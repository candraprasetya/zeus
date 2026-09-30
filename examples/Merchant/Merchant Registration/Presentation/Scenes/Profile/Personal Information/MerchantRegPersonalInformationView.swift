
//  MerchantRegPersonalInformationView.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegPersonalInformationView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.noButtonLeftTitleWithRightIcon(
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegPersonalInformationViewModel
	@FocusState var selectableFocus: String?
	
	// MARK: - Container View
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		let loadProcessIds = [viewModel.loadMerchantDataProcessId]
		let actionProcessIds = [viewModel.saveMerchantDataProcessId]
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
	
	// MARK: - Initialization
	init(viewModel: MerchantRegPersonalInformationViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(spacing: 0) {
						constructHeaderView()
						constructReferralSection()
						constructNpwpSection()
						constructNpwpReasonSection()
						constructActionButton()
						Spacer()
					}
				}
				.disableBounce(in: Self.self)
			}
			.onLoad {
				viewModel.prepareLocalData()
			}
		}
	}
	
	// MARK: - Section Views
	private func constructHeaderView() -> some View {
		MerchantRegCircleProgressTitleSubtitleLayout(
			title: StringRes.merchant_referral_and_personal_data_progress_title.localizedString,
			subtitle: StringRes.merchant_referral_and_personal_data_next_step.localizedString,
			progress: 10
		)
	}
	
	private func constructReferralSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructReferralCodeField()
			constructSourceOfFundField()
			constructAccountOwnerNameField()
		}
		.padding(length: .large)
	}
	
	private func constructReferralCodeField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_referral_and_personal_data_promo_code.localizedString,
			textfieldValue: $viewModel.model.referalCodeValue,
			textfieldType: .withoutIcon,
			regex: .alphaNumeric,
			allowsLeadingSpace: false,
			maxLength: 15,
			errorMessage: $viewModel.model.referalCodeValueErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructSourceOfFundField() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			SourceOfFundSelectorView(viewModel: viewModel.sofSelectorViewModel)
			CloveText(
				text: StringRes.merchant_referral_and_personal_data_account_subtext.localizedString,
				style: CloveUITypography.body.small
			)
			.foregroundColor(CloveUIColor.dark10.swiftUIColor)
		}
	}
	
	private func constructAccountOwnerNameField() -> some View {
		Group {
			if let name = viewModel.model.selectedAccount?.name {
				VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
					CloveText(
						text: StringRes.merchant_referral_and_personal_data_account_holder_name.localizedString,
						style: CloveUITypography.title.small
					)
					.foregroundColor(CloveUIColor.primary10.swiftUIColor)
					
					CloveText(
						text: name,
						style: CloveUITypography.body.large
					)
					.foregroundColor(CloveUIColor.dark20.swiftUIColor)
				}
				.padding(.bottom, length: .xSmall)
			}
		}
	}
	
	@ViewBuilder
	private func constructNpwpSection() -> some View {
		if viewModel.model.showNpwpSection {
			CloveSeparatorView(type: .section)
			VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
				constructNpwpTitle()
				constructNpwpRadioGroup()
			}
			.padding(length: .large)
		}
	}
	
	private func constructNpwpTitle() -> some View {
		CloveText(
			text: StringRes.merchant_referral_and_personal_data_npwp_label.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
	}
	
	private func constructNpwpRadioGroup() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_referral_and_personal_data_npwp_question.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			HStack(spacing: 0) {
				constructRadioOption(index: 0, label: StringRes.general_button_yes.localizedString, selection: $viewModel.model.selectedNpwpOption)
				constructRadioOption(index: 1, label: StringRes.general_button_no.localizedString, selection: $viewModel.model.selectedNpwpOption)
			}
		}
	}
	
	@ViewBuilder
	private func constructNpwpReasonSection() -> some View {
		if let selected = viewModel.model.selectedNpwpOption, selected == 1 {
			VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
				constructNpwpReasonTitle()
				constructNpwpReasonOptions()
			}
			.frame(maxWidth: .infinity, alignment: .leading)
			.padding([.bottom, .horizontal], length: .large)
		}
	}
	
	private func constructNpwpReasonTitle() -> some View {
		CloveText(
			text: StringRes.merchant_referral_and_personal_data_no_npwp_reason.localizedString,
			style: CloveUITypography.title.small
		)
		.foregroundColor(CloveUIColor.primary10.swiftUIColor)
	}
	
	private func constructNpwpReasonOptions() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.small.spacing) {
			constructReasonOption(
				index: 0,
				selection: $viewModel.model.selectedNpwpReasonOption,
				html: StringRes.merchant_referral_and_personal_data_reason_1.localizedString
			)
			constructReasonOption(
				index: 1,
				selection: $viewModel.model.selectedNpwpReasonOption,
				html: StringRes.merchant_referral_and_personal_data_reason_2.localizedString
			)
		}
	}
	
	private func constructActionButton() -> some View {
		CloveButtonViewV2(
			type: .textOnly(textId: StringRes.general_button_continue.localizedString),
			enabled: viewModel.isButtonEnabled(),
			layout: .stretch,
			onClick: viewModel.saveMerchantData
		)
		.padding([.bottom, .horizontal], length: .large)
	}
	
	// MARK: - Reusable Components
	private func constructRadioOption(index: Int, label: String, selection: Binding<Int?>) -> some View {
		HStack(spacing: CloveUISpacing.xSmall.spacing) {
			CloveRadioButtonViewV2(
				index: index,
				selectedIndex: selection,
				enabled: true
			)
			CloveText(
				text: label,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.frame(maxWidth: .infinity, alignment: .leading)
	}
	
	private func constructReasonOption(index: Int, selection: Binding<Int?>, html: String) -> some View {
		HStack(alignment: .top, spacing: CloveUISpacing.xSmall.spacing) {
			CloveRadioButtonViewV2(
				index: index,
				selectedIndex: selection,
				enabled: true
			)
			Text(html: html, baseFont: CloveUITypography.body.medium.asUIFont())
				.foregroundColor(CloveUIColor.dark20.swiftUIColor)
				.frame(maxWidth: .infinity, alignment: .leading)
		}
	}
	
	func leftButtonTap() { /*Disable Back Action*/ }
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
}
