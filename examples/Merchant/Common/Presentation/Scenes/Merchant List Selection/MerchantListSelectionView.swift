//
//  MerchantListSelectionView.swift
//  Merchant
//
//  Created by ITBCA on 11/06/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI
import StandardLibrary
import SharedI18nRes

struct MerchantListSelectionView<VM: MerchantListSelectionBaseViewModel>: BaseView, BaseNavigationView {
	var viewModel: VM
	@FocusState var selectableFocus: String?
	@State var searchBarText = ""
	
	let navigationBarStyle: CloveUI.NavigationBarStyle
	
	init(viewModel: VM) {
		self.viewModel = viewModel
		self.navigationBarStyle = .lightBackChevronWithTitle(
			title: viewModel.model.screenTitle
		)
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			VStack(spacing: 0) {
				switch viewModel.model.isSearchBarEnabled {
					case .enabled(let placeHolderText, let searchBarType):
						CloveSearchBarView(
							placeHolderText: placeHolderText,
							type: searchBarType,
							text: $searchBarText
						)
						.padding([.horizontal, .top], length: .large)
						.padding(.bottom, length: .xxSmall)
						
					default:
						EmptyView()
				}
				
				if !searchBarText.isEmpty, viewModel.getFilteredData(searchText: searchBarText).isEmpty {
					CloveErrorStateViewV2(
						messageId: StringRes.general_search_not_found.localizedString,
						type: .noSearchResult,
						errorPosition: .listView
					)
					.frame(maxWidth: .infinity)
					.padding(.top, length: .xSmall)
				} else {
					ScrollView {
						LazyVStack(alignment: .leading, spacing: 0) {
							ForEach(
								viewModel.getFilteredData(searchText: searchBarText),
								id: \.id
							) { item in
								constructItemView(data: item)
							}
						}
					}
					.disableBounce(in: Self.self)
				}
			}
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	private func constructItemView(data: MerchantListSelectionItemModel) -> some View {
		VStack(alignment: .leading, spacing: 0) {
			VStack(alignment: .leading, spacing: 0) {
				CloveText(text: data.title, style: data.titleFont)
					.foregroundStyle(data.titleColor.swiftUIColor)
					.padding(.top, length: .large)
				
				if !data.desc.isEmpty {
					CloveText(text: data.desc, style: data.descFont)
						.foregroundStyle(data.descColor.swiftUIColor)
						.padding(.top, length: .xxSmall)
				}
			}
			
			CloveSeparatorView(type: .section)
				.padding(.top, length: .large)
		}
		.padding(.horizontal, length: .large)
		.onTap {
			viewModel.onSelect(selectedItem: data)
		}
	}
}
