//
//  MerchantRegCameraServices.swift
//  Merchant
//
//  Created by Candra Prasetya on 10/05/26.
//

import AVFoundation
import Combine
import UIKit

public protocol MerchantRegCameraServiceProtocol {
	var previewLayer: AVCaptureVideoPreviewLayer { get }
	var capturedPhoto: PassthroughSubject<UIImage, Never> { get }
	var session: AVCaptureSession? { get }
	
	func startSession()
	func stopSession()
	func toggleFlash(isOn: Bool)
	func capturePhoto()
}

public final class MerchantRegCameraService: NSObject, MerchantRegCameraServiceProtocol {
	// MARK: - Published Properties
	public let previewLayer = AVCaptureVideoPreviewLayer()
	public let capturedPhoto = PassthroughSubject<UIImage, Never>()
	
	// MARK: - Private Properties
	public private(set) var session: AVCaptureSession?
	private var photoOutput: AVCapturePhotoOutput?
	private var videoDeviceInput: AVCaptureDeviceInput?
	
	// MARK: - Initialization
	override public init() {
		super.init()
		previewLayer.videoGravity = .resizeAspectFill
	}
	
	// MARK: - Public Methods
	public func startSession() {
		guard session == nil else {
			resumeSession()
			return
		}
		
		setupCamera()
	}
	
	public func stopSession() {
		session?.stopRunning()
	}
	
	public func toggleFlash(isOn: Bool) {
		guard let device = videoDeviceInput?.device else { return }
		
		do {
			try device.lockForConfiguration()
			device.torchMode = isOn ? .on : .off
			device.unlockForConfiguration()
		} catch {}
	}
	
	public func capturePhoto() {
		guard let photoOutput else { return }
		
		let photoSettings = AVCapturePhotoSettings()
		photoOutput.capturePhoto(with: photoSettings, delegate: self)
	}
	
	// MARK: - Private Methods
	private func setupCamera() {
		let session = AVCaptureSession()
		session.sessionPreset = .photo
		
		guard let videoDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
			return
		}
		
		do {
			let videoInput = try AVCaptureDeviceInput(device: videoDevice)
			if session.canAddInput(videoInput) {
				session.addInput(videoInput)
				videoDeviceInput = videoInput
			}
			
			let photoOutput = AVCapturePhotoOutput()
			if session.canAddOutput(photoOutput) {
				session.addOutput(photoOutput)
				self.photoOutput = photoOutput
			}
			
			self.session = session
			previewLayer.session = session
			
			DispatchQueue.global(qos: .userInitiated).async {
				session.startRunning()
			}
		} catch {}
	}
	
	private func resumeSession() {
		guard let session, !session.isRunning else { return }
		DispatchQueue.global(qos: .background).async {
			session.startRunning()
		}
	}
}

// MARK: - AVCapturePhotoCaptureDelegate
extension MerchantRegCameraService: AVCapturePhotoCaptureDelegate {
	public func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
		guard let imageData = photo.fileDataRepresentation(),
			  let image = UIImage(data: imageData)
		else {
			return
		}
		capturedPhoto.send(image)
	}
}
