//
//  MerchantRegBusinessDetailQrisViewModel.swift
//  Merchant
//
//  Created by ITBCA on 10/06/26.
//

import CloveUILib
import Combine
import Core
import Localize_Swift
import RxSwift
import SharedConfig
import SharedI18nRes
import StandardLibrary
import SwiftUI
import Swinject

final class MerchantRegBusinessDetailQrisViewModel: MerchantRegNavigableViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailQrisModel
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	let prepareProductProcessId = "prepareProductProcessId1"
	let validateMerchantProcessId = "validateMerchantProcessId1"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId1"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId1"
	
	var allProcessId: [String] {
		[
			prepareProductProcessId,
			validateMerchantProcessId,
			saveMerchantDataProcessId,
			loadMerchantDataProcessId
		]
	}
	
	init(navigationObject _: NavigationObject) {
		model = MerchantRegBusinessDetailQrisModel()
		prepareLocalData()
	}
		
	func getMerchantRepository() -> MerchantRegRepository? {
		MerchantRegDIManager.merchantRepositoryInjection.resolve(MerchantRegRepository.self)
	}
	
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareLocalDataSuccess
		)
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func toBusinessTypeListSelectionScreen() {
		let data = MerchantListSelectionModel(
			screenTitle: StringRes.merchant_select_qris_business_type_header_title.localizedString,
			itemList: model.categoryList.map({ $0.toMerchantListSelectionItemModel() }),
			isSearchBarEnabled: .enabled(
				placeHolderText: StringRes.general_search.localizedString,
				searchBarType: .withIcon
			),
			onSelectedItem: { selectedItem in
				let selectedBusinessCategoryModel = self.model.categoryList.filter({
					$0.content.code == selectedItem.itemId
				}).first ?? MerchantRegQRISBusinessCategoryModel()
				
				self.model.selectedBusinessType = selectedBusinessCategoryModel
			}
		)
		
		navigationEvent.send(
			.next(
				NavigationObject(
					screenId: kMerchantRegQRISSelectBusinessTypeScreen,
					data: data
				)
			)
		)
	}
	
	func toBusinessLocationSelectionScreen() {
		let data = MerchantListSelectionModel(
			screenTitle: StringRes.merchant_select_qris_business_location_header_title.localizedString,
			itemList: model.locationTypeList.map({ $0.toMerchantListSelectionItemModel() }),
			isSearchBarEnabled: .disabled,
			onSelectedItem: { selectedItem in
				let selectedBusinessLocationModel = self.model.locationTypeList.filter({
					$0.code == selectedItem.itemId
				}).first ?? CodeAndLocalizableTextModel(code: "", indonesian: "", english: "")
				
				self.model.selectedBusinessLocation = selectedBusinessLocationModel
			}
		)
		
		navigationEvent.send(
			.next(
				NavigationObject(
					screenId: kMerchantRegQRISSelectBusinessLocationScreen,
					data: data
				)
			)
		)
	}
	
	func openDatePicker() {
		let formatter = DateFormatter()
		formatter.dateFormat = "dd MMM yyyy"
		formatter.locale = Locale(identifier: Localize.currentLanguage())
		if let date = formatter.date(from: model.registeredDate) {
			model.selectedDate = date
		}
		model.bottomSheetIsPresented = true
	}
	
	func selectDate() {
		let formattedDate = DateFormatter.shared.format(
			epoch: Int64(model.selectedDate.toEpochString()) ?? 0,
			dateFormat: .ddMMMyyyy_sspace
		)
		
		model.registeredDate = formattedDate
		model.bottomSheetIsPresented = false
	}
	
	func nextButtonAction() {
		handleValidateMerchant()
	}
	
	func isButtonEnabled() -> Bool {
		let businessTypeIsSelected = !model.selectedBusinessType.contentId.isEmpty
		let averageMonthlyRevenueIsSelected = !model.averageMonthlyRevenue.isEmpty
		let registeredDateIsSelected = !model.registeredDate.isEmpty
		let businessLocationIsSelected = !model.selectedBusinessLocation.code.isEmpty
		let qrisStickerOwnerIsSelected = model.selectedQrisStickerOwnership != nil
		
		return businessTypeIsSelected && averageMonthlyRevenueIsSelected && registeredDateIsSelected && businessLocationIsSelected && qrisStickerOwnerIsSelected
	}
	
	private func prepareProduct() {
		handleProcess(
			{
				return try await MerchantRegDIManager
					.merchantRepositoryInjection.resolve(MerchantRegRepository.self)!
					.prepareProduct(type: self.model.productType)
			},
			withId: prepareProductProcessId,
			successHandler: { result in
				self.onPrepareSuccess(result)
			},
			errorDictionary: [
				MerchantRegBusinessDetailQrisErrorDictionary(
					retryAction: {
						self.prepareLocalData()
					}
				),
				LayoutErrorDictionary(
					logEventName: nil,
					retryHandler: {
						self.prepareLocalData()
					}
				)
			]
		)
	}
	
	private func onPrepareSuccess(_ result: MerchantRegPrepareProductEntity) {
		model.categoryList = result.categories?.map({
			MerchantRegQRISBusinessCategoryModel(
				contentId: $0.contentId,
				content: $0.content.toCodeAndLocalizableTextModel(),
				isHighRiskBased: $0.isHighRiskBased,
				isProfessionalLicense: $0.isProfessionalLicense
			)
		}) ?? []
		
		model.locationTypeList = result.locationTypes?.map({$0.toCodeAndLocalizableTextModel()}) ?? []
	}
	
	private func prepareLocalDataSuccess(_ entity: MerchantRegEntity) {
		let qrisData = entity.submitData?.qrisData
		let qrisDataModel = qrisData?.toMerchantRegBusinessDetailQrisModel()
		model = qrisDataModel ?? MerchantRegBusinessDetailQrisModel()
		
		merchantRegEntity = entity
		
		if entity.submitData?.qrisData?.businessEstablishmentDate != nil {
			selectDate()
		}
		prepareProduct()
	}
	
	private func handleValidateMerchant() {
		let requestData = model.toValidateMerchantRequestData()
		handleProcess(
			{
				return try await MerchantRegDIManager
					.merchantRepositoryInjection.resolve(MerchantRegRepository.self)!
					.validateMerchant(data: requestData)
			},
			withId: validateMerchantProcessId,
			successHandler: { result in
				self.onValidateMerchantSuccess(result)
			},
			errorDictionary: [
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	private func onValidateMerchantSuccess(_ result: MerchantRegQrisEntity) {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		let qrisData = submitData.qrisData ?? MerchantRegQrisEntity()
		qrisData.criteriaCode = result.criteriaCode
		qrisData.isUmi = result.isUmi
		qrisData.selectedBusinessType = model.selectedBusinessType.toMerchantRegCategoryEntity()
		
		let qrisDataInput = model.toMerchantRegQrisDataEntity(qrisData)
		
		let isHavingQris = (model.selectedQrisStickerOwnership == 0)
		if !isHavingQris {
			qrisDataInput.isHavingQris = false
			qrisDataInput.isScanningQris = false
		} else if MerchantInvalidQrisCounterManager().isCounterExceedThreshold() {
			qrisDataInput.isHavingQris = true
			qrisDataInput.isScanningQris = false
		}
		
		submitData.qrisData = qrisDataInput
		merchantRegEntity.submitData = submitData
		
		navigateToNextScreen()
	}
	
	private func navigateToNextScreen() {
		let isHavingQris = (model.selectedQrisStickerOwnership == 0)
		let isExceedThreshold = MerchantInvalidQrisCounterManager().isCounterExceedThreshold()
		let nextScreen = isHavingQris && !isExceedThreshold ? kMerchantRegQRISLandingScreen : kMerchantRegQRISDetailFormScreen
		
		if [
			kMerchantRegQRISLandingScreen,
			kMerchantRegQRISDetailFormScreen
		].contains(merchantRegEntity.screenStack.last) {
			merchantRegEntity.screenStack.removeLast()
		}
		appendScreen(nextScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(
				NavigationObject(
					screenId: nextScreen,
					data: self?.merchantRegEntity
				)
			))
		}
	}
}

// MARK: Mapper
private extension MerchantRegBusinessDetailQrisModel {
	func toValidateMerchantRequestData() -> MerchantRegQrisEntity {
		let requestData = MerchantRegQrisEntity()
		requestData.businessAverageMonthlyRevenue = Double(averageMonthlyRevenue) ?? 0.0
		return requestData
	}
	
	func toMerchantRegQrisDataEntity(_ result: MerchantRegQrisEntity) -> MerchantRegQrisEntity {
		let qrisData = result
		qrisData.selectedBusinessType = result.selectedBusinessType
		qrisData.businessAverageMonthlyRevenue = Double(averageMonthlyRevenue) ?? 0.0
		qrisData.businessEstablishmentDate = selectedDate
		qrisData.selectedBusinessLocation = LocalizableEntity()
		qrisData.selectedBusinessLocation? = selectedBusinessLocation.toLocalizableEntity()
		qrisData.isHavingQris = (selectedQrisStickerOwnership == 0)
		return qrisData
	}
}

private extension MerchantRegQrisEntity {
	func toMerchantRegBusinessDetailQrisModel() -> MerchantRegBusinessDetailQrisModel {
		let selectedBusinessType = selectedBusinessType?.toMerchantRegQRISBusinessCategoryModel()
		let selectedBusinessLocation = selectedBusinessLocation?.toCodeAndLocalizableTextModel()
		
		return MerchantRegBusinessDetailQrisModel(
			selectedBusinessType: selectedBusinessType ?? MerchantRegQRISBusinessCategoryModel(),
			averageMonthlyRevenue: businessAverageMonthlyRevenue?.toString() ?? "",
			selectedDate: businessEstablishmentDate ?? Date(),
			selectedBusinessLocation: selectedBusinessLocation ?? CodeAndLocalizableTextModel(
				code: "",
				indonesian: "",
				english: ""
			),
			selectedQrisStickerOwnership: isHavingQris.map { $0 ? 0 : 1 }
		)
	}
}

private extension MerchantRegCategoryEntity {
	func toMerchantRegQRISBusinessCategoryModel() -> MerchantRegQRISBusinessCategoryModel {
		MerchantRegQRISBusinessCategoryModel(
			contentId: contentId,
			content: content.toCodeAndLocalizableTextModel(),
			isHighRiskBased: isHighRiskBased,
			isProfessionalLicense: isProfessionalLicense
		)
	}
}

private extension MerchantRegQRISBusinessCategoryModel {
	func toMerchantListSelectionItemModel() -> MerchantListSelectionItemModel {
		MerchantListSelectionItemModel(itemId: content.code, title: content.getText())
	}
	
	func toMerchantRegCategoryEntity() -> MerchantRegCategoryEntity {
		let entity = MerchantRegCategoryEntity()
		entity.contentId = contentId
		entity.content = content.toLocalizableEntity()
		entity.isHighRiskBased = isHighRiskBased
		entity.isProfessionalLicense = isProfessionalLicense
		return entity
	}
}

private extension CodeAndLocalizableTextModel {
	func toMerchantListSelectionItemModel() -> MerchantListSelectionItemModel {
		MerchantListSelectionItemModel(itemId: code, title: getText())
	}
}

private extension LocalizableEntity {
	func toCodeAndLocalizableTextModel() -> CodeAndLocalizableTextModel {
		CodeAndLocalizableTextModel(code: code, indonesian: indonesian, english: english)
	}
}
