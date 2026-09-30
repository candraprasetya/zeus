//
//  MerchantRegCameraViewModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 10/05/26.
//

import AVFoundation
import Combine
import Core
import RxSwift
import SharedI18nRes
import StandardLibrary
import Swinject

final class MerchantRegCameraViewModel: BaseMutableStateViewModel {
	// MARK: - Published Properties
	@Published var processStates = [ProcessState]()
	@Published var model: MerchantRegCameraModel
	
	// MARK: - Navigation & Dependencies
	var navigationEvent = Core.NavigationEvent()
	var disposeBag = DisposeBag()
	private var cancellables = Set<AnyCancellable>()
	
	let capturePhotoProcessId = "capturePhotoProcessId"
	let cameraService: MerchantRegCameraServiceProtocol
	let permissionHandler = RequestPermissionHandler()
	
	private var device: AVCaptureDevice? {
		AVCaptureDevice.default(for: .video)
	}
	
	// MARK: - Initialization
	init(navigationObject: NavigationObject, cameraService: MerchantRegCameraServiceProtocol = MerchantRegCameraService()) {
		if let model = navigationObject.data as? MerchantRegCameraModel {
			self.model = model
		} else {
			self.model = MerchantRegCameraModel()
		}
		self.cameraService = cameraService
		setupBindings()
	}
	
	// MARK: - Public Methods
	func checkCameraAndRequestPermission() {
		permissionHandler.checkPermissionsAndProceed(
			permissions: [.camera],
			completion: { [weak self] in
				DispatchQueue.main.async {
					self?.model.cameraPermissionStatus = .authorized
					self?.startCameraSession()
				}
			},
			handleUngrantedPermission: { [weak self] ungrantedPermissions in
				self?.handleUngrantedPermission(ungrantedPermissions)
			}
		)
	}
	
	func startCameraSession() {
		cameraService.startSession()
		waitForSessionRunning()
	}
	
	func stopCameraSession() {
		cameraService.stopSession()
	}
	
	func toggleFlash() {
		let newIsOn = !model.isFlashOn
		model.isFlashOn = newIsOn
		cameraService.toggleFlash(isOn: newIsOn)
	}
	
	func capturePhoto() {
		guard !model.isCapturing else { return }
		model.isCapturing = true
		cameraService.capturePhoto()
	}
	
	func navigateBack() {
		stopCameraSession()
		navigationEvent.send(.previous(nil))
	}
	
	// MARK: - Private Methods
	private func setupBindings() {
		cameraService.capturedPhoto
			.receive(on: DispatchQueue.main)
			.sink { [weak self] image in
				self?.processCapturedPhoto(image)
			}
			.store(in: &cancellables)
	}
	
	private func handleUngrantedPermission(_ ungrantedPermission: [PermissionType]) {
		permissionHandler.requestPermissions(
			ungrantedPermission,
			completion: { [weak self] deniedPermissions in
				guard let self else { return }
				
				DispatchQueue.main.async {
					if deniedPermissions.isEmpty {
						self.model.cameraPermissionStatus = .authorized
						self.startCameraSession()
						return
					}
					
					self.model.isSessionReady = false
					self.permissionHandler.showToSettingPopUp(
						forDeniedPermission: deniedPermissions,
						title: StringRes.merchant_common_permission_title.localizedString,
						primaryButtonText: StringRes.general_button_set_now.localizedString,
						primaryButtonAction: {
							self.navigationEvent.send(.previous(nil))
						},
						secondaryButtonText: StringRes.general_button_back.localizedString,
						secondaryButtonAction: {
							self.navigationEvent.send(.previous(nil))
						}
					)
				}
			}
		)
	}
	
	private func waitForSessionRunning() {
		var attempts = 0
		let maxAttempts = 50
		
		Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] timer in
			guard let self else {
				timer.invalidate()
				return
			}
			
			attempts += 1
			
			if let session = cameraService.session, session.isRunning {
				DispatchQueue.main.async {
					self.model.isSessionReady = true
				}
				timer.invalidate()
			} else if attempts >= maxAttempts {
				DispatchQueue.main.async {
					self.model.isSessionReady = true
				}
				timer.invalidate()
			}
		}
	}
	
	private func processCapturedPhoto(_ image: UIImage) {
		let normalizedImage = normalizeImage(image)
		let croppedImage = cropImageToOverlay(normalizedImage)
		let (compressedImage, compressedImageData) = compressImageToMaxSize(croppedImage, maxSizeKB: 2048)
		let base64String = compressedImageData.base64EncodedString()
		
		model.capturedImage = compressedImage
		
		if let callback = model.onPhotoCaptured {
			callback(compressedImage, base64String, compressedImageData)
		}
	}
	
	private func compressImageToMaxSize(_ image: UIImage, maxSizeKB: Int = 2048) -> (UIImage, Data) {
		let maxSizeBytes = maxSizeKB * 1024
		var compression = 1.0
		let minCompression = 0.1
		
		guard var imageData = image.jpegData(compressionQuality: compression) else {
			if let data = image.jpegData(compressionQuality: 0.8) {
				return (image, data)
			}
			return (image, Data())
		}
		
		while imageData.count > maxSizeBytes, compression > minCompression {
			compression -= 0.1
			if let newData = image.jpegData(compressionQuality: compression) {
				imageData = newData
			} else {
				break
			}
		}
		
		if let compressedImage = UIImage(data: imageData) {
			return (compressedImage, imageData)
		}
		
		return (image, imageData)
	}
	
	private func cropImageToOverlay(_ image: UIImage) -> UIImage {
		let screen = UIScreen.main.bounds
		let cardFrame = calculateCardFrame(screenBounds: screen)
		
		let screenRectInImage = screenRectInImageCoordinates(
			imageSize: image.size,
			screenSize: screen.size
		)
		
		let scale = screenRectInImage.width / screen.width
		let cardRectInImage = CGRect(
			x: screenRectInImage.origin.x + cardFrame.origin.x * scale,
			y: screenRectInImage.origin.y + cardFrame.origin.y * scale,
			width: cardFrame.width * scale,
			height: cardFrame.height * scale
		).intersection(CGRect(origin: .zero, size: image.size))
		
		return crop(image: image, to: cardRectInImage)
	}
	
	private func screenRectInImageCoordinates(imageSize: CGSize, screenSize: CGSize) -> CGRect {
		let scale = max(screenSize.width / imageSize.width,
		                screenSize.height / imageSize.height)
		let visibleWidth = screenSize.width / scale
		let visibleHeight = screenSize.height / scale
		return CGRect(
			x: (imageSize.width - visibleWidth) / 2,
			y: (imageSize.height - visibleHeight) / 2,
			width: visibleWidth,
			height: visibleHeight
		)
	}
	
	private func crop(image: UIImage, to rect: CGRect) -> UIImage {
		guard rect.width > 0, rect.height > 0, let cgImage = image.cgImage else {
			return image
		}
		let scale = image.scale
		let pixelRect = CGRect(
			x: rect.origin.x * scale,
			y: rect.origin.y * scale,
			width: rect.width * scale,
			height: rect.height * scale
		).integral
		
		guard let cropped = cgImage.cropping(to: pixelRect) else {
			return image
		}
		return UIImage(cgImage: cropped, scale: scale, orientation: .up)
	}
	
	private func normalizeImage(_ image: UIImage) -> UIImage {
		guard image.imageOrientation != .up else { return image }
		
		let format = UIGraphicsImageRendererFormat()
		format.scale = image.scale
		let renderer = UIGraphicsImageRenderer(size: image.size, format: format)
		return renderer.image { _ in
			image.draw(in: CGRect(origin: .zero, size: image.size))
		}
	}
	
	private func calculateCardFrame(screenBounds: CGRect) -> CGRect {
		if let overlayFrame = model.overlayFrame {
			return overlayFrame
		}
		
		let cardAspect = model.overlayAspectRatio
		let topSafe = UIApplication.shared.windows.first?.safeAreaInsets.top ?? 0
		let horizontalPadding = screenBounds.width * 0.04
		let width = screenBounds.width - (horizontalPadding * 2)
		let topOffset = topSafe + (screenBounds.height * 0.05)
		
		return CGRect(
			x: horizontalPadding,
			y: topOffset,
			width: width,
			height: width / cardAspect
		)
	}
}

// MARK: - UIImage Extension (from KlikApps CameraController)
extension UIImage {
	func fixOrientationOfImage() -> UIImage? {
		if imageOrientation == .up {
			return self
		}
		
		var transform = CGAffineTransform.identity
		
		switch imageOrientation {
			case .down, .downMirrored:
				transform = transform.translatedBy(x: size.width, y: size.height)
				transform = transform.rotated(by: CGFloat(Double.pi))
			case .left, .leftMirrored:
				transform = transform.translatedBy(x: size.width, y: 0)
				transform = transform.rotated(by: CGFloat(Double.pi / 2))
			case .right, .rightMirrored:
				transform = transform.translatedBy(x: 0, y: size.height)
				transform = transform.rotated(by: -CGFloat(Double.pi / 2))
			default:
				break
		}
		
		switch imageOrientation {
			case .upMirrored, .downMirrored:
				transform = transform.translatedBy(x: size.width, y: 0)
				transform = transform.scaledBy(x: -1, y: 1)
			case .leftMirrored, .rightMirrored:
				transform = transform.translatedBy(x: size.height, y: 0)
				transform = transform.scaledBy(x: -1, y: 1)
			default:
				break
		}
		
		guard let context = CGContext(data: nil, width: Int(size.width), height: Int(size.height), bitsPerComponent: cgImage!.bitsPerComponent, bytesPerRow: 0, space: cgImage!.colorSpace!, bitmapInfo: cgImage!.bitmapInfo.rawValue) else {
			return nil
		}
		
		context.concatenate(transform)
		
		switch imageOrientation {
			case .left, .leftMirrored, .right, .rightMirrored:
				context.draw(self.cgImage!, in: CGRect(x: 0, y: 0, width: size.height, height: size.width))
			default:
				context.draw(self.cgImage!, in: CGRect(origin: .zero, size: size))
		}
		
		guard let cgImage = context.makeImage() else {
			return nil
		}
		
		return UIImage(cgImage: cgImage)
	}
}
