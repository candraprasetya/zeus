//
//  MerchantRegBusinessDetailQrisScreen.swift
//  Merchant
//
//  Created by ITBCA on 10/06/26.
//

import Core

let kMerchantRegBusinessDetailQrisScreen = "kMerchantRegBusinessDetailQrisScreen"

final class MerchantRegBusinessDetailQrisScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailQrisScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailQrisView(
				viewModel: MerchantRegBusinessDetailQrisViewModel(
					navigationObject: input
				)
			)
		)
	}
}
