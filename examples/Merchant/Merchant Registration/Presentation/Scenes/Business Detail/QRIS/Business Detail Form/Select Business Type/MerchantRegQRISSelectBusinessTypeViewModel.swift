//
//  MerchantRegQRISSelectBusinessTypeViewModel.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import Combine
import Core
import RxSwift

final class MerchantRegQRISSelectBusinessTypeViewModel: MerchantListSelectionBaseViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantListSelectionModel
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData()
	}
}
