//
//  MerchantRegQRISDetailFormScreen.swift
//  Merchant
//
//  Created by ITBCA on 24/06/26.
//

import Core

let kMerchantRegQRISDetailFormScreen = "kMerchantRegQRISDetailFormScreen"

final class MerchantRegQRISDetailFormScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegQRISDetailFormScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegQRISDetailFormView(
				viewModel: MerchantRegQRISDetailFormViewModel(
					navigationObject: input
				)
			)
		)
	}
}
