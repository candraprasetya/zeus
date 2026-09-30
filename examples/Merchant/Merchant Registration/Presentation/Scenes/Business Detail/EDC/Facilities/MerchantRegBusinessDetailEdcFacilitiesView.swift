
//  MerchantRegBusinessDetailEdcFacilitiesView.swift
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

struct MerchantRegBusinessDetailEdcFacilitiesView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegBusinessDetailEdcFacilitiesViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegBusinessDetailEdcFacilitiesViewModel) {
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
						constructBannerSection()
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
	
	private func constructBannerSection() -> some View {
		Group {
			try? CloveBannerViewV2(
				type: .infobox(
					variant: .bodyOnly(
						body: .html(
							textId: StringRes.merchant_business_details_transaction_fee_info.localizedString
						)
					),
					action: .chevron(action: viewModel.openProductInfo)
				),
				status: .info,
				showBanner: .constant(true)
			)
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructCashierTableCountField()
			constructDesiredEdcCountField()
			constructEdcFacilityField()
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructCashierTableCountField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_number_of_cashier_desks.localizedString,
			textfieldValue: $viewModel.model.cashierTableCountInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 3,
			errorMessage: $viewModel.model.cashierTableCountErrorText,
			isFocus: $selectableFocus,
			keyboard: .numberPad,
			validateInput: viewModel.validateCashierTableCount
		)
	}
	
	private func constructDesiredEdcCountField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_number_of_edc_requested.localizedString,
			textfieldValue: $viewModel.model.desiredEdcCountInput,
			textfieldType:
			.amountWithoutCurrency(
				minDecimalPlace: 0,
				maxDecimalPlace: 0,
				isFirstBeZero: false,
				isAllowDecimal: false
			),
			regex: .numeric,
			maxLength: 2,
			errorMessage: $viewModel.model.desiredEdcCountErrorText,
			isFocus: $selectableFocus,
			keyboard: .numberPad,
			validateInput: viewModel.validateDesiredEdcCount
		)
	}
	
	private func constructEdcFacilityField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_edc_facilities.localizedString,
			textfieldValue: $viewModel.model.selectedEdcFacilityValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openFacilitySelection
			),
			errorMessage: $viewModel.model.selectedEdcFacilityErrorText,
			isFocus: $selectableFocus
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
