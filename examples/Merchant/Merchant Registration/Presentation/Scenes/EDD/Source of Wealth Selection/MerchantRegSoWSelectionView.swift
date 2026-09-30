
//  MerchantRegSoWSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/07/26.
//

import CloveUI
import CloveUILib
import Core
import SwiftUI
import StandardLibrary
import SharedI18nRes

struct MerchantRegSoWSelectionView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_business_details_edd_source_of_wealth_select_header_title.localizedString
	)

    @ObservedObject var viewModel: MerchantRegSoWSelectionViewModel
	@FocusState var selectableFocus: String?
	
    init(viewModel: MerchantRegSoWSelectionViewModel) {
        self.viewModel = viewModel
    }

    var body: some View {
        WhiteRoundedBackgroundView {
			VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
				ScrollView {
					VStack(spacing: 0) {
						constructBannerSection()
						
						VStack(spacing: 0) {
							ForEach(
								Array(viewModel.model.selectableData.map{ $0.getText() }.enumerated()),
								id: \.0
							) { index, option in
								VStack(alignment: .leading, spacing: 0) {
									constructTitleCheckboxView(title: option, index: index) {
										viewModel.toggleOption(at: index, isSelected: !viewModel.model.selectedData.map{ $0.getText() }.contains(option))
									}
									.padding(.vertical, length: .medium)
									
									CloveSeparatorView(type: .section)
								}
								.frame(maxWidth: .infinity)
							}
						}
						
						if viewModel.model.selectedData.contains(where: { $0.code == viewModel.model.otherOptionCode }) {
							constructOtherField()
						}
						
						CloveButtonViewV2(
							type: .textOnly(textId: StringRes.general_button_save.localizedString),
							enabled: viewModel.isButtonEnabled(),
							layout: .stretch,
							onClick: viewModel.onSave
						)
						.padding(.top, 40)
					}
					.padding([.horizontal, .bottom], length: .large)
				}
				.disableBounce(in: Self.self)
				.keyboardAdaptive()
			}
        }
    }

    func leftButtonTap() {
        viewModel.toPreviousScreen()
    }
	
	private func constructOtherField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_business_details_edd_other_notes_label.localizedString,
			textfieldValue: $viewModel.model.otherInput,
			textfieldType: .withoutIcon,
			regex: .alphaNumericSpacePeriodCommaSingleQuote,
			allowsLeadingSpace: false,
			maxLength: 100,
			errorMessage: $viewModel.model.otherErrorText,
			isFocus: $selectableFocus,
			validateInput: viewModel.validateOther
		)
		.padding(.top, length: .large)
	}
	
	private func constructBannerSection() -> some View {
		Group {
			try? CloveBannerViewV2(
				type: .infobox(
					variant: .bodyOnly(
						body: .standard(
							textId: StringRes.merchant_business_details_edd_source_of_wealth_info_label.localizedString
						)
					),
					action: .none
				),
				status: .info,
				showBanner: .constant(true)
			)
		}
		.padding(.top, length: .large)
		.padding(.bottom, length: .xSmall)
	}
	
	@ViewBuilder
	private func constructTitleCheckboxView(title: String, index: Int, onTap: (() -> Void)? = nil) -> some View {
		let option = viewModel.model.selectableData[index]
		let isSelected = viewModel.model.selectedData.map{ $0.code }.contains(option.code)
		
		HStack(alignment: .center, spacing: CloveUISpacing.small.spacing) {
			CloveText(
				text: title,
				style: CloveUITypography.subtitle.large
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			CloveCheckBoxViewV2(
				state: isSelected ? .active : .inactive,
				onStateChange: { _ in
					onTap?()
				}
			)
		}
		.onTap {
			onTap?()
		}
	}
}
