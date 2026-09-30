
//  MerchantRegPersonalInformationScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import Core

let kMerchantRegPersonalInformationScreen = "MerchantRegPersonalInformationScreen"

final class MerchantRegPersonalInformationScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegPersonalInformationScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegPersonalInformationView(
				viewModel: MerchantRegPersonalInformationViewModel(navigationObject: input)
			),
			disableSwipeBack: true
		)
	}
}
