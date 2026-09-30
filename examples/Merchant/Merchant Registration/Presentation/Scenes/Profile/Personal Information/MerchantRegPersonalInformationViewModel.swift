
//  MerchantRegPersonalInformationViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegPersonalInformationViewModel: BaseMutableStateViewModel, MerchantRegNavigableViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegPersonalInformationModel
	@Published var sofSelectorViewModel = SourceOfFundSelectorViewModel(model: nil, feature: .home)
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	// MARK: - Process IDs
	let loadMerchantDataProcessId = "loadMerchantDataProcessId"
	let saveMerchantDataProcessId = "saveMerchantDataProcessId"
	
	// MARK: - Initialization
	init(navigationObject _: NavigationObject) {
		self.model = MerchantRegPersonalInformationModel()
	}
	
	// MARK: - Public Methods
	func prepareLocalData() {
		loadLocalData(
			successHandler: prepareDataSuccess,
			deleteOnInvalid: true,
			isValid: { _ in self.isValidEntity() }
		)
	}
	
	func saveMerchantData() {
		updateSubmitData()
		navigateToNextScreen()
	}
	
	func toPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func toHomeScreen() {
		MerchantRegPopUp().showNavigateToHomePopUpConfirmation(navigationEvent: navigationEvent)
	}
	
	func goToSelectSOFScreen() {
		let accountListModel = createAccountListModel()
		let listSelectionModel = createListSelectionModel(accountListModel: accountListModel)
		navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegSoFSelectionScreen, data: listSelectionModel)))
	}
	
	func setSelectedAccount(accountList: [SOFListAccountModel], selectedAccountNumber: String) {
		let selectedAccount = accountList.first { $0.formattedNumber == selectedAccountNumber }
		let selectedMerchantAccount = model.sofList.first { $0.formattedNumber == selectedAccountNumber }
		
		sofSelectorViewModel.model = SOFAccountModel(
			number: selectedAccountNumber,
			formattedNumber: selectedAccountNumber,
			currency: selectedAccount?.currency ?? "",
			type: selectedAccount?.type ?? "",
			formattedBalance: nil
		)
		
		model.selectedAccount = selectedMerchantAccount
		sofSelectorViewModel.errorMessage = nil
	}
	
	func isButtonEnabled() -> Bool {
		let isVerified = merchantRegEntity.prepareData?.npwp.isVerified ?? false
		let npwpMaskedNumberEmpty = merchantRegEntity.prepareData?.npwp.maskedNumber?.isEmpty ?? true
		
		let hasSOF = sofSelectorViewModel.model != nil
		let isNpwpOptionValid = model.selectedNpwpOption != nil && (model.selectedNpwpOption != 1 || model.selectedNpwpReasonOption != nil)
		let hasValidNpwp = isVerified || (!isVerified && !npwpMaskedNumberEmpty) || isNpwpOptionValid
		
		return hasSOF && hasValidNpwp
	}
		
	private func showNpwpSection() {
		guard let npwp = merchantRegEntity.prepareData?.npwp else { return }
		
		let isVerified = npwp.isVerified
		let npwpMaskedNumberEmpty = npwp.maskedNumber?.isEmpty ?? true
		
		if isVerified { model.showNpwpSection = false }
		else if !isVerified, !npwpMaskedNumberEmpty { model.showNpwpSection = false }
		else { model.showNpwpSection = true }
	}
	
	// MARK: - Data Preparation
	private func prepareDataSuccess(_ entity: MerchantRegEntity) {
		merchantRegEntity = entity
		
		model = merchantRegEntity.toMerchantRegPersonalInformationModel()
		setupInitialAccount()
		configureSOFSelector()
		showNpwpSection()
	}
	
	private func configureSOFSelector() {
		let shouldShowArrow = model.sofList.count > 1
		print("DEBUG: sofList count = \(model.sofList.count), shouldShowArrow = \(shouldShowArrow)")
		
		let newViewModel = SourceOfFundSelectorViewModel(model: sofSelectorViewModel.model, feature: .home)
		newViewModel.setTitle(title: StringRes.merchant_referral_and_personal_data_account_no.localizedString)
		newViewModel.setPlaceholder(placeholder: StringRes.merchant_referral_and_personal_data_button_select_account.localizedString)
		newViewModel.onClickAction = shouldShowArrow ? { [weak self] in self?.goToSelectSOFScreen() } : nil
		sofSelectorViewModel = newViewModel
	}
	
	private func setupInitialAccount() {
		if let account = model.selectedAccount {
			setInitialAccount(account)
		} else if model.sofList.count == 1, let account = model.sofList.first {
			setInitialAccount(account)
		}
	}
	
	private func setInitialAccount(_ account: AccountModel) {
		account.formattedNumber = account.number.formatAccountNumber()
		sofSelectorViewModel.model = SOFAccountModel(
			number: account.formattedNumber,
			formattedNumber: account.formattedNumber,
			currency: account.currency.code,
			type: account.typeDescription,
			formattedBalance: nil
		)
		model.selectedAccount = account
	}
	
	private func updateSubmitData() {
		let submitData = merchantRegEntity.submitData ?? MerchantRegSubmitDataEntity()
		submitData.referralCode = model.referalCodeValue
		submitData.selectedNpwpOption = model.selectedNpwpOption
		submitData.selectedNpwpReasonOption = model.selectedNpwpReasonOption
		submitData.selectedAccount = model.selectedAccount?.toAccountEntity()
		merchantRegEntity.submitData = submitData
	}
	
	// MARK: - Navigation
	private func navigateToNextScreen() {
		let isVerified = merchantRegEntity.prepareData?.npwp.isVerified == true
		let maskedNumber = merchantRegEntity.prepareData?.npwp.maskedNumber ?? ""
		
		let alreadyUploadNpwp = merchantRegEntity.submitData?.npwpBase64Image != nil
		
		if isVerified {
			// 1. isVerified == true -> Navigasi ke Personal Contact
			appendScreen(kMerchantRegPersonalContactScreen)
			saveLocalData { [weak self] in
				self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegPersonalContactScreen, data: self?.merchantRegEntity)))
			}
		} else {
			// 2. !maskedNumber.isNullOrEmpty() -> Navigasi ke NPWP Detail (kMerchantRegNpwpScreen)
			if !maskedNumber.isEmpty {
				appendScreen(kMerchantRegNpwpScreen)
				saveLocalData { [weak self] in
					self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegNpwpScreen, data: MerchantRegNpwpModel())))
				}
			} else {
				// 3. Cek npwpOption == "YA"
				if model.selectedNpwpOption == 0 {
					// 4. Cek apakah sudah upload npwp
					if alreadyUploadNpwp {
						// Sudah upload -> Navigasi ke NPWP Detail (kMerchantRegNpwpScreen)
						appendScreen(kMerchantRegNpwpScreen)
						saveLocalData { [weak self] in
							self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegNpwpScreen, data: MerchantRegNpwpModel())))
						}
					} else {
						// Belum upload -> Navigasi ke Capture/Camera
						let cameraModel = MerchantRegCameraModel(
							documentType: .npwp,
							title: StringRes.merchant_npwp_capture_title.localizedString,
							overlayAspectRatio: MerchantRegCameraOverlayAspectRatio.idCard,
							onPhotoCaptured: { [weak self] image, base64, data in
								let model = MerchantRegNpwpModel(
									capturedImage: image,
									capturedImageData: data,
									capturedImageBase64: base64,
									tempCapturedImageBase64: base64
								)
								self?.appendScreen(kMerchantRegPersonalInformationScreen)
								self?.saveLocalData { [weak self] in
									self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegNpwpScreen, data: model)))
								}
							}
						)
						appendScreen(kMerchantRegPersonalInformationScreen)
						saveLocalData { [weak self] in
							self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegCameraScreen, data: cameraModel)))
						}
					}
				} else {
					// npwpOption != "TIDAK" -> Navigasi ke Personal Contact
					appendScreen(kMerchantRegPersonalContactScreen)
					saveLocalData { [weak self] in
						self?.navigationEvent.send(.next(NavigationObject(screenId: kMerchantRegPersonalContactScreen, data: self?.merchantRegEntity)))
					}
				}
			}
		}
	}
	
	// MARK: - SOF Selection Helpers
	private func createAccountListModel() -> [SOFListAccountModel] {
		model.sofList.map {
			SOFListAccountModel(
				number: $0.number,
				formattedNumber: $0.number.formatAccountNumber(),
				currency: $0.currency.code,
				type: $0.typeDescription
			)
		}
	}
	
	private func createListSelectionModel(accountListModel: [SOFListAccountModel]) -> SourceOfFundListSelectionModel {
		let section = SourceOfFundSectionModel(
			type: .account,
			title: StringRes.merchant_select_account_saving_account.localizedString,
			iconName: "IconRekeningBook",
			balanceState: .closed,
			hasFetchedBalance: false,
			sectionItems: accountListModel
		)
		
		return SourceOfFundListSelectionModel(
			feature: .home,
			screenTitle: StringRes.merchant_select_account_header_title.localizedString,
			sections: [section],
			searchPlaceholder: StringRes.general_search.localizedString
		) { [weak self] result in
			self?.setSelectedAccount(
				accountList: accountListModel,
				selectedAccountNumber: result.formattedNumber
			)
		}
	}
	
	// MARK: - Validation
	func isValidEntity() -> Bool {
		!(merchantRegEntity.prepareData?.accounts.isEmpty ?? true)
	}
}

// MARK: - Mapper
extension MerchantRegEntity {
	func toMerchantRegPersonalInformationModel() -> MerchantRegPersonalInformationModel {
		MerchantRegPersonalInformationModel(
			sofList: prepareData?.accounts.map { $0.toAccountModel() } ?? [],
			selectedAccount: submitData?.selectedAccount?.toAccountModel(),
			selectedNpwpOption: submitData?.selectedNpwpOption,
			selectedNpwpReasonOption: submitData?.selectedNpwpReasonOption,
			referalCodeValue: submitData?.referralCode ?? ""
		)
	}
}

extension AccountEntity {
	func toAccountModel() -> AccountModel {
		let model = AccountModel()
		model.name = name
		model.currency = currency.toModel()
		model.number = accountNumber
		model.formattedNumber = formattedNumber
		model.typeDescription = type?.description ?? ""
		return model
	}
}
