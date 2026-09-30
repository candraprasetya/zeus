//
//  MerchantRegQRISLandingScreen.swift
//  Merchant
//
//  Created by ITBCA on 17/06/26.
//

import Core

let kMerchantRegQRISLandingScreen = "kMerchantRegQRISLandingScreen"

final class MerchantRegQRISLandingScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegQRISLandingScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegQRISLandingView(
				viewModel: MerchantRegQRISLandingViewModel(navigationObject: input)
			)
		)
	}
}
