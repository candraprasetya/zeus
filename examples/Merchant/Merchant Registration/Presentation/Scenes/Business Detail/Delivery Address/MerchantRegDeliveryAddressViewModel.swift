
//  MerchantRegDeliveryAddressViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegDeliveryAddressViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegDeliveryAddressModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let prepareProductProcessId = "prepareProductProcessId"
	
	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		model = MerchantRegDeliveryAddressModel()
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
	
	func isButtonEnabled() -> Bool {
		let hasValidReceiverName = !model.receiverNameInput.isEmpty && model.receiverNameErrorText.isEmpty
		let hasValidphoneNumber = !model.phoneNumberInput.isEmpty && model.phoneNumberErrorText.isEmpty
		
		return model.selectedOption == 1 ? (hasValidReceiverName && hasValidphoneNumber) : true
	}
	
	func saveMerchantData() {
		updateSubmitData()
		if model.isHighRisk {
			appendScreen(kMerchantRegEddScreen)
			saveLocalData { [weak self] in
				self?.navigationEvent
					.send(.next(NavigationObject(screenId: kMerchantRegEddScreen)))
			}
		} else {
			appendScreen(kMerchantRegDeliveryAddressScreen)
			saveLocalData { [weak self] in
				self?.navigationEvent
					.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen)))
			}
		}
	}
	
	func constructScreenTitle() -> String {
		let itemType = if model.productType == .edc {
			StringRes.merchant_facility_options_edc_label.localizedString
		} else {
			StringRes.merchant_facility_options_qris_label.localizedString
		}
		
		return String(format: StringRes.merchant_delivery_progress_title.localizedString, itemType)
	}
	
	func constructScreenSubTitle() -> String {
		let resource = model.isHighRisk
			? StringRes.merchant_delivery_next_step_edd
			: StringRes.merchant_delivery_next_step
		
		return resource.localizedString
	}
	
	func constructDeliveryIsTheSameTitle() -> String {
		let productName = (model.productType == .edc ? StringRes.merchant_facility_options_edc_label : StringRes.merchant_facility_options_qris_label).localizedString
		
		return String(
			format: StringRes.merchant_delivery_recipient_is_same_question.localizedString,
			productName
		)
	}
	
	// MARK: - Validation
	func validateReceiverName() {
		if model.receiverNameInput.isEmpty {
			model.receiverNameErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_delivery_recipient_name.localizedString
			)
		} else if model.receiverNameInput.count < 3 || !model.receiverNameInput.isValidFormatInput {
			model.receiverNameErrorText = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.receiverNameErrorText = ""
		}
	}
	
	func validateReceiverPhoneNumber() {
		if model.phoneNumberInput.isEmpty {
			model.phoneNumberErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_delivery_recipient_phone_no.localizedString
			)
		} else {
			model.phoneNumberErrorText = ""
		}
	}
	
	// MARK: - Private Methods
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		model.productType = entity.submitData?.productType ?? .edc
		
		let productData = (
			model.productType == .edc ? merchantRegEntity.submitData?.edcData : merchantRegEntity.submitData?.qrisData
		)
		
		if let address = productData?.businessAddress {
			model.streetName = address.streetName ?? ""
			model.buildingName = address.buildingName ?? ""
			model.selectedLocation = address.toMerchantLocationModel()
		}
		
		if let submitData = merchantRegEntity.submitData {
			model.phoneNumber = submitData.selectedPhoneNumber?.maskedPhoneNumber ?? ""
			model.name = submitData.selectedAccount?.name ?? ""
			
			if let otherReceiverName = productData?.otherReceiverName,
			   !otherReceiverName.isEmpty,
			   let otherReceiverPhoneNumber = productData?.otherReceiverPhoneNumber,
			   !otherReceiverPhoneNumber.isEmpty
			{
				model.receiverNameInput = otherReceiverName
				model.phoneNumberInput = otherReceiverPhoneNumber
			}
		}
		
		if let productData {
			model.selectedOption = productData.selectedReceiverOption ?? 0
			
			let isNrtPep = entity.prepareData?.isHighRisk ?? true
			let isHighRiskBusiness = productData.selectedBusinessType?.isHighRiskBased ?? true
			model.isHighRisk = !isNrtPep && isHighRiskBusiness
		}
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		let edcData = submitData.edcData ?? MerchantRegEdcEntity()
		let qrisData = submitData.qrisData ?? MerchantRegQrisEntity()
		
		if model.selectedOption == 1 {
			if !model.receiverNameInput.isEmpty, !model.phoneNumberInput.isEmpty {
				if submitData.productType == .edc {
					edcData.selectedReceiverOption = model.selectedOption
					edcData.otherReceiverName = model.receiverNameInput
					edcData.otherReceiverPhoneNumber = model.phoneNumberInput
					submitData.edcData = edcData
				} else {
					qrisData.selectedReceiverOption = model.selectedOption
					qrisData.otherReceiverName = model.receiverNameInput
					qrisData.otherReceiverPhoneNumber = model.phoneNumberInput
					submitData.qrisData = qrisData
				}
			}
		} else {
			if submitData.productType == .edc {
				edcData.selectedReceiverOption = model.selectedOption
				submitData.edcData?.otherReceiverName = nil
				submitData.edcData?.otherReceiverPhoneNumber = nil
			} else {
				qrisData.selectedReceiverOption = model.selectedOption
				submitData.qrisData?.otherReceiverName = nil
				submitData.qrisData?.otherReceiverPhoneNumber = nil
			}
		}
		
		merchantRegEntity.submitData = submitData
	}
}

// MARK: - Mapper
private extension MerchantRegLocationEntity {
	func toMerchantLocationModel() -> MerchantRegLocationModel {
		MerchantRegLocationModel(
			postalId: postalId ?? "",
			postalCode: postalCode ?? "",
			villageId: villageId ?? "",
			villageName: villageName ?? "",
			subdistrictId: subdistrictId ?? "",
			subdistrictName: subdistrictName ?? "",
			regencyId: regencyId ?? "",
			regencyName: regencyName ?? "",
			provinceId: provinceId ?? "",
			provinceName: provinceName ?? "",
			cityTagQris: cityTagQris ?? "",
			agentBankCode: agentBankCode ?? "",
			agentBankName: agentBankName ?? "",
		)
	}
}

private extension String {
	var isValidFormatInput: Bool {
		guard !isEmpty else { return false }
		var allowedCharacters = CharacterSet.alphanumerics
		allowedCharacters.insert(charactersIn: " -.,'’")
		return rangeOfCharacter(from: allowedCharacters.inverted) == nil
	}
}
