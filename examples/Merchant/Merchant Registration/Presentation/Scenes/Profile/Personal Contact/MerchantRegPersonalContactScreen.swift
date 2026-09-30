
//  MerchantRegPersonalContactScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import Core

let kMerchantRegPersonalContactScreen = "MerchantRegPersonalContactScreen"

final class MerchantRegPersonalContactScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegPersonalContactScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegPersonalContactView(
				viewModel: MerchantRegPersonalContactViewModel(navigationObject: input)
			)
		)
	}
}
