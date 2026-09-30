//
//  MerchantRegBusinessDetailQrisView.swift
//  Merchant
//
//  Created by ITBCA on 10/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegBusinessDetailQrisView: BaseMutableStateView, BaseRightNavigationItemView {
	@ObservedObject var viewModel: MerchantRegBusinessDetailQrisViewModel
	@FocusState var selectableFocus: String?
	
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	init(viewModel: MerchantRegBusinessDetailQrisViewModel) {
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
			.overlay(Color.clear.valueChanged(value: viewModel.model.bottomSheetIsPresented) { newValue in
				if newValue {
					BottomSheetController.shared.present(contructBirthdatePicker())
				} else {
					BottomSheetController.shared.dismiss()
				}
			})
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
	
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		return constructLoaderContainerView(
			forProcesses: [LoadingState(id: [
				viewModel.validateMerchantProcessId,
				viewModel.saveMerchantDataProcessId
			])],
			content: {
				constructSpinnerContainerView(
					forProcesses: [LoadingState(id: [
						viewModel.prepareProductProcessId,
						viewModel.loadMerchantDataProcessId
					])],
					size: .large,
					theme: .light,
					content: {
						constructErrorContainerView(
							forProcesses: viewModel.allProcessId,
							errorLayoutPosition: .emptyScreen,
							content: content
						)
					}
				)
			}
		)
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
				.padding(.top, length: .large)
		}
	}
	
	private func constructTitleFormView() -> some View {
		CloveText(
			text: StringRes.merchant_business_details_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
	}
	
	private func constructBodyFormView() -> some View {
		VStack(spacing: 0) {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_business_type.localizedString,
				textfieldValue: Binding<String>.constant(viewModel.model.selectedBusinessType.content.getText()),
				textfieldType: .selectable(
					icon: .image(
						Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
						iconColor: .primary10
					),
					onTapped: viewModel.toBusinessTypeListSelectionScreen
				),
				errorMessage: $viewModel.model.selectBusinessTypeErrorMessage,
				isFocus: $selectableFocus
			)
			
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_average_monthly_revenue.localizedString,
				textfieldValue: $viewModel.model.averageMonthlyRevenue,
				textfieldType: .amountWithoutCurrency(
					minDecimalPlace: 0,
					maxDecimalPlace: 0,
					isFirstBeZero: false,
					isAllowDecimal: false
				),
				maxLength: 15,
				errorMessage: $viewModel.model.averageMonthlyRevenueErrorMessage,
				isFocus: $selectableFocus,
				validateInput: {
					if viewModel.model.averageMonthlyRevenue.isEmpty {
						let emptyErrorMessage = String(
							format: StringRes.general_error_empty.localizedString,
							StringRes.merchant_business_details_average_monthly_revenue.localizedString
						)
						viewModel.model.averageMonthlyRevenueErrorMessage = emptyErrorMessage
					} else {
						viewModel.model.averageMonthlyRevenueErrorMessage = ""
					}
				}
			)
			.padding(.top, length: .large)
			
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_business_establishment_date.localizedString,
				textfieldValue: $viewModel.model.registeredDate,
				textfieldType: .selectable(
					icon: .image(
						Image("CalendarOutline", bundle: Bundle(identifier: CloveUI.bundleID)),
						iconColor: .dark20
					),
					onTapped: viewModel.openDatePicker
				),
				errorMessage: $viewModel.model.registeredDateErrorText,
				isFocus: $selectableFocus
			)
			.padding(.top, length: .large)
			
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_business_details_business_location.localizedString,
				textfieldValue: Binding<String>.constant(viewModel.model.selectedBusinessLocation.getText()),
				textfieldType: .selectable(
					icon: .image(
						Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
						iconColor: .primary10
					),
					onTapped: viewModel.toBusinessLocationSelectionScreen
				),
				errorMessage: $viewModel.model.selectBusinessLocationErrorMessage,
				isFocus: $selectableFocus
			)
			.padding(.top, length: .large)
			
			constructValidateQrisStickerOwnershipField()
				.padding(.top, length: .large)
			
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.general_button_yes.localizedString),
				enabled: viewModel.isButtonEnabled(),
				layout: .stretch,
				onClick: viewModel.nextButtonAction
			)
			.padding(.top, length: .large)
		}
	}
	
	private func contructBirthdatePicker() -> some View {
		ZStack(alignment: .bottom) {
			Color.black.opacity(0.25)
				.edgesIgnoringSafeArea(.all)
				.animation(.none, value: viewModel.model.bottomSheetIsPresented)
				.onTapGesture {
					withAnimation(.easeInOut) {
						viewModel.model.bottomSheetIsPresented = false
					}
				}
			
			VStack(spacing: 0) {
				Divider()
				HStack(spacing: 0) {
					Spacer()
					Button(
						action: {
							withAnimation(.easeInOut) {
								viewModel.selectDate()
							}
						},
						label:{
							Text(StringRes.general_button_done.localizedString)
								.foregroundColor(Color(.systemBlue))
								.font(.system(size: 17, weight: .semibold))
						}
					)
				}
				.padding(.horizontal, length: .medium)
				.padding(.vertical, length: .small)
				.background(Color(.secondarySystemBackground))
				
				Divider()
				
				DatePicker(
					"",
					selection: $viewModel.model.selectedDate,
					in: ...Date(),
					displayedComponents: .date
				)
				.datePickerStyle(WheelDatePickerStyle())
				.environment(\.locale, Locale(identifier: Localize.currentLanguage()))
				.labelsHidden()
				.frame(maxWidth: .infinity)
				.padding(.vertical, length: .xSmall)
			}
			.frame(maxWidth: .infinity)
			.background(Color(.systemBackground))
			.transition(.move(edge: .bottom))
			.animation(.easeInOut, value: viewModel.model.bottomSheetIsPresented)
		}
		.frame(maxWidth: .infinity, maxHeight: .infinity)
	}
	
	private func constructValidateQrisStickerOwnershipField() -> some View {
		VStack(alignment: .leading, spacing: 0) {
			CloveText(
				text: StringRes.merchant_business_details_qris_question.localizedString,
				style: CloveUITypography.title.small
			)
			.multilineTextAlignment(.leading)
			.foregroundStyle(CloveUIColor.primary10.swiftUIColor)
			
			HStack(spacing: 0) {
				constructRadioOption(
					index: 0,
					label: StringRes.general_button_yes.localizedString,
					selection: $viewModel.model.selectedQrisStickerOwnership
				)
				
				constructRadioOption(
					index: 1,
					label: StringRes.general_button_no.localizedString,
					selection: $viewModel.model.selectedQrisStickerOwnership
				)
			}
			.padding(.top, length: .xSmall)
		}
	}
	
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
}
