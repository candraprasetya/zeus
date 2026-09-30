
//  MerchantRegBusinessTypeSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 12/06/26.
//

import Combine
import Core
import RxSwift

final class MerchantRegBusinessTypeSelectionViewModel: MerchantListSelectionBaseViewModel {
	@Published var processStates = [ProcessState]()
	var model: MerchantListSelectionModel

	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()

	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData()
	}
}
