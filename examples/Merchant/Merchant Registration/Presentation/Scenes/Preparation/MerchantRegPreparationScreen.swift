
//  MerchantRegPreparationScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Core

let kMerchantRegPreparationScreen = "MerchantRegPreparationScreen"

final class MerchantRegPreparationScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegPreparationScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegPreparationView(viewModel: MerchantRegPreparationViewModel(navigationObject: input)
			)
		)
	}
}
