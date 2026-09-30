
//  MerchantRegApplyStatusScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUI
import Core

public let kMerchantRegApplyStatusScreen = "MerchantRegApplyStatusScreen"

final class MerchantRegApplyStatusScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegApplyStatusScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegApplyStatusView(viewModel: MerchantRegApplyStatusViewModel(navigationObject: input)),
			disableSwipeBack: true,
			backgroundType: .onBoarding
		)
	}
}
