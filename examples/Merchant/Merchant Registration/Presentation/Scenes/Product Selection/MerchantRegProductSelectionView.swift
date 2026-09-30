
//  MerchantRegProductSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 20/05/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegProductSelectionView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegProductSelectionViewModel
	
	// MARK: - Initialization
	init(viewModel: MerchantRegProductSelectionViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		WhiteRoundedBackgroundView {
			ScrollView {
				VStack(spacing: CloveUISpacing.large.spacing) {
					constructHeaderView()
					constructProductSection()
					Spacer()
				}
			}
			.disableBounce(in: Self.self)
			.onLoad {
				viewModel.prepareLocalData()
			}
		}
	}
	
	// MARK: - Section Views
	private func constructHeaderView() -> some View {
		MerchantRegCircleProgressTitleSubtitleLayout(
			title: StringRes.merchant_facility_options_progress_title.localizedString,
			subtitle: StringRes.merchant_facility_options_next_step.localizedString,
			progress: 30
		)
	}
	
	private func constructProductSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructTitle()
			
			VStack(spacing: 0) {
				ForEach(Array(viewModel.model.data.enumerated()), id: \.element.text) { index, item in
					constructProductContent(
						index: index,
						imageString: item.imageString,
						text: item.text,
						desc: item.desc,
						tappableText: item.tappableText
					)
					.onTap {
						viewModel.navigateToAddressDetail(index: index)
					}
				}
			}
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructTitle() -> some View {
		CloveText(
			text: StringRes.merchant_facility_options_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
	}
	
	// MARK: - Reusable Components
	private func constructProductContent(index: Int, imageString: String, text: String, desc: String, tappableText: String) -> some View {
		VStack(alignment: .leading, spacing: 0) {
			HStack(alignment: .top, spacing: CloveUISpacing.small.spacing) {
				Image(imageString, bundle: Merchant.bundle)
					.resizable()
					.frame(width: 54, height: 54)
				
				VStack(alignment: .leading, spacing: CloveUISpacing.xxSmall.spacing) {
					Group {
						CloveText(
							text: text,
							style: CloveUITypography.title.medium
						)
						.foregroundColor(CloveUIColor.primary20.swiftUIColor)
						
						CloveText(
							text: desc,
							style: CloveUITypography.body.small
						)
						.foregroundColor(CloveUIColor.dark20.swiftUIColor)
						
						HStack(spacing: 2) {
							CloveText(
								text: tappableText,
								style: CloveUITypography.body.small
							)
							.foregroundColor(CloveUIColor.dark10.swiftUIColor)
							
							CloveText(
								text: StringRes.merchant_common_here.localizedString,
								style: CloveUITypography.subtitle.small
							)
							.foregroundColor(CloveUIColor.secondary30.swiftUIColor)
							.onTap {
								viewModel.navigateToUrl(index: index)
							}
						}
					}
					.frame(maxWidth: .infinity, alignment: .leading)
				}
				
				VStack(spacing: 0) {
					Image("blueArrowRight", bundle: Bundle(identifier: CloveUI.bundleID))
						.resizable()
						.frame(width: 24, height: 24)
				}
				.frame(maxHeight: .infinity)
			}
			.padding(.vertical, length: .medium)
			
			CloveSeparatorView(type: .section)
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
}
