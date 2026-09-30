
//  MerchantRegDeliveryAddressModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import Core

struct MerchantRegDeliveryAddressModel {
	var productType = MerchantRegProductType.edc
    // MARK: - Data for display
	var streetName = ""
	var buildingName = ""
	var name = ""
	var phoneNumber = ""

    // MARK: - Data for logical processes
	var selectedLocation: MerchantRegLocationModel?
	var selectedOption: Int? = 0
	var isHighRisk = false

    // MARK: - Data for input
	var phoneNumberInput = ""
	var phoneNumberErrorText = ""
	var receiverNameInput = ""
	var receiverNameErrorText = ""
}
