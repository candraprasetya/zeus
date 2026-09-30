//
//  MerchantListSelectionViewModel.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import Core

public protocol MerchantListSelectionBaseViewModel: BaseViewModel {
	associatedtype ModelType: MerchantListSelectionModel
	var model: ModelType { get set }
	
	func onSelect(selectedItem: MerchantListSelectionItemModel) -> Void
}

extension MerchantListSelectionBaseViewModel {
	public func onSelect(selectedItem: MerchantListSelectionItemModel) -> Void {
		model.onSelectedItem(selectedItem)
		navigationEvent.send(.previous(nil))
	}
	
	public func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	public func getFilteredData(searchText: String) -> [MerchantListSelectionItemModel] {
		return if searchText.isEmpty {
			model.itemList
		} else {
			model.itemList.filter {
				$0.title.lowercased().contains(searchText.lowercased()) ||
				$0.desc.lowercased().contains(searchText.lowercased())
			}
		}
	}
	
	public func isDataNotFound(searchText: String) -> Bool {
		getFilteredData(searchText: searchText).isEmpty
	}
}
