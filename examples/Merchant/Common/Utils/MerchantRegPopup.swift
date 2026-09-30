//
//  MerchantRegPopup.swift
//  Merchant
//
//  Created by Candra Prasetya on 12/05/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI
import UIKit

public class MerchantRegPopUp {
	public static let shared = MerchantRegPopUp()
	private static var currentHostingController: UIViewController?
	
	public init() {} // public for fluent API: MerchantRegPopUp().createPopUpView().showPopUpView()
	
	public func createPopUpView(view: some View) -> Self {
		let wrapperView = ZStack {
			CloveUIColor.primary30.swiftUIColor.opacity(0.4)
				.ignoresSafeArea()
			
			view
				.padding(length: .xLarge)
				.frame(maxWidth: .infinity)
				.background(Color.white)
				.cornerRadius(20)
				.padding(length: .large)
		}
		
		let host = UIHostingController(rootView: wrapperView)
		host.view.backgroundColor = .clear
		host.modalPresentationStyle = .overFullScreen
		host.modalTransitionStyle = .crossDissolve
		
		if MerchantRegPopUp.currentHostingController != nil {
			MerchantRegPopUp.shared.dismissPopUp(animated: false)
		}
		
		MerchantRegPopUp.currentHostingController = host
		return self
	}
	
	public func showPopUpView() {
		guard let host = MerchantRegPopUp.currentHostingController else { return }
		
		guard let windowScene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene ?? UIApplication.shared.connectedScenes.first as? UIWindowScene,
		      let rootVC = windowScene.windows.first(where: \.isKeyWindow)?.rootViewController
		else {
			return
		}
		
		var topVC = rootVC
		while let presented = topVC.presentedViewController {
			if presented == host {
				break
			}
			topVC = presented
		}
		
		if topVC.presentedViewController != nil {
			topVC.dismiss(animated: false)
		}
		
		topVC.present(host, animated: true)
	}
	
	public func dismissPopUp(animated: Bool = true) {
		guard let host = MerchantRegPopUp.currentHostingController else { return }
		host.dismiss(animated: animated) {
			MerchantRegPopUp.currentHostingController = nil
		}
	}
	
	public func showNavigateToHomePopUpConfirmation(navigationEvent: Core.NavigationEvent) {
		let confirmationView = ClovePopUp().createPopUpView(
			type: .noIcon(
				titleText: StringRes.merchant_common_pop_up_return_home_title.localizedString,
				subtitleText: StringRes.merchant_common_pop_up_return_home_desc.localizedString,
				primaryButtonText: StringRes.general_button_yes.localizedString,
				primaryButtonAction: {
					navigationEvent.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen)))
				},
				secondaryButtonPosition: .horizontal(
					secondaryButtonText: StringRes.general_button_no.localizedString,
					secondaryButtonAction: { [weak self] in
						self?.dismissPopUp()
					}
				)
			)
		)
		
		if MerchantRegPopUp.currentHostingController != nil {
			self.dismissPopUp(animated: false)
		}
		
		confirmationView.showPopUpView()
	}
}
