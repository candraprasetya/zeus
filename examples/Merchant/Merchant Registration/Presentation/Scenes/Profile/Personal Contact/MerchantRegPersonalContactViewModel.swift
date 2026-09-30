
//  MerchantRegPersonalContactViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegPersonalContactViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegPersonalContactModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let inquiryLegalDocsProcessId = "inquiryLegalDocsProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	
	// MARK: - Private var
	let merchantRegLegalProductType = "MERC-OPEN-EMAIL"

	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		self.model = MerchantRegPersonalContactModel()
	}
	
	// MARK: - Public Methods
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess,
			deleteOnInvalid: true,
			isValid: { _ in self.isValidEntity() }
		)
	}
	
	func saveMerchantData() {
		updateSubmitData()
		navigateToProductSelection()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func toPhoneNumberSelection() {
		updateSubmitData()
		let selectionModel = createPhoneNumberSelectionModel()
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegPhoneNumberSelectionScreen, data: selectionModel)))
	}
	
	func updateCheckBoxState(at index: Int, to state: CloveCheckBoxState) {
		model.legalDocuments[index] = MerchantRegPersonalContactAgreementItems(
			legalDocument: model.legalDocuments[index].legalDocument,
			checkBoxesState: state
		)
	}
	
	func isButtonEnabled() -> Bool {
		let checkAllAgreement = model.legalDocuments.allSatisfy { $0.checkBoxesState == .active }
		let isPhoneNumberValid = model.selectedPhoneNumber != nil
		let isSelectedAdditionalPhoneNumberOption = model.selectedAdditionalPhoneNumberOption != nil
		let isAdditionalPhoneNumberValid = (model.selectedAdditionalPhoneNumberOption == 1) ? !model.additionalPhoneNumberValue.isEmpty : true
		return checkAllAgreement && isPhoneNumberValid && isSelectedAdditionalPhoneNumberOption && isAdditionalPhoneNumberValid
	}
	
	// MARK: - Data Preparation
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		model = entity.toMerchantRegPersonalContactModel()
		
		if model.phoneNumberList.count == 1 {
			model.selectedPhoneNumber = model.phoneNumberList.first
		}
		
		fetchLegalDocuments()
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		submitData.selectedPhoneNumber = model.selectedPhoneNumber?.toPhoneEntity()
		submitData.selectedAdditionalPhoneNumberOption = model.selectedAdditionalPhoneNumberOption
		submitData.additionalBusinessPhoneNumber = (model.selectedAdditionalPhoneNumberOption == 1) ? model.additionalPhoneNumberValue : nil
		submitData.checkedAgreements = model.legalDocuments.map(\.legalDocument.documentNo)
		merchantRegEntity.submitData = submitData
		
		// Reset checkmark
		model.legalDocuments = model.legalDocuments.map {
			MerchantRegPersonalContactAgreementItems(
				legalDocument: $0.legalDocument,
				checkBoxesState: .inactive
			)
		}
	}
	
	// MARK: - Legal Documents
	private func fetchLegalDocuments() {
		let useCase = CoreDIManager
			.coreUseCaseInjection
			.resolve(LegalDocumentInquiryUseCase.self)!
		
		handleProcess(
			withId: inquiryLegalDocsProcessId,
			result: useCase.process(
				productName: merchantRegLegalProductType,
				documentType: LegalDocumentType.csd.rawValue
			),
			successHandler: { [weak self] entity in
				self?.handleLegalDocumentInquirySuccess(documents: entity)
			},
			defaultErrorHandler: ErrorHandler(withDefault: .errorState(retryHandler: { [weak self] in
				self?.fetchLegalDocuments()
			}), navigationEvent: navigationEvent)
		)
	}
	
	private func handleLegalDocumentInquirySuccess(documents: LegalDocumentListEntity) {
		model.legalDocuments = documents.toModel().documents.map {
			MerchantRegPersonalContactAgreementItems(
				legalDocument: $0,
				checkBoxesState: .inactive
			)
		}
	}
	
	// MARK: - Navigation
	private func navigateToProductSelection() {
		appendScreen(kMerchantRegProductSelectionScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegProductSelectionScreen, data: self?.merchantRegEntity)))
		}
	}
	
	// MARK: - Selection Helpers
	private func createPhoneNumberSelectionModel() -> MerchantRegPhoneNumberSelectionModel {
		MerchantRegPhoneNumberSelectionModel(onPhoneSelected: { [weak self] selectedPhoneNumber in
			self?.model.selectedPhoneNumber = selectedPhoneNumber
			self?.model.phoneNumberValue = selectedPhoneNumber.maskedPhoneNumber ?? ""
		}, phoneNumberList: model.phoneNumberList)
	}
	
	// MARK: - Validation
	func isValidEntity() -> Bool {
		!(merchantRegEntity.prepareData?.phoneNumbers.isEmpty ?? true)
	}
	
	func validateAdditionalPhoneNumber() {
		if model.additionalPhoneNumberValue.isEmpty {
			model.additionalPhoneNumberErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_personal_contact_business_phone_no.localizedString
			)
		} else {
			model.additionalPhoneNumberErrorText = ""
		}
	}
}

// MARK: - Mapper
extension MerchantRegEntity {
	func toMerchantRegPersonalContactModel() -> MerchantRegPersonalContactModel {
		MerchantRegPersonalContactModel(
			maskedEmail: prepareData?.maskedEmail ?? "",
			selectedAdditionalPhoneNumberOption: submitData?.selectedAdditionalPhoneNumberOption,
			phoneNumberList: prepareData?.phoneNumbers.map { $0.toPhoneModel() } ?? [],
			selectedPhoneNumber: submitData?.selectedPhoneNumber?.toPhoneModel(),
			phoneNumberValue: submitData?.selectedPhoneNumber?.toPhoneModel().maskedPhoneNumber ?? "",
			additionalPhoneNumberValue: submitData?.additionalBusinessPhoneNumber ?? "",
		)
	}
}

extension PhonesEntity {
	func toPhoneModel() -> PhoneModel {
		PhoneModel(maskedPhoneNumber: maskedPhoneNumber, phoneId: phoneId)
	}
}

extension PhoneModel {
	func toPhoneEntity() -> PhonesEntity {
		PhonesEntity(maskedPhoneNumber: maskedPhoneNumber, phoneId: phoneId)
	}
}
