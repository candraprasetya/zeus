
//  MerchantRegAddressViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/04/26.
//

import Combine
import Core
import CoreLocation
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegAddressViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegAddressModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	
	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		self.model = MerchantRegAddressModel()
	}
	
	// MARK: - Public Methods
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func openMapSelection() {
		let mapsModel = createMapsModel()
		navigationEvent.send(.next(NavigationObject(screenId: ScreenNameConstant().merchantRegMapsScreen, data: mapsModel)))
	}
	
	func openVillageSelection() {
		let villageModel = createVillageSelectionModel()
		navigationEvent.send(
			.next(NavigationObject(screenId: kMerchantRegVillageSelectionScreen, data: villageModel))
		)
	}
	
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess
		)
	}
	
	func isButtonEnabled() -> Bool {
		let isSelectedAddressValid = !model.selectedAddress.isEmpty && model.selectedAddressErrorText.isEmpty
		let isSelectedVillageValid = !model.selectedVillage.isEmpty && model.selectedVillageErrorText.isEmpty
		let isStreetNameValid = !model.streetName.isEmpty && model.streetNameErrorText.isEmpty
		let isBuildingNameValid = !model.buildingName.isEmpty && model.buildingNameErrorText.isEmpty
		return isSelectedAddressValid && isSelectedVillageValid && isStreetNameValid && isBuildingNameValid
	}
	
	func isBusinessLocationAddressEmpty() -> Bool {
		model.selectedAddress.isEmpty
	}
	
	func saveMerchantData() {
		updateSubmitData()
		navigateToBusinessDetail()
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	// MARK: - Map Selection
	private func createMapsModel() -> MerchantMapsModel {
		MerchantMapsModel(
			initialCoordinate: model.selectedCoordinate,
			onLocationSelected: { [weak self] coordinate, address in
				self?.handleLocationSelected(coordinate: coordinate, address: address)
			},
			onDismiss: nil
		)
	}
	
	private func handleLocationSelected(coordinate: CLLocationCoordinate2D, address: String) {
		model.selectedCoordinate = coordinate
		model.selectedAddress = address
	}
	
	// MARK: - Village Selection
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		model.productType = entity.submitData?.productType ?? .edc
		
		let productData = ((
			merchantRegEntity.submitData?.productType == .edc
		) ? merchantRegEntity.submitData?.edcData : merchantRegEntity.submitData?.qrisData) ?? MerchantRegProductEntity()
		
		if let address = productData.businessAddress {
			model.selectedCoordinate = CLLocationCoordinate2D(
				latitude: Double(address.latitude ?? "0") ?? 0.0,
				longitude: Double(address.longitude ?? "0") ?? 0.0
			)
			model.streetName = address.streetName ?? ""
			model.buildingName = address.buildingName ?? ""
			model.selectedLocation = address.toMerchantLocationModel()
			model.selectedAddress = address.address ?? ""
			model.selectedVillage = address.villageName ?? ""
		}
	}
	
	private func createVillageSelectionModel() -> MerchantRegVillageSelectionModel {
		MerchantRegVillageSelectionModel(
			onVillageSelected: { [weak self] village in
				self?.handleVillageSelected(village)
			}
		)
	}
	
	private func handleVillageSelected(_ village: MerchantRegLocationModel) {
		model.selectedLocation = village
		model.selectedVillage = village.villageName
		model.selectedVillageErrorText = ""
	}
	
	private func updateSubmitData() {
		let productData = ((
			merchantRegEntity.submitData?.productType == .edc
		) ? merchantRegEntity.submitData?.edcData : merchantRegEntity.submitData?.qrisData) ?? MerchantRegProductEntity()
		
		productData.businessAddress = model.toMerchantLocationEntity(model.selectedLocation)
		
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		
		if merchantRegEntity.submitData?.productType == .edc {
			let data = submitData.edcData ?? MerchantRegEdcEntity()
			data.businessAddress = productData.businessAddress
			submitData.edcData = data
		} else {
			let data = submitData.qrisData ?? MerchantRegQrisEntity()
			data.businessAddress = productData.businessAddress
			submitData.qrisData = data
		}
		
		merchantRegEntity.submitData = submitData
	}
	
	private func navigateToBusinessDetail() {
		let isEdc = merchantRegEntity.submitData?.productType == .edc
		let nextScreen = isEdc ? kMerchantRegBusinessDetailEdcScreen : kMerchantRegBusinessDetailQrisScreen
		appendScreen(nextScreen)
		saveLocalData { [weak self] in
			guard let self else { return }
			navigationEvent.send(.next(
				NavigationObject(
					screenId: nextScreen
				)
			))
		}
	}
	
	// MARK: - Validation
	func validateStreetName() {
		if model.streetName.isEmpty {
			model.streetNameErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_address_street_name_and_number.localizedString
			)
		} else if model.streetName.count < 5 {
			model.streetNameErrorText = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.streetNameErrorText = ""
		}
	}
	
	func validateBuildingName() {
		if model.buildingName.isEmpty {
			model.buildingNameErrorText = String(
				format: StringRes.general_error_empty.localizedString,
				StringRes.merchant_business_address_building_name_and_block.localizedString
			)
		} else if model.buildingName.count < 5 {
			model.buildingNameErrorText = StringRes.merchant_common_error_field_invalid_format.localizedString
		} else {
			model.buildingNameErrorText = ""
		}
	}
}

// MARK: - Mapper
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

private extension MerchantRegAddressModel {
	func toMerchantLocationEntity(_ data: MerchantRegLocationModel? = nil) -> MerchantRegLocationEntity {
		let entity = MerchantRegLocationEntity()
		entity.address = selectedAddress
		entity.latitude = "\(selectedCoordinate?.latitude ?? 0)"
		entity.longitude = "\(selectedCoordinate?.longitude ?? 0)"
		entity.buildingName = buildingName
		entity.streetName = streetName
		
		if let data {
			entity.postalId = data.postalId
			entity.postalCode = data.postalCode
			entity.villageId = data.villageId
			entity.villageName = data.villageName
			entity.subdistrictId = data.subdistrictId
			entity.subdistrictName = data.subdistrictName
			entity.regencyId = data.regencyId
			entity.regencyName = data.regencyName
			entity.provinceId = data.provinceId
			entity.provinceName = data.provinceName
			entity.cityTagQris = data.cityTagQris
			entity.agentBankCode = data.agentBankCode
			entity.agentBankName = data.agentBankName
		}
		
		return entity
	}
}
