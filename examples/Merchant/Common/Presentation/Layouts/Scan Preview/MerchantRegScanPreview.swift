//
//  MerchantRegScanPreview.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import AVFoundation
import SwiftUI
import UIKit

struct MerchantRegScanPreview: UIViewRepresentable {
	let session: AVCaptureSession
	
	func makeUIView(context: Context) -> UIView {
		let view = UIView()
		
		let previewLayer = AVCaptureVideoPreviewLayer(session: session)
		previewLayer.videoGravity = .resizeAspectFill
		previewLayer.frame = UIScreen.main.bounds
		
		view.layer.addSublayer(previewLayer)
		
		return view
	}
	
	func updateUIView(_ uiView: UIView, context: Context) {
		if let previewLayer = uiView.layer.sublayers?.first as? AVCaptureVideoPreviewLayer {
			previewLayer.session = session
		}
	}
}
