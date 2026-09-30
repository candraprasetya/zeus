
//  MerchantRegAddressView.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/04/26.
//

import CloveUI
import CloveUILib
import Core
import CoreLocation
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegAddressView: BaseMutableStateView, BaseNavigationView, BaseRightNavigationItemView {
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.titleLeftIconRight(
		withBackButton: true,
		title: StringRes.merchant_common_header_title.localizedString,
		icon: "IconHome"
	)
	
	@ObservedObject var viewModel: MerchantRegAddressViewModel
	@FocusState var selectableFocus: String?
	
	// MARK: - Initialization
	init(viewModel: MerchantRegAddressViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
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
	
	// MARK: - Navigation
	func leftButtonTap() {
		viewModel.toPreviousScreen()
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
			title: StringRes.merchant_business_address_progress_title.localizedString,
			subtitle: StringRes.merchant_business_address_next_step.localizedString,
			progress: 50
		)
	}
	
	private func constructTitle() -> some View {
		CloveText(
			text: StringRes.merchant_business_address_title.localizedString,
			style: CloveUITypography.title.large
		)
		.foregroundColor(CloveUIColor.primary30.swiftUIColor)
		.frame(maxWidth: .infinity, alignment: .leading)
		.padding(.horizontal, length: .large)
	}
	
	private func constructAddressFormSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructBusinessAddressField()
			constructSubdistrictField()
			if viewModel.model.selectedLocation != nil {
				constructLocationDetailSection()
			}
			constructStreetNameField()
			constructBuildingNameField()
		}
		.padding(.horizontal, length: .large)
	}
	
	private func constructBusinessAddressField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_address_business_location_address.localizedString,
			textfieldValue: $viewModel.model.selectedAddress,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openMapSelection
			),
			errorMessage: $viewModel.model.selectedAddressErrorText,
			isFocus: $selectableFocus
		)
	}
	
	private func constructSubdistrictField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_address_sub_district.localizedString,
			textfieldValue: $viewModel.model.selectedVillage,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openVillageSelection
			),
			errorMessage: $viewModel.model.selectedVillageErrorText,
			isDisabled: viewModel.isBusinessLocationAddressEmpty(),
			isFocus: $selectableFocus
		)
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
					constructLocationDetailItem(label: StringRes.general_user_data_province.localizedString, value: location.provinceName)
					constructLocationDetailItem(label: StringRes.merchant_business_address_city_region.localizedString, value: location.regencyName)
				}
				HStack(alignment: .top, spacing: 0) {
					constructLocationDetailItem(label: StringRes.merchant_business_address_district.localizedString, value: location.subdistrictName)
					constructLocationDetailItem(label: StringRes.merchant_business_address_sub_district.localizedString, value: location.villageName)
				}
				HStack(alignment: .top, spacing: 0) {
					constructLocationDetailItem(label: StringRes.general_user_data_postal_code.localizedString, value: location.postalCode)
					Spacer(minLength: 0).frame(maxWidth: .infinity)
				}
			}
			.padding(length: .medium)
			.frame(maxWidth: .infinity, alignment: .leading)
			.background(CloveUIColor.light20.swiftUIColor)
			.cornerRadius(12, corners: .allCorners)
			.withBorderCustomColor(color: CloveUIColor.light30.swiftUIColor, radius: 12)
		}
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
	
	private func constructStreetNameField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_address_street_name_and_number.localizedString,
			textfieldValue: $viewModel.model.streetName,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: viewModel.model.productType == .edc ? 23 : 50,
			errorMessage: $viewModel.model.streetNameErrorText,
			isDisabled: viewModel.isBusinessLocationAddressEmpty(),
			isFocus: $selectableFocus,
			validateInput: viewModel.validateStreetName
		)
	}
	
	private func constructBuildingNameField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_address_building_name_and_block.localizedString,
			textfieldValue: $viewModel.model.buildingName,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: viewModel.model.productType == .edc ? 23 : 50,
			errorMessage: $viewModel.model.buildingNameErrorText,
			isDisabled: viewModel.isBusinessLocationAddressEmpty(),
			isFocus: $selectableFocus,
			validateInput: viewModel.validateBuildingName
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
	
	func rightFirstButtonTap() {
		viewModel.toHomeScreen()
	}
}
