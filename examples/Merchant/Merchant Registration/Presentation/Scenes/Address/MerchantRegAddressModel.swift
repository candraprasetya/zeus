
//  MerchantRegAddressModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/04/26.
//

import CoreLocation

struct MerchantRegAddressModel {
	// MARK: - Data for logical processes
	var selectedCoordinate: CLLocationCoordinate2D?
	var selectedAddress = ""
	var selectedAddressErrorText = ""
	var selectedVillage = ""
	var selectedVillageErrorText = ""
	var streetName = ""
	var streetNameErrorText = ""
	var buildingName = ""
	var buildingNameErrorText = ""
	var productType = MerchantRegProductType.edc
	var selectedLocation: MerchantRegLocationModel?
}
