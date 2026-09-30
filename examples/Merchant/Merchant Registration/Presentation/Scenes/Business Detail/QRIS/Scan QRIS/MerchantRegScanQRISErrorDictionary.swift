//
//  MerchantRegScanQRISErrorDictionary.swift
//  Merchant
//
//  Created by ITBCA on 26/06/26.
//

@preconcurrency import Core
import CloveUI
import CloveUILib
import SharedConfig
import SharedI18nRes
import StandardLibrary
import SwiftUI

final class MerchantRegScanQRISErrorDictionary: PresentationErrorDictionary {
	let logEventName: String?
	let navigationEvent: Core.NavigationEvent
	let defaultButtonAction: @Sendable () -> Void
	let bypassScanAction: @Sendable () -> Void
	
	public init(
		logEventName: String? = nil,
		navigationEvent: Core.NavigationEvent,
		defaultButtonAction: @Sendable @escaping () -> Void,
		bypassScanAction: @Sendable @escaping () -> Void
	) {
		self.logEventName = logEventName
		self.navigationEvent = navigationEvent
		self.defaultButtonAction = defaultButtonAction
		self.bypassScanAction = bypassScanAction
	}
	
	public func handle(error: Error, processId: String) -> (any CloveUI.PresentationError)? {
		MerchantInvalidQrisCounterManager().addCounter()
		if !error.isException(ofType: MaintenanceServiceException.self) &&
			!error.isException(ofType: MaintenanceGatewayException.self) &&
			MerchantInvalidQrisCounterManager().isCounterExceedThreshold() {
			return showBypassScanPopUp(processId)
		}
		
		if let error = error as? MerchantRegParseQRISError {
			return handlePresentationError(error: error, processId: processId)
		} else {
			return handleError(error: error, processId: processId)
		}
	}
	
	private func handlePresentationError(
		error: MerchantRegParseQRISError,
		processId: String
	) -> (any CloveUI.PresentationError)? {
		switch error.type {
			case .invalidQris:
				return handleInvalidQris(processId)
			case .general:
				return defaultPopGeneralPopUp(processId: processId)
		}
	}
	
	private func handleError(
		error: Error,
		processId: String
	) -> (any CloveUI.PresentationError)? {
		let applicationException = error.asException(ofType: ApplicationException.self)
		let errorMessage = applicationException?.errorMessage.toModel().getText() ?? StringRes.general_error_oops.localizedString
		
		switch applicationException?.errorCode {
			case "MRC-3-305":
				return PresentationErrorType.popup(
					message: errorMessage,
					primaryAction: defaultButtonAction,
					processId: processId,
					icon: nil,
					title: StringRes.merchant_business_qris_details_error_qris_invalid_title.localizedString,
					primaryButtonText: StringRes.merchant_business_qris_details_scan_again.localizedString,
					secondaryButton: nil
				)
			case "MRC-3-306":
				return PresentationErrorType.popup(
					message: errorMessage,
					primaryAction: bypassScanAction,
					processId: processId,
					icon: nil,
					title: StringRes.merchant_business_qris_details_error_qris_exists_title.localizedString,
					primaryButtonText: StringRes.general_button_continue.localizedString,
					secondaryButton: (
						text: StringRes.merchant_business_qris_details_scan_again.localizedString,
						action: defaultButtonAction,
						position: .hozizontal
					)
				)
			default:
				if error.isException(ofType: GeneralErrorException.self) ||
					error.isException(ofType: PassthroughErrorException.self) ||
					error.isException(ofType: RequestTimeoutException.self) ||
					error.isException(ofType: GatewayTimeoutException.self) ||
					error.isException(ofType: ServiceTimeoutException.self) {
					return ClovePopUp.PopUpType.fallback(
						variant: .bodyOnly(subtitleText: errorMessage),
						primaryButtonText: StringRes.general_button_ok.localizedString,
						primaryButtonAction: defaultButtonAction,
						secondaryButtonPosition: nil
					)
				} else {
					return nil
				}
		}
	}
	
	private func defaultPopGeneralPopUp(processId: String) -> (any CloveUI.PresentationError)? {
		PresentationErrorType.popup(
			message: StringRes.merchant_business_qris_details_error_qris_invalid_desc.localizedString,
			primaryAction: defaultButtonAction,
			processId: processId,
			icon: nil,
			title: StringRes.merchant_business_qris_details_error_qris_invalid_title.localizedString,
			primaryButtonText: StringRes.merchant_business_qris_details_scan_again.localizedString,
			secondaryButton: nil
		)
	}
	
	private func handleInvalidQris(_ processId: String) -> (any CloveUI.PresentationError)? {
		let errorTitle = StringRes.merchant_business_qris_details_error_qris_invalid_title.localizedString
		let errorMessage = StringRes.merchant_business_qris_details_error_qris_invalid_desc.localizedString
		let primaryButtonText = StringRes.merchant_business_qris_details_scan_again.localizedString
		
		return PresentationErrorType.popup(
			message: errorMessage,
			primaryAction: self.defaultButtonAction,
			processId: processId,
			icon: nil,
			title: errorTitle,
			primaryButtonText: primaryButtonText,
			secondaryButton: nil
		)
	}
	
	private func showBypassScanPopUp(_ processId: String) -> (any CloveUI.PresentationError)? {
		let errorTitle = StringRes.merchant_business_qris_details_error_qris_failed_exceed_limit_title.localizedString
		let errorMessage = StringRes.merchant_business_qris_details_error_qris_failed_exceed_limit_desc.localizedString
		let primaryButtonText = StringRes.general_button_ok.localizedString
		
		return PresentationErrorType.popup(
			message: errorMessage,
			primaryAction: self.bypassScanAction,
			processId: processId,
			icon: nil,
			title: errorTitle,
			primaryButtonText: primaryButtonText,
			secondaryButton: nil
		)
	}
}
