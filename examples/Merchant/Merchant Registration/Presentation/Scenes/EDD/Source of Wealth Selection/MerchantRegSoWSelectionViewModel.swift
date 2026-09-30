
//  MerchantRegSoWSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/07/26.
//

import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary

final class MerchantRegSoWSelectionViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegSoWSelectionModel

	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData()
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toggleOption(at idx: Int, isSelected: Bool) {
		let option = model.selectableData[idx]
		
		if isSelected {
			model.selectedData.append(option)
		} else {
			model.selectedData.removeAll { $0.code == option.code }
		}
	}
	
	func isButtonEnabled() -> Bool {
		let selectedCodes = model.selectedData.map { $0.code }.sorted()
		let initialCodes = model.initialSelectedData.map { $0.code }.sorted()
		let isSelectionChanged = selectedCodes != initialCodes
		
		let isOtherInputChanged = model.otherInput != model.initialOtherInput
		
		let isDataChanged = isSelectionChanged || isOtherInputChanged
		
		let isBaseValid = isDataChanged && !model.selectedData.isEmpty
		let isOtherValid = isOtherSelected() ? (!model.otherInput.isEmpty && model.otherErrorText.isEmpty) : true
		
		return isBaseValid && isOtherValid
	}
	
	func isOtherSelected() -> Bool {
		model.selectedData.contains(where: { $0.code == model.otherOptionCode })
	}
	
	func onSave() {
		model.optionOnSave?(model.selectedData, model.otherInput)
		navigationEvent.send(.previous(nil))
	}
	
	func validateOther() {
		if model.otherInput.isEmpty {
			model.otherErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_edd_other_notes_label.localizedString
			)
		} else {
			model.otherErrorText = ""
		}
	}
}
