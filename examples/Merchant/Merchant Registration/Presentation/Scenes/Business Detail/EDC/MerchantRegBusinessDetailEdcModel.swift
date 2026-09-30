
//  MerchantRegBusinessDetailEdcModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Core

struct MerchantRegBusinessDetailEdcModel {
	// MARK: - Data for display
	var categoryList = [MerchantRegCategoryModel]()
	var ownershipStatusList = [CodeAndLocalizableTextModel]()
	var locationTypeList = [CodeAndLocalizableTextModel]()
	var facilityList = [CodeAndLocalizableTextModel]()

	// MARK: - Data for logical processes
	var productType = MerchantRegProductType.edc
	var selectedBusinessType: MerchantRegCategoryModel?
	var selectedOwnershipStatus: CodeAndLocalizableTextModel?
	var selectedBusinessLocation: CodeAndLocalizableTextModel?
	var businessEstablishmentDate: Date?
	var bottomSheetIsPresented = false

	// MARK: - EDC specific
	var businessNameInput = ""
	var businessNameErrorText = ""
	var selectedBusinessTypeValue = ""
	var selectedBusinessTypeErrorText = ""
	var selectedBusinessOwnershipStatusValue = ""
	var selectedBusinessOwnershipStatusErrorText = ""
	var selectedBusinessLocationValue = ""
	var selectedBusinessLocationErrorText = ""
	var selectedEdcFromAnotherBankOption: Int?
	var edcIssuingInstitutionInput = ""
	var edcIssuingInstitutionErrorText = ""
	var selectedDate = Date()
	var businessEstablishmentDateValue = ""
	var businessEstablishmentDateErrorText = ""
}

// MARK: - Category Model
struct MerchantRegCategoryModel {
	var contentId = ""
	var content = CodeAndLocalizableTextModel(code: "", indonesian: "", english: "")
	var isHighRiskBased = false
	var isProfessionalLicense = false
}
