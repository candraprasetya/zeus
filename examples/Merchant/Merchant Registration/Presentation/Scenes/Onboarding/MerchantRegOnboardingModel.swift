
//  MerchantRegOnboardingModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Core
import SharedI18nRes
import StandardLibrary

public struct MerchantRegOnboardingModel {
	// MARK: - Data for display
	let data = [
		(imageString: "MerchantApplyOnboardingItem1", text: StringRes.merchant_onboarding_desc_1.localizedString),
		(imageString: "MerchantApplyOnboardingItem2", text: StringRes.merchant_onboarding_desc_2.localizedString),
		(imageString: "MerchantApplyOnboardingItem3", text: StringRes.merchant_onboarding_desc_3.localizedString)
	]

	// MARK: - Data for logical processes
	var isFromOpenAccount = false

	public init(isFromOpenAccount: Bool? = nil) {
		self.isFromOpenAccount = isFromOpenAccount ?? false
	}
}
