
//  MerchantRegVillageSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 05/05/26.
//

import Core

let kMerchantRegVillageSelectionScreen = "MerchantRegVillageSelectionScreen"

final class MerchantRegVillageSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegVillageSelectionScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegVillageSelectionView(
				viewModel: MerchantRegVillageSelectionViewModel(navigationObject: input)
			),
			disableSwipeBack: true
		)
	}
}
