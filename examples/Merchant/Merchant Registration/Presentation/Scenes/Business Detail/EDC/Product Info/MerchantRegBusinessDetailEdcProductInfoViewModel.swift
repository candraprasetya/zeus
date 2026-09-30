//
//  MerchantRegBusinessDetailEdcProductInfoViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegBusinessDetailEdcProductInfoViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailEdcProductInfoModel

	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()

	// MARK: - Process IDs
	let inquiryProductInfoProcessId = "inquiryProductInfoProcessId"

	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = MerchantRegBusinessDetailEdcProductInfoModel()
	}

	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}

	func getMerchantRepository() -> MerchantRegRepository? {
		MerchantRegDIManager.merchantRepositoryInjection.resolve(MerchantRegRepository.self)
	}

	func inquiryProductInfo() {
		handleProcess(
			{ try await self.getMerchantRepository()!.inquiryProductInfo(type: .transactionCost) },
			withId: inquiryProductInfoProcessId,
			successHandler: { [weak self] entity in
				self?.model = entity.toMerchantRegBusinessDetailEdcProductInfoModel()

			},
			errorDictionary: [
				MerchantRegBusinessDetailEdcProductInfoErrorDictionary(
					logEventName: "",
					retryAction: inquiryProductInfo
				),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}

	func navigateToUrl() {
		let url = URL(string: model.url)
		ClovePopUp().createPopUpView(
			type: .withIcon(
				icon: UIImage(named: "StatusWarning", bundleId: CloveUI.bundleID) ?? UIImage(),
				titleText: StringRes.merchant_facility_options_popup_link_title.localizedString,
				subtitleText: String(format: StringRes.general_browser_subtitle.localizedString, url?.host ?? ""),
				primaryButtonText: StringRes.general_button_continue.localizedString,
				primaryButtonAction: {
					if let url {
						UIApplication.shared.open(url)
					}
				},
				secondaryButtonPosition: .horizontal(
					secondaryButtonText: StringRes.general_button_nanti_saja.localizedString,
					secondaryButtonAction: {}
				)
			)
		).showPopUpView()
	}
}

// MARK: - Mapper
extension MerchantRegProductInfoEntity {
	func toMerchantRegBusinessDetailEdcProductInfoModel() -> MerchantRegBusinessDetailEdcProductInfoModel {
		MerchantRegBusinessDetailEdcProductInfoModel(
			htmlContent: htmlContent,
			url: url
		)
	}
}
