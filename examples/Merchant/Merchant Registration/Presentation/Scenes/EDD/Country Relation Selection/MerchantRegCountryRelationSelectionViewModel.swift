
//  MerchantRegCountryRelationSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 02/07/26.
//

import Combine
import Core
import RxSwift

final class MerchantRegCountryRelationSelectionViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegCountryRelationSelectionModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		model = navigationObject.getData()
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	var filteredData: [String] {
		if model.searchInput.isEmpty { return model.selectableData }
		
		return model.selectableData.filter {
			$0.localizedCaseInsensitiveContains(model.searchInput)
		}
	}
	
	var isMaxSelected: Bool {
		model.selectedData.count >= model.maxSelection
	}
	
	func toggleOption(label: String, isSelected: Bool) {
		if isSelected {
			guard !isMaxSelected,
			      !model.selectedData.contains(where: { $0 == label }),
			      let itemToAdd = model.selectableData.first(where: { $0 == label })
			else { return }
			
			model.selectedData.append(itemToAdd)
		} else {
			removeSelected(label: label)
		}
	}
	
	func removeSelected(label: String) {
		model.selectedData.removeAll { $0 == label }
	}
	
	func isButtonEnabled() -> Bool {
		let currentCodes = model.selectedData.sorted()
		let initialCodes = model.initialSelectedData.sorted()
		
		return currentCodes != initialCodes && !model.selectedData.isEmpty
	}
	
	func onSave() {
		model.optionOnSave?(model.selectedData)
		navigationEvent.send(.previous(nil))
	}
}
