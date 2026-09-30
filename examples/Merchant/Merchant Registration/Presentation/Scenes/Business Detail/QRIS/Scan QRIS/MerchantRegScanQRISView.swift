//
//  MerchantRegScanQRISView.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import AVFoundation
import CloveUI
import CloveUILib
import Combine
import Core
import Lottie
import SwiftUI

struct MerchantRegScanQRISView: BaseMutableStateView, BaseRightNavigationItemView, UpdatableNavBar {
	@ObservedObject var viewModel: MerchantRegScanQRISViewModel
	
	var navigationBarStyle: CloveUI.NavigationBarStyle
	var updateNavbar: ((CloveUI.NavigationBarStyle) -> Void)?
	
	init(viewModel: MerchantRegScanQRISViewModel) {
		self.viewModel = viewModel
		self.navigationBarStyle = .titleLeftIconRight(
			withBackButton: true,
			title: viewModel.screenTitle,
			icon: viewModel.iconName,
			secondIcon: "FlashOff"
		)
	}
	
	var body: some View {
		constructContainerView {
			ZStack {
				MerchantRegScanPreview(session: viewModel.scanner.session)
					.ignoresSafeArea()
				
				LottieView(
					animationFileName: "ic_scanning_new",
					loopMode: .loop,
					contentMode: .scaleToFill
				)
				.frame(maxWidth: .infinity, maxHeight: .infinity)
				.ignoresSafeArea()
				
				VStack(spacing: 0) {
					Spacer()
					
					Image(
						"QRISSupportedLogo",
						bundle: Bundle(identifier: Merchant.bundleId)
					)
					.resizable()
					.scaledToFit()
					.frame(width: 64, height: 40)
					.padding(.bottom, length: .xLarge)
				}
			}
			.onViewDidAppear {
				viewModel.checkCameraAndGaleryPermission { granted in
					if granted {
						viewModel.configureScanner()
					}
				}
			}
			.background {
				CloveUIColor.dark30.swiftUIColor
					.frame(
						maxWidth: .greatestFiniteMagnitude,
						maxHeight: .greatestFiniteMagnitude
					)
					.ignoresSafeArea()
			}
			.gesture(
				MagnificationGesture()
					.onChanged { value in
						viewModel.onZoom(value)
					}
					.onEnded { value in
						viewModel.onZoomEnded()
					}
			)
			.onDisappear {
				viewModel.scanner.stop()
			}
			.sheet(isPresented: $viewModel.showImagePicker) {
				MerchantRegImagePicker { image in
					viewModel.imagePickerOnSelectedImage(image)
				}
				.ignoresSafeArea()
			}
		}
	}
	
	func leftButtonTap() {
		viewModel.backToPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.triggerImagePicker()
	}
	
	func rightSecondButtonTap() {
		viewModel.toggleFlashlight()
		updateNavbar?(.titleLeftIconRight(
			withBackButton: true,
			title: viewModel.screenTitle,
			icon: viewModel.iconName,
			secondIcon: viewModel.isFlashOn ? "FlashOn" : "FlashOff"
		))
	}
	
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		return constructErrorContainerView(forProcesses: viewModel.allProcessId) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: [viewModel.validateQrisProcessId])],
				content: content
			)
		}
	}
}






