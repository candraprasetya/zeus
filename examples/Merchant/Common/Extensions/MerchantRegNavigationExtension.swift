//
//  MerchantRegNavigationExtension.swift
//  Merchant
//
//  Created by Candra Prasetya on 29/04/26.
//

import CloveUILib
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import SwiftUI
import Swinject

// MARK: - Shared Session Manager
public final class MerchantRegSession {
	public static let shared = MerchantRegSession()
	
	public var entity = MerchantRegEntity()
	public let dataUpdatedEvent = PassthroughSubject<Void, Never>()
	
	private init() {} // singleton: use `shared`
	
	public func notifyUpdate() {
		dataUpdatedEvent.send()
	}
	
	public func reset() {
		entity = MerchantRegEntity()
	}
}

// MARK: - Protocol
protocol MerchantRegNavigableViewModel: BaseMutableStateViewModel {
	var saveMerchantDataProcessId: String { get }
	var loadMerchantDataProcessId: String { get }
	func getMerchantRepository() -> MerchantRegRepository?
	func prepareLocalData()
}

// MARK: - Screen Stack Operations
extension MerchantRegNavigableViewModel {
	var merchantRegEntity: MerchantRegEntity {
		get { MerchantRegSession.shared.entity }
		set { MerchantRegSession.shared.entity = newValue }
	}
	
	/// Append screen ke stack dengan filter exclude Onboarding & Preparation
	/// - Parameter screenName: Screen ID yang akan ditambahkan
	func appendScreen(_ screenName: String) {
		var screenStack = merchantRegEntity.screenStack
			.filter { $0 != kMerchantRegOnboardingScreen && $0 != kMerchantRegPreparationScreen }
		
		if let index = screenStack.firstIndex(of: screenName) {
			screenStack = Array(screenStack[..<index])
		}
		
		screenStack.append(screenName)
		merchantRegEntity.screenStack = screenStack
		print("DEBUG: \(merchantRegEntity.screenStack)")
	}
	
	/// Load merchant entity dari local storage
	/// - Parameters:
	///   - successHandler: Callback dengan entity yang diload
	///   - deleteOnInvalid: Jika true, akan delete local data jika tidak valid (default: false)
	///   - isValid: Closure untuk check validasi data
	///   - noDataHandler: Optional callback saat data tidak ditemukan (default: retry)
	func loadLocalData(
		successHandler: @escaping (MerchantRegEntity) -> Void,
		deleteOnInvalid: Bool = false,
		isValid: ((MerchantRegEntity) -> Bool)? = nil,
		noDataHandler: (() -> Void)? = nil
	) {
		guard let repository = getMerchantRepository() else {
			fatalError("CRITICAL: MerchantRepository could not be resolved.")
		}
		
		handleProcess(
			{ try await repository.loadLocalData() },
			withId: loadMerchantDataProcessId,
			successHandler: { [weak self] entity in
				if deleteOnInvalid, let isValid, !isValid(entity) {
					self?.handleInvalidEntity()
					return
				}
				successHandler(entity)
			},
			errorDictionary: [
				LayoutErrorDictionary(logEventName: nil, retryHandler: { [weak self] in
					if let noDataHandler {
						noDataHandler()
					} else {
						self?.loadLocalData(successHandler: successHandler, deleteOnInvalid: deleteOnInvalid, isValid: isValid, noDataHandler: noDataHandler)
					}
				})
			]
		)
	}
	
	/// Save merchant entity ke local storage
	/// - Parameter successHandler: Callback setelah save berhasil
	func saveLocalData(successHandler: @escaping () -> Void) {
		guard let repository = getMerchantRepository() else {
			fatalError("CRITICAL: MerchantRepository could not be resolved.")
		}
		
		handleProcess(
			{ try await repository.saveLocalData(data: self.merchantRegEntity) },
			withId: saveMerchantDataProcessId,
			successHandler: { _ in
				MerchantRegSession.shared.notifyUpdate()
				successHandler()
			},
			errorDictionary: nil
		)
	}
	
	/// Delete local merchant data
	/// - Parameter successHandler: Callback setelah delete berhasil
	func deleteLocalData(successHandler: (() -> Void)? = nil) {
		guard let repository = getMerchantRepository() else {
			fatalError("CRITICAL: MerchantRepository could not be resolved.")
		}
		
		handleProcess(
			{ try await repository.deleteLocalMerchantData() },
			withId: loadMerchantDataProcessId,
			successHandler: { _ in successHandler?() },
			errorDictionary: nil
		)
	}
	
	private func handleInvalidEntity() {
		ClovePopUp().createPopUpView(
			type: .noIcon(
				titleText: StringRes.general_error_oops.localizedString,
				subtitleText: StringRes.general_error_oops.localizedString,
				primaryButtonText: StringRes.general_button_ok.localizedString,
				primaryButtonAction: {
					self.deleteLocalData {
						self.navigationEvent.send(.previous(NavigationObject(screenId: ScreenNameConstant.homeScreen)))
					}
				}
			)
		).showPopUpView()
	}
	
	func getMerchantRepository() -> MerchantRegRepository? {
		MerchantRegDIManager.merchantRepositoryInjection.resolve(MerchantRegRepository.self)
	}
	
	func prepareLocalData() {}
}
