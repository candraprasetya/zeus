
//  MerchantRegProductSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 20/05/26.
//

import Core
import SharedI18nRes
import StandardLibrary

struct MerchantRegProductSelectionModel {
	// MARK: - Data for display
	let data = [
		(
			imageString: "IconMerchantEDC",
			text: StringRes.merchant_facility_options_edc_label.localizedString,
			desc: StringRes.merchant_facility_options_edc_description.localizedString,
			tappableText: StringRes.merchant_facility_options_edc_link.localizedString),
		(
			imageString: "IconMerchantQRISStatis",
			text: StringRes.merchant_facility_options_qris_label.localizedString,
			desc: StringRes.merchant_facility_options_qris_description.localizedString,
			tappableText: StringRes.merchant_facility_options_qris_link.localizedString)
	]
}
