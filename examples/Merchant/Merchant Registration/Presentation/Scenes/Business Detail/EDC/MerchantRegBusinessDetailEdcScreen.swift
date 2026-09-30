
//  MerchantRegBusinessDetailEdcScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Core

let kMerchantRegBusinessDetailEdcScreen = "MerchantRegBusinessDetailEdcScreen"

final class MerchantRegBusinessDetailEdcScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailEdcScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailEdcView(viewModel: MerchantRegBusinessDetailEdcViewModel(navigationObject: input))
		)
	}
}
