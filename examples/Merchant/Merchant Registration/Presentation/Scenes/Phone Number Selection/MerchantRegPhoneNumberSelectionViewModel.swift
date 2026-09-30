
//  MerchantRegPhoneNumberSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/04/26.
//

import Combine
import Core
import RxSwift

final class MerchantRegPhoneNumberSelectionViewModel: BaseMutableStateViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegPhoneNumberSelectionModel
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData() ?? MerchantRegPhoneNumberSelectionModel()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func tapToSelect(_ phone: PhoneModel) {
		model.onPhoneSelected?(phone)
		navigationEvent.send(.previous(nil))
	}
}
