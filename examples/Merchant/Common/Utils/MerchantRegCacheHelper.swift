//
//  MerchantRegCacheHelper.swift
//  Merchant
//
//  Created by Candra Prasetya on 21/04/26.
//

public class MerchantRegCacheHelper {
	public func isCacheValid(_ cachedEpoch: Double, _ inquiryEpoch: Double) -> Bool {
		let cachedSeconds = cachedEpoch / 1000
		let inquirySeconds = inquiryEpoch / 1000
		
		let cachedDate = Date(timeIntervalSince1970: cachedSeconds)
		let inquiryDate = Date(timeIntervalSince1970: inquirySeconds)
		
		let calendar = Calendar.current
		let cachedDateOnly = calendar.startOfDay(for: cachedDate)
		let inquiryDateOnly = calendar.startOfDay(for: inquiryDate)
		
		let components = calendar.dateComponents([.day], from: cachedDateOnly, to: inquiryDateOnly)
		
		guard let daysDifference = components.day else { return false }
		
		return abs(daysDifference) <= 7
	}
	
	public init() {} // public access for instantiation
}
