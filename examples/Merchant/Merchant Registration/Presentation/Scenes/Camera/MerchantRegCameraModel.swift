//
//  MerchantRegCameraModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 10/05/26.
//

import AVFoundation
import Core
import SwiftUI

enum MerchantRegCameraDocumentType {
	case npwp
	case ktp
}

enum MerchantRegCameraOverlayAspectRatio {
	/// ISO/IEC 7810 ID-1 card dimensions (85.6mm × 53.98mm).
	/// Used for NPWP, KTP, and other ID cards.
	static let idCard = 85.6 / 53.98
}

struct MerchantRegCameraModel {
	// MARK: - Data for display
	let title: String
	
	// MARK: - Data for logical processes
	let documentType: MerchantRegCameraDocumentType
	let overlayAspectRatio: CGFloat
	let onPhotoCaptured: ((UIImage, String, Data) -> Void)?
	
	// MARK: - Data for input
	var capturedImage: UIImage?
	var isFlashOn = false
	var cameraPermissionStatus = AVAuthorizationStatus.notDetermined
	var hasShownPermissionAlert = false
	var isSessionReady = false
	var overlayFrame: CGRect?
	var isCapturing = false
	
	// MARK: - Initialization
	init(
		documentType: MerchantRegCameraDocumentType = .npwp,
		title: String = "Foto sesuai garis bantu",
		overlayAspectRatio: CGFloat = MerchantRegCameraOverlayAspectRatio.idCard,
		onPhotoCaptured: ((UIImage, String, Data) -> Void)? = nil
	) {
		self.documentType = documentType
		self.title = title
		self.overlayAspectRatio = overlayAspectRatio
		self.onPhotoCaptured = onPhotoCaptured
	}
}
