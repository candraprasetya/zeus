
//  MerchantRegOnboardingScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Core

public let kMerchantRegOnboardingScreen = "MerchantRegOnboardingScreen"

final class MerchantRegOnboardingScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegOnboardingScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegOnboardingView(
				viewModel: MerchantRegOnboardingViewModel(navigationObject: input)
			),
			disableSwipeBack: true
		)
	}
}
