
//  MerchantRegBusinessDetailEdcTransactionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Core

let kMerchantRegBusinessDetailEdcTransactionScreen = "MerchantRegBusinessDetailEdcTransactionScreen"

final class MerchantRegBusinessDetailEdcTransactionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailEdcTransactionScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailEdcTransactionView(viewModel: MerchantRegBusinessDetailEdcTransactionViewModel(navigationObject: input))
		)
	}
}
