
//  MerchantRegPhoneNumberSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/04/26.
//

import CloveUI
import CloveUILib
import Core
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegPhoneNumberSelectionView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(title: StringRes.merchant_personal_contact_select_phone_title.localizedString)
	
	@ObservedObject var viewModel: MerchantRegPhoneNumberSelectionViewModel
	
	init(viewModel: MerchantRegPhoneNumberSelectionViewModel) {
		self.viewModel = viewModel
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			ScrollView {
				VStack(alignment: .leading, spacing: 0) {
					ForEach(Array(viewModel.model.phoneNumberList.enumerated()), id: \.offset) { _, item in
						constructPhoneNumberItem(item)
					}
				}
			}
		}
	}
	
	func constructPhoneNumberItem(_ phone: PhoneModel) -> some View {
		VStack(spacing: 0) {
			CloveText(
				text: phone.maskedPhoneNumber ?? "",
				style: CloveUITypography.subtitle.large
			)
			.frame(maxWidth: .infinity, alignment: .leading)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			.padding(length: .large)
			
			CloveSeparatorView(type: .section)
				.padding(.horizontal, length: .large)
		}
		.onTap {
			viewModel.tapToSelect(phone)
		}
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
}
