
//  MerchantRegProductSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 20/05/26.
//

import Core

let kMerchantRegProductSelectionScreen = "MerchantRegProductSelectionScreen"

final class MerchantRegProductSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegProductSelectionScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegProductSelectionView(
				viewModel: MerchantRegProductSelectionViewModel(navigationObject: input)
			)
		)
	}
}
