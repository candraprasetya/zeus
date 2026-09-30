
//  MerchantRegProductSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 20/05/26.
//

import CloveUI
import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegProductSelectionViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegProductSelectionModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Private Properties
	private let edcURL = URL(string: "https://www.bca.co.id/id/bisnis/produk/penerimaan-bisnis/edc-bca")
	private let qrisURL = URL(string: "https://www.bca.co.id/id/bisnis/produk/penerimaan-bisnis/QRIS-bisnis")
	
	// MARK: - Process IDs
	let inquiryStatusProcessId = "merchantInquiryStatusProcessId"
	let prepareProcessId = "merchantPrepareProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	
	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		self.model = MerchantRegProductSelectionModel()
	}
	
	func prepareLocalData() {
		loadLocalData(
			successHandler: { [weak self] entity in
				self?.prepareDataSuccess(entity: entity)
			}
		)
	}
	
	private func prepareDataSuccess(entity _: MerchantRegEntity) {
		// Just reactive update if needed
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
		
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func navigateToUrl(index: Int) {
		let url = index == 0 ? edcURL : qrisURL
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
					secondaryButtonAction: { /*Dismiss*/ }
				)
			)
		).showPopUpView()
	}
	
	func navigateToAddressDetail(index: Int) {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		submitData.productType = index == 0 ? MerchantRegProductType.edc : MerchantRegProductType.qris
		merchantRegEntity.submitData = submitData
		
		appendScreen(kMerchantRegAddressScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegAddressScreen, data: self?.merchantRegEntity)))
		}
	}
}
