
//  MerchantRegApplyStatusView.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegApplyStatusView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleOnly(title: "")
	
	@ObservedObject var viewModel: MerchantRegApplyStatusViewModel
	
	init(viewModel: MerchantRegApplyStatusViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		Group {
			if let status = viewModel.model.status {
				switch status {
					case .rejected:
						constructStatusRejected()
					case .completeData:
						constructStatusCompleteData()
					case .emailAlreadyRegistered:
						constructStatusEmailAlreadyRegistered()
					case .waiting:
						constructStatusWaiting()
					default:
						constructStatusAlreadyRegistered()
				}
			}
		}
		.showBanner(
			text: StringRes.merchant_status_reference_number_copied.localizedString,
			isShowingBannerArray: $viewModel.model.isShowingBanner
		)
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func constructStatusAlreadyRegistered() -> some View {
		VStack(spacing: 0) {
			VStack(spacing: 0) {
				Image("MerchantBCALogo", bundle: Merchant.bundle)
					.resizable()
					.frame(width: 188, height: 116)
					.padding(.bottom, 38)
				
				CloveText(
					text: StringRes.merchant_status_registered_title.localizedString,
					style: CloveUITypography.title.xLarge
				)
				.foregroundColor(CloveUIColor.primary20.swiftUIColor)
				.multilineTextAlignment(.center)
				.padding(.bottom, length: .xLarge)
				
				CloveText(
					text: StringRes.merchant_status_registered_desc.localizedString,
					style: CloveUITypography.body.xLarge
				)
				.foregroundColor(CloveUIColor.primary20.swiftUIColor)
				.multilineTextAlignment(.center)
			}
			.frame(maxWidth: .infinity, maxHeight: .infinity)
			.padding(.horizontal, length: .large)
			
			VStack(spacing: CloveUISpacing.medium.spacing) {
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.merchant_status_open_in_merchant_app.localizedString),
					layout: .stretch,
					onClick: viewModel.openMerchantBcaApp
				)
				
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.merchant_status_back_to_home.localizedString),
					layout: .stretch,
					style: .secondary,
					onClick: viewModel.toHomeScreen
				)
			}
			.padding(length: .large)
		}
	}
	
	func constructStatusEmailAlreadyRegistered() -> some View {
		VStack(spacing: 0) {
			VStack(spacing: 0) {
				Image("MerchantBCALogo", bundle: Merchant.bundle)
					.resizable()
					.frame(width: 188, height: 116)
					.padding(.bottom, 38)
				
				CloveText(
					text: StringRes.merchant_status_email_registered_title.localizedString,
					style: CloveUITypography.title.xLarge
				)
				.foregroundColor(CloveUIColor.primary20.swiftUIColor)
				.multilineTextAlignment(.center)
				.padding(.bottom, length: .xLarge)
				
				CloveText(
					text: StringRes.merchant_status_email_registered_desc.localizedString,
					style: CloveUITypography.body.xLarge
				)
				.foregroundColor(CloveUIColor.primary20.swiftUIColor)
				.multilineTextAlignment(.center)
			}
			.frame(maxWidth: .infinity, maxHeight: .infinity)
			.padding(.horizontal, length: .large)
			
			VStack(spacing: CloveUISpacing.medium.spacing) {
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.settings_change_email.localizedString),
					layout: .stretch,
					onClick: viewModel.navigateToSettings
				)
				
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.merchant_status_back_to_home.localizedString),
					layout: .stretch,
					style: .secondary,
					onClick: viewModel.toHomeScreen
				)
			}
			.padding(length: .large)
		}
	}
	
	func constructStatusWaiting() -> some View {
		VStack(spacing: 0) {
			ScrollView {
				VStack(spacing: 0) {
					Image("StatusPending", bundle: Bundle(identifier: CloveUI.bundleID))
						.resizable()
						.frame(width: 100, height: 100)
						.padding(.bottom, length: .xLarge)
					
					CloveText(
						text: StringRes.merchant_status_pending_analysis_title.localizedString,
						style: CloveUITypography.title.large
					)
					.foregroundColor(CloveUIColor.primary20.swiftUIColor)
					.multilineTextAlignment(.center)
					.padding(.bottom, length: .medium)
					
					CloveText(
						text: StringRes.merchant_status_pending_analysis_desc.localizedString,
						style: CloveUITypography.body.medium
					)
					.foregroundColor(CloveUIColor.dark20.swiftUIColor)
					.multilineTextAlignment(.center)
					.padding(.bottom, length: .xLarge)
					
					if let reffNo = viewModel.model.reffNo, !reffNo.isEmpty {
						CloveSeparatorView(type: .section)
						
						HStack(spacing: 0) {
							CloveText(
								text: StringRes.merchant_status_reference_number.localizedString,
								style: CloveUITypography.body.medium
							)
							.foregroundColor(CloveUIColor.dark20.swiftUIColor)
							.frame(maxWidth: .infinity, alignment: .leading)
							
							HStack(spacing: 0) {
								CloveText(
									text: reffNo,
									style: CloveUITypography.title.medium
								)
								.foregroundColor(CloveUIColor.dark20.swiftUIColor)
								
								Image("Copy", bundle: Bundle(identifier: CloveUI.bundleID))
									.resizable()
									.aspectRatio(contentMode: .fit)
									.frame(width: 16, height: 16)
									.padding(.leading, length: .large)
							}
							.onTapGesture {
								viewModel.onCopyToClipboard()
							}
						}
						.padding(.vertical, length: .medium)
						
						CloveSeparatorView(type: .section)
					}
				}
				.padding(length: .large)
			}
			.disableBounce(in: Self.self)
			
			Spacer()
			
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.general_button_ok.localizedString),
				layout: .stretch,
				onClick: viewModel.toHomeScreen
			)
			.padding(length: .large)
		}
	}
	
	func constructStatusCompleteData() -> some View {
		VStack(spacing: 0) {
			ScrollView {
				VStack(spacing: 0) {
					Image("StatusWarning", bundle: Bundle(identifier: CloveUI.bundleID))
						.resizable()
						.frame(width: 100, height: 100)
						.padding(.bottom, length: .xLarge)
					
					CloveText(
						text: StringRes.merchant_status_pending_document_title.localizedString,
						style: CloveUITypography.title.large
					)
					.foregroundColor(CloveUIColor.primary20.swiftUIColor)
					.multilineTextAlignment(.center)
					.padding(.bottom, length: .medium)
						
					CloveText(
						text: StringRes.merchant_status_pending_document_desc.localizedString,
						style: CloveUITypography.body.medium
					)
					.foregroundColor(CloveUIColor.dark20.swiftUIColor)
					.multilineTextAlignment(.center)
					.padding(.bottom, length: .xLarge)

					if let reffNo = viewModel.model.reffNo, !reffNo.isEmpty {
						CloveSeparatorView(type: .section)
						
						HStack(spacing: 0) {
							CloveText(
								text: StringRes.merchant_status_reference_number.localizedString,
								style: CloveUITypography.body.medium
							)
							.foregroundColor(CloveUIColor.dark20.swiftUIColor)
							.frame(maxWidth: .infinity, alignment: .leading)
							
							HStack(spacing: 0) {
								CloveText(
									text: reffNo,
									style: CloveUITypography.body.medium
								)
								.foregroundColor(CloveUIColor.dark20.swiftUIColor)
								
								Image("Copy", bundle: Bundle(identifier: CloveUI.bundleID))
									.resizable()
									.aspectRatio(contentMode: .fit)
									.frame(width: 16, height: 16)
									.padding(.leading, length: .large)
							}
							.onTapGesture {
								viewModel.onCopyToClipboard()
							}
						}
						.padding(.vertical, length: .medium)
						
						CloveSeparatorView(type: .section)
					}
				}
				.padding(length: .large)
			}
			.disableBounce(in: Self.self)
			
			Spacer()
			
			VStack(spacing: CloveUISpacing.xSmall.spacing) {
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.merchant_status_button_complete_document.localizedString),
					layout: .stretch,
					onClick: viewModel.toHomeScreen
				)
				
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.general_button_back.localizedString),
					layout: .stretch,
					style: .secondary,
					onClick: viewModel.toHomeScreen
				)
			}
			.padding(length: .large)
		}
	}
	
	func constructStatusRejected() -> some View {
		VStack(spacing: 0) {
			ScrollView {
				VStack(spacing: 0) {
					Image("StatusFailed", bundle: Bundle(identifier: CloveUI.bundleID))
						.resizable()
						.frame(width: 100, height: 100)
						.padding(.bottom, length: .xLarge)
					
					CloveText(
						text: StringRes.merchant_status_rejected_title.localizedString,
						style: CloveUITypography.title.large
					)
					.foregroundColor(CloveUIColor.primary20.swiftUIColor)
					.multilineTextAlignment(.center)
					.padding(.bottom, length: .medium)
					
					CloveText(
						text: StringRes.merchant_status_rejected_desc.localizedString,
						style: CloveUITypography.body.medium
					)
					.foregroundColor(CloveUIColor.dark20.swiftUIColor)
					.multilineTextAlignment(.center)
				}
				.padding(length: .large)
			}
			.disableBounce(in: Self.self)
			
			Spacer()
			
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.general_button_ok.localizedString),
				layout: .stretch,
				onClick: viewModel.toHomeScreen
			)
			.padding(length: .large)
		}
	}
}
