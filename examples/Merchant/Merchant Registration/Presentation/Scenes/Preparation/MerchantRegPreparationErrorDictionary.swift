//
//  MerchantRegPreparationErrorDictionary.swift
//  Merchant
//
//  Created by Candra Prasetya on 21/05/26.
//

import CloveUI
import CloveUILib
@preconcurrency import Core
import SharedConfig
import SharedI18nRes
import StandardLibrary
import SwiftUI

public final class MerchantRegPreparationErrorDictionary: PresentationErrorDictionary {
	public let logEventName: String?
	public let newHandling: Bool
	public let navigationEvent: NavigationEvent
	public let retryPrepareAction: @Sendable () -> Void
	
	private let navigateToHome: @Sendable () -> Void
	
	public init(
		logEventName: String? = nil,
		navigationEvent: NavigationEvent,
		newHandling: Bool? = nil,
		retryPrepareAction: @Sendable @escaping () -> Void
	) {
		self.logEventName = logEventName
		self.navigationEvent = navigationEvent
		self.retryPrepareAction = retryPrepareAction
		self.newHandling = newHandling ?? true
		self.navigateToHome = { navigationEvent.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen))) }
	}
	
	public func handle(error: any Error, processId: String) -> (any CloveUI.PresentationError)? {
		let applicationException = error.asException(ofType: PassthroughErrorException.self)
		let errorMessage = applicationException?.errorMessage.toModel().getText() ?? StringRes.general_error_oops.localizedString
		
		return if let errorCode = applicationException?.errorCode {
			switch errorCode {
				case let code where code.contains("MRC-3-304"):
					constructPopup(
						errorMessage: errorMessage,
						processId: processId,
						action: {
							if let mainDelegate {
								RemoveProvisioningHelper.shared.resetLocalStoredData()
								mainDelegate.logOutInvalidDataWithoutPopUp()
							}
						}
					)
				case let code where code.contains("MRC-3-301"):
					constructPopupWithIcon(
						iconString: "StatusFailed",
						errorMessage: errorMessage,
						processId: processId,
						action: navigateToHome
					)
				case let code where code.contains("MRC-3-302"):
					constructPopupWithIcon(
						iconString: "StatusWarning",
						errorMessage: errorMessage,
						processId: processId,
						action: navigateToHome
					)
				case let code where code.contains("MRC-3-303"):
					constructPopupVerticalButton(
						errorMessage: errorMessage,
						processId: processId,
						action: { [weak self] in
							self?.navigationEvent
								.send(.next(NavigationObject(screenId: ScreenNameConstant().personalInfoWebViewScreen)))
						},
						secondaryAction: { [weak self] in
							self?.navigateToHome()
						}
					)
				default:
					constructPopup(
						errorMessage: errorMessage,
						processId: processId,
						action: navigateToHome
					)
			}
		} else if error.isException(ofType: GeneralErrorException.self) ||
					error.isException(ofType: GatewayTimeoutException.self) ||
					error.isException(ofType: ServiceTimeoutException.self) ||
					error.isException(ofType: NoConnectivityException.self) ||
					error.isException(ofType: RequestTimeoutException.self) {
			constructPopup(
				errorMessage: errorMessage,
				processId: processId,
				action: navigateToHome
			)
		} else {
			nil
		}
	}
	
	private func constructPopup(
		errorMessage: String,
		processId: String,
		action: (() -> Void)? = nil
	) -> (any CloveUI.PresentationError) {
		!newHandling ? ClovePopUp.PopUpType.fallback(
			variant: .bodyOnly(subtitleText: errorMessage),
			primaryButtonText: StringRes.general_button_ok.localizedString,
			primaryButtonAction: { action?() }
		) : PresentationErrorType.popup(
			message: errorMessage,
			primaryAction: { action?() },
			processId: processId,
			primaryButtonText: StringRes.general_button_ok.localizedString
		)
	}
	
	private func constructPopupWithIcon(
		iconString: String,
		errorMessage: String,
		processId: String,
		action: (() -> Void)? = nil
	) -> (any CloveUI.PresentationError) {
		!newHandling ? ClovePopUp.PopUpType.withIcon(
			icon: UIImage(named: iconString, in: Bundle(identifier: CloveUI.bundleID), compatibleWith: nil) ?? UIImage(),
			titleText: "",
			subtitleText: errorMessage,
			primaryButtonText: StringRes.general_button_ok.localizedString,
			primaryButtonAction: { action?() },
			secondaryButtonPosition: nil
		) : PresentationErrorType.popup(
			message: errorMessage,
			primaryAction: action,
			processId: processId,
			icon: (name: iconString, bundle: Bundle(identifier: CloveUI.bundleID) ?? Bundle()),
			primaryButtonText: StringRes.general_button_ok.localizedString
		)
	}
	
	private func constructPopupVerticalButton(
		errorMessage: String,
		processId: String,
		action: (() -> Void)? = nil,
		secondaryAction: (() -> Void)? = nil
	) -> (any CloveUI.PresentationError) {
		!newHandling ? ClovePopUp.PopUpType.fallback(
			variant: .bodyOnly(subtitleText: errorMessage),
			primaryButtonText: StringRes.merchant_common_update_data.localizedString,
			primaryButtonAction: { action?() },
			secondaryButtonPosition: .vertical(
				secondaryButtonText: StringRes.general_button_later.localizedString,
				secondaryButtonAction: { secondaryAction?() }
			)
		) : PresentationErrorType.popup(
			message: errorMessage,
			primaryAction: action,
			processId: processId,
			primaryButtonText: StringRes.merchant_common_update_data.localizedString,
			secondaryButton: (
				text: StringRes.general_button_later.localizedString,
				action: { secondaryAction?() },
				position: .vertical
			)
		)
	}
}
