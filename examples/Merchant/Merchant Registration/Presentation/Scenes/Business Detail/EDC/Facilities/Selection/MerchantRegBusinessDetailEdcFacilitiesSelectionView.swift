//  MerchantRegBusinessDetailEdcFacilitiesSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 22/06/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegBusinessDetailEdcFacilitiesSelectionView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle: CloveUI.NavigationBarStyle {
		CloveUI.NavigationBarStyle.lightBackChevronWithTitle(title: viewModel.model.title)
	}

	@ObservedObject var viewModel: MerchantRegBusinessDetailEdcFacilitiesSelectionViewModel

	init(viewModel: MerchantRegBusinessDetailEdcFacilitiesSelectionViewModel) {
		self.viewModel = viewModel
	}

	var body: some View {
		WhiteRoundedBackgroundView {
			VStack(alignment: .leading, spacing: 0) {
				constructHeaderTitleView()

				Rectangle()
					.frame(height: 1)
					.foregroundColor(CloveUITheme.Color.primary20.swiftUIColor)
					.padding([.leading, .top], length: .large)

				ScrollView {
					VStack(spacing: 0) {
						ForEach(Array(viewModel.model.selectableData.enumerated()), id: \.0) { index, option in
							VStack(alignment: .leading, spacing: 0) {
								constructTitleCheckboxView(item: option, index: index) {
									let isCurrentlySelected = viewModel.model.selectedData.contains(where: { $0.code == option.code })
									viewModel.toggleOption(at: index, isSelected: !isCurrentlySelected)
								}
								.padding(.vertical, length: .medium)

								CloveSeparatorView(type: .section)
							}
							.padding(.horizontal, length: .large)
							.frame(maxWidth: .infinity)
						}
					}
				}
				.disableBounce(in: Self.self)
				.frame(maxHeight: .infinity, alignment: .top)

				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.general_label_select.localizedString),
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

	// MARK: - Helper Views
	private func constructHeaderTitleView() -> some View {
		HStack(spacing: CloveUISpacing.small.spacing) {
			CloveText(
				text: viewModel.model.headerText,
				style: CloveUITypography.title.medium
			)
			.foregroundColor(CloveUIColor.primary20.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)

			CloveCheckBoxViewV2(
				state: viewModel.model.selectAll,
				onStateChange: { _ in
					viewModel.toggleSelectAll()
				}
			)
		}
		.padding([.top, .horizontal], length: .large)
	}

	@ViewBuilder
	private func constructTitleCheckboxView(item: CodeAndLocalizableTextModel, index: Int, onTap: (() -> Void)? = nil) -> some View {
		let isSelected = viewModel.model.selectedData.contains(where: { $0.code == item.code })
		
		HStack(alignment: .center, spacing: CloveUISpacing.small.spacing) {
			CloveText(
				text: item.getText(),
				style: CloveUITypography.subtitle.medium
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)

			CloveCheckBoxViewV2(
				state: isSelected ? .active : .inactive,
				onStateChange: { _ in
					onTap?()
				}
			)
		}
		.onTap {
			onTap?()
		}
	}
}
