//
//  MerchantRegScanQRISScreen.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import Core

let kMerchantRegScanQRISScreen = "kMerchantRegScanQRISScreen"

final class MerchantRegScanQRISScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegScanQRISScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegScanQRISView(
				viewModel: MerchantRegScanQRISViewModel(navigationObject: input)
			),
			shouldIgnoreTopSafeArea: true
		)
	}
}
