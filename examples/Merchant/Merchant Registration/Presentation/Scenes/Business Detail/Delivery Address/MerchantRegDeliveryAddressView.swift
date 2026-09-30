
//  MerchantRegDeliveryAddressView.swift
//  Merchant
//
//  Created by Candra Prasetya on 23/06/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegDeliveryAddressView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegDeliveryAddressViewModel
	@FocusState var selectableFocus: String?
	
	init(viewModel: MerchantRegDeliveryAddressViewModel) {
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
		let loadProcessIds = [viewModel.loadMerchantDataProcessId]
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
			title: viewModel.constructScreenTitle(),
			subtitle: viewModel.constructScreenSubTitle(),
			progress: 80
		)
	}
	
	private func constructTitle() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			CloveText(
				text: viewModel.constructDeliveryIsTheSameTitle(),
				style: CloveUITypography.title.large
			)
			.foregroundColor(CloveUIColor.primary30.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			HStack(spacing: CloveUISpacing.large.spacing) {
				constructOptionButton(
					index: 0,
					label: StringRes.general_button_yes.localizedString,
					selection: $viewModel.model.selectedOption
				)
				.frame(maxWidth: .infinity)
				
				constructOptionButton(
					index: 1,
					label: StringRes.general_button_no.localizedString,
					selection: $viewModel.model.selectedOption
				)
				.frame(maxWidth: .infinity)
			}
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructAddressFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			if let optionIndex = viewModel.model.selectedOption, optionIndex == 0 {
				constructAccountOwnerNameSection()
				constructPhoneNumberSection()
			} else {
				constructReceiverNameField()
				constructReceiverPhoneNumberField()
			}
			
			constructLocationDetailSection()
			
			constructStreetNameSection()
			constructBuildingNameSection()
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructAccountOwnerNameSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_delivery_recipient_name.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: viewModel.model.name,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.padding(.bottom, length: .xSmall)
	}
	
	private func constructPhoneNumberSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_delivery_recipient_phone_no.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: viewModel.model.phoneNumber,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.padding(.bottom, length: .xSmall)
	}
	
	private func constructStreetNameSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_business_address_street_name_and_number.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: viewModel.model.streetName,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.padding(.bottom, length: .xSmall)
	}
	
	private func constructBuildingNameSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_business_address_building_name_and_block.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: viewModel.model.buildingName,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
		.padding(.bottom, length: .xSmall)
	}
	
	@ViewBuilder
	private func constructLocationDetailSection() -> some View {
		let location = viewModel.model.selectedLocation ?? MerchantRegLocationModel()
		VStack(alignment: .leading, spacing: CloveUISpacing.small.spacing) {
			CloveText(
				text: StringRes.merchant_business_address_location_details.localizedString,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			VStack(alignment: .leading, spacing: CloveUISpacing.medium.spacing) {
				HStack(alignment: .top, spacing: 0) {
					constructLocationDetailItem(
						label: StringRes.general_user_data_province.localizedString,
						value: location.provinceName
					)
					
					constructLocationDetailItem(
						label: StringRes.merchant_business_address_city_region.localizedString,
						value: location.regencyName
					)
				}
				HStack(alignment: .top, spacing: 0) {
					constructLocationDetailItem(
						label: StringRes.merchant_business_address_district.localizedString,
						value: location.subdistrictName
					)
					
					constructLocationDetailItem(
						label: StringRes.merchant_business_address_sub_district.localizedString,
						value: location.villageName
					)
				}
				HStack(alignment: .top, spacing: 0) {
					constructLocationDetailItem(
						label: StringRes.general_user_data_postal_code.localizedString,
						value: location.postalCode
					)
					
					Spacer(minLength: 0)
						.frame(maxWidth: .infinity)
				}
			}
			.padding(length: .medium)
			.frame(maxWidth: .infinity, alignment: .leading)
			.background(CloveUIColor.light20.swiftUIColor)
			.cornerRadius(12, corners: .allCorners)
			.withBorderCustomColor(color: CloveUIColor.light30.swiftUIColor, radius: 12)
		}
	}
	
	private func constructReceiverNameField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_delivery_recipient_name.localizedString,
			textfieldValue: $viewModel.model.receiverNameInput,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			isUppercased: true,
			maxLength: 40,
			errorMessage: $viewModel.model.receiverNameErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateReceiverName
		)
	}
	
	private func constructReceiverPhoneNumberField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_delivery_recipient_phone_no.localizedString,
			textfieldValue: $viewModel.model.phoneNumberInput,
			textfieldType: .withoutIcon,
			regex: .numeric,
			allowsLeadingSpace: false,
			maxLength: 13,
			errorMessage: $viewModel.model.phoneNumberErrorText,
			isFocus: $selectableFocus,
			keyboard: .phonePad,
			validateInput: viewModel.validateReceiverPhoneNumber  
		)
	}
	
	private func constructLocationDetailItem(label: String, value: String) -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xxSmall.spacing) {
			CloveText(
				text: label,
				style: CloveUITypography.subtitle.small
			)
			.foregroundColor(CloveUIColor.dark10.swiftUIColor)
			
			CloveText(
				text: value,
				style: CloveUITypography.title.medium
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			.textCase(.uppercase)
		}
		.frame(maxWidth: .infinity, alignment: .leading)
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
	
	// MARK: - Reusable Components
	private func constructOptionButton(index: Int, label: String, selection: Binding<Int?>) -> some View {
		CloveText(
			text: label,
			style: CloveUITypography.body.medium
		)
		.foregroundColor(
			index == selection.wrappedValue ? CloveUIColor.light10.swiftUIColor : CloveUIColor.dark20.swiftUIColor
		)
		.padding(.horizontal, length: .medium)
		.padding(.vertical, length: .xSmall)
		.frame(maxWidth: .infinity)
		.background(
			index == selection.wrappedValue ? CloveUIColor.primary10.swiftUIColor : CloveUIColor.light10.swiftUIColor
		)
		.cornerRadius(8, corners: .allCorners)
		.withBorderCustomColor(
			color: index == selection.wrappedValue ? CloveUIColor.primary20.swiftUIColor : CloveUIColor.dark10.swiftUIColor,
			radius: 8
		)
		.onTap {
			viewModel.model.selectedOption = index
		}
	}
}
