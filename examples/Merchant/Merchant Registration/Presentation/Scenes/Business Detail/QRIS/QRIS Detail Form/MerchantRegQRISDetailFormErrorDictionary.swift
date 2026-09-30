//
//  MerchantRegQRISDetailFormErrorDictionary.swift
//  Merchant
//
//  Created by ITBCA on 21/07/26.
//

import CloveUI
import CloveUILib
import Core
import SharedConfig
import SharedI18nRes
import StandardLibrary

final class MerchantRegQRISDetailFormErrorDictionary: PresentationErrorDictionary {
	let logEventName: String?
	
	public init(logEventName: String? = nil) {
		self.logEventName = logEventName
	}
	
	public func handle(error: Error, processId: String) -> (any CloveUI.PresentationError)? {
		guard let applicationException = error.asException(ofType: ApplicationException.self) else {
			return nil
		}
		
		let errorCode = applicationException.errorCode
		switch errorCode {
			case "MRC-3-305", "MRC-3-306":
				return ClovePopUp.PopUpType.fallback(
					variant: .bodyOnly(
						subtitleText: StringRes.merchant_business_qris_details_error_nmid_not_valid.localizedString
					),
					primaryButtonText: StringRes.general_button_ok.localizedString,
					primaryButtonAction: { /* Do nothing, dismiss only! */},
					secondaryButtonPosition: nil
				)
			default:
				return nil
		}
	}
}
