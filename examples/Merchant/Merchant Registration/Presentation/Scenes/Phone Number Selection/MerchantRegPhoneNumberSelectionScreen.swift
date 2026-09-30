
//  MerchantRegPhoneNumberSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/04/26.
//

import Core

let kMerchantRegPhoneNumberSelectionScreen = "MerchantRegPhoneNumberSelectionScreen"

final class MerchantRegPhoneNumberSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegPhoneNumberSelectionScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegPhoneNumberSelectionView(
				viewModel: MerchantRegPhoneNumberSelectionViewModel(navigationObject: input)
			)
		)
	}
}
