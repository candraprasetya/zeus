//
//  MerchantRegQRISSelectBusinessTypeScreen.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import Core

let kMerchantRegQRISSelectBusinessTypeScreen = "kMerchantRegQRISSelectBusinessTypeScreen"

final class MerchantRegQRISSelectBusinessTypeScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegQRISSelectBusinessTypeScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantListSelectionView(
				viewModel: MerchantRegQRISSelectBusinessTypeViewModel(
					navigationObject: input
				)
			)
		)
	}
}
