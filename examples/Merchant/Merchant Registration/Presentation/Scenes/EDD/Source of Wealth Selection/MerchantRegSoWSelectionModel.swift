
//  MerchantRegSoWSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/07/26.
//

import Core

struct MerchantRegSoWSelectionModel {
    // MARK: - Data for logical processes
	var selectedData = [CodeAndLocalizableTextModel]()
	var selectableData = [CodeAndLocalizableTextModel]()
	var hasChanged = false
	let otherOptionCode = "99"

    // MARK: - Data for input
	var optionOnSave: (([CodeAndLocalizableTextModel], String?) -> Void)?
	var initialSelectedData = [CodeAndLocalizableTextModel]()
	var initialOtherInput = ""
	var otherInput = ""
	var otherErrorText = ""
}
