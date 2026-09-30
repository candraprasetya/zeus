//
//  MerchantRegTabSelectionView.swift
//  Merchant
//
//  Created by Candra Prasetya on 24/06/26.
//

import CloveUI
import CloveUILib
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegTabSelectionView<YesContent: View, NoContent: View>: View {
	let title: String
	@Binding var selection: Int?
	
	let yesLabel: String
	let noLabel: String
	
	let yesContent: () -> YesContent
	let noContent: () -> NoContent
	let type: MerchantRegTabSelectionType
	let cornerRadius = CGFloat(8)
	enum MerchantRegTabSelectionType {
		case radioButton
		case tabButton
	}
	
	init(
		title: String,
		type: MerchantRegTabSelectionType? = nil,
		selection: Binding<Int?>,
		yesLabel: String = StringRes.general_button_yes.localizedString,
		noLabel: String = StringRes.general_button_no.localizedString,
		@ViewBuilder yesContent: @escaping () -> YesContent = { EmptyView() },
		@ViewBuilder noContent: @escaping () -> NoContent = { EmptyView() }
	) {
		self.title = title
		self.type = type ?? .tabButton
		self._selection = selection
		self.yesLabel = yesLabel
		self.noLabel = noLabel
		self.yesContent = yesContent
		self.noContent = noContent
	}
	
	var body: some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			CloveText(
				text: title,
				style: CloveUITypography.title.large
			)
			.foregroundColor(CloveUIColor.primary30.swiftUIColor)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			HStack(spacing: CloveUISpacing.large.spacing) {
				if type == .radioButton {
					constructRadioOption(value: 0, label: yesLabel)
					constructRadioOption(value: 1, label: noLabel)
				} else {
					optionButton(value: 0, label: yesLabel)
					optionButton(value: 1, label: noLabel)
				}
			}
			
			if selection == 0 {
				yesContent()
			} else if selection == 1 {
				noContent()
			}
		}
		.frame(maxWidth: .infinity)
	}
	
	private func optionButton(value: Int, label: String) -> some View {
		CloveText(
			text: label,
			style: CloveUITypography.body.medium
		)
		.foregroundColor(
			value == selection ? CloveUIColor.light10.swiftUIColor : CloveUIColor.dark20.swiftUIColor
		)
		.padding(.horizontal, length: .medium)
		.padding(.vertical, length: .small)
		.frame(maxWidth: .infinity)
		.background(
			value == selection ? CloveUIColor.primary10.swiftUIColor : CloveUIColor.light10.swiftUIColor
		)
		.cornerRadius(cornerRadius, corners: .allCorners)
		.withBorderCustomColor(
			color: value == selection ? CloveUIColor.primary20.swiftUIColor : CloveUIColor.dark10.swiftUIColor,
			radius: cornerRadius
		)
		.onTap {
			withAnimation(.easeInOut(duration: 0.2)) {
				selection = value
			}
		}
		.accessibilityLabel(label)
		.accessibilityAddTraits(.isButton)
	}
	
	private func constructRadioOption(value: Int, label: String) -> some View {
		HStack(spacing: CloveUISpacing.xSmall.spacing) {
			CloveRadioButtonViewV2(
				index: value,
				selectedIndex: $selection,
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
