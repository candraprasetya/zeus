
//  MerchantRegNpwpScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 26/04/26.
//

import Core

let kMerchantRegNpwpScreen = "MerchantRegNpwpScreen"

final class MerchantRegNpwpScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegNpwpScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegNpwpView(
				viewModel: MerchantRegNpwpViewModel(navigationObject: input)
			)
		)
	}
}
