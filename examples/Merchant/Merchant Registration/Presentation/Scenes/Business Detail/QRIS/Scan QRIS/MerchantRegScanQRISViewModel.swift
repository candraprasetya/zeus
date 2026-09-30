//
//  MerchantRegScanQRISViewModel.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import AVFoundation
import CloveUI
import CloveUILib
import Combine
import Core
import CoreImage
import checker
import Localize_Swift
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegScanQRISViewModel: BaseMutableStateViewModel {
	@Published var showImagePicker = false
	@Published var processStates = [ProcessState]()
	@Published var scanner = MerchantRegScannerManager()

	let screenTitle = StringRes.merchant_business_qris_details_scan_qris.localizedString
	let iconName = "UploadImage"
	let permissionHandler = RequestPermissionHandler()
	
	let parseQrisProcessId = "parseQrisProcessId"
	let validateQrisProcessId = "validateQrisProcessId"
	let merchantRegEntity: MerchantRegEntity
	
	var allProcessId: [String] {
		[
			parseQrisProcessId,
			validateQrisProcessId
		]
	}
	
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	
	var isFlashOn = false
	var zoomFactor: CGFloat = 1.0
	var lastZoomFactor: CGFloat = 1.0
	
	private var device: AVCaptureDevice? {
		AVCaptureDevice.default(for: .video)
	}
	
	init(navigationObject: NavigationObject) {
		merchantRegEntity = navigationObject.getData()
	}
	
	func backToPreviousScreen() {
		navigationEvent.send(.previous(nil))
	}
	
	func checkCameraAndGaleryPermission(completion: @escaping (Bool) -> Void) {
		permissionHandler.checkPermissionsAndProceed(
			permissions: [.camera, .media],
			completion: {
				completion(true)
			},
			handleUngrantedPermission: { ungrantedPermissions in
				self.handleUngrantedPermission(ungrantedPermissions, completion: completion)
			}
		)
	}
	
	func triggerImagePicker() {
		do {
			try device?.lockForConfiguration()
			if let device = device, device.hasTorch {
				if device.isTorchActive && device.isTorchModeSupported(.off) {
					device.torchMode = .off
					isFlashOn = false
				}
			}
			device?.unlockForConfiguration()
		} catch { /* Do Nothing */ }
		
		showImagePicker = true
	}
	
	func toggleFlashlight() {
		do {
			try device?.lockForConfiguration()
			if device != nil {
				if device?.torchMode == .on {
					device?.torchMode = .off
					isFlashOn = false
				} else {
					try device?.setTorchModeOn(level: 1)
					device?.torchMode = .on
					isFlashOn = true
				}
			}
			device?.unlockForConfiguration()
		} catch { /* Do Nothing */ }
	}
	
	func setZoom(_ zoom: CGFloat) {
		guard let device = device else { return }
		
		let maxZoom = min(device.activeFormat.videoMaxZoomFactor, 6.0)
		let zoom = min(max(zoom, 1.0), maxZoom)
		
		do {
			try device.lockForConfiguration()
			device.videoZoomFactor = zoom
			device.unlockForConfiguration()
			
			zoomFactor = zoom
		} catch { /* Do Nothing */ }
	}
	
	func onZoom(_ value: CGFloat) {
		let newZoom = lastZoomFactor * value
		setZoom(newZoom)
	}
	
	func onZoomEnded() {
		lastZoomFactor = zoomFactor
	}
	
	func configureScanner() {
		scanner.configure()
		scanner.onScan = { qrContent in
			self.handleParseQrisNmid(qrContent)
		}
		scanner.start()
	}
	
	func imagePickerOnSelectedImage(_ image: UIImage) {
		guard let ciImage = CIImage(image: image) else { return }
		
		let detectorOptions = [CIDetectorAccuracy: CIDetectorAccuracyHigh]
		guard let detector = CIDetector(
			ofType: CIDetectorTypeQRCode,
			context: nil,
			options: detectorOptions
		) else { return }
		
		let features = detector.features(in: ciImage)
		if let qrCodeFeature = features.first as? CIQRCodeFeature,
		   let qrContent = qrCodeFeature.messageString {
			handleParseQrisNmid(qrContent)
		}
	}
	
	func handleParseQrisNmid(_ qrContent: String) {
		handleProcess(
			{
				return try await self.parseQrisNmid(qrContent)
			},
			withId: parseQrisProcessId,
			successHandler: { result in
				self.handleValidateQris(nmid: result.nmid, merchantName: result.merchantName)
			},
			errorDictionary: [
				MerchantRegScanQRISErrorDictionary(
					navigationEvent: navigationEvent,
					defaultButtonAction: {
						self.scanner.start()
					},
					bypassScanAction: {
						self.bypassScanAction()
					}
				),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	private func parseQrisNmid(_ qrContent: String) async throws -> MerchantRegParseQRISModel {
		try await withCheckedThrowingContinuation { continuation in
			do {
				let checker = try QRISCheckerNative(input: qrContent).getChecker()
				if let nmid = checker.getNMID(),
				   let merchantName = checker.getMerchantName(),
				   checker.getCategory() == .mpm {
					continuation.resume(
						returning: MerchantRegParseQRISModel(
							nmid: nmid,
							merchantName: merchantName
						)
					)
				} else {
					continuation.resume(throwing: MerchantRegParseQRISError(type: .invalidQris))
				}
			} catch {
				continuation.resume(throwing: MerchantRegParseQRISError(type: .general))
			}
		}
	}
	
	private func handleUngrantedPermission(
		_ ungrantedPermission: [Core.PermissionType],
		completion: @escaping (Bool) -> Void
	) {
		permissionHandler.requestPermissions(
			ungrantedPermission,
			completion: { deniedPermissions in
				if deniedPermissions.isEmpty {
					completion(true)
					return
				}
				
				if let window = UIApplication.shared.keyWindow {
					window.subviews.forEach { view in
						if view is CloveUI.PermissionTutorialPopUp {
							view.removeFromSuperview()
						}
					}
				}
				
				self.permissionHandler.showToSettingPopUp(
					forDeniedPermission: deniedPermissions,
					title: StringRes.merchant_common_permission_title.localizedString,
					primaryButtonText: StringRes.general_button_set_now.localizedString,
					primaryButtonAction: nil,
					secondaryButtonText: StringRes.general_button_back.localizedString,
					secondaryButtonAction: {
						self.navigationEvent.send(.previous(nil))
					}
				)
			}
		)
	}
	
	private func handleValidateQris(nmid: String, merchantName: String) {
		handleProcess(
			{
				return try await MerchantRegDIManager
					.merchantRepositoryInjection.resolve(MerchantRegRepository.self)!
					.validateQris(nmid: nmid, stickerName: nil)
			},
			withId: validateQrisProcessId,
			successHandler: { _ in
				self.onSuccessValidateQris(
					nmid: nmid,
					merchantName: merchantName
				)
			},
			errorDictionary: [
				MerchantRegScanQRISErrorDictionary(
					navigationEvent: navigationEvent,
					defaultButtonAction: {
						self.scanner.start()
					},
					bypassScanAction: {
						self.bypassScanAction()
					}
				),
				PopupGeneralErrorDictionary(navigationEvent: navigationEvent)
			]
		)
	}
	
	private func onSuccessValidateQris(nmid: String, merchantName: String) {
		let qrisData = merchantRegEntity.submitData?.qrisData ?? MerchantRegQrisEntity()
		let qrisRequestData = MerchantRegQrisRequestDataEntity()
		qrisRequestData.nmid = nmid
		qrisRequestData.merchantName = merchantName
		qrisData.scannedQrisRequestData = qrisRequestData
		qrisData.isScanningQris = true
		qrisData.isHavingQris = true
		merchantRegEntity.submitData?.qrisData = qrisData
		
		let nextScreen = kMerchantRegQRISDetailFormScreen
		merchantRegEntity.screenStack.append(nextScreen)
		navigationEvent.send(.next(
			NavigationObject(
				screenId: kMerchantRegQRISDetailFormScreen,
				data: merchantRegEntity
			))
		)
	}
	
	private func bypassScanAction() {
		let qrisData = merchantRegEntity.submitData?.qrisData ?? MerchantRegQrisEntity()
		qrisData.isHavingQris = true
		qrisData.isScanningQris = false
		merchantRegEntity.submitData?.qrisData = qrisData
		merchantRegEntity.submitData?.qrisData?.otherQrisRequestData = nil
		
		let nextScreen = kMerchantRegQRISDetailFormScreen
		merchantRegEntity.screenStack.append(nextScreen)
		navigationEvent.send(.next(
			NavigationObject(
				screenId: nextScreen,
				data: merchantRegEntity
			))
		)
	}
}
