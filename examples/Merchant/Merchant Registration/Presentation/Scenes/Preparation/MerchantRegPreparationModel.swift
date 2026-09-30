
//  MerchantRegPreparationModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Core
import SharedI18nRes
import StandardLibrary

struct MerchantRegPreparationModel {
	// MARK: - Data for display
	let data = [
		(text: StringRes.merchant_prepare_document_doc_1_label.localizedString,
		 details: [
		 	StringRes.merchant_prepare_document_doc_1_content.localizedString
		 ]),
		(text: StringRes.merchant_prepare_document_doc_2_label.localizedString,
		 details: [
		 	StringRes.merchant_prepare_document_doc_2_content.localizedString
		 ]),
		(text: StringRes.merchant_prepare_document_doc_3_label.localizedString,
		 details: [
		 	StringRes.merchant_prepare_document_doc_3_content.localizedString
		 ]),
		(text: StringRes.merchant_prepare_document_doc_4_label.localizedString,
		 details: [
		 	StringRes.merchant_prepare_document_doc_4_content.localizedString
		 ]),
		(text: StringRes.merchant_prepare_document_doc_5_label.localizedString,
		 details: [
		 	StringRes.merchant_prepare_document_doc_5_content.localizedString
		 ])
	]

	// MARK: - Data for logical processes
	var epochStatus = 0.0
}
