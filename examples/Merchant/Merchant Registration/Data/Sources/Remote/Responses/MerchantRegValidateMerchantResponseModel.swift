//
//  MerchantRegValidateMerchantResponseModel.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

struct MerchantRegValidateMerchantResponseModel: Decodable {
	let epoch: Double
	let merchantCriteriaCode: String
	let flagUmi: Bool
}
