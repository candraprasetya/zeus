
//  MerchantRegPhoneNumberSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/04/26.
//

import Core

struct MerchantRegPhoneNumberSelectionModel {
	// MARK: - Data for logical processes
	var onPhoneSelected: ((PhoneModel) -> Void)?
	var phoneNumberList = [PhoneModel]()
}
