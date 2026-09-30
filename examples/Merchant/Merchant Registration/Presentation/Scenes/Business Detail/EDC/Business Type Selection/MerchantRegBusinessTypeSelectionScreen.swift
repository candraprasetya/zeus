
//  MerchantRegBusinessTypeSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 12/06/26.
//

import CloveUI
import Core

public let kMerchantRegBusinessTypeSelectionScreen = "MerchantRegBusinessTypeSelectionScreen"

final class MerchantBusinessTypeSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessTypeSelectionScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantListSelectionView(viewModel: MerchantRegBusinessTypeSelectionViewModel(navigationObject: input))
		)
	}
}
