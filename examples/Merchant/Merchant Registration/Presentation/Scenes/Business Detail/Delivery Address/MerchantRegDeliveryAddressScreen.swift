
//  MerchantRegDeliveryAddressScreen.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import Core

let kMerchantRegDeliveryAddressScreen = "MerchantRegDeliveryAddressScreen"

final class MerchantRegDeliveryAddressScreen: ScreenV2<NavigationObject> {

    override var identifier: String {
        return kMerchantRegDeliveryAddressScreen
    }

    override func build() -> ViewController {
        return generateSwiftUIViewController(
            withView: MerchantRegDeliveryAddressView(viewModel: MerchantRegDeliveryAddressViewModel(navigationObject: input))
        )
    }
}
