//
//  MerchantRegCoordinator.swift
//  Merchant
//
//  Created by Candra Prasetya on 31/03/26.
//

import Aegis
import Core
import CoreLocation
import UIKit

public class MerchantRegCoordinator: Coordinator {
	public var parentCoordinator: Core.CoordinatorProtocol?
	public var child: Core.CoordinatorProtocol?
	public var navigationController: Core.BaseNavigationController
	public var screenStack: [Core.Screenable] = []
	public var lastViewController: UIViewController?
	
	public let isFromOpenAccount: Bool
	public let navigationObject: NavigationObject?
	public var bridgingHomeCoordClosure: ((NavigationObject) -> Void)?
	public var bridgingOpenAccountClosure: ((NavigationObject) -> Void)?
	public var bridgingPersonalizationClosure: ((ScreenResult?) -> Coordinator?)?
	public var bridgingPersonalInformationClosure: ((ScreenResult?) -> Coordinator?)?
	
	public init(
		navigationController: Core.BaseNavigationController,
		isFromOpenAccount: Bool = false,
		navigationObject: NavigationObject? = nil
	) {
		self.navigationController = navigationController
		self.isFromOpenAccount = isFromOpenAccount
		self.navigationObject = navigationObject
		
		super.init()
	}
	
	public func start() {
		MerchantInvalidQrisCounterManager().resetCounter()
		if let navigationObject {
			if let entity = navigationObject.data as? MerchantRegEntity {
				MerchantRegSession.shared.entity = entity
			}
			
			if let entity = navigationObject.data as? MerchantRegEntity, !entity.screenStack.isEmpty {
				initializeLastScreen(entity.screenStack, entity: entity)
			} else if navigationObject.screenId == kMerchantRegOnboardingScreen {
				set([MerchantRegOnboardingScreen(navigationObject)])
			} else if navigationObject.screenId == kMerchantRegApplyStatusScreen {
				set([MerchantRegApplyStatusScreen(navigationObject)])
			}
		}
	}
	
	public func showScreen(identifier: String, navigation: Core.Navigation) {
		switch identifier {
			case kMerchantRegOnboardingScreen:
				configureMerchantRegOnboardingNavigationEvent(navigation)
			case kMerchantRegPreparationScreen:
				configureMerchantRegPreparationNavigationEvent(navigation)
			case kMerchantRegApplyStatusScreen:
				configureMerchantRegApplyStatusNavigationEvent(navigation)
			case kMerchantRegPersonalInformationScreen:
				configureMerchantRegPersonalInformationNavigationEvent(navigation)
			case kMerchantRegNpwpScreen:
				configureMerchantRegNpwpNavigationEvent(navigation)
			case kMerchantRegSoFSelectionScreen,
			     kMerchantRegPhoneNumberSelectionScreen,
			     kMerchantRegCameraScreen, kMerchantRegVillageSelectionScreen, kMerchantRegBusinessTypeSelectionScreen,
			     kMerchantRegBusinessDetailEdcFacilitiesSelectionScreen, kMerchantRegBusinessDetailEdcProductInfoScreen, kMerchantRegSoWSelectionScreen, kMerchantRegCountryRelationSelectionScreen:
				pop()
			case kMerchantRegPersonalContactScreen:
				configureMerchantRegPersonalContactNavigationEvent(navigation)
			case kMerchantRegAddressScreen:
				configureMerchantRegAddressNavigationEvent(navigation)
			case kMerchantRegProductSelectionScreen:
				configureMerchantRegProductSelectionNavigationEvent(navigation)
			case kMerchantRegBusinessDetailEdcScreen:
				configureMerchantRegBusinessDetailEdcNavigationEvent(navigation)
			case kMerchantRegBusinessDetailEdcTransactionScreen:
				configureMerchantRegBusinessDetailEdcTransactionNavigationEvent(navigation)
			case kMerchantRegBusinessDetailEdcFacilitiesScreen:
				configureMerchantRegBusinessDetailEdcFacilitiesNavigationEvent(navigation)
			case kMerchantRegDeliveryAddressScreen:
				configureMerchantRegBusinessDetailDeliveryAddressNavigationEvent(navigation)
			case kMerchantRegEddScreen:
				configureMerchantRegEddNavigationEvent(navigation)
			case kMerchantRegBusinessDetailQrisScreen:
				configureMerchantRegBusinessDetailQrisNavigationEvent(navigation)
			case kMerchantRegQRISSelectBusinessTypeScreen:
				configureMerchantRegQRISSelectBusinessTypeNavigationEvent(navigation)
			case kMerchantRegQRISSelectBusinessLocationScreen:
				configureMerchantRegQRISSelectBusinessLocationNavigationEvent(navigation)
			case kMerchantRegQRISLandingScreen:
				configureMerchantRegQRISLandingNavigationEvent(navigation)
			case kMerchantRegScanQRISScreen:
				configureMerchantRegScanQRISNavigationEvent(navigation)
			case kMerchantRegQRISDetailFormScreen:
				configureMerchantRegQRISDetailFormNavigationEvent(navigation)
			case kMerchantRegMultiSettlementInformationScreen:
				configureMerchantRegMultiSettlementInformationNavigationEvent(navigation)
			default:
				break
		}
	}
	
	private func configureMerchantRegOnboardingNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegPreparationScreen {
					push(MerchantRegPreparationScreen(result))
				}
		}
	}
	
	private func configureMerchantRegPreparationNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				
				if let entity = result.data as? MerchantRegEntity, !entity.screenStack.isEmpty {
					initializeLastScreen(entity.screenStack, entity: entity)
					return
				}
				
				switch result.screenId {
					case kMerchantRegApplyStatusScreen:
						push(MerchantRegApplyStatusScreen(result))
					case kMerchantRegPersonalInformationScreen:
						push(MerchantRegPersonalInformationScreen(result))
					case kMerchantRegPersonalContactScreen:
						push(MerchantRegPersonalContactScreen(result))
					case kMerchantRegAddressScreen:
						push(MerchantRegAddressScreen(result))
					case kMerchantRegNpwpScreen:
						push(MerchantRegNpwpScreen(result))
					case ScreenNameConstant().personalInfoWebViewScreen:
						if let coordinator = bridgingPersonalInformationClosure?(result) {
							startChild(coordinator)
							
							coordinator.parentCoordinator = parentCoordinator
							parentCoordinator?.child = coordinator
						}
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegApplyStatusNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case kMerchantRegAddressScreen:
						push(MerchantRegPreparationScreen(result))
					case ScreenNameConstant.settingScreen:
						toPersonalization()
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegPersonalInformationNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case kMerchantRegSoFSelectionScreen:
						push(MerchantRegSoFSelectionScreen(result))
					case kMerchantRegPersonalContactScreen:
						push(MerchantRegPersonalContactScreen(result))
					case kMerchantRegCameraScreen:
						push(MerchantRegCameraScreen(result))
					case kMerchantRegNpwpScreen:
						pushAndDismiss(
							MerchantRegNpwpScreen(result),
							byIdentifier: kMerchantRegPersonalInformationScreen
						)
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegNpwpNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case kMerchantRegCameraScreen:
						push(MerchantRegCameraScreen(result))
					case kMerchantRegPersonalContactScreen:
						push(MerchantRegPersonalContactScreen(result))
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegPersonalContactNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case kMerchantRegAddressScreen:
						push(MerchantRegAddressScreen(result))
					case kMerchantRegSoFSelectionScreen:
						push(MerchantRegSoFSelectionScreen(result))
					case kMerchantRegPhoneNumberSelectionScreen:
						push(MerchantRegPhoneNumberSelectionScreen(result))
					case kMerchantRegProductSelectionScreen:
						push(MerchantRegProductSelectionScreen(result))
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegAddressNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case ScreenNameConstant().merchantRegMapsScreen:
						bridgingHomeCoordClosure?(result)
					case kMerchantRegVillageSelectionScreen:
						push(MerchantRegVillageSelectionScreen(result))
					case kMerchantRegBusinessDetailQrisScreen:
						push(MerchantRegBusinessDetailQrisScreen(result))
					case kMerchantRegBusinessDetailEdcScreen:
						push(MerchantRegBusinessDetailEdcScreen(result))
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegBusinessDetailQrisNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				guard let result = value as? NavigationObject else {
					pop()
					return
				}
				switch result.screenId {
					case ScreenNameConstant.homeScreen:
						navigateToHome(result)
					default:
						pop(byIdentifier: result.screenId)
				}
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				switch result.screenId {
					case kMerchantRegAddressScreen:
						push(MerchantRegAddressScreen(result))
					case kMerchantRegQRISSelectBusinessTypeScreen:
						push(MerchantRegQRISSelectBusinessTypeScreen(result))
					case kMerchantRegQRISSelectBusinessLocationScreen:
						push(MerchantRegQRISSelectBusinessLocationScreen(result))
					case kMerchantRegQRISLandingScreen:
						push(MerchantRegQRISLandingScreen(result))
					case kMerchantRegQRISDetailFormScreen:
						push(MerchantRegQRISDetailFormScreen(result))
					default:
						break
				}
		}
	}
	
	private func configureMerchantRegQRISSelectBusinessTypeNavigationEvent(_ navigation: Navigation) {
		if case .previous = navigation {
			pop()
		}
	}
	
	private func configureMerchantRegQRISSelectBusinessLocationNavigationEvent(_ navigation: Navigation) {
		if case .previous = navigation {
			pop()
		}
	}
	
	private func configureMerchantRegProductSelectionNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegAddressScreen {
					push(MerchantRegAddressScreen(result))
				}
		}
	}
	
	private func configureMerchantRegQRISLandingNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else {
					return
				}
				if result.screenId == kMerchantRegScanQRISScreen {
					push(MerchantRegScanQRISScreen(result))
				}
		}
	}
	
	private func configureMerchantRegScanQRISNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else {
					return
				}
				if result.screenId == kMerchantRegQRISDetailFormScreen {
					pushAndDismiss(
						MerchantRegQRISDetailFormScreen(result),
						byIdentifier: kMerchantRegBusinessDetailQrisScreen,
						animated: true
					)
				}
		}
	}
	
	private func configureMerchantRegQRISDetailFormNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject, !result.screenId.isEmpty else {
					return
				}
				switch result.screenId {
					case kMerchantRegMultiSettlementInformationScreen:
						push(MerchantRegMultiSettlementInformationScreen(()))
					case kMerchantRegDeliveryAddressScreen:
						push(MerchantRegDeliveryAddressScreen(result))
					case kMerchantRegScanQRISScreen:
						push(MerchantRegScanQRISScreen(result))
					default:
						return
				}
		}
	}
	
	private func configureMerchantRegBusinessDetailEdcNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegBusinessTypeSelectionScreen {
					push(MerchantBusinessTypeSelectionScreen(result))
				} else if result.screenId == kMerchantRegBusinessDetailEdcTransactionScreen {
					push(MerchantRegBusinessDetailEdcTransactionScreen(result))
				}
		}
	}
	
	private func configureMerchantRegBusinessDetailEdcTransactionNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegBusinessTypeSelectionScreen {
					push(MerchantBusinessTypeSelectionScreen(result))
				} else if result.screenId == kMerchantRegBusinessDetailEdcFacilitiesScreen {
					push(MerchantRegBusinessDetailEdcFacilitiesScreen(result))
				}
		}
	}
	
	private func configureMerchantRegBusinessDetailEdcFacilitiesNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegBusinessTypeSelectionScreen {
					push(MerchantBusinessTypeSelectionScreen(result))
				} else if result.screenId == kMerchantRegBusinessDetailEdcFacilitiesSelectionScreen {
					if let _ = result.data as? MerchantRegBusinessDetailEdcFacilitiesSelectionModel {
						push(MerchantRegBusinessDetailEdcFacilitiesSelectionScreen(result))
					}
				} else if result.screenId == kMerchantRegBusinessDetailEdcProductInfoScreen {
					push(MerchantRegBusinessDetailEdcProductInfoScreen(result))
				} else if result.screenId == kMerchantRegDeliveryAddressScreen {
					push(MerchantRegDeliveryAddressScreen(result))
				}
		}
	}
	
	private func configureMerchantRegBusinessDetailDeliveryAddressNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegEddScreen {
					push(MerchantRegEddScreen(result))
				}
		}
	}
	
	private func configureMerchantRegEddNavigationEvent(_ navigation: Navigation) {
		switch navigation {
			case .previous(let value):
				handlePreviousNavigation(value)
				
			case .next(let value):
				guard let result = value as? NavigationObject else { return }
				if result.screenId == kMerchantRegSoWSelectionScreen {
					push(MerchantRegSoWSelectionScreen(result))
				} else if result.screenId == kMerchantRegCountryRelationSelectionScreen {
					push(MerchantRegCountryRelationSelectionScreen(result))
				}
		}
	}
	
	private func configureMerchantRegMultiSettlementInformationNavigationEvent(_ navigation: Navigation) {
		if case .previous = navigation {
			pop()
		}
	}
	
	private func loadScreenStack(_ identifier: String, entity: MerchantRegEntity?) -> Screenable {
		var navigationObject = NavigationObject(screenId: identifier, data: entity)
		
		switch identifier {
			case kMerchantRegPersonalInformationScreen:
				return MerchantRegPersonalInformationScreen(navigationObject)
			case kMerchantRegPersonalContactScreen:
				return MerchantRegPersonalContactScreen(navigationObject)
			case kMerchantRegAddressScreen:
				return MerchantRegAddressScreen(navigationObject)
			case kMerchantRegNpwpScreen:
				navigationObject = NavigationObject(
					screenId: identifier,
					data: entity?.toMerchantNpwpModel()
				)
				return MerchantRegNpwpScreen(navigationObject)
			case kMerchantRegProductSelectionScreen:
				return MerchantRegProductSelectionScreen(navigationObject)
			case kMerchantRegBusinessDetailQrisScreen:
				return MerchantRegBusinessDetailQrisScreen(navigationObject)
			case kMerchantRegQRISLandingScreen:
				return MerchantRegQRISLandingScreen(navigationObject)
			case kMerchantRegScanQRISScreen:
				return MerchantRegScanQRISScreen(navigationObject)
			case kMerchantRegQRISDetailFormScreen:
				return MerchantRegQRISDetailFormScreen(navigationObject)
			case kMerchantRegBusinessDetailEdcScreen:
				return MerchantRegBusinessDetailEdcScreen(navigationObject)
			case kMerchantRegBusinessDetailEdcTransactionScreen:
				return MerchantRegBusinessDetailEdcTransactionScreen(navigationObject)
			case kMerchantRegBusinessDetailEdcFacilitiesScreen:
				return MerchantRegBusinessDetailEdcFacilitiesScreen(navigationObject)
			case kMerchantRegBusinessDetailEdcProductInfoScreen:
				return MerchantRegBusinessDetailEdcProductInfoScreen(navigationObject)
			case kMerchantRegDeliveryAddressScreen:
				return MerchantRegDeliveryAddressScreen(navigationObject)
			case kMerchantRegEddScreen:
				return MerchantRegEddScreen(navigationObject)
			default:
				return MerchantRegOnboardingScreen(navigationObject)
		}
	}
	
	private func initializeLastScreen(_ screenStack: [String], entity: MerchantRegEntity?) {
		guard let lastScreenId = screenStack.last else { return }
		
		let allButLast = screenStack.dropLast()
		var allScreens: [Screenable] = []
		for screenId in allButLast {
			allScreens.append(loadScreenStack(screenId, entity: entity))
		}
		allScreens.append(loadScreenStack(lastScreenId, entity: entity))
		
		var viewControllers: [UIViewController] = []
		for (_, screen) in allScreens.enumerated() {
			let vc = screen.build()
			viewControllers.append(vc)
			screen.event = { [weak self, weak screen] navigation in
				self?.showScreen(
					identifier: screen?.identifier ?? "",
					navigation: navigation
				)
			}
			self.screenStack.append(screen)
		}
		
		let existingVCs = navigationController.viewControllers
		let nonMerchantVCs = existingVCs.filter { vc in
			!String(describing: type(of: vc)).contains("Merchant")
		}
		let finalVCs = nonMerchantVCs + viewControllers
		
		navigationController.setViewControllers(finalVCs, animated: true)
	}
	
	private func toPersonalization(helper: PostConcredUIHelper? = nil) {
		finishAndRedirectToParentBridge(
			targetIdentifier: ScreenNameConstant.homeScreen,
			keepRootScreens: 1
		) { [weak self] in
			self?.bridgingPersonalizationClosure?(helper)
		}
	}
	
	private func navigateToHome(_ result: NavigationObject) {
		if bridgingOpenAccountClosure != nil {
			bridgingOpenAccountClosure?(result)
		} else {
			pop(byIdentifier: result.screenId)
		}
	}
	
	private func handlePreviousNavigation(_ value: Any?, popFallback: Bool = true) {
		guard let result = value as? NavigationObject else {
			if popFallback { pop() }
			return
		}
		if result.screenId == ScreenNameConstant.homeScreen {
			navigateToHome(result)
		} else {
			pop(byIdentifier: result.screenId)
		}
	}
}

public extension CoordinatorProtocol {
	func finishAndRedirectToParentBridge(
		targetIdentifier: String,
		animated: Bool = false,
		keepRootScreens: Int = 1,
		getRedirectTarget: () -> Coordinator?
	) {
		guard let parent = parentCoordinator else {
			if let target = getRedirectTarget() {
				startChild(target)
			}
			return
		}
		
		guard let targetCoordinator = getRedirectTarget() else {
			pop(byIdentifier: targetIdentifier, animated: animated)
			return
		}
		
		let rootVCs = Array(navigationController.viewControllers.prefix(keepRootScreens))
		navigationController.viewControllers = rootVCs
		screenStack.removeAll()
		if parent.screenStack.count > keepRootScreens {
			parent.screenStack = Array(parent.screenStack.prefix(keepRootScreens))
		}
		
		parent.child = nil
		parentCoordinator = nil
		child = nil
		
		parent.startChild(targetCoordinator)
	}
}
