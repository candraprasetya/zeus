
//  MerchantRegCountryRelationSelectionScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 02/07/26.
//

import Core

let kMerchantRegCountryRelationSelectionScreen = "MerchantRegCountryRelationSelectionScreen"

final class MerchantRegCountryRelationSelectionScreen: ScreenV2<NavigationObject> {

    override var identifier: String {
        return kMerchantRegCountryRelationSelectionScreen
    }

    override func build() -> ViewController {
        return generateSwiftUIViewController(
            withView: MerchantRegCountryRelationSelectionView(viewModel: MerchantRegCountryRelationSelectionViewModel(navigationObject: input))
        )
    }
}
