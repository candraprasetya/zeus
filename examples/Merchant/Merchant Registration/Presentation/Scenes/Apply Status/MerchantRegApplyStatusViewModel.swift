
//  MerchantRegApplyStatusViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary

final class MerchantRegApplyStatusViewModel: BaseMutableStateViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegApplyStatusModel
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	private let merchantBcaAppURL = URL(string: "https://merchantbcaapp.bca.co.id/a0KG/mi1wvgjy")
	
	init(navigationObject: NavigationObject) {
		model = navigationObject.getData()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func navigateToSettings() {
		navigationEvent.send(.next(NavigationObject(screenId: ScreenNameConstant.settingScreen)))
	}
	
	func openMerchantBcaApp() {
		ClovePopUp().createPopUpView(
			type: .withIcon(
				icon: UIImage(named: "StatusWarning", bundleId: CloveUI.bundleID) ?? UIImage(),
				titleText: StringRes.merchant_status_popup_link_title.localizedString,
				subtitleText: String(
					format: StringRes.general_browser_subtitle.localizedString,
					StringRes.merchant_common_popup_open_merchant_label.localizedString
				),
				primaryButtonText: StringRes.general_button_continue.localizedString,
				primaryButtonAction: {
					if let url = self.merchantBcaAppURL {
						UIApplication.shared.open(url)
					}
				},
				secondaryButtonPosition: .horizontal(
					secondaryButtonText: StringRes.general_button_nanti_saja.localizedString,
					secondaryButtonAction: { /*Dismiss*/ }
				)
			)
		).showPopUpView()
	}
	
	func toHomeScreen() {
		navigationEvent.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen)))
	}
	
	func onCopyToClipboard() {
		if let reffNo = model.reffNo {
			UIPasteboard.general.string = reffNo
			model.isShowingBanner.append(true)
		}
	}
}
