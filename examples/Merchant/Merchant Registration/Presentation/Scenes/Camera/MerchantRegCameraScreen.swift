//
//  MerchantRegCameraScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 10/05/26.
//

import CloveUI
import Core

let kMerchantRegCameraScreen = "MerchantRegCameraScreen"

final class MerchantRegCameraScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegCameraScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegCameraView(viewModel: MerchantRegCameraViewModel(navigationObject: input)),
			disableSwipeBack: true,
			shouldIgnoreTopSafeArea: true,
			backgroundType: .onBoarding,
		)
	}
}
