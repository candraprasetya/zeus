
//  MerchantRegPersonalContactView.swift
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

struct MerchantRegPersonalContactView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegPersonalContactViewModel
	@FocusState var selectableFocus: String?
	
	// MARK: - Initialization
	init(viewModel: MerchantRegPersonalContactViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(alignment: .leading, spacing: 0) {
						constructHeaderView()
						constructPhoneSection()
						constructEmailSection()
						constructLegalDocumentsSection()
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
			title: StringRes.merchant_personal_contact_progress_title.localizedString,
			subtitle: StringRes.merchant_personal_contact_next_step.localizedString,
			progress: 20
		)
	}
	
	private func constructPhoneSection() -> some View {
		VStack(spacing: 0) {
			VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
				constructPhoneTitle()
				if viewModel.model.phoneNumberList.count == 1 {
					constructPhoneField()
				} else {
					constructPhoneTextField()
				}
				constructAdditionalPhoneRadioGroup()
			}
			constructAdditionalPhoneTextField()
		}
		.padding(length: .large)
	}
	
	private func constructPhoneTitle() -> some View {
		CloveText(
			text: StringRes.merchant_personal_contact_phone_no_data.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
	}
	
	private func constructPhoneField() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_personal_contact_business_owner_phone_no.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			if let phoneNumberSelected = viewModel.model.selectedPhoneNumber {
				CloveText(
					text: phoneNumberSelected.maskedPhoneNumber ?? "",
					style: CloveUITypography.body.large
				)
				.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			}
		}
	}
	
	private func constructPhoneTextField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_personal_contact_business_owner_phone_no.localizedString,
			textfieldValue: $viewModel.model.phoneNumberValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.toPhoneNumberSelection
			),
			maxLength: 13,
			errorMessage: $viewModel.model.phoneNumberErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructAdditionalPhoneRadioGroup() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_personal_contact_phone_no_question.localizedString,
				style: CloveUITypography.subtitle.small
			)
			.multilineTextAlignment(.leading)
			.fixedSize(horizontal: false, vertical: true)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			
			HStack(spacing: 0) {
				constructRadioOption(index: 0, label: StringRes.general_button_yes.localizedString, selection: $viewModel.model.selectedAdditionalPhoneNumberOption)
				constructRadioOption(index: 1, label: StringRes.general_button_no.localizedString, selection: $viewModel.model.selectedAdditionalPhoneNumberOption)
			}
		}
	}
	
	@ViewBuilder
	private func constructAdditionalPhoneTextField() -> some View {
		if viewModel.model.selectedAdditionalPhoneNumberOption == 1 {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_personal_contact_business_phone_no.localizedString,
				textfieldValue: $viewModel.model.additionalPhoneNumberValue,
				textfieldType: .withoutIcon,
				regex: .numeric,
				allowsLeadingSpace: false,
				maxLength: 13,
				errorMessage: $viewModel.model.additionalPhoneNumberErrorText,
				isFocus: $selectableFocus,
				keyboard: .phonePad,
				validateInput: viewModel.validateAdditionalPhoneNumber
			)
			.padding(.top, length: .large)
		}
	}
	
	private func constructEmailSection() -> some View {
		VStack(spacing: 0) {
			CloveSeparatorView(type: .section)
			VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
				constructEmailTitle()
				constructEmailField()
			}
			.frame(maxWidth: .infinity, alignment: .leading)
			constructEmailBanner()
		}
	}
	
	private func constructEmailTitle() -> some View {
		CloveText(
			text: StringRes.merchant_personal_contact_email_address_details.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.padding([.horizontal, .top], length: .large)
	}
	
	private func constructEmailField() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_personal_contact_email_address.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: viewModel.model.maskedEmail,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructEmailBanner() -> some View {
		Group {
			try? CloveBannerViewV2(
				type: .infobox(
					variant: .bodyOnly(
						body: .html(
							textId: StringRes.merchant_personal_contact_email_alert_info.localizedString
						)
					),
					action: .none
				),
				status: .info,
				showBanner: .constant(true)
			)
		}
		.padding(length: .large)
	}
	
	private func constructLegalDocumentsSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			ForEach(Array(viewModel.model.legalDocuments.enumerated()), id: \.offset) { index, item in
				constructLegalDocumentItem(index: index, item: item)
			}
		}
		.padding([.bottom, .horizontal], length: .large)
	}
	
	private func constructLegalDocumentItem(index: Int, item: MerchantRegPersonalContactAgreementItems) -> some View {
		HStack(alignment: .top, spacing: CloveUISpacing.small.spacing) {
			CloveCheckBoxViewV2(
				state: item.checkBoxesState,
				onStateChange: { state in
					viewModel.updateCheckBoxState(at: index, to: state)
				}
			)
			
			Text(
				html: item.legalDocument.documentFile,
				baseFont: CloveUITypography.body.small.asUIFont()
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
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
	
	// MARK: - Navigation
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
			viewModel.inquiryLegalDocsProcessId
		]
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
}
