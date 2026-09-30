//
//  MerchantRegPrepareEddResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 12/06/26.
//

struct MerchantRegPrepareEddResponseModel: Decodable {
	let epoch: Double
	let sourceOfWealths: [MerchantRegPrepareEddSourceOfWealthResponseModel]
	let countries: [String]
}

struct MerchantRegPrepareEddSourceOfWealthResponseModel: Decodable {
	let id: String
	let indonesian: String
	let english: String
}
