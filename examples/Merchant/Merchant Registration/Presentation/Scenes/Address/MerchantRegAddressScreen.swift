
//  MerchantRegAddressScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/04/26.
//

import Core

let kMerchantRegAddressScreen = "MerchantRegAddressScreen"

final class MerchantRegAddressScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegAddressScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegAddressView(
				viewModel: MerchantRegAddressViewModel(navigationObject: input)
			)
		)
	}
}
