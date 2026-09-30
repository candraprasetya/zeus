
//  MerchantRegBusinessDetailEdcView.swift
//  Merchant
//
//  Created by Candra Prasetya on 09/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegBusinessDetailEdcView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegBusinessDetailEdcViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegBusinessDetailEdcViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(spacing: CloveUISpacing.large.spacing) {
						constructHeaderView()
						constructTitle()
						constructAddressFormSection()
						constructActionButton()
						Spacer()
					}
				}
				.disableBounce(in: Self.self)
				.keyboardAdaptive()
			}
			.overlay(Color.clear.valueChanged(value: viewModel.model.bottomSheetIsPresented) { newValue in
				if newValue {
					BottomSheetController.shared.present(AnyView(constructDatePicker()))
				} else {
					BottomSheetController.shared.dismiss()
				}
			})
			.onLoad {
				viewModel.prepareProduct()
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
		
		return constructErrorContainerView(
			forProcesses: allProcessIds,
			errorLayoutPosition: .emptyScreen
		) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: actionProcessIds)],
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
	
	private func constructAddressFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructBusinessTypeField()
			constructBusinessNameField()
			constructBusinessOwnershipStatusField()
			constructBusinessEstablishmentDateField()
			constructBusinessLocationField()
			constructEdcFromAnotherBankRadioGroup()
			if let optionIndex = viewModel.model.selectedEdcFromAnotherBankOption, optionIndex == 0 {
				constructEdcIssuingInstitutionField()
			}
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructBusinessTypeField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_business_type.localizedString,
			textfieldValue: $viewModel.model.selectedBusinessTypeValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openBusinessTypeSelection
			),
			errorMessage: $viewModel.model.selectedBusinessTypeErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructBusinessNameField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_business_name.localizedString,
			textfieldValue: $viewModel.model.businessNameInput,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: 23,
			errorMessage: $viewModel.model.businessNameErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateBusinessName
		)
	}
	
	private func constructBusinessOwnershipStatusField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_business_ownership_status.localizedString,
			textfieldValue: $viewModel.model.selectedBusinessOwnershipStatusValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openBusinessOwnershipStatusSelection
			),
			errorMessage: $viewModel.model.selectedBusinessOwnershipStatusErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructBusinessEstablishmentDateField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_business_establishment_date.localizedString,
			textfieldValue: $viewModel.model.businessEstablishmentDateValue,
			textfieldType: .selectable(
				icon: .image(
					Image("CalendarOutline", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .dark20
				),
				onTapped: viewModel.openDatePicker
			),
			errorMessage: $viewModel.model.businessEstablishmentDateErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructBusinessLocationField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_business_location.localizedString,
			textfieldValue: $viewModel.model.selectedBusinessLocationValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openBusinessLocationSelection
			),
			errorMessage: $viewModel.model.selectedBusinessLocationErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructEdcFromAnotherBankRadioGroup() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_business_details_edc_question.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			HStack(spacing: 0) {
				constructRadioOption(index: 0, label: StringRes.general_button_yes.localizedString, selection: $viewModel.model.selectedEdcFromAnotherBankOption)
				constructRadioOption(index: 1, label: StringRes.general_button_no.localizedString, selection: $viewModel.model.selectedEdcFromAnotherBankOption)
			}
		}
	}
	
	private func constructEdcIssuingInstitutionField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_edc_issuing_institution.localizedString,
			textfieldValue: $viewModel.model.edcIssuingInstitutionInput,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: 40,
			errorMessage: $viewModel.model.edcIssuingInstitutionErrorText,
			helperText: StringRes.merchant_business_details_name_of_bank_or_other_edc_label.localizedString,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateIssuingInstitution
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
	
	private func constructDatePicker() -> some View {
		ZStack(alignment: .bottom) {
			Color.black.opacity(0.25)
				.edgesIgnoringSafeArea(.all)
				.onTapGesture {
					withAnimation(.easeInOut) {
						viewModel.model.bottomSheetIsPresented = false
					}
				}
			
			VStack(spacing: 0) {
				Divider()
				HStack(spacing: 0) {
					Spacer()
					Button(action: {
						withAnimation(.easeInOut) {
							viewModel.selectDate()
						}
					}
					) {
						Text(StringRes.general_button_done.localizedString)
							.foregroundColor(Color(.systemBlue))
							.font(.system(size: 17, weight: .semibold))
					}
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
}
