//
//  MerchantRegPrepareResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

struct MerchantRegPrepareResponseModel: Decodable {
	let epoch: Double
	let accounts: [MerchantRegPrepareAccountResponseModel]
	let phoneNumbers: [MerchantRegPreparePhoneNumberResponseModel]
	let maskedEmail: String
	let npwp: MerchantRegPrepareNpwpResponseModel
	let isHighRisk: Bool
}

struct MerchantRegPrepareAccountResponseModel: Decodable {
	let name: String
	let number: String
	let formattedNumber: String
	let currencyCode: String
	let typeCode: String
	let typeName: String
	let formattedTypeName: String
}

struct MerchantRegPreparePhoneNumberResponseModel: Decodable {
	let id: String
	let maskedNumber: String
}

struct MerchantRegPrepareNpwpResponseModel: Decodable {
	let maskedNumber: String?
	let status: String?
	let isVerified: Bool
}
