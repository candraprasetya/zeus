//
//  MerchantRegQRISLandingViewModel.swift
//  Merchant
//
//  Created by ITBCA on 17/06/26.
//

import CloveUI
import CloveUILib
import Core

final class MerchantRegQRISLandingViewModel: BaseViewModel {
	var navigationEvent = NavigationEvent()
	let merchantRegEntity: MerchantRegEntity
	
	init(navigationObject: NavigationObject) {
		self.merchantRegEntity = navigationObject.getData()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func getQRISImageViewWidth() -> CGFloat {
		return (CloveUI.AppInfo.screenWidth - (CloveUISpacing.large.spacing * 2)) / 2
	}
	
	func nextButtonAction() {
		let nextScreen = kMerchantRegScanQRISScreen
		merchantRegEntity.screenStack.append(nextScreen)
		navigationEvent.send(.next(
			NavigationObject(
				screenId: nextScreen,
				data: merchantRegEntity
			)
		))
	}
}
