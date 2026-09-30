//
//  MerchantRegQRISDetailFormView.swift
//  Merchant
//
//  Created by ITBCA on 24/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegQRISDetailFormView: BaseMutableStateView, BaseRightNavigationItemView {
	@ObservedObject var viewModel: MerchantRegQRISDetailFormViewModel
	@FocusState var selectableFocus: String?
	
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	init(viewModel: MerchantRegQRISDetailFormViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(spacing: 0) {
						constructHeaderView()
						
						constructFormView()
							.padding(.all, length: .large)
					}
				}
				.disableBounce(in: Self.self)
				.keyboardAdaptive()
			}
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
	
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		return constructErrorContainerView(forProcesses: viewModel.allProcessId) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: viewModel.allProcessId)],
				content: {
					constructErrorContainerView(
						forProcesses: viewModel.allProcessId,
						errorLayoutPosition: .emptyScreen,
						content: content
					)
				}
			)
		}
	}
	
	private func constructHeaderView() -> some View {
		MerchantRegCircleProgressTitleSubtitleLayout(
			title: StringRes.merchant_business_details_progress_title.localizedString,
			subtitle: StringRes.merchant_business_details_next_step_qris.localizedString,
			progress: 70
		)
	}
	
	private func constructFormView() -> some View {
		VStack(spacing: 0) {
			constructTitleFormView()
			
			constructBodyFormView()
		}
	}
	
	private func constructTitleFormView() -> some View {
		CloveText(
			text: StringRes.merchant_business_qris_details_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
	}
	
	private func constructBodyFormView() -> some View {
		VStack(spacing: 0) {
			constructTextFieldContainerView()
				.padding(.top, length: .large)
			
			if !viewModel.model.isHavingQris {
				constructInfoBanner()
					.padding(.top, length: .large)
			}
			
			if viewModel.model.isUmi {
				constructUmiContentView()
					.padding(.top, length: .large)
			}
			
			constructButtonContainerView()
				.padding(.vertical, length: .large)
		}
	}
	
	private func constructTextFieldContainerView() -> some View {
		VStack(spacing: 0) {
			if viewModel.model.isHavingQris {
				let isEditable = !viewModel.model.isScannedQris
				constructNmidTextfield(isEditable: isEditable)
				
				constructMerchantNameTextfield(isEditable: isEditable)
					.padding(.top, length: .large)
			} else {
				constructMerchantNameTextfield(isEditable: true)
			}
			
			constructMerchantNameOnQrisSticker()
				.padding(.top, length: .large)
		}
	}
	
	@ViewBuilder
	private func constructNmidTextfield(isEditable: Bool) -> some View {
		if isEditable {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_qris_details_national_mid.localizedString,
				textfieldValue: $viewModel.model.nmid,
				textfieldType: .withoutIcon,
				regex: .alphaNumeric,
				allowsLeadingSpace: false,
				maxLength: 15,
				errorMessage: $viewModel.model.nmidErrorMessage,
				helperText: StringRes.merchant_business_qris_details_nmid_instruction.localizedString,
				isFocus: $selectableFocus,
				validateInput: viewModel.validateNmidTextfield
			)
		} else {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_qris_details_national_mid.localizedString,
				textfieldValue: $viewModel.model.nmid,
				textfieldType: .showDataOnly,
				errorMessage: Binding<String>.constant(""),
				isFocus: $selectableFocus
			)
		}
	}
	
	@ViewBuilder
	private func constructMerchantNameTextfield(isEditable: Bool) -> some View {
		if isEditable {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_business_name.localizedString,
				textfieldValue: $viewModel.model.merchantName,
				textfieldType: .withIcon(
					icon: .image(
						Image("Info", bundle: Bundle(identifier: CloveUI.bundleID)),
						iconColor: .primary10
					)
				),
				regex: .alphaNumericSpacePeriodCommaSingleQuote,
				allowsLeadingSpace: false,
				maxLength: viewModel.merchantNameMaxLength(),
				errorMessage: $viewModel.model.merchantNameErrorMessage,
				helperText: viewModel.merchantNameHelperText(),
				isFocus: $selectableFocus,
				validateInput: viewModel.validateMerchantNameTextfield
			)
			.overlay(alignment: .topTrailing) {
				EmptyView()
					.frame(width: 24, height: 24)
					.padding(.top, 26)
					.onTap {
						viewModel.merchantNameTooltipAction()
					}
			}
		} else {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_business_name.localizedString,
				textfieldValue: $viewModel.model.merchantName,
				textfieldType: .showDataOnly,
				errorMessage: Binding<String>.constant(""),
				isFocus: $selectableFocus
			)
		}
	}
	
	@ViewBuilder
	private func constructMerchantNameOnQrisSticker() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_qris_details_business_name_on_sticker.localizedString,
			textfieldValue: $viewModel.model.qrisStickerName,
			textfieldType: .withIcon(
				icon: .image(
					Image("Info", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				)
			),
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: viewModel.merchantNameOnStickerMaxLength(),
			errorMessage: $viewModel.model.qrisStickerNameErrorMessage,
			helperText: viewModel.merchantNameOnStickerHelperText(),
			isFocus: $selectableFocus,
			validateInput: viewModel.validateMerchantNameOnStickerTextfield
		)
		.overlay(alignment: .topTrailing) {
			EmptyView()
				.frame(width: 24, height: 24)
				.padding(.top, 26)
				.onTap {
					viewModel.merchantNameQrisStickerTooltipAction()
				}
		}
	}
	
	private func constructInfoBanner() -> some View {
		Group {
			try? CloveBannerViewV2(
				type: .infobox(
					variant: .bodyOnly(
						body: CloveBannerString.standard(
							textId: viewModel.constructBannerText()
						)
					),
					action: nil
				),
				status: .info,
				showBanner: Binding<Bool>.constant(true)
			)
		}
	}
	
	private func constructUmiContentView() -> some View {
		VStack(spacing: 0) {
			HStack(alignment: .center, spacing: 0) {
				CloveText(
					text: StringRes.merchant_business_qris_details_multi_settlement.localizedString,
					style: CloveUITypography.subtitle.medium
				)
				.foregroundColor(CloveUIColor.primary10.swiftUIColor)
				.frame(maxWidth: .infinity, alignment: .leading)
				
				Spacer()
				
				CloveSwitchesView(isOn: $viewModel.model.isMultiSettlement)
			}
			
			Group {
				let multiSetlementText = StringRes.merchant_business_qris_details_multi_settlement_alert.localizedString
					.replacingOccurrences(of: "%1$@", with: "")
				
				try? CloveBannerViewV2(
					type: .infobox(
						variant: .bodyOnly(body: .standard(textId: multiSetlementText)),
						action: .link(
							labelId: StringRes.merchant_business_qris_details_multi_settlement_alert_link.key,
							action: viewModel.redirectToMultiSettlementInfoScreen
						)
					),
					status: .info,
					showBanner: Binding<Bool>.constant(true)
				)
			}
			.padding(.top, length: .large)
		}
	}
	
	private func constructButtonContainerView() -> some View {
		VStack(spacing: 0) {
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.general_button_continue.localizedString),
				enabled: viewModel.isNextButtonEnabled(),
				layout: .stretch,
				size: .large,
				style: .primary,
				onClick: viewModel.nextButtonAction
			)
			
			if viewModel.isShowScanAgainButton() {
				CloveButtonViewV2(
					type: .textOnly(textId: StringRes.merchant_business_qris_details_scan_again.localizedString),
					layout: .stretch,
					size: .large,
					style: .secondary,
					onClick: viewModel.toScanQrisScreen
				)
				.padding(.top, length: .large)
			}
		}
	}
}
