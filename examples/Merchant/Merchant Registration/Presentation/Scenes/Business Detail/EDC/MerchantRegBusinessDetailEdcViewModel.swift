
//  MerchantRegBusinessDetailEdcViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import CloveUILib
import Combine
import Core
import Localize_Swift
import RxSwift
import SharedConfig
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegBusinessDetailEdcViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailEdcModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let prepareProductProcessId = "prepareProductProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = MerchantRegBusinessDetailEdcModel()
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess
		)
	}
	
	func prepareProduct() {
		let productType = model.productType
		handleProcess(
			{ try await self.getMerchantRepository()!.prepareProduct(type: productType) },
			withId: prepareProductProcessId,
			successHandler: prepareProductSuccess,
			errorDictionary: [
				MerchantRegBusinessDetailEdcErrorDictionary(retryAction: prepareProduct),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	func openBusinessTypeSelection() {
		let data = MerchantListSelectionModel(
			screenTitle: StringRes.merchant_select_qris_business_type_header_title.localizedString,
			itemList: model.categoryList.map { item in
				MerchantListSelectionItemModel(title: item.content.getText())
			},
			isSearchBarEnabled:
			.enabled(placeHolderText: StringRes.general_search.localizedString, searchBarType: .withIcon),
			onSelectedItem: { selectedItem in
				self.model.selectedBusinessType = self.model.categoryList
					.first(where: { item in item.content.getText().contains(selectedItem.title) })
				self.model.selectedBusinessTypeValue = selectedItem.title
			}
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessTypeSelectionScreen, data: data)))
	}
	
	func openBusinessOwnershipStatusSelection() {
		let data = MerchantListSelectionModel(
			screenTitle: StringRes.merchant_business_details_business_ownership_status.localizedString,
			itemList: model.ownershipStatusList.map { item in
				MerchantListSelectionItemModel(title: item.getText())
			},
			isSearchBarEnabled: .disabled,
			onSelectedItem: { selectedItem in
				self.model.selectedOwnershipStatus = self.model.ownershipStatusList
					.first(where: { item in item.getText().contains(selectedItem.title) })
				self.model.selectedBusinessOwnershipStatusValue = selectedItem.title
			}
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessTypeSelectionScreen, data: data)))
	}
	
	func openBusinessLocationSelection() {
		let data = MerchantListSelectionModel(
			screenTitle: StringRes.merchant_select_qris_business_location_header_title.localizedString,
			itemList: model.locationTypeList.map { item in
				MerchantListSelectionItemModel(title: item.getText())
			},
			isSearchBarEnabled: .disabled,
			onSelectedItem: { selectedItem in
				self.model.selectedBusinessLocation = self.model.locationTypeList
					.first(where: { item in item.getText().contains(selectedItem.title) })
				self.model.selectedBusinessLocationValue = selectedItem.title
			}
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessTypeSelectionScreen, data: data)))
	}
	
	func openDatePicker() {
		model.selectedDate = model.businessEstablishmentDateValue.toDate(fromStringWithFormat: .ddMMMyyyy)
		model.bottomSheetIsPresented = true
	}
	
	func selectDate() {
		let date = DateFormatter.shared.format(
			epoch: Int64(model.selectedDate.toEpochString()) ?? 0,
			dateFormat: .ddMMMyyyy_sspace
		)
		
		model.businessEstablishmentDate = model.selectedDate
		model.businessEstablishmentDateValue = date
		model.bottomSheetIsPresented = false
	}
	
	func isButtonEnabled() -> Bool {
		let isEdcValid = model.selectedEdcFromAnotherBankOption != nil && (
			model.selectedEdcFromAnotherBankOption != 0 ||
				(!model.edcIssuingInstitutionInput.isEmpty && model.edcIssuingInstitutionErrorText.isEmpty)
		)
		
		let isBusinessNameValid = !model.businessNameInput.isEmpty &&
			model.businessNameErrorText.isEmpty
		
		let isBusinessTypeValid = !model.selectedBusinessTypeValue.isEmpty &&
			model.selectedBusinessTypeErrorText.isEmpty
		
		let isOwnershipValid = !model.selectedBusinessOwnershipStatusValue.isEmpty &&
			model.selectedBusinessOwnershipStatusErrorText.isEmpty
		
		let isEstablishmentDateValid = !model.businessEstablishmentDateValue.isEmpty &&
			model.businessEstablishmentDateErrorText.isEmpty
		
		let isBusinessLocationValid = !model.selectedBusinessLocationValue.isEmpty &&
			model.selectedBusinessLocationErrorText.isEmpty
		
		return isBusinessNameValid && isBusinessTypeValid && isOwnershipValid && isEstablishmentDateValid && isBusinessLocationValid && isEdcValid
	}
	
	func saveMerchantData() {
		updateSubmitData()
		appendScreen(kMerchantRegBusinessDetailEdcTransactionScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessDetailEdcTransactionScreen, data: self?.merchantRegEntity)))
		}
	}
	
	// MARK: - Validation
	func validateBusinessName() {
		if model.businessNameInput.isEmpty {
			model.businessNameErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_business_name.localizedString
			)
		} else if model.businessNameInput.count < 5 {
			model.businessNameErrorText = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.businessNameErrorText = ""
		}
	}
	
	func validateIssuingInstitution() {
		if model.edcIssuingInstitutionInput.isEmpty {
			model.edcIssuingInstitutionErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edc_issuing_institution.localizedString
			)
		} else {
			model.edcIssuingInstitutionErrorText = ""
		}
	}
	
	// MARK: - Private Methods
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		submitData.productType = .edc
		
		let edcData = submitData.edcData ?? MerchantRegEdcEntity()
		edcData.businessName = model.businessNameInput
		edcData.selectedBusinessOwnershipStatus = model.selectedOwnershipStatus?.toLocalizableEntity()
		edcData.selectedHaveOtherEdcOption = model.selectedEdcFromAnotherBankOption
		edcData.selectedBusinessType = model.selectedBusinessType?.toCategoryEntity()
		edcData.businessEstablishmentDate = model.businessEstablishmentDate
		edcData.selectedBusinessLocation = model.selectedBusinessLocation?.toLocalizableEntity()
		
		if model.selectedEdcFromAnotherBankOption == 0 {
			edcData.otherEdcInstitution = model.edcIssuingInstitutionInput
		} else {
			edcData.otherEdcInstitution = ""
		}
		
		submitData.edcData = edcData
		merchantRegEntity.submitData = submitData
	}
	
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		
		if let product = merchantRegEntity.prepareData?.product {
			model.categoryList = product.categories?.map { $0.toCategoryModel() } ?? []
			model.ownershipStatusList = product.ownershipStatus?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
			model.locationTypeList = product.locationTypes?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
			model.facilityList = product.facilities?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
		}
		
		if let submitData = merchantRegEntity.submitData {
			model.productType = submitData.productType ?? .edc
			model.selectedBusinessType = submitData.edcData?.selectedBusinessType?.toCategoryModel()
			model.selectedBusinessTypeValue = model.selectedBusinessType?.content.getText() ?? ""
			model.businessNameInput = submitData.edcData?.businessName ?? ""
			model.selectedOwnershipStatus = PresentationMapper()
				.mapToCodeAndLocalizableTextModel(
					fromEntity: submitData.edcData?.selectedBusinessOwnershipStatus ?? LocalizableEntity()
				)
			model.selectedBusinessOwnershipStatusValue = model.selectedOwnershipStatus?.getText() ?? ""
			if let date = submitData.edcData?.businessEstablishmentDate {
				let dateFormatted = DateFormatter.shared.format(
					epoch: Int64(date.toEpochString()) ?? 0,
					dateFormat: .ddMMMyyyy_sspace
				)
				
				model.businessEstablishmentDate = date
				model.selectedDate = date
				model.businessEstablishmentDateValue = dateFormatted
			}
			model.selectedBusinessLocation = PresentationMapper()
				.mapToCodeAndLocalizableTextModel(
					fromEntity: submitData.edcData?.selectedBusinessLocation ?? LocalizableEntity()
				)
			model.selectedBusinessLocationValue = model.selectedBusinessLocation?.getText() ?? ""
			model.selectedEdcFromAnotherBankOption = submitData.edcData?.selectedHaveOtherEdcOption
			model.edcIssuingInstitutionInput = submitData.edcData?.otherEdcInstitution ?? ""
		}
	}
	
	private func prepareProductSuccess(_ entity: MerchantRegPrepareProductEntity) {
		if merchantRegEntity.prepareData == nil {
			merchantRegEntity.prepareData = MerchantRegPrepareDataEntity()
		}
		merchantRegEntity.prepareData?.product = entity
		
		model.categoryList = entity.categories?.map { $0.toCategoryModel() } ?? []
		model.ownershipStatusList = entity.ownershipStatus?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
		model.locationTypeList = entity.locationTypes?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
		model.facilityList = entity.facilities?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
		
		saveLocalData { [weak self] in
			self?.prepareLocalData()
		}
	}
}

// MARK: - Mapper
extension MerchantRegCategoryEntity {
	func toCategoryModel() -> MerchantRegCategoryModel {
		MerchantRegCategoryModel(
			contentId: contentId,
			content: PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: content),
			isHighRiskBased: isHighRiskBased,
			isProfessionalLicense: isProfessionalLicense
		)
	}
}

extension MerchantRegCategoryModel {
	func toCategoryEntity() -> MerchantRegCategoryEntity {
		let entity = MerchantRegCategoryEntity()
		entity.contentId = contentId
		entity.content = content.toLocalizableEntity()
		entity.isHighRiskBased = isHighRiskBased
		entity.isProfessionalLicense = isProfessionalLicense
		return entity
	}
}
