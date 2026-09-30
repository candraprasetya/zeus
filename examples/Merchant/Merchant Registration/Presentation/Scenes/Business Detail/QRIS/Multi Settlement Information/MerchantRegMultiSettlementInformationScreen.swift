//
//  MerchantRegMultiSettlementInformationScreen.swift
//  Merchant
//
//  Created by ITBCA on 29/06/26.
//

import Core

let kMerchantRegMultiSettlementInformationScreen = "kMerchantRegMultiSettlementInformationScreen"

final class MerchantRegMultiSettlementInformationScreen: ScreenV2<()> {
	override var identifier: String {
		kMerchantRegMultiSettlementInformationScreen
	}
	
	override func build() -> ViewController {
		generateSwiftUIViewController(
			withView: MerchantRegMultiSettlementInformationView(
				viewModel: MerchantRegMultiSettlementInformationViewModel()
			)
		)
	}
}
