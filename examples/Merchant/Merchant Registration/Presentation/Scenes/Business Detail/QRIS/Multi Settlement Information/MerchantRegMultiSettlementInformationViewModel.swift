//
//  MerchantRegMultiSettlementInformationViewModel.swift
//  Merchant
//
//  Created by ITBCA on 29/06/26.
//

import Combine
import Core
import RxSwift
import StandardLibrary
import Swinject

final class MerchantRegMultiSettlementInformationViewModel: BaseMutableStateViewModel {
	@Published var processStates = [ProcessState]()
	@Published var multiSettlementInfoUrl = ""
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	let prepareMultiSettlementInfoProcessId = "prepareMultiSettlementInfoProcessId"
	
	init() {
		prepareMultiSettlementInfo()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	private func prepareMultiSettlementInfo() {
		handleProcess(
			{
				return try await MerchantRegDIManager
					.merchantRepositoryInjection.resolve(MerchantRegRepository.self)!
					.inquiryProductInfo(type: .multiSettlement)
			},
			withId: prepareMultiSettlementInfoProcessId,
			successHandler: { data in
				self.multiSettlementInfoUrl = data.url
			},
			errorDictionary: [
				MerchantRegMultiSettlementInformationErrorDictionary(
					retryAction: {
						self.prepareMultiSettlementInfo()
					}
				),
				LayoutErrorDictionary(
					logEventName: nil,
					retryHandler: {
						self.prepareMultiSettlementInfo()
					}
				)
			]
		)
	}
}
