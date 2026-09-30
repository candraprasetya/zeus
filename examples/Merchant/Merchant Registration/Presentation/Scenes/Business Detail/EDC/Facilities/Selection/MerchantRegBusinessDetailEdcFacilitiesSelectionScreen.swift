//
//  MerchantRegBusinessDetailEdcFacilitiesSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 22/06/26.
//

import Core

let kMerchantRegBusinessDetailEdcFacilitiesSelectionScreen = "MerchantRegBusinessDetailEdcFacilitiesSelectionScreen"

final class MerchantRegBusinessDetailEdcFacilitiesSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegBusinessDetailEdcFacilitiesSelectionScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegBusinessDetailEdcFacilitiesSelectionView(viewModel: MerchantRegBusinessDetailEdcFacilitiesSelectionViewModel(navigationObject: input))
		)
	}
}
