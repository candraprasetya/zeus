
//  MerchantRegPreparationViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import Combine
import Core
import RxSwift
import Swinject

final class MerchantRegPreparationViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegPreparationModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let inquiryStatusProcessId = "merchantInquiryStatusProcessId"
	let prepareProcessId = "merchantPrepareProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	
	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		self.model = MerchantRegPreparationModel()
	}
	
	// MARK: - Public Methods
	func prepareLocalData() {
		// Just reactive update if needed
	}
	
	func startMerchantOpenAccount() {
		if UserDefaults.standard.bool(forKey: Core.UserDefaultsConstants().merchantIsFromOpenAccount) {
			inquiryStatus()
		} else {
			prepareData()
		}
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	// MARK: - API Calls
	private func inquiryStatus() {
		handleProcess(
			{ try await self.getMerchantRepository()!.inquiryStatus() },
			withId: inquiryStatusProcessId,
			successHandler: { [weak self] result in
				self?.handleInquiryStatusSuccess(result)
			},
			errorDictionary: [
				MerchantRegPreparationErrorDictionary(
					navigationEvent: navigationEvent, retryPrepareAction: {
						self.inquiryStatus()
					}
				),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent),
			]
		)
	}
	
	private func prepareData() {
		handleProcess(
			{ try await self.getMerchantRepository()!.prepare() },
			withId: prepareProcessId,
			successHandler: { [weak self] data in
				self?.navigateToPersonalInformation(data)
			},
			errorDictionary: [
				MerchantRegPreparationErrorDictionary(
					navigationEvent: navigationEvent, retryPrepareAction: {
						self.prepareData()
					}
				),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent),
			]
		)
	}
	
	// MARK: - Response Handlers
	private func handleInquiryStatusSuccess(_ result: MerchantRegEntity) {
		model.epochStatus = result.epoch
		if result.status == .eligible {
			prepareData()
		} else {
			navigateToApplyStatus(result)
		}
	}
	
	private func navigateToPersonalInformation(_ data: MerchantRegEntity) {
		UserDefaults.standard.removeObject(forKey: Core.UserDefaultsConstants().merchantIsFromOpenAccount)
		merchantRegEntity = data
		appendScreen(kMerchantRegPersonalInformationScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegPersonalInformationScreen, data: self?.merchantRegEntity)))
		}
	}
	
	// MARK: - Navigation
	private func navigateToApplyStatus(_ result: MerchantRegEntity) {
		let navigationObject = NavigationObject(
			screenId: kMerchantRegApplyStatusScreen,
			data: MerchantRegApplyStatusModel(status: result.status, reffNo: result.reffNo)
		)
		navigationEvent.send(.next(navigationObject))
	}
}
