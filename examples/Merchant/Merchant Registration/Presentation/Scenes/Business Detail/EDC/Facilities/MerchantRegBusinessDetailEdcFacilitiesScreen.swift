
//  MerchantRegBusinessDetailEdcFacilitiesScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Core

let kMerchantRegBusinessDetailEdcFacilitiesScreen = "MerchantRegBusinessDetailEdcFacilitiesScreen"

final class MerchantRegBusinessDetailEdcFacilitiesScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailEdcFacilitiesScreen
	}

	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailEdcFacilitiesView(viewModel: MerchantRegBusinessDetailEdcFacilitiesViewModel(navigationObject: input))
		)
	}
}
