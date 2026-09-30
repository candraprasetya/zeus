//
//  MerchantRegBusinessDetailEdcFacilitiesSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 22/06/26.
//

import CloveUI
import CloveUILib
import Core

struct MerchantRegBusinessDetailEdcFacilitiesSelectionModel {
	var title = ""
	var headerText = ""
	var selectedData = [CodeAndLocalizableTextModel]()
	var selectableData = [CodeAndLocalizableTextModel]()
	var hasChanged = false
	var selectAll = CloveCheckBoxState.inactive
	var optionOnSave: (([CodeAndLocalizableTextModel]) -> Void)?
	var initialSelectedData = [CodeAndLocalizableTextModel]()
}
