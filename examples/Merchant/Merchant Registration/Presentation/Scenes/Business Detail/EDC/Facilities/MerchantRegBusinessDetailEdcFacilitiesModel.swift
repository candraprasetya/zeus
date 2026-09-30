
//  MerchantRegBusinessDetailEdcFacilitiesModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Core

struct MerchantRegBusinessDetailEdcFacilitiesModel {
	// MARK: - Data for display
	var facilityList = [CodeAndLocalizableTextModel]()
	
	// MARK: - Data for logical processes
	var productType = MerchantRegProductType.edc
	var selectedEdcFacilities = [CodeAndLocalizableTextModel]()
	
	// MARK: - Data for input
	var cashierTableCountInput = ""
	var cashierTableCountErrorText = ""
	
	var desiredEdcCountInput = ""
	var desiredEdcCountErrorText = ""
	
	var selectedEdcFacilityValue = ""
	var selectedEdcFacilityErrorText = ""
}
