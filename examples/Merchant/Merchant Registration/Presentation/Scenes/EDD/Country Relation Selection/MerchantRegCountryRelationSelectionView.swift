
//  MerchantRegCountryRelationSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 02/07/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegCountryRelationSelectionView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_business_details_edd_country_relation_select_header_title.localizedString
	)
	
	@ObservedObject var viewModel: MerchantRegCountryRelationSelectionViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegCountryRelationSelectionViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			VStack(alignment: .leading, spacing: 0) {
				CloveSearchBarView(
					placeHolderText: StringRes.general_search.localizedString,
					type: .withIcon,
					text: $viewModel.model.searchInput
				)
				.padding([.horizontal, .top], length: .large)
				
				if !viewModel.model.searchInput.isEmpty, viewModel.filteredData.isEmpty {
					CloveErrorStateViewV2(
						messageId: StringRes.general_search_not_found.localizedString,
						type: .noSearchResult,
						errorPosition: .listView
					)
					.frame(maxWidth: .infinity)
					.padding(.top, length: .small)
				} else {
					if !viewModel.model.selectedData.isEmpty {
						ScrollView(.horizontal, showsIndicators: false) {
							HStack(spacing: 10) {
								ForEach(Array(viewModel.model.selectedData.enumerated()), id: \.offset) { index, option in
									optionButton(label: option)
								}
							}
						}
						.padding([.horizontal, .top], length: .large)
					}
					
					ScrollView(showsIndicators: false) {
						VStack(alignment: .leading, spacing: 0) {
							constructBannerSection()
								.padding(.top, length: .large)
							
							VStack(spacing: 0) {
								ForEach(Array(viewModel.filteredData.enumerated()), id: \.offset) { index, option in
									VStack(alignment: .leading, spacing: 0) {
										constructTitleCheckboxView(item: option) {
											let isCurrentlySelected = viewModel.model.selectedData.contains(where: { $0 == option })
											viewModel.toggleOption(label: option, isSelected: !isCurrentlySelected)
										}
										.padding(.vertical, length: .medium)
										
										CloveSeparatorView(type: .section)
									}
									.frame(maxWidth: .infinity)
								}
							}
						}
					}
					.disableBounce(in: Self.self)
					.keyboardAdaptive()
					.frame(maxHeight: .infinity, alignment: .leading)
					.padding(.horizontal, length: .large)
				}
				
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.general_button_save.localizedString),
					enabled: viewModel.isButtonEnabled(),
					layout: .stretch,
					onClick: viewModel.onSave
				)
				.padding(length: .large)
			}
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	private func optionButton(label: String) -> some View {
		HStack(spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: label,
				style: CloveUITypography.body.medium
			)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			Image("MerchantRegCrossIcon", bundle: Bundle(identifier: Merchant.bundleId))
				.resizable()
				.frame(width: 16, height: 16)
				.onTap {
					withAnimation(.easeInOut(duration: 0.2)) {
						viewModel.removeSelected(label: label)
					}
				}
		}
		.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		.padding(.horizontal, length: .small)
		.padding(.vertical, length: .xSmall)
		.cornerRadius(8, corners: .allCorners)
		.withBorderCustomColor(
			color: CloveUIColor.dark10.swiftUIColor,
			radius: 8
		)
	}
	
	private func constructBannerSection() -> some View {
		Group {
			try? CloveBannerViewV2(
				type: .infobox(
					variant: .bodyOnly(
						body: .standard(
							textId: StringRes.merchant_business_details_edd_country_relation_info_label.localizedString
						)
					),
					action: .none
				),
				status: .info,
				showBanner: .constant(true)
			)
		}
	}
	
	@ViewBuilder
	private func constructTitleCheckboxView(item: String, onTap: (() -> Void)? = nil) -> some View {
		let isSelected = viewModel.model.selectedData.contains(where: { $0 == item })
		let isDisabled = viewModel.isMaxSelected && !isSelected
		
		HStack(alignment: .center, spacing: CloveUISpacing.small.spacing) {
			CloveText(
				text: item,
				style: CloveUITypography.subtitle.large
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			CloveCheckBoxViewV2(
				state: isSelected ? .active : isDisabled ? .disabled : .inactive,
				onStateChange: { _ in
					if !isDisabled {
						onTap?()
					}
				}
			)
		}
		.onTap {
			if !isDisabled {
				onTap?()
			}
		}
	}
}
