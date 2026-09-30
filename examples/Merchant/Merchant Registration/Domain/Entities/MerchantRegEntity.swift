//
//  MerchantRegEntity.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

import Core

public enum MerchantRegProductType: String {
	case edc = "EDC"
	case qris = "QRIS"
}

public enum MerchantRegProductInfoType: String {
	case multiSettlement = "MULTI_SETTLEMENT"
	case transactionCost = "TRANSACTION_COST"
}

public enum MerchantRegApplyStatus: String {
	case alreadyRegistered = "REGISTERED"
	case emailAlreadyRegistered = "EMAIL_REGISTERED"
	case waiting = "PENDING_ANALYSIS"
	case completeData = "PENDING_DOCUMENT"
	case rejected = "REJECTED"
	case eligible = "ELIGIBLE"
}

public class MerchantRegEntity {
	public var epoch = 0.0
	public var prepareData: MerchantRegPrepareDataEntity?
	public var submitData: MerchantRegSubmitDataEntity?
	public var status: MerchantRegApplyStatus?
	public var reffNo = ""
	public var screenStack = [String]()

	public init() {} // public access for instantiation
}

public class MerchantRegPrepareDataEntity {
	public var accounts = [AccountEntity]()
	public var phoneNumbers = [PhonesEntity]()
	public var maskedEmail = ""
	public var npwp = MerchantRegNpwpEntity()
	public var isHighRisk = false
	public var product: MerchantRegPrepareProductEntity?
	public var edd: MerchantRegPrepareEddEntity?
	public init() {} // public access for instantiation
}

public class MerchantRegNpwpEntity {
	public var maskedNumber: String?
	public var status: String?
	public var isVerified = false

	public init() {} // public access for instantiation
}

public class MerchantRegSubmitDataEntity {
	public var referralCode: String?
	public var selectedAccount: AccountEntity?
	public var selectedNpwpOption: Int?
	public var selectedNpwpReasonOption: Int?
	public var npwpNumber: String?
	public var selectedStatusNpwp: String?
	public var registeredNpwpDate: Date?
	public var npwpBase64Image: String?
	public var selectedPhoneNumber: PhonesEntity?
	public var selectedAdditionalPhoneNumberOption: Int?
	public var additionalBusinessPhoneNumber: String?
	public var checkedAgreements: [String]?
	public var productType: MerchantRegProductType?
	public var edcData: MerchantRegEdcEntity?
	public var qrisData: MerchantRegQrisEntity?
	public var eddData: MerchantRegEddEntity?

	public init() {} // public access for instantiation
}

public class MerchantRegPrepareProductEntity {
	public var categories: [MerchantRegCategoryEntity]?
	public var ownershipStatus: [LocalizableEntity]?
	public var locationTypes: [LocalizableEntity]?
	public var facilities: [LocalizableEntity]?
}

public class MerchantRegProductInfoEntity {
	public var htmlContent = ""
	public var url = ""
}

public class MerchantRegPrepareEddEntity {
	public var sourceOfWealths = [LocalizableEntity]()
	public var countries = [String]()
}

public class MerchantRegEddEntity {
	public var selectedSourceOfWealths: [LocalizableEntity]?
	public var otherSourceOfWealth: String?
	public var residenceSinceDate: Date?
	public var hasAnotherBankOption: Int?
	public var otherBankName: String?
	public var hasCountryRelationOption: Int?
	public var selectedCountryRelations: [String]?
}

public class MerchantRegEdcEntity: MerchantRegProductEntity {
	public var businessName: String?
	public var selectedBusinessOwnershipStatus: LocalizableEntity?
	public var selectedHaveOtherEdcOption: Int?
	public var otherEdcInstitution: String?
	public var averageAmountPerTransaction: Double?
	public var lowestItemPrice: Double?
	public var highestItemPrice: Double?
	public var cashierTableCount: String?
	public var desiredEdcCount: String?
	public var selectedEdcFacilities: [LocalizableEntity]?
}

public class MerchantRegQrisEntity: MerchantRegProductEntity {
	public var criteriaCode: String?
	public var isUmi: Bool?
	public var isHavingQris: Bool?
	public var isScanningQris = false
	public var newQrisRequestData: MerchantRegQrisRequestDataEntity?
	public var otherQrisRequestData: MerchantRegQrisRequestDataEntity?
	public var scannedQrisRequestData: MerchantRegQrisRequestDataEntity?

	override public init() {}
}

public class MerchantRegQrisRequestDataEntity {
	public var nmid: String?
	public var merchantName: String?
	public var stickerName: String?
	public var isMultiSettlement = true
}

public class MerchantRegProductEntity {
	public var businessAddress: MerchantRegLocationEntity?
	public var selectedBusinessType: MerchantRegCategoryEntity?
	public var businessEstablishmentDate: Date?
	public var selectedBusinessLocation: LocalizableEntity?
	public var businessAverageMonthlyRevenue: Double?
	public var selectedReceiverOption: Int?
	public var otherReceiverName: String?
	public var otherReceiverPhoneNumber: String?

	public init() {} // public access for instantiation
}

public class MerchantRegCategoryEntity {
	public var contentId = ""
	public var content = LocalizableEntity()
	public var isHighRiskBased = false
	public var isProfessionalLicense = false

	public init() {} // public access for instantiation
}
