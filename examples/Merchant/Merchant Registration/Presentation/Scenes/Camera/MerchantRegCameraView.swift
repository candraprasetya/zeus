//  MerchantRegCameraView.swift
//  Merchant
//
//  Created by Candra Prasetya on 26/04/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegCameraView: BaseMutableStateView, BaseNavigationView, UpdatableNavBar {
	var updateNavbar: ((CloveUI.NavigationBarStyle) -> Void)?
	
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_npwp_capture_title.localizedString,
		haveRightBarItem: false
	)
	
	@ObservedObject var viewModel: MerchantRegCameraViewModel
	
	// MARK: - Initialization
	init(viewModel: MerchantRegCameraViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		ZStack {
			CameraPreviewRepresentable(
				previewLayer: viewModel.cameraService.previewLayer
			)
			.ignoresSafeArea()
			
			KtpOverlayView(
				aspectRatio: viewModel.model.overlayAspectRatio,
				verticalBias: 0.2,
				instructions: [
					StringRes.merchant_npwp_capture_guidelines_1.localizedString,
					StringRes.merchant_npwp_capture_guidelines_2.localizedString,
				],
				onOverlayRectReady: { frame in
					viewModel.model.overlayFrame = frame
				}
			)
			.ignoresSafeArea()
			
			VStack(spacing: 0) {
				Spacer()
				
				constructButtons()
					.padding(.bottom, CloveUISpacing.xLarge.spacing)
					.padding(.horizontal, CloveUISpacing.large.spacing)
			}
		}
		.onAppear {
			let navbarItem = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
				title: StringRes.merchant_npwp_capture_title.localizedString,
				haveRightBarItem: false
			)
			updateNavbar?(navbarItem)
			viewModel.checkCameraAndRequestPermission()
		}
		.onDisappear {
			viewModel.stopCameraSession()
		}
	}
	
	// MARK: - Bottom Controls
	private func constructButtons() -> some View {
		ZStack {
			HStack {
				constructFlashButton()
				Spacer()
			}
			
			constructCaptureButton()
		}
		.padding(length: .large)
	}
	
	private func constructFlashButton() -> some View {
		Button(action: viewModel.toggleFlash) {
			Image(viewModel.model.isFlashOn ? "icCameraFlashActive" : "icCameraFlashInactive")
				.resizable()
				.frame(width: 48, height: 48)
		}
	}
	
	private func constructCaptureButton() -> some View {
		Button(action: viewModel.capturePhoto) {
			Image("cameraButton")
				.resizable()
				.frame(width: 64, height: 64)
		}
	}
	
	// MARK: - Navigation
	func leftButtonTap() {
		viewModel.navigateBack()
	}
}

// MARK: - Instruction Row
private struct InstructionRow: View {
	let text: String
	
	var body: some View {
		HStack(alignment: .top, spacing: CloveUISpacing.small.spacing) {
			Circle()
				.fill(Color.white)
				.frame(width: 6, height: 6)
				.padding(.top, 6)
			
			Text(text)
				.font(CloveUITypography.body.small.asSwiftUIFont())
				.foregroundColor(.white)
				.multilineTextAlignment(.leading)
			
			Spacer()
		}
	}
}

// MARK: - KTP Overlay View
private struct KtpOverlayView: View {
	let aspectRatio: CGFloat
	var horizontalPadding: CGFloat = 20
	var verticalBias: CGFloat = 0.5
	var verticalOffset: CGFloat = 0
	var cornerRadius: CGFloat = 12
	var strokeWidth: CGFloat = 2
	var dimOpacity: Double = 0.6
	let instructions: [String]
	let onOverlayRectReady: (CGRect) -> Void
	
	var body: some View {
		GeometryReader { geometry in
			let size = geometry.size
			let holeRect = calculateHoleRect(in: size)
			
			ZStack(alignment: .topLeading) {
				maskWithHole(size: size, hole: holeRect)
					.allowsHitTesting(false)
				
				instructionsList
					.padding(.horizontal, CloveUISpacing.large.spacing)
					.offset(y: holeRect.maxY + 24)
			}
			.onAppear {
				onOverlayRectReady(holeRect)
			}
			.onChange(of: size) { _ in
				onOverlayRectReady(holeRect)
			}
		}
	}
	
	private func calculateHoleRect(in size: CGSize) -> CGRect {
		let holeWidth = size.width - horizontalPadding * 2
		let holeHeight = holeWidth / aspectRatio
		let availableSpace = size.height - holeHeight
		let holeTop = availableSpace * verticalBias + size.height * verticalOffset
		return CGRect(x: horizontalPadding, y: holeTop, width: holeWidth, height: holeHeight)
	}
	
	private func maskWithHole(size: CGSize, hole: CGRect) -> some View {
		Canvas { context, _ in
			var combined = Path(CGRect(origin: .zero, size: size))
			let holePath = Path(roundedRect: hole, cornerRadius: cornerRadius)
			combined.addPath(holePath)
			
			context.fill(
				combined,
				with: .color(.black.opacity(dimOpacity)),
				style: FillStyle(eoFill: true)
			)
			context.stroke(holePath, with: .color(.white), lineWidth: strokeWidth)
		}
	}
	
	private var instructionsList: some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.medium.spacing) {
			ForEach(instructions, id: \.self) { text in
				InstructionRow(text: text)
			}
		}
	}
}

// MARK: - Camera Preview Representable
import AVFoundation

private struct CameraPreviewRepresentable: UIViewRepresentable {
	let previewLayer: AVCaptureVideoPreviewLayer
	
	func makeUIView(context _: Context) -> UIView {
		let view = UIView(frame: UIScreen.main.bounds)
		view.backgroundColor = .black
		
		previewLayer.videoGravity = .resizeAspectFill
		previewLayer.frame = view.bounds
		
		if let connection = previewLayer.connection {
			connection.videoOrientation = .portrait
			connection.isEnabled = true
		}
		
		view.layer.insertSublayer(previewLayer, at: 0)
		
		view.setNeedsLayout()
		view.layoutIfNeeded()
		
		return view
	}
	
	func updateUIView(_ uiView: UIView, context _: Context) {
		let newFrame = uiView.bounds
		
		if newFrame.width > 0, newFrame.height > 0 {
			if previewLayer.frame != newFrame {
				previewLayer.frame = newFrame
			}
		} else {
			previewLayer.frame = UIScreen.main.bounds
		}
		
		if let connection = previewLayer.connection, !connection.isEnabled {
			connection.isEnabled = true
		}
	}
}
