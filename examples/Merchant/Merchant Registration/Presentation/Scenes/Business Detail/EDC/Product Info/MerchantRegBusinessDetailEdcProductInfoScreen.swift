//
//  MerchantRegBusinessDetailEdcProductInfoScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import Core

let kMerchantRegBusinessDetailEdcProductInfoScreen = "MerchantRegBusinessDetailEdcProductInfoScreen"

final class MerchantRegBusinessDetailEdcProductInfoScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailEdcProductInfoScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailEdcProductInfoView(viewModel: MerchantRegBusinessDetailEdcProductInfoViewModel(navigationObject: input))
		)
	}
}
