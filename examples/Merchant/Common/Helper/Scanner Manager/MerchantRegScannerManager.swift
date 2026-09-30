//
//  MerchantRegScannerManager.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import AVFoundation
import Combine

final class MerchantRegScannerManager: NSObject, ObservableObject, AVCaptureMetadataOutputObjectsDelegate {
	let session = AVCaptureSession()
	private let metadataOutput = AVCaptureMetadataOutput()
	
	var onScan: ((String) -> Void)?
	
	func configure() {
		guard let device = AVCaptureDevice.default(
			.builtInWideAngleCamera,
			for: .video,
			position: .back
		) else { return }
		
		do {
			let input = try AVCaptureDeviceInput(device: device)
			
			if session.canAddInput(input) {
				session.addInput(input)
			}
			
			if session.canAddOutput(metadataOutput) {
				session.addOutput(metadataOutput)
				
				metadataOutput.setMetadataObjectsDelegate(self, queue: .main)
				metadataOutput.metadataObjectTypes = [.qr, .ean13, .code128]
			}
			
		} catch {
			print("Camera error:", error)
		}
	}
	
	func start() {
		if !session.isRunning {
			DispatchQueue.global(qos: .background).async {
				self.session.startRunning()
			}
		}
	}
	
	func stop() {
		if session.isRunning {
			DispatchQueue.global(qos: .background).async {
				self.session.stopRunning()
			}
		}
	}
	
	func metadataOutput(
		_ output: AVCaptureMetadataOutput,
		didOutput metadataObjects: [AVMetadataObject],
		from connection: AVCaptureConnection
	) {
		stop()
		guard let object = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
			  let qrContent = object.stringValue else { return }
		AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
		onScan?(qrContent)
	}
}
