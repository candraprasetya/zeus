//
//  MerchantRegFilesResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 20/05/26.
//

struct MerchantRegFilesResponseModel: Decodable {
	let epoch: Double
	let files: [MerchantRegFileResponseModel]
}

struct MerchantRegFileResponseModel: Decodable {
	let name: String
	let documentId: String
	let createdDate: Double
	let status: String
}
