
//  MerchantRegNpwpModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 26/04/26.
//

import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegNpwpModel {
	// MARK: - Data for display
	var capturedImage: UIImage?
	var capturedImageData: Data?
	var capturedImageBase64 = ""
	var npwpNumberValue = ""
	var npwpNumber = ""
	var npwpNumberErrorText = ""
	var statusNpwpValue = ""
	var statusNpwp = ""
	var statusNpwpErrorText = ""
	var selectedDate = Date()
	var registeredDate = ""
	var registeredDateErrorText = ""
	var isConfirmationChecked = CloveCheckBoxState.inactive
	var bottomSheetIsPresented = false
	var bottomSheetNpwpStatusIsPresented = false
	var tempCapturedImageBase64 = ""

	var popUpContent = [
		StringRes.merchant_npwp_popup_content_bullet_1.localizedString,
		StringRes.merchant_npwp_popup_content_bullet_2.localizedString,
		StringRes.merchant_npwp_popup_content_bullet_3.localizedString
	]
}
