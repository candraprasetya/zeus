//  MerchantRegBusinessDetailEdcFacilitiesSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 22/06/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import Foundation
import RxSwift
import SharedI18nRes
import StandardLibrary

final class MerchantRegBusinessDetailEdcFacilitiesSelectionViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailEdcFacilitiesSelectionModel

	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()

	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		model = navigationObject.getData()
		updateSelectAllState()
	}

	// MARK: - Public Methods
	func toggleSelectAll() {
		if model.selectAll == .active {
			model.selectedData.removeAll()
		} else {
			model.selectedData = model.selectableData
		}
		updateSelectAllState()
	}

	func toggleOption(at idx: Int, isSelected: Bool) {
		let option = model.selectableData[idx]
		if isSelected {
			model.selectedData.append(option)
		} else {
			model.selectedData.removeAll { $0.code == option.code }
		}
		updateSelectAllState()
	}
	
	private func updateSelectAllState() {
		let selectedCount = model.selectedData.count
		if selectedCount == model.selectableData.count {
			model.selectAll = .active
		} else if selectedCount > 0 {
			model.selectAll = .indeterminate
		} else {
			model.selectAll = .inactive
		}
		
		let currentCodes = model.selectedData.map { $0.code }.sorted()
		let initialCodes = model.initialSelectedData.map { $0.code }.sorted()
		model.hasChanged = currentCodes != initialCodes
	}

	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}

	func isButtonEnabled() -> Bool {
		model.hasChanged && !model.selectedData.isEmpty
	}

	func onSave() {
		model.optionOnSave?(model.selectedData)
		navigationEvent.send(.previous(nil))
	}
}
