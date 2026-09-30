//
//  MerchantCircleProgressView.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import CloveUI
import CloveUILib
import StandardLibrary
import SwiftUI

struct MerchantRegCircleProgressTitleSubtitleLayout: View {
	let title: String
	let subtitle: String
	let progress: Double
	
	init(
		title: String,
		subtitle: String,
		progress: Double,
	) {
		self.title = title
		self.subtitle = subtitle
		self.progress = progress
	}
	
	var body: some View {
		VStack(spacing: 0) {
			HStack(spacing: CloveUISpacing.small.spacing) {
				MerchantRegCircleProgressView(progress: progress)
				
				VStack(alignment: .leading, spacing: 0) {
					Text(title)
						.font(CloveUITypography.title.large.asSwiftUIFont())
						.foregroundColor(CloveUITheme.Color.dark20.swiftUIColor)
						.multilineTextAlignment(.leading)
						.fixedSize(horizontal: false, vertical: true)
					
					Text(subtitle)
						.font(CloveUITypography.body.medium.asSwiftUIFont())
						.foregroundColor(CloveUITheme.Color.dark10.swiftUIColor)
						.multilineTextAlignment(.leading)
						.fixedSize(horizontal: false, vertical: true)
				}
				.frame(maxWidth: .infinity, alignment: .leading)
			}
			.padding(.horizontal, length: .large)
			.padding(.vertical, length: .medium)
			
			CloveSeparatorView(type: .section)
		}
	}
}

struct MerchantRegCircleProgressView: View {
	let progress: Double
	let size: CGFloat
	let radius: CGFloat
	let bgColor: Color
	let fgColor: Color
	let lineWidth: CGFloat
	
	init(
		progress: Double,
		size: CGFloat = 37,
		radius: CGFloat = 20,
		bgColor: Color = CloveUIColor.secondary10.swiftUIColor,
		fgColor: Color = CloveUIColor.secondary20.swiftUIColor,
		lineWidth: CGFloat = 3.0
	) {
		self.progress = progress
		self.size = size
		self.radius = radius
		self.bgColor = bgColor
		self.fgColor = fgColor
		self.lineWidth = lineWidth
	}
	
	var body: some View {
		ZStack {
			Circle()
				.stroke(bgColor, lineWidth: lineWidth)
				.frame(width: size, height: size)
			
			Circle()
				.trim(from: 0.0, to: progress / 100)
				.stroke(
					fgColor,
					style: StrokeStyle(
						lineWidth: lineWidth,
						lineCap: .round
					)
				)
				.rotationEffect(.degrees(-90))
				.frame(width: size, height: size)
				.animation(.easeInOut(duration: 0.3), value: progress)
			
			Text("\(progress.toStringWithoutTrailingZero())%")
				.font(CloveUITypography.title.small.asSwiftUIFont())
				.foregroundColor(CloveUIColor.dark30.swiftUIColor)
		}
	}
}
