
//  MerchantRegEddView.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegEddView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegEddViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegEddViewModel) {
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
			.overlay(Color.clear.valueChanged(value: viewModel.model.bottomSheetIsPresented) { newValue in
				if newValue {
					BottomSheetController.shared.present(contructBirthdatePicker())
				} else {
					BottomSheetController.shared.dismiss()
				}
			})
			.onLoad {
				viewModel.prepareEdd()
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
			viewModel.prepareEddProcessId
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
			title: StringRes.merchant_business_details_edd_progress_title.localizedString,
			subtitle: StringRes.merchant_business_details_edd_progress_next_step.localizedString,
			progress: 90
		)
	}
	
	private func constructTitle() -> some View {
		CloveText(
			text: StringRes.merchant_business_details_edd_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
		.padding(.horizontal, length: .large)
	}
	
	private func constructFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructSourceOfWealthField()
			constructLivingAtCurrentAddressField()
			constructAnotherBankSection()
			constructCountryRelationSection()
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructSourceOfWealthField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_edd_source_of_wealth.localizedString,
			textfieldValue: $viewModel.model.selectedSourceOfWealthsValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openSourceOfWealthSelection
			),
			errorMessage: $viewModel.model.selectedSourceOfWealthsErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateSourceOfWealth
		)
	}
	
	private func constructLivingAtCurrentAddressField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_edd_living_at_current_address_since.localizedString,
			textfieldValue: $viewModel.model.livingAtCurrentAddressSinceDateValue,
			textfieldType: .selectable(
				icon: .image(
					Image("CalendarOutline", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .dark20
				),
				onTapped: viewModel.openDatePicker
			),
			errorMessage: $viewModel.model.livingAtCurrentAddressSinceDateErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateLivingAtCurrentAddress
		)
	}
	
	private func constructAnotherBankSection() -> some View {
		MerchantRegTabSelectionView(
			title: StringRes.merchant_business_details_edd_has_account_another_bank.localizedString,
			selection: $viewModel.model.hasAnotherBankOption,
			yesContent: {
				CloveUILib.CloveTextFieldView(
					textfieldTitle: StringRes.merchant_business_details_edd_other_bank_or_institution_name.localizedString,
					textfieldValue: $viewModel.model.bankOrInstitutionInput,
					textfieldType: .withoutIcon,
					regex: .alphaNumericSpacePeriodCommaSingleQuote,
					allowsLeadingSpace: false,
					maxLength: 40,
					errorMessage: $viewModel.model.bankOrInstitutionErrorText,
					isFocus: $selectableFocus,
					validateInput: viewModel.validateBankOrInstitution
				)
			}
		)
	}
	
	private func constructCountryRelationSection() -> some View {
		MerchantRegTabSelectionView(
			title: StringRes.merchant_business_details_edd_business_country_relation_question.localizedString,
			selection: $viewModel.model.hasCountryRelationOption,
			yesContent: {
				CloveUILib.CloveTextFieldView(
					textfieldTitle: StringRes.merchant_business_details_edd_country_relation_select_header_title.localizedString,
					textfieldValue: $viewModel.model.selectedCountryRelationInput,
					textfieldType: .selectable(
						icon: .image(
							Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
							iconColor: .primary10
						),
						onTapped: viewModel.openCountryRelationSelection
					),
					errorMessage: $viewModel.model.selectedCountryRelationErrorText,
					isFocus: $selectableFocus,
					validateInput: viewModel.validateCountryRelation
				)
				.padding(.bottom, length: .small)
			}
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
	
	private func contructBirthdatePicker() -> some View {
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
					}) {
						Text(StringRes.general_button_done.localizedString)
							.foregroundColor(Color(.systemBlue))
							.font(.system(size: 17, weight: .semibold))
					}
				}
				.padding(.horizontal, length: .medium)
				.padding(.vertical, length: .small)
				.background(Color(.secondarySystemBackground))
				
				Divider()
				
				MerchantRegMonthYearPicker(date: $viewModel.model.selectedDate, maxDate: Date())
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
}
