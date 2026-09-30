//
//  MerchantListSelectionModel.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import CloveUILib
import SwiftUI

public class MerchantListSelectionModel {
	let screenTitle: String
	let itemList: [MerchantListSelectionItemModel]
	let isSearchBarEnabled: MerchantListSelectionSearchBarState
	let onSelectedItem: (MerchantListSelectionItemModel) -> Void
	
	public init(
		screenTitle: String,
		itemList: [MerchantListSelectionItemModel],
		isSearchBarEnabled: MerchantListSelectionSearchBarState = .disabled,
		onSelectedItem: @escaping (MerchantListSelectionItemModel) -> Void
	) {
		self.screenTitle = screenTitle
		self.itemList = itemList
		self.isSearchBarEnabled = isSearchBarEnabled
		self.onSelectedItem = onSelectedItem
	}
}

public struct MerchantListSelectionItemModel: Identifiable {
	public let id = UUID()
	var itemId = ""
	var title = ""
	var titleFont = CloveUITypography.subtitle.large
	var titleColor = CloveUIColor.primary10
	var desc = ""
	var descFont = CloveUITypography.body.small
	var descColor = CloveUIColor.dark20
}

public enum MerchantListSelectionSearchBarState {
	case enabled(
		placeHolderText: String,
		searchBarType: CloveUILib.SearchBarType
	)
	case disabled
}
