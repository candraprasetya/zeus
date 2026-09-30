
//  MerchantRegSoWSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/07/26.
//

import Core

let kMerchantRegSoWSelectionScreen = "MerchantRegSoWSelectionScreen"

final class MerchantRegSoWSelectionScreen: ScreenV2<NavigationObject> {

    override var identifier: String {
        return kMerchantRegSoWSelectionScreen
    }

    override func build() -> ViewController {
        return generateSwiftUIViewController(
			withView: MerchantRegSoWSelectionView(viewModel: MerchantRegSoWSelectionViewModel(navigationObject: input))
        )
    }
}
