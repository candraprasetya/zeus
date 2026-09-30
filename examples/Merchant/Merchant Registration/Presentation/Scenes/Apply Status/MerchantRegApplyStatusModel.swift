
//  MerchantRegApplyStatusModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

import Core

public struct MerchantRegApplyStatusModel {
	// MARK: - Data for logical processes
	public var status: MerchantRegApplyStatus?
	public var reffNo: String?
	public var isShowingBanner = [Bool]()

	public init(status: MerchantRegApplyStatus? = nil, reffNo: String? = nil) {
		self.status = status
		self.reffNo = reffNo
	}
}
