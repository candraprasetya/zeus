//
//  MerchantRegPrepareProductResponseModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 12/06/26.
//

struct MerchantRegPrepareProductResponseModel: Decodable {
	let epoch: Int
	let merchantCategories: [MerchantRegPrepareProductCategoryResponseModel]
	let ownershipStatus: [MerchantRegPrepareProductOwnershipStatusResponseModel]?
	let locationTypes: [MerchantRegPrepareProductLocationTypeResponseModel]
	let edcFacilities: [MerchantRegPrepareProductEdcFacilityResponseModel]?
}

struct MerchantRegPrepareProductCategoryResponseModel: Decodable {
	let contentId: String
	let id: String
	let indonesian: String
	let english: String
	let isHighRiskBased: Bool
	let isProfessionalLicense: Bool
}

struct MerchantRegPrepareProductOwnershipStatusResponseModel: Decodable {
	let id: String
	let indonesian: String
	let english: String
}

struct MerchantRegPrepareProductLocationTypeResponseModel: Decodable {
	let id: String
	let indonesian: String
	let english: String
}

struct MerchantRegPrepareProductEdcFacilityResponseModel: Decodable {
	let id: String
	let indonesian: String
	let english: String
}
