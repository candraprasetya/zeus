//
//  MerchantRegQRISDetailFormViewModel.swift
//  Merchant
//
//  Created by ITBCA on 24/06/26.
//

import CloveUILib
import Combine
import Core
import Localize_Swift
import RxSwift
import SharedI18nRes
import StandardLibrary
import SwiftUI
import Swinject

final class MerchantRegQRISDetailFormViewModel: MerchantRegNavigableViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model = MerchantRegQRISDetailFormModel()
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	var merchantNameMaxLength = 23
	var merchantNameOnStickerMaxLength = 50
	
	let validateQrisProcessId = "validateQrisProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	
	var allProcessId: [String] {
		[
			validateQrisProcessId,
			saveMerchantDataProcessId,
			loadMerchantDataProcessId
		]
	}
	
	init(navigationObject: NavigationObject) {
		merchantRegEntity = navigationObject.getData()
		getInitializeQrisData()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(NavigationObject(screenId: kMerchantRegBusinessDetailQrisScreen)))
	}
	
	func toScanQrisScreen() {
		navigationEvent.send(.next(
			NavigationObject(
				screenId: kMerchantRegScanQRISScreen,
				data: merchantRegEntity
			)
		))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func getMerchantRepository() -> MerchantRegRepository? {
		MerchantRegDIManager.merchantRepositoryInjection.resolve(MerchantRegRepository.self)
	}
	
	func constructBannerText() -> String {
		return String(
			format: StringRes.merchant_business_qris_details_business_name_alert.localizedString,
			model.businessCategory
		)
	}
	
	func redirectToMultiSettlementInfoScreen() {
		navigationEvent.send(.next(
			NavigationObject(screenId: kMerchantRegMultiSettlementInformationScreen)
		))
	}
	
	func nextButtonAction() {
		let requestNmidParam: String? = model.isHavingQris && !model.isScannedQris ? model.nmid : nil
		handleValidateQris(nmid: requestNmidParam, stickerName: model.qrisStickerName)
	}
	
	func merchantNameTooltipAction() {
		ClovePopUp().createPopUpView(
			type: .popUpWithImageRatio(
				image: UIImage(
					resource: ImageResource(
						name: "MerchantNameTooltip",
						bundle: Bundle(identifier: Merchant.bundleId) ?? Bundle()
					)
				),
				size: .large,
				titleText: StringRes.merchant_business_details_business_name.localizedString,
				subtitleText: StringRes.merchant_popup_business_name_content.localizedString,
				primaryButtonText: StringRes.general_button_ok.localizedString,
				primaryButtonAction: { /* Do Nothing! */ },
				secondaryButtonPosition: nil
			)
		).showPopUpView()
	}

	func merchantNameQrisStickerTooltipAction() {
		ClovePopUp().createPopUpView(
			type: .popUpWithImageRatio(
				image: UIImage(
					resource: ImageResource(
						name: "BusinessNameTutorialImage",
						bundle: Bundle(identifier: Merchant.bundleId) ?? Bundle()
					)
				),
				size: .large,
				titleText: StringRes.merchant_popup_business_name_sticker_no_qris_title.localizedString,
				subtitleText: merchantNameTooltipPopUpDescription(),
				primaryButtonText: StringRes.general_button_ok.localizedString,
				primaryButtonAction: { /* Do Nothing! */ },
				secondaryButtonPosition: nil
			),
			isSupportHTML: true
		).showPopUpView()
	}
	
	func isNextButtonEnabled() -> Bool {
		let merchantNameIsNotEmpty = !model.merchantName.isEmpty
		let merchantNameIsNotError = model.merchantNameErrorMessage.isEmpty
		let merchantNameOnStickerIsNotEmpty = !model.qrisStickerName.isEmpty
		let merchantNameOnStickerIsNotError = model.qrisStickerNameErrorMessage.isEmpty
		
		if model.isHavingQris {
			let nmidIsNotEmpty = !model.nmid.isEmpty
			let nmidIsNotError = model.nmidErrorMessage.isEmpty
			return nmidIsNotEmpty && nmidIsNotError &&
			merchantNameIsNotEmpty && merchantNameIsNotError &&
			merchantNameOnStickerIsNotEmpty && merchantNameOnStickerIsNotError
		} else {
			return merchantNameIsNotEmpty && merchantNameIsNotError &&
			merchantNameOnStickerIsNotEmpty && merchantNameOnStickerIsNotError
		}
	}
	
	func isShowScanAgainButton() -> Bool {
		let isCounterExceedThreshold = MerchantInvalidQrisCounterManager().isCounterExceedThreshold()
		return model.isHavingQris && !isCounterExceedThreshold
	}
	
	func validateNmidTextfield() {
		if model.nmid.isEmpty {
			let emptyErrorMessage = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_qris_details_national_mid.localizedString
			)
			model.nmidErrorMessage = emptyErrorMessage
		} else if model.nmid.count < 15 || !model.nmid.isValidAlphanumericFormatInput {
			model.nmidErrorMessage = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.nmidErrorMessage = ""
		}
	}
	
	func validateMerchantNameTextfield() {
		if model.merchantName.isEmpty {
			let emptyErrorMessage = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_business_name.localizedString
			)
			model.merchantNameErrorMessage = emptyErrorMessage
		} else if model.merchantName.count < 5 || !model.merchantName.isValidFormatInput {
			model.merchantNameErrorMessage = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.merchantNameErrorMessage = ""
		}
	}
	
	func merchantNameHelperText() -> String {
		return if model.isHavingQris {
			if model.isScannedQris {
				""
			} else {
				StringRes.merchant_business_qris_details_business_name_instruction.localizedString
			}
		} else {
			String(
				format: StringRes.general_error_length_maximum.localizedString,
				String(merchantNameMaxLength)
			)
		}
	}
	
	func validateMerchantNameOnStickerTextfield() {
		if model.qrisStickerName.isEmpty {
			let emptyErrorMessage = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_qris_details_business_name_on_sticker.localizedString
			)
			model.qrisStickerNameErrorMessage = emptyErrorMessage
		} else if model.qrisStickerName.count < 5 || !model.qrisStickerName.isValidFormatInput {
			model.qrisStickerNameErrorMessage = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.qrisStickerNameErrorMessage = ""
		}
	}
	
	func merchantNameOnStickerHelperText() -> String {
		model.isHavingQris ?
		StringRes.merchant_business_qris_details_business_name_on_sticker_instruction.localizedString :
		String(
			format: StringRes.general_error_length_maximum.localizedString,
			String(merchantNameOnStickerMaxLength)
		)
	}
	
	private func merchantNameTooltipPopUpDescription() -> String {
		return if model.isHavingQris {
			StringRes.merchant_popup_business_name_sticker_has_qris_content.localizedString
		} else {
			String(
				format: StringRes.merchant_popup_business_name_sticker_no_qris_content.localizedString,
				"<b>\(model.businessCategory)</b>"
			)
		}
	}
	
	private func getInitializeQrisData() {
		let qrisData = merchantRegEntity.submitData?.qrisData ?? MerchantRegQrisEntity()
		let isHavingQris = qrisData.isHavingQris ?? false
		
		if MerchantInvalidQrisCounterManager().isCounterExceedThreshold() && isHavingQris {
			let qrisRequestData = qrisData.otherQrisRequestData ?? MerchantRegQrisRequestDataEntity()
			model = qrisData.toMerchantRegQRISDetailFormModel(qrisRequestData: qrisRequestData)
			model.isScanQrisInvalidExceedThreshold = true
			model.isHavingQris = true
			model.isScannedQris = false
		} else {
			let qrisFlowDataType = getQrisDataFlowType(
				isHavingQris: qrisData.isHavingQris ?? false,
				isScanInvalidExceedThreshold: false,
				isScannedQris: qrisData.isScanningQris
			)
			
			var qrisRequestData = MerchantRegQrisRequestDataEntity()
			switch qrisFlowDataType {
				case .newQris:
					if let newQrisRequestData = qrisData.newQrisRequestData {
						qrisRequestData = newQrisRequestData
					}
				case .otherQris:
					if let otherQrisRequestData = qrisData.otherQrisRequestData {
						qrisRequestData = otherQrisRequestData
					}
				case .scannedQris:
					if let scannedQrisRequestData = qrisData.scannedQrisRequestData {
						qrisRequestData = scannedQrisRequestData
					}
			}
			
			model = qrisData.toMerchantRegQRISDetailFormModel(qrisRequestData: qrisRequestData)
		}
	}
	
	private func handleValidateQris(nmid: String?, stickerName: String) {
		handleProcess(
			{
				return try await MerchantRegDIManager
					.merchantRepositoryInjection.resolve(MerchantRegRepository.self)!
					.validateQris(nmid: nmid, stickerName: stickerName)
			},
			withId: validateQrisProcessId,
			successHandler: { _ in
				self.handleOnSuccessValidateQris()
			},
			errorDictionary: [
				MerchantRegQRISDetailFormErrorDictionary(),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	private func handleOnSuccessValidateQris() {
		updateQrisData()
		let nextScreen = kMerchantRegDeliveryAddressScreen
		appendScreen(nextScreen)
		saveLocalData {
			self.navigationEvent.send(.next(
				NavigationObject(screenId: nextScreen)
			))
		}
	}
	
	private func getQrisDataFlowType(
		isHavingQris: Bool,
		isScanInvalidExceedThreshold: Bool,
		isScannedQris: Bool
	) -> QrisDataFlowType {
		if isHavingQris {
			if isScanInvalidExceedThreshold || !isScannedQris {
				return .otherQris
			} else {
				return .scannedQris
			}
		} else {
			return .newQris
		}
	}
	
	private func updateQrisData() {
		let qrisData = self.merchantRegEntity.submitData?.qrisData ?? MerchantRegQrisEntity()
		let qrisRequestDataEntity = model.toMerchantRegQrisRequestDataEntity()
		
		switch getQrisDataFlowType(
			isHavingQris: model.isHavingQris,
			isScanInvalidExceedThreshold: model.isScanQrisInvalidExceedThreshold,
			isScannedQris: model.isScannedQris
		) {
			case .newQris:
				qrisData.newQrisRequestData = qrisRequestDataEntity
			case .otherQris:
				qrisData.otherQrisRequestData = qrisRequestDataEntity
			case .scannedQris:
				qrisData.scannedQrisRequestData = qrisRequestDataEntity
		}
		
		self.merchantRegEntity.submitData?.qrisData = qrisData
	}
}

private extension MerchantRegQrisEntity {
	func toMerchantRegQRISDetailFormModel(
		qrisRequestData: MerchantRegQrisRequestDataEntity
	) -> MerchantRegQRISDetailFormModel {
		MerchantRegQRISDetailFormModel(
			nmid: qrisRequestData.nmid ?? "",
			merchantName: qrisRequestData.merchantName ?? "",
			qrisStickerName: qrisRequestData.stickerName ?? "",
			businessCategory: selectedBusinessType?.content.toModel().getText() ?? "",
			isUmi: isUmi ?? false,
			isHavingQris: isHavingQris ?? false,
			isScannedQris: isScanningQris
		)
	}
}

private extension MerchantRegQRISDetailFormModel {
	func toMerchantRegQrisRequestDataEntity() -> MerchantRegQrisRequestDataEntity {
		let entity = MerchantRegQrisRequestDataEntity()
		entity.nmid = nmid
		entity.merchantName = merchantName
		entity.stickerName = qrisStickerName
		entity.isMultiSettlement = isMultiSettlement
		return entity
	}
}

private extension String {
	var isValidFormatInput: Bool {
		guard !self.isEmpty else { return false }
		var allowedCharacters = CharacterSet.alphanumerics
		allowedCharacters.insert(charactersIn: " -.,'’")
		return self.rangeOfCharacter(from: allowedCharacters.inverted) == nil
	}
	
	var isValidAlphanumericFormatInput: Bool {
		guard !self.isEmpty else { return false }
		return self.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) == nil
	}
}

private enum QrisDataFlowType {
	case newQris
	case otherQris
	case scannedQris
}
