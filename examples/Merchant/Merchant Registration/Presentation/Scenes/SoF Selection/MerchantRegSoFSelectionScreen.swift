
//  MerchantRegSoFSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import Core

let kMerchantRegSoFSelectionScreen = "kMerchantRegSoFSelectionScreen"

class MerchantRegSoFSelectionScreen: ScreenV2<NavigationObject> {
	override var identifier: String {
		kMerchantRegSoFSelectionScreen
	}

	override public func build() -> ViewController {
		generateSwiftUIViewController(
			withView: SourceOfFundListSelectionView(
				viewModel: MerchantRegSoFSelectionViewModel(screenResult: input)
			)
		)
	}
}
