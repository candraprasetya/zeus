
//  MerchantRegBusinessDetailEdcTransactionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegBusinessDetailEdcTransactionViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegBusinessDetailEdcTransactionModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let prepareProductProcessId = "prepareProductProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		model = MerchantRegBusinessDetailEdcTransactionModel()
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess
		)
	}
	
	func isButtonEnabled() -> Bool {
		let averageMonthlyRevenueIsValid = !model.averageMonthlyRevenueInput.isEmpty && model.averageMonthlyRevenueErrorText.isEmpty
		let averageAmountPerTransactionIsValid = !model.averageAmountPerTransactionInput.isEmpty && model.averageAmountPerTransactionErrorText.isEmpty
		let lowestItemPriceIsValid = !model.lowestItemPriceInput.isEmpty && model.lowestItemPriceErrorText.isEmpty
		let highestItemPriceIsValid = !model.highestItemPriceInput.isEmpty && model.highestItemPriceErrorText.isEmpty
		
		return averageMonthlyRevenueIsValid && averageAmountPerTransactionIsValid && lowestItemPriceIsValid && highestItemPriceIsValid
	}
	
	func saveMerchantData() {
		updateSubmitData()
		appendScreen(kMerchantRegBusinessDetailEdcFacilitiesScreen)
		saveLocalData { [weak self] in
			self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegBusinessDetailEdcFacilitiesScreen, data: self?.merchantRegEntity)))
		}
	}
	
	// MARK: - Validation
	func validateAverageMonthlyRevenueInput() {
		if model.averageMonthlyRevenueInput.isEmpty {
			model.averageMonthlyRevenueErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_average_monthly_revenue.localizedString
			)
		} else {
			model.averageMonthlyRevenueErrorText = ""
		}
	}
	
	func validateAverageAmountPerTransactionInput() {
		if model.averageAmountPerTransactionInput.isEmpty {
			model.averageAmountPerTransactionErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_average_nominal_per_transaction.localizedString
			)
		} else {
			model.averageAmountPerTransactionErrorText = ""
		}
	}
	
	func validateLowestItemPriceInput() {
		if model.lowestItemPriceInput.isEmpty {
			model.lowestItemPriceErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_lowest_item_price.localizedString
			)
		} else {
			model.lowestItemPriceErrorText = ""
		}
	}
	
	func validateHighestItemPriceInput() {
		if model.highestItemPriceInput.isEmpty {
			model.highestItemPriceErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_details_highest_item_price.localizedString
			)
		} else {
			model.highestItemPriceErrorText = ""
		}
	}
	
	// MARK: - Private Methods
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		if let submitData = merchantRegEntity.submitData {
			if let revenue = submitData.edcData?.businessAverageMonthlyRevenue {
				model.averageMonthlyRevenueInput = String(Int(revenue))
			}
			if let averageAmount = submitData.edcData?.averageAmountPerTransaction {
				model.averageAmountPerTransactionInput = String(Int(averageAmount))
			}
			if let lowestPrice = submitData.edcData?.lowestItemPrice {
				model.lowestItemPriceInput = String(Int(lowestPrice))
			}
			if let highestPrice = submitData.edcData?.highestItemPrice {
				model.highestItemPriceInput = String(Int(highestPrice))
			}
		}
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		let data = submitData.edcData ?? MerchantRegEdcEntity()
		
		data.businessAverageMonthlyRevenue = Double(model.averageMonthlyRevenueInput)
		data.averageAmountPerTransaction = Double(model.averageAmountPerTransactionInput)
		data.lowestItemPrice = Double(model.lowestItemPriceInput)
		data.highestItemPrice = Double(model.highestItemPriceInput)
		
		submitData.edcData = data
		merchantRegEntity.submitData = submitData
	}
}
