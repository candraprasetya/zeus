//
//  MerchantRegMonthYearPicker.swift
//  Merchant
//
//  Created by Candra Prasetya on 01/07/26.
//

import SharedI18nRes
import SharedConfig
import StandardLibrary
import SwiftUI

struct MerchantRegMonthYearPicker: View {
	@Binding var date: Date
	@Environment(\.locale) var locale
	var maxDate: Date?
	@State private var snapID = 0
	
	@State private var calendar: Calendar = {
		var cal = Calendar.current
		cal.locale = .current
		return cal
	}()
	
	init(date: Binding<Date>, maxDate: Date? = nil) {
		self._date = date
		self.maxDate = maxDate
	}
	
	var currentYear: Int {
		calendar.component(.year, from: Date())
	}
	
	var years: [Int] {
		Array((currentYear - 100)...currentYear)
	}
	
	var isYearFirst: Bool {
		locale.identifier.hasPrefix("zh")
	}
	
	var body: some View {
		HStack(spacing: 0) {
			if isYearFirst {
				yearPicker
				monthPicker
			} else {
				monthPicker
				yearPicker
			}
		}
		.onChange(of: locale) { newLocale in
			var cal = Calendar.current
			cal.locale = newLocale
			calendar = cal
		}
	}
	
	var yearPicker: some View {
		Picker("Year", selection: yearBinding) {
			ForEach(years, id: \.self) { year in
				Text(formattedYear(year))
					.tag(year)
			}
		}
		.pickerStyle(WheelPickerStyle())
		.accessibilityLabel("Year")
		.frame(minWidth: 0, maxWidth: .infinity)
		.clipped()
		.id(snapID)
	}
	
	var monthPicker: some View {
		Picker("Month", selection: monthBinding) {
			ForEach(1...12, id: \.self) { month in
				Text(formattedMonth(month))
					.tag(month)
			}
		}
		.pickerStyle(WheelPickerStyle())
		.accessibilityLabel("Month")
		.frame(minWidth: 0, maxWidth: .infinity)
		.clipped()
		.id(snapID)
	}
	
	private var monthBinding: Binding<Int> {
		Binding<Int>(
			get: { calendar.component(.month, from: date) },
			set: { newMonth in
				let year = calendar.component(.year, from: date)
				guard let newDate = calendar.date(from: DateComponents(year: year, month: newMonth, day: 1)) else { return }
				let clamped = clampToDate(newDate)
				date = clamped
				if newDate > clamped { snapID += 1 }
			}
		)
	}
	
	private var yearBinding: Binding<Int> {
		Binding<Int>(
			get: { calendar.component(.year, from: date) },
			set: { newYear in
				let month = calendar.component(.month, from: date)
				guard let newDate = calendar.date(from: DateComponents(year: newYear, month: month, day: 1)) else { return }
				let clamped = clampToDate(newDate)
				date = clamped
				if newDate > clamped { snapID += 1 }
			}
		)
	}
	
	private func clampToDate(_ date: Date) -> Date {
		guard let maxDate else { return date }
		return date > maxDate ? maxDate : date
	}
	
	private func formattedYear(_ year: Int) -> String {
		return DateFormatter.shared.format(
			day: nil,
			month: nil,
			year: year.toKotlinInt(),
			dateFormat: .yyyy
		)
	}
	
	private func formattedMonth(_ month: Int) -> String {
		return DateFormatter.shared.format(
			day: nil,
			month: month.toKotlinInt(),
			year: nil,
			dateFormat: .MMMM
		)
	}
}
