//
//  MerchantRegBusinessDetailQrisModel.swift
//  Merchant
//
//  Created by ITBCA on 10/06/26.
//

import Core

struct MerchantRegBusinessDetailQrisModel {
	var selectedBusinessType = MerchantRegQRISBusinessCategoryModel()
	var selectBusinessTypeErrorMessage = ""
	
	var averageMonthlyRevenue = ""
	var averageMonthlyRevenueErrorMessage = ""
	
	var registeredDate = ""
	var registeredDateErrorText = ""
	var selectedDate = Date()
	var bottomSheetIsPresented = false
	
	var selectedBusinessLocation = CodeAndLocalizableTextModel(code: "", indonesian: "", english: "")
	var selectBusinessLocationErrorMessage = ""
	
	var selectedQrisStickerOwnership: Int?
	
	var productType = MerchantRegProductType.qris
	var categoryList = [MerchantRegQRISBusinessCategoryModel]()
	var locationTypeList = [CodeAndLocalizableTextModel]()
}

struct MerchantRegQRISBusinessCategoryModel {
	var contentId = ""
	var content = CodeAndLocalizableTextModel(code: "", indonesian: "", english: "")
	var isHighRiskBased = false
	var isProfessionalLicense = false
}
