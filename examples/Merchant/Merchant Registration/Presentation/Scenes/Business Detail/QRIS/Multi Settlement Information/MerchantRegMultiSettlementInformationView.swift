//
//  MerchantRegMultiSettlementInformationView.swift
//  Merchant
//
//  Created by ITBCA on 29/06/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI
import WebKit

struct MerchantRegMultiSettlementInformationView: BaseMutableStateView, BaseNavigationView {
	@ObservedObject var viewModel: MerchantRegMultiSettlementInformationViewModel
	
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_business_qris_details_multi_settlement_info.localizedString
	)
	
	init(viewModel: MerchantRegMultiSettlementInformationViewModel) {
		self.viewModel = viewModel
	}
	
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				VStack(spacing: 0) {
					if let targetURL = URL(string: viewModel.multiSettlementInfoUrl) {
						WebView(url: targetURL)
					}
				}
			}
		}
	}
	
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		return constructErrorContainerView(forProcesses: [viewModel.prepareMultiSettlementInfoProcessId]) {
			constructSpinnerContainerView(
				forProcesses: [LoadingState(id: [viewModel.prepareMultiSettlementInfoProcessId])],
				size: .large,
				theme: .light,
				content: {
					constructErrorContainerView(
						forProcesses: [viewModel.prepareMultiSettlementInfoProcessId],
						errorLayoutPosition: .emptyScreen,
						content: content
					)
				}
			)
		}
	}
}

struct WebView: UIViewRepresentable {
	let url: URL
	
	func makeUIView(context: Context) -> WKWebView {
		let contentController = WKUserContentController()
		contentController.addUserScript(metaScriptWebview())
		contentController.addUserScript(styleScriptWebview())
		
		let webConfiguration = WKWebViewConfiguration()
		webConfiguration.websiteDataStore = WKWebsiteDataStore.nonPersistent()
		webConfiguration.preferences = WKPreferences()
		webConfiguration.userContentController = contentController
		
		return WKWebView(frame: .zero, configuration: webConfiguration)
	}
	
	func updateUIView(_ webView: WKWebView, context: Context) {
		let request = URLRequest(url: url)
		webView.load(request)
	}
	
	private func metaScriptWebview() -> WKUserScript {
		let source: String = "var meta = document.createElement('meta');" +
		"meta.name = 'viewport';" +
		"meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';" +
		"var head = document.getElementsByTagName('head')[0];" + "head.appendChild(meta);";
		
		return WKUserScript(source: source, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
	}
	
	private func styleScriptWebview() -> WKUserScript {
		let fontScript = "var style = document.createElement('style');" +
		"style.appendChild(document.createTextNode('@font-face { font-family: 'BCASans'; src: url('../Fonts/BCASans-Regular.ttf');}'));" +
		"style.appendChild(document.createTextNode('body { font-family: 'BCASans'; }'));" +
		"var head = document.getElementsByTagName('head')[0];" +
		"head.appendChild(style);"
		
		return WKUserScript(source: fontScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
	}
}
