
//  MerchantRegPersonalContactModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUILib
import Core

struct MerchantRegPersonalContactModel {
	// MARK: - Data for display
	var maskedEmail = ""

	// MARK: - Data for logical processes
	var selectedAdditionalPhoneNumberOption: Int?
	var phoneNumberList = [PhoneModel]()
	var selectedPhoneNumber: PhoneModel?
	var legalDocuments = [MerchantRegPersonalContactAgreementItems]()

	// MARK: - Data for input
	var phoneNumberValue = ""
	var phoneNumberErrorText = ""
	var additionalPhoneNumberValue = ""
	var additionalPhoneNumberErrorText = ""
}

struct MerchantRegPersonalContactAgreementItems {
	var legalDocument = LegalDocumentModel()
	var checkBoxesState = CloveCheckBoxState.inactive
}
