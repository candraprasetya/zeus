
//  MerchantRegNpwpViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 26/04/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import Localize_Swift
import RxSwift
import SavingsAccount
import SharedConfig
import SharedI18nRes
import StandardLibrary
import SwiftUI
import Swinject

final class MerchantRegNpwpViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegNpwpModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let uploadDocumentProcessId = "uploadDocumentProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData() ?? MerchantRegNpwpModel()
	}
	
	// MARK: - Public Methods
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess
		)
	}
	
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		if model.tempCapturedImageBase64.isEmpty {
			model.npwpNumberValue = entity.submitData?.npwpNumber ?? ""
			model.capturedImageBase64 = entity.submitData?.npwpBase64Image ?? ""
			model.statusNpwpValue = entity.submitData?.selectedStatusNpwp ?? ""
		}
		
		model.npwpNumber = entity.prepareData?.npwp.maskedNumber ?? ""
		model.statusNpwp = entity.prepareData?.npwp.status ?? ""
		if let date = entity.submitData?.registeredNpwpDate {
			let dateFormatted = DateFormatter.shared.format(
				epoch: Int64(date.toEpochString()) ?? 0,
				dateFormat: .ddMMMyyyy_sspace
			)
			model.registeredDate = dateFormatted
		}
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func saveMerchantData() {
		if let maskedNumber = merchantRegEntity.prepareData?.npwp.maskedNumber, !maskedNumber.isEmpty {
			updateSubmitData()
			navigateToNextScreen()
		} else {
			uploadDocument()
		}
	}
	
	func isButtonEnabled() -> Bool {
		if model.capturedImageBase64.isEmpty {
			!model.registeredDate.isEmpty
		} else {
			!model.statusNpwpValue.isEmpty &&
				!model.npwpNumberValue.isEmpty &&
				!model.registeredDate.isEmpty &&
				model.isConfirmationChecked == .active
		}
	}
	
	func updateCheckBoxState(to state: CloveCheckBoxState) {
		model.isConfirmationChecked = state
	}
	
	func retakePhoto() {
		let cameraModel = MerchantRegCameraModel(
			documentType: .npwp,
			title: StringRes.merchant_npwp_capture_title.localizedString,
			overlayAspectRatio: MerchantRegCameraOverlayAspectRatio.idCard,
			onPhotoCaptured: { [weak self] image, base64, data in
				self?.model.capturedImage = image
				self?.model.capturedImageBase64 = base64
				self?.model.capturedImageData = data
				self?.navigationEvent.send(.previous(nil))
			}
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegCameraScreen, data: cameraModel)))
	}
	
	func loadImageFromBase64(_ base64String: String) -> UIImage? {
		guard let imageData = Data(base64Encoded: base64String) else {
			return nil
		}
		return UIImage(data: imageData)
	}
	
	func openStatusSelection() {
		model.bottomSheetNpwpStatusIsPresented = true
	}
	
	func openDatePicker() {
		model.selectedDate = model.registeredDate.toDate(fromStringWithFormat: .ddMMMyyyy)
		model.bottomSheetIsPresented = true
	}
	
	func selectDate() {
		let date = DateFormatter.shared.format(
			epoch: Int64(model.selectedDate.toEpochString()) ?? 0,
			dateFormat: .ddMMMyyyy_sspace
		)
		
		model.registeredDate = date
		model.bottomSheetIsPresented = false
	}
	
	func uploadDocument() {
		//TODO: CRP Ubah pakai method baru omnimon
		handleProcess(
			withId: uploadDocumentProcessId,
			result: CreateSavingsAccountDIManager.createSavingsAccountUseCaseInjection.resolve(CreateSavingsAccountMerchantUploadDocumentUseCase.self)!
				.process(document: model.toCreateSavingsAccountLegalDocumentEntity()),
			successHandler: uploadDocumentSuccess,
			defaultErrorHandler: ErrorHandler(
				withDefault: .popUp,
				navigationEvent: navigationEvent
			),
			customErrorHandler: handleUploadDocumentError
		)
	}
	
	// MARK: - Private Methods
	private func handleUploadDocumentError(error: Error) -> PresentationError? {
		if let uploadDocError = error as? CreateSavingsAccountMerchantUploadDocumentError {
			switch uploadDocError {
					case .documentUploadLimit:
					return ClovePopUp.PopUpType.fallback(
						variant: .bodyOnly(subtitleText: StringRes.merchant_common_pop_up_document_limit_error.localizedString),
						primaryButtonText: StringRes.general_button_ok.localizedString,
						primaryButtonAction: {
							self.navigationEvent.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen)))
						}
					)
			}
		} else if let generalError = error as? CommonError {
			if generalError == .generalError {
				return ClovePopUp.PopUpType.fallback(
					variant: .bodyOnly(subtitleText: StringRes.general_error_oops.localizedString),
					primaryButtonText: StringRes.general_button_ok.localizedString,
					primaryButtonAction: { /*Dismiss*/ }
				)
			}
		}
		
		return nil
	}
	
	private func uploadDocumentSuccess(response _: [CreateSavingsAccountLegalDocumentEntity]) {
		updateSubmitData()
		navigateToNextScreen()
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		submitData.npwpBase64Image = model.capturedImageBase64
		submitData.npwpNumber = model.npwpNumberValue
		submitData.selectedStatusNpwp = model.statusNpwpValue
		submitData.registeredNpwpDate = model.selectedDate
		merchantRegEntity.submitData = submitData
	}
	
	private func appendPersonalContactScreen() {
		appendScreen(kMerchantRegPersonalContactScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegPersonalContactScreen, data: self?.merchantRegEntity)))
		}
	}
	
	private func navigateToNextScreen() {
		appendScreen(kMerchantRegNpwpScreen)
		saveLocalData {
			self.appendPersonalContactScreen()
		}
	}
	
	// MARK: - Validation
		func validateNpwpNumber() {
		if model.npwpNumberValue.isEmpty {
			model.npwpNumberErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_npwp_npwp_number.localizedString
			)
		} else if model.npwpNumberValue.count < 16 {
			model.npwpNumberErrorText = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.npwpNumberErrorText = ""
		}
	}
}

// MARK: - Mapper
extension MerchantRegEntity {
	func toMerchantNpwpModel() -> MerchantRegNpwpModel {
		MerchantRegNpwpModel()
	}
}

extension MerchantRegNpwpModel {
	func toCreateSavingsAccountLegalDocumentEntity() -> CreateSavingsAccountLegalDocumentEntity {
		let data = capturedImageData ?? Data(base64Encoded: capturedImageBase64)
		return CreateSavingsAccountLegalDocumentEntity(
			id: "",
			data: data,
			fileName: "NPWP_\(Date().timeIntervalSince1970).jpg",
			mimeType: CreateSavingsAccountPresentationConstants().jpegImageMimeType,
			dataType: CreateSavingsAccountPresentationConstants().jpegDataType
		)
	}
}
