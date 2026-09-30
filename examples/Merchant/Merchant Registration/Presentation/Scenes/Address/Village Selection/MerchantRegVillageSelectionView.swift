
//  MerchantRegVillageSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 05/05/26.
//

import CloveUI
import CloveUILib
import Core
import Lottie
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegVillageSelectionView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_select_sub_district_header_title.localizedString
	)
	
	@ObservedObject var viewModel: MerchantRegVillageSelectionViewModel
	
	init(viewModel: MerchantRegVillageSelectionViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			VStack(spacing: 0) {
				constructSearchBarOnly()
				
				constructErrorContainerView(
					forProcesses: [viewModel.villageProcessId],
					errorLayoutPosition: .emptyScreen,
					content: {
						if viewModel.model.village.isEmpty {
							constructSpinnerContainerView(
								forProcesses: [LoadingState(id: [viewModel.villageProcessId])],
								size: .large,
								theme: .light,
								content: {
									CloveErrorStateViewV2(
										messageId: StringRes.merchant_select_sub_district_empty_state.localizedString,
										type: .empty,
										errorPosition: .emptyScreen
									)
								}
							)
							.frame(maxHeight: .infinity)
						} else {
							constructVillageList()
								.frame(maxHeight: .infinity, alignment: .top)
						}
					}
				)
			}
		}
	}
	
	@ViewBuilder
	private func constructVillageList() -> some View {
		ScrollView {
			LazyVStack(alignment: .leading, spacing: 0) {
				ForEach(Array(viewModel.model.village.enumerated()), id: \.offset) { _, item in
					constructVillageRow(item: item)
						.onTap {
							viewModel.selectVillage(item)
						}
						.onAppear {
							viewModel.loadMoreIfNeeded(currentItem: item)
						}
				}
				
				if viewModel.hasMorePages {
					constructLoadMoreFooter()
				}
			}
			.padding(.horizontal, length: .large)
		}
		.disableBounce(in: Self.self)
	}
	
	@ViewBuilder
	private func constructVillageRow(item: MerchantRegLocationModel) -> some View {
		VStack(alignment: .leading, spacing: 0) {
			VStack(alignment: .leading, spacing: CloveUISpacing.xxSmall.spacing) {
				MultiFontLabel(
					item.villageName,
					baseFont: CloveUITypography.subtitle.medium.asUIFont()
				)
				.foregroundColor(CloveUIColor.primary10.swiftUIColor)
				.textCase(.uppercase)
				
				CloveText(
					text: constructSubtitle(for: item),
					style: CloveUITypography.body.small
				)
				.foregroundColor(CloveUIColor.dark20.swiftUIColor)
				.textCase(.uppercase)
			}
			.padding(.vertical, length: .medium)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			CloveSeparatorView(type: .section)
		}
		.contentShape(Rectangle())
	}
	
	private func constructSubtitle(for item: MerchantRegLocationModel) -> String {
		[
			item.subdistrictName,
			item.regencyName,
			item.provinceName,
			item.postalCode
		]
		.filter { !$0.isEmpty }
		.joined(separator: ", ")
	}
	
	@ViewBuilder
	private func constructLoadMoreFooter() -> some View {
		HStack {
			Spacer()
			LottieView(animation: .named("loadingSpinnerLight", bundle: Bundle(identifier: CloveUILib.bundleID) ?? Bundle()))
				.playing(loopMode: .loop)
				.frame(width: 24, height: 24)
			Spacer()
		}
		.padding(.vertical, length: .medium)
	}
	
	@ViewBuilder
	private func constructSearchBarOnly() -> some View {
		HStack(spacing: CloveUISpacing.xSmall.spacing) {
			Image("IconPinLocationOutline", bundle: Bundle(identifier: Merchant.bundleId))
				.resizable()
				.frame(width: 24, height: 24)
			
			ZStack(alignment: .leading) {
				if viewModel.model.searchText.isEmpty {
					CloveText(
						text: StringRes.merchant_select_sub_district_placeholder_searchbar.localizedString,
						style: CloveUITypography.body.small
					)
					.foregroundColor(CloveUITheme.Color.dark10.swiftUIColor)
				}
				
				TextField("", text: $viewModel.model.searchText)
					.font(CloveUITypography.body.medium.asSwiftUIFont())
					.foregroundColor(CloveUITheme.Color.dark20.swiftUIColor)
					.valueChanged(value: viewModel.model.searchText) { newValue in
						let filtered = newValue.replacingOccurrences(
							of: "[^a-zA-Z0-9 .,'-]",
							with: "",
							options: .regularExpression
						)
						
						if filtered != newValue {
							viewModel.model.searchText = filtered
						}
						
						if filtered.isEmpty {
							viewModel.clearSearchResults()
						}
					}
					.onSubmit {
						viewModel.performSearch()
					}
			}
			
			Button(action: {
				UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
				viewModel.performSearch()
			}) {
				CloveText(text: StringRes.general_search.localizedString, style: CloveUITypography.title.medium)
					.foregroundColor(
						viewModel.isSearchEnabled ? CloveUIColor.primary10.swiftUIColor : CloveUIColor.dark10
							.swiftUIColor)
			}
		}
		.padding(.horizontal, length: .small)
		.padding(.vertical, length: .xSmall)
		.background(CloveUIColor.light20.swiftUIColor)
		.cornerRadius(8, corners: .allCorners)
		.withBorderCustomColor(color: CloveUIColor.light30.swiftUIColor, radius: 8)
		.padding([.horizontal, .top], length: .large)
		.padding(.bottom, length: .medium)
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
}
