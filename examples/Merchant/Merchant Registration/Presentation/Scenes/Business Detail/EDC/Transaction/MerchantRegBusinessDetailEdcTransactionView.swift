
//  MerchantRegBusinessDetailEdcTransactionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegBusinessDetailEdcTransactionView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegBusinessDetailEdcTransactionViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegBusinessDetailEdcTransactionViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(spacing: CloveUISpacing.large.spacing) {
						constructHeaderView()
						
						constructTitle()
						
						constructFormSection()
						
						constructActionButton()
						
						Spacer()
					}
				}
				.disableBounce(in: Self.self)
				.keyboardAdaptive()
			}
			.onLoad {
				viewModel.prepareLocalData()
			}
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
	
	// MARK: - Container View
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		let loadProcessIds = [
			viewModel.loadMerchantDataProcessId,
			viewModel.prepareProductProcessId
		]
		let actionProcessIds = [viewModel.saveMerchantDataProcessId]
		let allProcessIds = loadProcessIds + actionProcessIds
		
		return constructErrorContainerView(forProcesses: allProcessIds) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: actionProcessIds)],
				content: {
					constructErrorContainerView(
						forProcesses: allProcessIds,
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
	
	// MARK: - Section Views
	private func constructHeaderView() -> some View {
		MerchantRegCircleProgressTitleSubtitleLayout(
			title: StringRes.merchant_business_details_progress_title.localizedString,
			subtitle: StringRes.merchant_business_details_next_step_edc.localizedString,
			progress: 70
		)
	}
	
	private func constructTitle() -> some View {
		CloveText(
			text: StringRes.merchant_business_details_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
		.padding(.horizontal, length: .large)
	}
	
	private func constructFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructAverageMonthlyRevenueField()
			constructAverageAmountPerTransactionField()
			constructLowestItemPriceField()
			constructHighestItemPriceField()
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructAverageMonthlyRevenueField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_average_monthly_revenue.localizedString,
			textfieldValue: $viewModel.model.averageMonthlyRevenueInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 15,
			errorMessage: $viewModel.model.averageMonthlyRevenueErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateAverageMonthlyRevenueInput
		)
	}
	
	private func constructAverageAmountPerTransactionField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_average_nominal_per_transaction.localizedString,
			textfieldValue: $viewModel.model.averageAmountPerTransactionInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 12,
			errorMessage: $viewModel.model.averageAmountPerTransactionErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateAverageAmountPerTransactionInput
		)
	}
	
	private func constructLowestItemPriceField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_lowest_item_price.localizedString,
			textfieldValue: $viewModel.model.lowestItemPriceInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 10,
			errorMessage: $viewModel.model.lowestItemPriceErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateLowestItemPriceInput
		)
	}
	
	private func constructHighestItemPriceField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_highest_item_price.localizedString,
			textfieldValue: $viewModel.model.highestItemPriceInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 10,
			errorMessage: $viewModel.model.highestItemPriceErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateHighestItemPriceInput
		)
	}
	
	private func constructActionButton() -> some View {
		CloveButtonViewV2(
			type: .textOnly(textId: StringRes.general_button_continue.localizedString),
			enabled: viewModel.isButtonEnabled(),
			layout: .stretch,
			onClick: viewModel.saveMerchantData
		)
		.padding([.horizontal, .bottom], length: .large)
	}
}
