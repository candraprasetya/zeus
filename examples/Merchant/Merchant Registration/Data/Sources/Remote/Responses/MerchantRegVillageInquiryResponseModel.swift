//
//  MerchantRegVillageInquiryResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 05/05/26.
//

struct MerchantRegVillageInquiryResponseModel: Decodable {
	let epoch: Double
	let addressList: [MerchantRegVillageDataResponseModel]
	let page: Int
	let maxPage: Int
}

struct MerchantRegVillageDataResponseModel: Decodable {
	let postalId: String
	let postalCode: String
	let villageId: String
	let villageName: String
	let subdistrictId: String
	let subdistrictName: String
	let regencyId: String
	let regencyName: String
	let provinceId: String
	let provinceName: String
	let cityTagQris: String
	let agentbankCode: String
	let agentbankName: String
}
