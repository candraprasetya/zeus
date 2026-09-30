//
//  MerchantRegQRISLandingView.swift
//  Merchant
//
//  Created by ITBCA on 17/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegQRISLandingView: BaseView, BaseRightNavigationItemView {
	var viewModel: MerchantRegQRISLandingViewModel
	
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	init(viewModel: MerchantRegQRISLandingViewModel) {
		self.viewModel = viewModel
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			ScrollView {
				VStack(spacing: 0) {
					constructQRISImageView()
					
					constructInfoView()
						.padding(.top, length: .large)
					
					constructNextButton()
						.padding(.top, length: .large)
				}
				.padding(.all, length: .large)
			}
			.disableBounce(in: Self.self)
		}
	}
	
	private func constructQRISImageView() -> some View {
		HStack(spacing: 0) {
			VStack(spacing: 0) {
				Image("QrisStickerExample", bundle: Bundle(identifier: Merchant.bundleId))
					.resizable()
					.frame(maxWidth: .greatestFiniteMagnitude)
				
				HStack(alignment: .center, spacing: 0) {
					Image("Checklist", bundle: Bundle(identifier: CloveUI.bundleID))
						.renderingMode(.template)
						.resizable()
						.foregroundStyle(CloveUIColor.light10.swiftUIColor)
						.frame(width: 20, height: 20)
						.padding(.vertical, length: .xSmall)
						.padding(.leading, length: .small)
					
					CloveText(
						text: StringRes.merchant_business_qris_details_landing_do.localizedString,
						style: CloveUITypography.title.small
					)
					.foregroundColor(CloveUIColor.light10.swiftUIColor)
					.frame(maxWidth: .greatestFiniteMagnitude, alignment: .leading)
					.padding(.leading, length: .xSmall)
				}
				.background(
					CloveUIColor.tosca20.swiftUIColor
				)
			}
			.frame(width: viewModel.getQRISImageViewWidth())
			
			VStack(spacing: 0) {
				Image("QrisStickerExample", bundle: Bundle(identifier: Merchant.bundleId))
					.resizable()
					.frame(maxWidth: .greatestFiniteMagnitude)
					.blur(radius: 3)
				
				HStack(alignment: .center, spacing: 0) {
					Image("CrossFilled", bundle: Bundle(identifier: CloveUI.bundleID))
						.renderingMode(.template)
						.resizable()
						.foregroundStyle(CloveUIColor.light10.swiftUIColor)
						.frame(width: 20, height: 20)
						.padding(.vertical, length: .xSmall)
						.padding(.leading, length: .small)
					
					CloveText(
						text: StringRes.merchant_business_qris_details_landing_dont.localizedString,
						style: CloveUITypography.title.small
					)
					.foregroundColor(CloveUIColor.light10.swiftUIColor)
					.frame(maxWidth: .greatestFiniteMagnitude, alignment: .leading)
					.padding(.leading, length: .xSmall)
				}
				.background(
					CloveUIColor.danger20.swiftUIColor
				)
			}
			.frame(width: viewModel.getQRISImageViewWidth())
		}
		.cornerRadius(12, corners: [.bottomLeft, .bottomRight])
	}
	
	private func constructInfoView() -> some View {
		VStack(alignment: .leading, spacing: 0) {
			CloveText(
				text: StringRes.merchant_business_qris_details_landing_prepare_qris.localizedString,
				style: CloveUITypography.title.large
			)
			.foregroundColor(CloveUIColor.primary20.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			CloveText(
				text: StringRes.merchant_business_qris_details_landing_landing_desc.localizedString,
				style: CloveUITypography.body.medium
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			.padding(.top, length: .xSmall)
			
			constructBulletTextList(
				title: StringRes.merchant_business_qris_details_landing_confirmation_title.localizedString,
				list: [
					StringRes.merchant_business_qris_details_landing_confirmation_item_1.localizedString,
					StringRes.merchant_business_qris_details_landing_confirmation_item_2.localizedString,
					StringRes.merchant_business_qris_details_landing_confirmation_item_3.localizedString
				]
			)
			.padding(.top, length: .xSmall)
		}
	}
	
	private func constructBulletTextList(title: String, list: [String]) -> some View {
		VStack(alignment: .leading, spacing: 0) {
			CloveText(
				text: title,
				style: CloveUITypography.body.medium
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			ForEach(list, id: \.self) { text in
				HStack(alignment: .top, spacing: 0) {
					CloveText(text: "•", style: CloveUITypography.body.medium)
						.foregroundColor(CloveUIColor.dark20.swiftUIColor)
					
					CloveText(text: text, style: CloveUITypography.body.medium)
						.foregroundColor(CloveUIColor.dark20.swiftUIColor)
						.frame(maxWidth: .infinity, alignment: .leading)
						.padding(.leading, length: .xSmall)
				}
				.padding(.top, length: .xSmall)
			}
		}
	}
	
	private func constructNextButton() -> some View {
		CloveButtonViewV2(
			type: .textOnly(
				textId: StringRes.merchant_business_qris_details_landing_button_understand.localizedString
			),
			enabled: true,
			layout: .stretch,
			onClick: viewModel.nextButtonAction
		)
	}
}
