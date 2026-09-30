
//  MerchantRegEddScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/06/26.
//

import Core

let kMerchantRegEddScreen = "MerchantRegEddScreen"

final class MerchantRegEddScreen: ScreenV2<NavigationObject> {

    override var identifier: String {
        return kMerchantRegEddScreen
    }

    override func build() -> ViewController {
        return generateSwiftUIViewController(
            withView: MerchantRegEddView(viewModel: MerchantRegEddViewModel(navigationObject: input))
        )
    }
}
