//
//  MerchantRegBusinessDetailQrisErrorDictionary.swift
//  Merchant
//
//  Created by ITBCA on 01/07/26.
//

@preconcurrency import Core
import CloveUI
import CloveUILib
import SharedConfig
import SharedI18nRes
import StandardLibrary
import SwiftUI

final class MerchantRegBusinessDetailQrisErrorDictionary: PresentationErrorDictionary {
	let logEventName: String?
	let retryAction: @Sendable () -> Void
	
	public init(
		logEventName: String? = nil,
		retryAction: @Sendable @escaping () -> Void
	) {
		self.logEventName = logEventName
		self.retryAction = retryAction
	}
	
	public func handle(error: Error, processId: String) -> (any CloveUI.PresentationError)? {
		let applicationException = error.asException(ofType: ApplicationException.self)
		let errorMessage = applicationException?.errorMessage.toModel().getText() ?? StringRes.general_error_oops.localizedString
		
		if error.isException(ofType: GeneralErrorException.self) ||
			error.isException(ofType: PassthroughErrorException.self) ||
			error.isException(ofType: RequestTimeoutException.self) ||
			error.isException(ofType: GatewayTimeoutException.self) ||
			error.isException(ofType: ServiceTimeoutException.self) {
			return showRetryPresentationError(errorMessage: errorMessage, processId: processId)
		} else if let commonError = error as? Core.CommonError {
			switch commonError {
				case .missingMandatoryField:
					return showRetryPresentationError(errorMessage: errorMessage, processId: processId)
				default:
					return nil
			}
		} else {
			return nil
		}
	}
	
	private func showRetryPresentationError(
		errorMessage: String,
		processId: String
	) -> (any CloveUI.PresentationError)? {
		return PresentationErrorType.onScreen(
			message: errorMessage,
			primaryAction: retryAction,
			processId: processId,
			buttonText: StringRes.general_button_retry.localizedString,
			icon: .timeoutWithRefresh
		)
	}
}
