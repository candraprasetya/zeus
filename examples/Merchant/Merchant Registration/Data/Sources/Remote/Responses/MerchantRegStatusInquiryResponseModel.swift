//
//  MerchantRegStatusInquiryResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 15/04/26.
//

struct MerchantRegStatusInquiryResponseModel: Decodable {
	let epoch: Double
	let status: String
	let reffNo: String?
}
