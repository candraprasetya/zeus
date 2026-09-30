
//  MerchantRegVillageSelectionViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 05/05/26.
//

import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegVillageSelectionViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegVillageSelectionModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let villageProcessId = "villageProcessId"
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject) {
		self.model = navigationObject.getData()
	}
	
	// MARK: - Computed Properties
	var isSearchEnabled: Bool {
		!model.searchText.isEmpty && model.searchText.count > 2
	}
	
	var hasMorePages: Bool {
		model.currentPage <= model.maxPage
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		model.onDismiss?()
		navigationEvent.send(.previous(nil))
	}
	
	func selectVillage(_ village: MerchantRegLocationModel) {
		model.onVillageSelected?(village)
		navigationEvent.send(.previous(nil))
	}
	
	func performSearch() {
		guard isSearchEnabled else { return }
		resetPagination()
		fetchVillages()
	}
	
	func loadMoreIfNeeded(currentItem: MerchantRegLocationModel) {
		guard hasMorePages, !model.isLoadingMore else { return }
		guard let lastItem = model.village.last else { return }
		guard lastItem.villageId == currentItem.villageId,
		      lastItem.postalId == currentItem.postalId else { return }
		fetchVillages()
	}
	
	func clearSearchResults() {
		resetPagination()
	}
	
	// MARK: - Private Methods
	private func resetPagination() {
		model.currentPage = 1
		model.maxPage = 1
		model.village = []
		model.isLoadingMore = false
	}
	
	private func getMerchantRepository() -> MerchantRegRepository? {
		MerchantRegDIManager.merchantRepositoryInjection.resolve(MerchantRegRepository.self)
	}
	
	// MARK: - API Calls
	private func fetchVillages() {
		model.isLoadingMore = true
		handleProcess(
			{
				try await self.getMerchantRepository()!
					.inquiryVillage(data: self.model.toMerchantVillageEntity())
			},
			withId: villageProcessId,
			successHandler: { [weak self] result in
				self?.handleFetchVillagesSuccess(result)
				self?.model.isLoadingMore = false
			},
			errorDictionary: [
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	// MARK: - Response Handlers
	private func handleFetchVillagesSuccess(_ result: MerchantRegVillageEntity) {
		let village = result.toMerchantVillageSelectionModel()
		if !village.village.isEmpty {
			model.currentPage = village.currentPage + 1
			model.maxPage = village.maxPage
			model.village.append(contentsOf: village.village)
		} else {
			resetPagination()
			addError(
				forProcess: villageProcessId,
				type: PresentationErrorType.onScreen(
					message: StringRes.merchant_select_sub_district_not_found_state.localizedString,
					primaryAction: { /*Dismiss*/ },
					processId: villageProcessId,
					buttonText: "",
					icon: .noSearchResult
				)
			)
		}
	}
}

// MARK: - Mapper
private extension MerchantRegVillageEntity {
	func toMerchantVillageSelectionModel() -> MerchantRegVillageSelectionModel {
		MerchantRegVillageSelectionModel(
			searchText: keyword ?? "",
			currentPage: currentPage,
			maxPage: maxPage,
			village: villages?.map { $0.toMerchantLocationModel() } ?? []
		)
	}
}

private extension MerchantRegVillageSelectionModel {
	func toMerchantVillageEntity() -> MerchantRegVillageEntity {
		let entity = MerchantRegVillageEntity()
		entity.currentPage = currentPage
		entity.maxPage = maxPage
		entity.keyword = searchText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
		return entity
	}
}

private extension MerchantRegLocationEntity {
	func toMerchantLocationModel() -> MerchantRegLocationModel {
		MerchantRegLocationModel(
			postalId: postalId ?? "",
			postalCode: postalCode ?? "",
			villageId: villageId ?? "",
			villageName: villageName ?? "",
			subdistrictId: subdistrictId ?? "",
			subdistrictName: subdistrictName ?? "",
			regencyId: regencyId ?? "",
			regencyName: regencyName ?? "",
			provinceId: provinceId ?? "",
			provinceName: provinceName ?? "",
			cityTagQris: cityTagQris ?? "",
			agentBankCode: agentBankCode ?? "",
			agentBankName: agentBankName ?? "",
		)
	}
}
