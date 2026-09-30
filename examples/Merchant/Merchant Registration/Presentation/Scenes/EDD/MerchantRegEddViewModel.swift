
//  MerchantRegEddViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/06/26.
//

import Combine
import Core
import Localize_Swift
import RxSwift
import SharedConfig
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegEddViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegEddModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let prepareEddProcessId = "prepareEddProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		model = MerchantRegEddModel()
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
	
	func prepareEdd() {
		handleProcess(
			{ try await self.getMerchantRepository()!.prepareEdd() },
			withId: prepareEddProcessId,
			successHandler: prepareEddSuccess,
			errorDictionary: [
				MerchantRegEddErrorDictionary(retryAction: prepareEdd),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	func isButtonEnabled() -> Bool {
		let isAnotherBankValid = model.hasAnotherBankOption != nil &&
		(model.hasAnotherBankOption != 0 || (!model.bankOrInstitutionInput.isEmpty && model.bankOrInstitutionErrorText.isEmpty))
		
		let isCountryRelationValid = model.hasCountryRelationOption != nil &&
		(model.hasCountryRelationOption != 0 || (!model.selectedCountryRelationInput.isEmpty && model.selectedCountryRelationErrorText.isEmpty))
		
		let isLivingAtCurrentAddressSinceDateValid = !model.livingAtCurrentAddressSinceDateValue.isEmpty && model.livingAtCurrentAddressSinceDateErrorText.isEmpty
		
		let isSourceOfWealthValid = !model.selectedSourceOfWealths.isEmpty && model.selectedSourceOfWealthsErrorText.isEmpty
		
		return isAnotherBankValid && isCountryRelationValid && isLivingAtCurrentAddressSinceDateValid && isSourceOfWealthValid
	}
	
	func saveMerchantData() {
		updateSubmitData()
		appendScreen(kMerchantRegEddScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent
				.send(
					.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen, data: self?.merchantRegEntity))
				)
		}
	}
	
	func openSourceOfWealthSelection() {
		var selectionModel = MerchantRegSoWSelectionModel(
			selectedData: model.selectedSourceOfWealths,
			selectableData: model.sourceOfWealthList,
			initialSelectedData: model.selectedSourceOfWealths,
			initialOtherInput: model.otherSourceOfWealthInput,
			otherInput: model.otherSourceOfWealthInput
		)
		
		selectionModel.optionOnSave = { [weak self] selectedOptions, other in
			guard let self else { return }
			
			model.selectedSourceOfWealths = model.sourceOfWealthList.filter { item in
				selectedOptions.contains(where: { $0.code == item.code })
			}
			
			model.selectedSourceOfWealthsValue = selectedOptions.compactMap { item in
				if item.code == self.model.otherOptionCode {
					if let otherText = other, !otherText.isEmpty {
						self.model.otherSourceOfWealthInput = otherText
						return otherText
					} else {
						self.model.otherSourceOfWealthInput = ""
						return nil
					}
				} else {
					return item.getText()
				}
			}.joined(separator: ", ")
			
			if !selectedOptions.contains(where: { $0.code == self.model.otherOptionCode }) {
				model.otherSourceOfWealthInput = ""
			}
			
			validateSourceOfWealth()
		}
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegSoWSelectionScreen, data: selectionModel)))
	}
	
	func openCountryRelationSelection() {
		let selectionModel = MerchantRegCountryRelationSelectionModel(
			selectedData: model.selectedCountryRelations,
			selectableData: model.countryRelationList,
			optionOnSave: { [weak self] selectedOptions in
				guard let self else { return }
				
				model.selectedCountryRelations = model.countryRelationList.filter { item in
					selectedOptions.contains(where: { $0 == item })
				}
				
				model.selectedCountryRelationInput = selectedOptions.compactMap { $0 }.joined(separator: ", ")
				
				validateCountryRelation()
			},
			initialSelectedData: model.selectedCountryRelations
		)
		
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegCountryRelationSelectionScreen, data: selectionModel)))
	}
	
	func openDatePicker() {
		model.bottomSheetIsPresented = true
	}
	
	func selectDate() {
		let epochInt = Int64(model.selectedDate.toEpochString()) ?? 0
		let date = DateFormatter.shared.format(
			epoch: epochInt,
			dateFormat: .MMMMyyyy_sspace
		)
		
		model.livingAtCurrentAddressSinceDateValue = date
		model.bottomSheetIsPresented = false
		validateLivingAtCurrentAddress()
	}
	
	// MARK: - Validation
	func validateSourceOfWealth() {
		if model.selectedSourceOfWealths.isEmpty {
			model.selectedSourceOfWealthsErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edd_source_of_wealth.localizedString
			)
		} else {
			model.selectedSourceOfWealthsErrorText = ""
		}
	}
	
	func validateLivingAtCurrentAddress() {
		if model.livingAtCurrentAddressSinceDateValue.isEmpty {
			model.livingAtCurrentAddressSinceDateErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edd_living_at_current_address_since.localizedString
			)
		} else {
			model.livingAtCurrentAddressSinceDateErrorText = ""
		}
	}
	
	func validateBankOrInstitution() {
		if model.hasAnotherBankOption == 0, model.bankOrInstitutionInput.isEmpty {
			model.bankOrInstitutionErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edd_other_bank_or_institution_name.localizedString
			)
		} else {
			model.bankOrInstitutionErrorText = ""
		}
	}
	
	func validateCountryRelation() {
		if model.hasCountryRelationOption == 0, model.selectedCountryRelationInput.isEmpty {
			model.selectedCountryRelationErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edd_other_bank_or_institution_name.localizedString
			)
		} else {
			model.selectedCountryRelationErrorText = ""
		}
	}
	
	// MARK: - Private Methods
	private func prepareEddSuccess(_ entity: MerchantRegPrepareEddEntity) {
		if merchantRegEntity.prepareData == nil {
			merchantRegEntity.prepareData = MerchantRegPrepareDataEntity()
		}
		merchantRegEntity.prepareData?.edd = entity
		
		model.sourceOfWealthList = entity.sourceOfWealths
			.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) }
		model.countryRelationList = entity.countries
		
		saveLocalData { [weak self] in
			self?.prepareLocalData()
		}
	}
	
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		
		var updatedModel = model
		
		if let submitData = merchantRegEntity.submitData {
			if let eddData = submitData.eddData {
				updatedModel.selectedSourceOfWealths = eddData.selectedSourceOfWealths?.map { PresentationMapper().mapToCodeAndLocalizableTextModel(fromEntity: $0) } ?? []
				updatedModel.otherSourceOfWealthInput = eddData.otherSourceOfWealth ?? ""
				updatedModel.selectedSourceOfWealthsValue = updatedModel.selectedSourceOfWealths.compactMap { item in
					if item.code == model.otherOptionCode {
						updatedModel.otherSourceOfWealthInput.isEmpty ? nil : updatedModel.otherSourceOfWealthInput
					} else {
						item.getText()
					}
				}.joined(separator: ", ")
				if let savedDate = eddData.residenceSinceDate {
					updatedModel.selectedDate = savedDate
					
					updatedModel.livingAtCurrentAddressSinceDateValue = DateFormatter.shared.format(
						epoch: Int64(updatedModel.selectedDate.toEpochString()) ?? 0,
						dateFormat: .MMMMyyyy_sspace
					)
				}
				
				updatedModel.hasAnotherBankOption = eddData.hasAnotherBankOption
				updatedModel.bankOrInstitutionInput = eddData.otherBankName ?? ""
				updatedModel.hasCountryRelationOption = eddData.hasCountryRelationOption
				
				updatedModel.selectedCountryRelations = eddData.selectedCountryRelations ?? []
				updatedModel.selectedCountryRelationInput = updatedModel.selectedCountryRelations.compactMap { $0 }
					.joined(separator: ", ")
			}
		}
		
		model = updatedModel
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		let edcData = submitData.edcData ?? MerchantRegEdcEntity()
		let eddData = submitData.eddData ?? MerchantRegEddEntity()
		
		eddData.selectedSourceOfWealths = model.selectedSourceOfWealths.map { $0.toLocalizableEntity() }
		eddData.residenceSinceDate = model.selectedDate
		eddData.hasAnotherBankOption = model.hasAnotherBankOption
		
		if model.hasAnotherBankOption == 0 {
			eddData.otherBankName = model.bankOrInstitutionInput
		} else {
			eddData.otherBankName = ""
		}
		
		eddData.hasCountryRelationOption = model.hasCountryRelationOption
		
		if model.hasCountryRelationOption == 0 {
			eddData.selectedCountryRelations = model.selectedCountryRelations
		} else {
			eddData.selectedCountryRelations?.removeAll()
		}
		
		eddData.otherSourceOfWealth = model.otherSourceOfWealthInput
		
		submitData.eddData = eddData
		submitData.edcData = edcData
		
		merchantRegEntity.submitData = submitData
	}
}
