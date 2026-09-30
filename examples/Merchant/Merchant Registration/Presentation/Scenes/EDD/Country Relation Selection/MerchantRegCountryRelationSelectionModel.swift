
//  MerchantRegCountryRelationSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 02/07/26.
//

import Core

struct MerchantRegCountryRelationSelectionModel {
	// MARK: - Data for logical processes
	var selectedData = [String]()
	var selectableData = [String]()
	var hasChanged = false
	let maxSelection = 3

	// MARK: - Data for input
	var optionOnSave: (([String]) -> Void)?
	var initialSelectedData = [String]()
	var searchInput = ""
}
