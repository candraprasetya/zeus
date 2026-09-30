
//  MerchantRegOnboardingViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Combine
import Core
import RxSwift
import Swinject

final class MerchantRegOnboardingViewModel: BaseMutableStateViewModel {
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegOnboardingModel
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	init(navigationObject _: NavigationObject) {
		model = MerchantRegOnboardingModel()
		model.isFromOpenAccount = UserDefaults.standard
			.bool(forKey: Core.UserDefaultsConstants().merchantIsFromOpenAccount)
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toPreparationScreen() {
		if model.isFromOpenAccount, PartialUpdateHelper.handlingPartialUpdate(featureKey: .merchantRegistration) {
			Task {
				try await CoreDIManager.coreRepositoryResolver.resolve(CoreRepository.self)!.deleteLocalDataMerchant()
			}
			PartialUpdateHelper.showPartialUpdatePopup(featureKey: .merchantRegistration)			
		} else {
			let navigationObject = NavigationObject(screenId: kMerchantRegPreparationScreen, data: model)
			navigationEvent.send(.next(navigationObject))
		}
	}
	
	func toHomeScreen() {
		UserDefaults.standard.removeObject(forKey: Core.UserDefaultsConstants().merchantIsFromOpenAccount)
		let navigationObject = NavigationObject(screenId: ScreenNameConstant.homeScreen)
		navigationEvent.send(.previous(navigationObject))
	}
}
