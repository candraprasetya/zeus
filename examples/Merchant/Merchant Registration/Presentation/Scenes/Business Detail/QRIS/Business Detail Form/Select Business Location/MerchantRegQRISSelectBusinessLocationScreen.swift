//
//  MerchantRegQRISSelectBusinessLocationScreen.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import Core

let kMerchantRegQRISSelectBusinessLocationScreen = "kMerchantRegQRISSelectBusinessLocationScreen"

final class MerchantRegQRISSelectBusinessLocationScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegQRISSelectBusinessLocationScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantListSelectionView(
				viewModel: MerchantRegQRISSelectBusinessLocationViewModel(
					navigationObject: input
				)
			)
		)
	}
}
