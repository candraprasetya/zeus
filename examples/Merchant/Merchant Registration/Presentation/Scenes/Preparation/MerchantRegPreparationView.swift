
//  MerchantRegPreparationView.swift
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

struct MerchantRegPreparationView: BaseMutableStateView, BaseNavigationView {
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_common_header_title.localizedString
	)
	
	@ObservedObject var viewModel: MerchantRegPreparationViewModel
	
	// MARK: - Initialization
	init(viewModel: MerchantRegPreparationViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				VStack(spacing: 0) {
					ScrollView {
						constructHeaderView()
						constructPreparationItemsList()
					}
					.disableBounce(in: Self.self)
					Spacer()
					constructActionButton()
				}
			}
		}
	}
	
	// MARK: - Section Views
	private func constructHeaderView() -> some View {
		CloveText(
			text: StringRes.merchant_prepare_document_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary10.swiftUIColor)
		.multilineTextAlignment(.center)
		.padding(length: .large)
		.padding(.horizontal, length: .large)
	}
	
	private func constructPreparationItemsList() -> some View {
		VStack(alignment: .leading, spacing: 0) {
			ForEach(Array(viewModel.model.data.enumerated()), id: \.offset) { index, item in
				constructPreparationItem(index: index, text: item.text, details: item.details)
			}
		}
		.padding(length: .large)
	}
	
	private func constructActionButton() -> some View {
		CloveButtonViewV2(
			type: .textOnly(textId: StringRes.general_button_start.localizedString),
			layout: .stretch,
			onClick: viewModel.startMerchantOpenAccount
		)
		.padding(length: .large)
	}
	
	// MARK: - Navigation
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	// MARK: - Container View
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		let loadProcessIds = [viewModel.loadMerchantDataProcessId]
		let actionProcessIds = [
			viewModel.saveMerchantDataProcessId,
			viewModel.prepareProcessId,
			viewModel.inquiryStatusProcessId
		]
		let allProcessIds = loadProcessIds + actionProcessIds
		
		return constructErrorContainerView(forProcesses: allProcessIds) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: actionProcessIds)],
				content: {
					constructErrorContainerView(
						forProcesses: loadProcessIds,
						errorLayoutPosition: .emptyScreen,
						content: {
							constructSpinnerContainerView(
								forProcesses: [LoadingState(id: loadProcessIds)],
								size: .large,
								theme: .light,
								content: content
							)
						}
					)
				}
			)
		}
	}
	
	// MARK: - Helper Views
	private func constructPreparationItem(index: Int, text: String, details: [String]) -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.medium.spacing) {
			HStack(alignment: .top, spacing: CloveUISpacing.medium.spacing) {
				Text("\(index + 1)")
					.font(CloveUITypography.title.medium.asSwiftUIFont())
					.foregroundColor(CloveUIColor.light10.swiftUIColor)
					.padding(4)
					.frame(minWidth: 24, minHeight: 24)
					.background(
						Circle()
							.fill(CloveUIColor.secondary20.swiftUIColor)
					)
				
				VStack(alignment: .leading, spacing: CloveUISpacing.xxSmall.spacing) {
					CloveText(
						text: text,
						style: CloveUITypography.title.medium
					)
					.foregroundColor(CloveUIColor.primary30.swiftUIColor)
					
					VStack(alignment: .leading, spacing: 0) {
						ForEach(details, id: \.self) { detail in
							Text(html: detail, baseFont: CloveUITypography.body.small.asUIFont())
								.foregroundColor(CloveUIColor.dark20.swiftUIColor)
						}
					}
				}
			}
			
			if index != viewModel.model.data.count - 1 {
				CloveSeparatorView(type: .section)
					.padding(.bottom, length: .medium)
			}
		}
	}
}
