
//  MerchantRegPersonalInformationModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import Core

struct MerchantRegPersonalInformationModel {
	// MARK: - Data for logical processes
	var sofList = [AccountModel]()
	var selectedAccount: AccountModel?
	var selectedNpwpOption: Int?
	var selectedNpwpReasonOption: Int?
	var showNpwpSection = false

	// MARK: - Data for input
	var referalCodeValue = ""
	var referalCodeValueErrorText = ""
}
