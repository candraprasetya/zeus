//
//  MerchantInvalidQrisCounterManager.swift
//  Merchant
//
//  Created by ITBCA on 30/06/26.
//

struct MerchantInvalidQrisCounterManager {
	private let userDefaultKey = "merchantRegInvalidScanQrisDataCounterDefaultKey"
	private let threshold = 3
	
	init() {}
	
	public func isCounterExceedThreshold() -> Bool {
		getCounter() > threshold
	}
	
	public func addCounter() {
		let currentCounter = getCounter()
		if currentCounter <= threshold {
			let addedCounter = currentCounter + 1
			UserDefaults.standard.set(
				addedCounter,
				forKey: userDefaultKey
			)
		}
	}
	
	public func getCounter() -> Int {
		UserDefaults.standard.integer(
			forKey: userDefaultKey
		)
	}
	
	public func resetCounter() {
		UserDefaults.standard.removeObject(
			forKey: userDefaultKey
		)
	}
}
