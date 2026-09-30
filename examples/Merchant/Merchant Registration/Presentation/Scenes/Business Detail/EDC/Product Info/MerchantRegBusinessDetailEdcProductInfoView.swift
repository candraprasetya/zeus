//
//  MerchantRegBusinessDetailEdcProductInfoView.swift
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

struct MerchantRegBusinessDetailEdcProductInfoView: BaseMutableStateView, BaseNavigationView {
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_business_details_transaction_fees_title.localizedString
	)

	@ObservedObject var viewModel: MerchantRegBusinessDetailEdcProductInfoViewModel

	init(viewModel: MerchantRegBusinessDetailEdcProductInfoViewModel) {
		self.viewModel = viewModel
	}

	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
						Text(html: viewModel.model.htmlContent, baseFont: CloveUITypography.body.medium.asUIFont())
							.foregroundColor(CloveUIColor.dark20.swiftUIColor)
							.frame(maxWidth: .infinity, alignment: .leading)
					}
					.padding(length: .large)

					tappableLinkView()
						.frame(maxWidth: .infinity, alignment: .leading)
						.padding(.horizontal, length: .large)
				}
				.disableBounce(in: Self.self)
			}
			.onLoad {
				viewModel.inquiryProductInfo()
			}
		}
	}

	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}

	@ViewBuilder
	private func tappableLinkView() -> some View {
		let tappableText = StringRes.merchant_business_details_transaction_fees_content_this_link_label.localizedString
		let fullText = String(
			format: StringRes.merchant_business_details_transaction_fees_content.localizedString,
			tappableText
		)
		
		let containerText: Text = {
			if var attrString = try? AttributedString(markdown: fullText) {
				attrString.font = Font(CloveUITypography.body.medium.asUIFont())
				attrString.foregroundColor = CloveUIColor.dark20.swiftUIColor
				
				if let range = attrString.range(of: tappableText) {
					attrString[range].font = Font(CloveUITypography.title.medium.asUIFont())
					attrString[range].foregroundColor = CloveUIColor.primary10.swiftUIColor
					attrString[range].underlineStyle = .single
					
					attrString[range].link = URL(string: viewModel.model.navigateActionScheme)
				}
				
				if let dotString = attrString.range(of: ".") {
					attrString[dotString].font = Font(CloveUITypography.body.medium.asUIFont())
					attrString[dotString].foregroundColor = CloveUIColor.primary10.swiftUIColor
				}
				return Text(attrString)
			} else {
				return Text(fullText)
			}
		}()
		
		containerText
			.environment(\.openURL, OpenURLAction { url in
				if url.absoluteString == viewModel.model.navigateActionScheme {
					viewModel.navigateToUrl()
					return .handled
				}
				return .systemAction
			})
	}

	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		let loadProcessIds = [viewModel.inquiryProductInfoProcessId]

		return constructErrorContainerView(
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
}
