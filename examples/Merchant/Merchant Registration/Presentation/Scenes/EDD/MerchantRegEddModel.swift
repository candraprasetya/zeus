
//  MerchantRegEddModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/06/26.
//

import Core

struct MerchantRegEddModel {
	// MARK: - Data for display
	var sourceOfWealthList = [CodeAndLocalizableTextModel]()
	var countryRelationList = [String]()

	// MARK: - Data for logical processes
	var selectedSourceOfWealths = [CodeAndLocalizableTextModel]()
	var selectedCountryRelations = [String]()
	var bottomSheetIsPresented = false
	var selectedDate = Date()
	var hasAnotherBankOption: Int?
	var hasCountryRelationOption: Int?
	let otherOptionCode = "99"

	// MARK: - Data for input
	var selectedSourceOfWealthsValue = ""
	var selectedSourceOfWealthsErrorText = ""
	var livingAtCurrentAddressSinceDateValue = ""
	var livingAtCurrentAddressSinceDateErrorText = ""
	var bankOrInstitutionInput = ""
	var bankOrInstitutionErrorText = ""
	var selectedCountryRelationInput = ""
	var selectedCountryRelationErrorText = ""
	var otherSourceOfWealthInput = ""
}
