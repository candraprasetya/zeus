//
//  MerchantRegDTO.swift
//  Merchant
//
//  Created by Candra Prasetya on 17/04/26.
//

public struct MerchantRegDTO: Codable {
	let epoch: Double?
	let screenStack: [String]?
	let prepareData: MerchantRegPrepareDataDTO?
	let submitData: MerchantRegSubmitDataDTO?
}

public struct MerchantRegPrepareDataDTO: Codable {
	let accounts: [MerchantRegAccountDTO]
	let phoneNumbers: [MerchantRegPhoneNumberDTO]
	let maskedEmail: String
	let npwp: MerchantRegNpwpDTO
	let isHighRisk: Bool?
	let product: MerchantRegPrepareProductDTO?
}

public struct MerchantRegNpwpDTO: Codable {
	let maskedNumber: String?
	let status: String?
	let isVerified: Bool?
}

public struct MerchantRegSubmitDataDTO: Codable {
	let referralCode: String?
	let selectedAccount: MerchantRegAccountDTO?
	let selectedNpwpOption: Int?
	let selectedNpwpReasonOption: Int?
	let npwpNumber: String?
	let selectedStatusNpwp: String?
	let registeredNpwpDate: Date?
	let npwpBase64Image: String?
	let selectedPhoneNumber: MerchantRegPhoneNumberDTO?
	let selectedAdditionalPhoneNumberOption: Int?
	let additionalBusinessPhoneNumber: String?
	let productType: String?
	let edcData: MerchantRegEdcDataDTO?
	let qrisData: MerchantRegQrisDataDTO?
	let eddData: MerchantRegEddDataDTO?
}

public struct MerchantRegPrepareProductDTO: Codable {
	let categories: [MerchantRegCategoryDTO]?
	let ownershipStatus: [MerchantRegLocalizedDTO]?
	let locationTypes: [MerchantRegLocalizedDTO]?
	let facilities: [MerchantRegLocalizedDTO]?
}

public struct MerchantRegProductDataDTO: Codable {
	let businessAddress: MerchantRegLocationDTO?
	let selectedBusinessType: MerchantRegCategoryDTO?
	let businessEstablishmentDate: Date?
	let selectedBusinessLocation: MerchantRegLocalizedDTO?
	let businessAverageMonthlyRevenue: Double?
	let selectedReceiverOption: Int?
	let otherReceiverName: String?
	let otherReceiverPhoneNumber: String?
}

public struct MerchantRegEdcDataDTO: Codable {
	let businessName: String?
	let selectedOwnershipStatus: MerchantRegLocalizedDTO?
	let selectedEdcFromAnotherBankOption: Int?
	let edcIssuingInstitution: String?
	let cashierTableCount: String?
	let desiredEdcCount: String?
	let selectedEdcFacilities: [MerchantRegLocalizedDTO]?
	let productData: MerchantRegProductDataDTO?
	let averageAmountPerTransaction: Double?
	let lowestItemPrice: Double?
	let highestItemPrice: Double?
}

public struct MerchantRegEddDataDTO: Codable {
	let selectedSourceOfWealths: [MerchantRegLocalizedDTO]?
	let residenceSinceDate: Date?
	let hasAnotherBankOption: Int?
	let bankOrInstitution: String?
	let hasCountryRelationOption: Int?
	let selectedCountryRelations: [String]?
	let otherSourceOfWealth: String?
}

public struct MerchantRegQrisDataDTO: Codable {
	let productData: MerchantRegProductDataDTO?
	let criteriaCode: String?
	let isUmi: Bool?
	let isHavingQris: Bool?
	let isScanningQris: Bool?
	let newQrisRequestData: MerchantRegQrisRequestDataDTO?
	let otherQrisRequestData: MerchantRegQrisRequestDataDTO?
	let scannedQrisRequestData: MerchantRegQrisRequestDataDTO?
}

public struct MerchantRegQrisRequestDataDTO: Codable {
	let nmid: String?
	let merchantName: String?
	let stickerName: String?
	let isMultiSettlement: Bool?
}

public struct MerchantRegCategoryDTO: Codable {
	let contentId: String?
	let content: MerchantRegLocalizedDTO?
	let isHighRiskBased: Bool?
	let isProfessionalLicense: Bool?
}

public struct MerchantRegLocalizedDTO: Codable {
	let id: String?
	let indonesian: String?
	let english: String?
}

public struct MerchantRegLocationDTO: Codable {
	let address: String?
	let longitude: String?
	let latitude: String?
	let postalId: String?
	let postalCode: String?
	let villageId: String?
	let villageName: String?
	let subdistrictId: String?
	let subdistrictName: String?
	let regencyId: String?
	let regencyName: String?
	let provinceId: String?
	let provinceName: String?
	let cityTagQris: String?
	let agentBankCode: String?
	let agentBankName: String?
	let streetName: String?
	let buildingName: String?
}

public struct MerchantRegAccountDTO: Codable {
	let name: String?
	let number: String?
	let formattedNumber: String?
	let typeName: String?
	let typeCode: String?
	let currencyCode: String?
	let formattedTypeName: String?
}

public struct MerchantRegPhoneNumberDTO: Codable {
	let id: String?
	let number: String?
}
