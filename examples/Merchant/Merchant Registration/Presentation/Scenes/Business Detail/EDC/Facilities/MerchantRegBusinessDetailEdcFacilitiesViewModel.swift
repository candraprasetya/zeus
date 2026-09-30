
//  MerchantRegBusinessDetailEdcFasilitiesViewModel.swift
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

final class MerchantRegBusinessDetailEdcFacilitiesViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailEdcFacilitiesModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let prepareProductProcessId = "prepareProductProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = MerchantRegBusinessDetailEdcFacilitiesModel()
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
	
	func openFacilitySelection() {
		let data = MerchantRegBusinessDetailEdcFacilitiesSelectionModel(
			title: StringRes.merchant_select_edc_facilities_header_title.localizedString,
			headerText: StringRes.merchant_select_edc_facilities_select_all.localizedString,
			selectedData: model.selectedEdcFacilities,
			selectableData: model.facilityList,
			optionOnSave: { [weak self] selectedOptions in
				guard let self else { return }
				
				let sortedFacilities = selectedOptions.sorted { $0.code < $1.code }
				
				model.selectedEdcFacilities = sortedFacilities
				
				model.selectedEdcFacilityValue = sortedFacilities.map { $0.getText() }.joined(separator: ", ")
				
				validateEdcFacility()
			},
			initialSelectedData: model.selectedEdcFacilities
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessDetailEdcFacilitiesSelectionScreen, data: data)))
	}
	
	func openProductInfo() {
		updateSubmitData()
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessDetailEdcProductInfoScreen, data: nil)))
		}
	}
	
	func isButtonEnabled() -> Bool {
		let cashierTableCountIsValid = !model.cashierTableCountInput.isEmpty && model.cashierTableCountErrorText.isEmpty
		let desiredEdcCountIsValid = !model.desiredEdcCountInput.isEmpty && model.desiredEdcCountErrorText.isEmpty
		let selectedEdcFacilitiesIsValid = !model.selectedEdcFacilities.isEmpty && model.selectedEdcFacilityErrorText.isEmpty
		
		return cashierTableCountIsValid && desiredEdcCountIsValid && selectedEdcFacilitiesIsValid
	}
	
	func saveMerchantData() {
		updateSubmitData()
		appendScreen(kMerchantRegDeliveryAddressScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegDeliveryAddressScreen, data: nil)))
		}
	}
	
	// MARK: - Private Methods
	
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		if let submitData = merchantRegEntity.submitData {
			model.productType = submitData.productType ?? .edc
			model.cashierTableCountInput = submitData.edcData?.cashierTableCount ?? ""
			model.desiredEdcCountInput = submitData.edcData?.desiredEdcCount ?? ""
			model.selectedEdcFacilities = submitData.edcData?.selectedEdcFacilities?
				.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
			model.selectedEdcFacilityValue = model.selectedEdcFacilities.map { $0.getText() }.joined(separator: ", ")
		}
		
		prepareFacilities()
	}
	
	private func prepareFacilities() {
		model.facilityList = merchantRegEntity.prepareData?.product?.facilities?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		let data = submitData.edcData ?? MerchantRegEdcEntity()
		
		data.cashierTableCount = model.cashierTableCountInput
		data.desiredEdcCount = model.desiredEdcCountInput
		data.selectedEdcFacilities = model.selectedEdcFacilities.map { $0.toLocalizableEntity() }
		
		submitData.edcData = data
		merchantRegEntity.submitData = submitData
	}
	
	// MARK: - Validation
	func validateCashierTableCount() {
		if model.cashierTableCountInput.isEmpty {
			model.cashierTableCountErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_number_of_cashier_desks.localizedString
			)
		} else {
			model.cashierTableCountErrorText = ""
		}
	}
	
	func validateDesiredEdcCount() {
		if model.desiredEdcCountInput.isEmpty {
			model.desiredEdcCountErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_number_of_edc_requested.localizedString
			)
		} else {
			model.desiredEdcCountErrorText = ""
		}
	}
	
	func validateEdcFacility() {
		if model.selectedEdcFacilities.isEmpty {
			model.selectedEdcFacilityErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edc_facilities.localizedString
			)
		} else {
			model.selectedEdcFacilityErrorText = ""
		}
	}
}
