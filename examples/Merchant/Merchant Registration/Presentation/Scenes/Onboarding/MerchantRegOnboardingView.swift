
//  MerchantRegOnboardingView.swift
//  Merchant
//
//  Created by Candra Prasetya on 13/04/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegOnboardingView: BaseMutableStateView, BaseNavigationView, UpdatableNavBar {
	var updateNavbar: ((CloveUI.NavigationBarStyle) -> Void)?
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_common_header_title.localizedString
	)

	@ObservedObject var viewModel: MerchantRegOnboardingViewModel

	init(viewModel: MerchantRegOnboardingViewModel) {
		self.viewModel = viewModel
	}

	var body: some View {
		WhiteRoundedBackgroundView {
			VStack(spacing: 0) {
				ScrollView {
					constructHeaderView()

					VStack(spacing: 0) {
						ForEach(viewModel.model.data, id: \.text) { item in
							constructOnboardingItem(imageString: item.imageString, text: item.text)
						}
					}
					.padding([.horizontal, .bottom], length: .large)
				}
				.disableBounce(in: Self.self)

				Spacer()

				constructActionButton()
			}
		}.onLoad {
			updateWebviewNavBar()
		}
	}

	private func updateWebviewNavBar() {
		let navigationBarStyleState = viewModel.model.isFromOpenAccount ? CloveUI.NavigationBarStyle.noButtonLeftTitleWithRightIcon(title: StringRes.merchant_common_header_title.localizedString
		) : CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
			title: StringRes.merchant_common_header_title.localizedString
		)

		updateNavbar?(navigationBarStyleState)
	}

	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}

	private func constructHeaderView() -> some View {
		VStack(spacing: 0) {
			Image("MerchantApplyOnboarding", bundle: Merchant.bundle)
				.resizable()
				.frame(width: 120, height: 120)
				.padding(.vertical, length: .large)

			CloveText(
				text: StringRes.merchant_onboarding_headline.localizedString,
				style: CloveUITypography.title.large
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			.multilineTextAlignment(.center)
			.padding(.top, length: .large)

			CloveText(
				text: StringRes.merchant_onboarding_subtext.localizedString,
				style: CloveUITypography.body.medium
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			.multilineTextAlignment(.center)
			.padding(.top, length: .xSmall)
			.padding(.bottom, length: .large)
		}
		.padding(length: .large)
	}

	private func constructOnboardingItem(imageString: String, text: String) -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.medium.spacing) {
			HStack(spacing: CloveUISpacing.small.spacing) {
				Image(imageString, bundle: Merchant.bundle)
					.resizable()
					.frame(width: 40, height: 40)

				CloveText(
					text: text,
					style: CloveUITypography.title.medium
				)
				.foregroundColor(CloveUIColor.primary30.swiftUIColor)
			}

			CloveSeparatorView(type: .section)
				.padding(.bottom, length: .medium)
		}
	}

	private func constructActionButton() -> some View {
		VStack(spacing: CloveUISpacing.xSmall.spacing) {
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.merchant_onboarding_button_apply_now.localizedString),
				layout: .stretch,
				onClick: viewModel.toPreparationScreen
			)

			if viewModel.model.isFromOpenAccount {
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.general_button_skip.localizedString),
					layout: .stretch,
					style: .secondary,
					onClick: viewModel.toHomeScreen
				)
			}
		}
		.padding(length: .large)
	}
}
