//
//  MerchantRegRepositoryImpl.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

import Aegis
import Core
import RxSwift
import SharedConfig

public class MerchantRepositoryImpl: Core.BaseRepository, MerchantRegRepository {
	public func prepare() async throws -> MerchantRegEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/prepare"),
			mapper: { (response: BaseResponse<MerchantRegPrepareResponseModel>) in
				response.body.getOutputSchema().toMerchantEntity()
			}
		)
	}

	public func inquiryStatus() async throws -> MerchantRegEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/status"),
			mapper: { (response: BaseResponse<MerchantRegStatusInquiryResponseModel>) in
				response.body.getOutputSchema().toMerchantEntity()
			}
		)
	}

	public func prepareProduct(type: MerchantRegProductType) async throws -> MerchantRegPrepareProductEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/prepare-product/\(type.rawValue)"),
			mapper: { (response: BaseResponse<MerchantRegPrepareProductResponseModel>) in
				response.body.getOutputSchema().toMerchantRegPrepareProductDataEntity()
			}
		)
	}

	public func validateMerchant(data: MerchantRegQrisEntity) async throws -> MerchantRegQrisEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/validate-merchant"),
			parameters: data.toMerchantRegValidateMerchantRequestModel(),
			mapper: { (response: BaseResponse<MerchantRegValidateMerchantResponseModel>) in
				response.body.getOutputSchema().toMerchantRegQrisDataEntity(
					revenue: data.businessAverageMonthlyRevenue ?? 00
				)
			}
		)
	}

	public func validateQris(nmid: String? = nil, stickerName: String? = nil) async throws {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/validate-qris"),
			parameters: MerchantRegValidateQrisRequestModel(
				nmid: nmid,
				stickerName: stickerName
			),
			mapper: { (_: BaseResponse<Core.EpochOnlyResponseModel>) in
			}
		)
	}

	public func inquiryProductInfo(type: MerchantRegProductInfoType) async throws -> MerchantRegProductInfoEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(url: "api/merchant/opening/product-info?product=\(type.rawValue)"),
			mapper: { (response: BaseResponse<MerchantRegProductInfoResponseModel>) in
				response.body.getOutputSchema().toMerchantRegProductInfoEntity()
			}
		)
	}

	public func saveLocalData(data: MerchantRegEntity) async throws {
		try await insert(item: (Constants().merchantRegSchema, Constants().merchantRegResourceId, data.toDTO()))
	}

	public func loadLocalData() async throws -> MerchantRegEntity {
		try await getById(Constants().merchantRegResourceId, from: Constants().merchantRegSchema)
			.map { (item: MerchantRegDTO) in
				item.toEntity()
			} ?? MerchantRegEntity()
	}

	public func deleteLocalMerchantData() async throws {
		try await delete(withId: Constants().merchantRegResourceId, from: Constants().merchantRegSchema)
	}

	public func inquiryVillage(data: MerchantRegVillageEntity) async throws -> MerchantRegVillageEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(
				url: "api/merchant/opening/address/villages?keyword=\(data.keyword ?? "")&page=\(data.currentPage)"
			),
			mapper: { (response: BaseResponse<MerchantRegVillageInquiryResponseModel>) in
				response.body.getOutputSchema().toMerchantVillageEntity()
			}
		)
	}

	public func prepareEdd() async throws -> MerchantRegPrepareEddEntity {
		try await get(
			requestEndpoint: RequestEndpoint.V3(
				url: "api/merchant/opening/prepare-edd"
			),
			mapper: { (response: BaseResponse<MerchantRegPrepareEddResponseModel>) in
				response.body.getOutputSchema().toMerchantRegPrepareEntity()
			}
		)
	}
}

// MARK: - Response Model to Entity Mappers
extension MerchantRegPrepareResponseModel {
	func toMerchantEntity() -> MerchantRegEntity {
		let entity = MerchantRegEntity()
		let prepareData = MerchantRegPrepareDataEntity()

		prepareData.accounts = accounts.map { $0.toAccountEntity() }
		prepareData.maskedEmail = maskedEmail
		prepareData.phoneNumbers = phoneNumbers.map { $0.toPhoneEntity() }
		prepareData.npwp = npwp.toNpwpEntity()
		prepareData.isHighRisk = isHighRisk

		entity.epoch = epoch
		entity.prepareData = prepareData

		return entity
	}
}

extension MerchantRegPrepareNpwpResponseModel {
	func toNpwpEntity() -> MerchantRegNpwpEntity {
		let entity = MerchantRegNpwpEntity()
		entity.status = status
		entity.maskedNumber = maskedNumber
		entity.isVerified = isVerified

		return entity
	}
}

extension MerchantRegPrepareAccountResponseModel {
	func toAccountEntity() -> Core.AccountEntity {
		let entity = Core.AccountEntity()

		entity.name = name
		entity.accountNumber = number
		entity.formattedNumber = formattedNumber
		entity.currency.code = currencyCode
		entity.type = AccountTypeEntity(code: typeCode, description: formattedTypeName)

		return entity
	}
}

extension MerchantRegPreparePhoneNumberResponseModel {
	func toPhoneEntity() -> PhonesEntity {
		PhonesEntity(maskedPhoneNumber: maskedNumber, phoneId: id)
	}
}

extension MerchantRegStatusInquiryResponseModel {
	func toMerchantEntity() -> MerchantRegEntity {
		let entity = MerchantRegEntity()
		entity.epoch = epoch
		entity.status = MerchantRegApplyStatus(rawValue: status.uppercased())
		entity.reffNo = reffNo ?? ""

		return entity
	}
}

extension MerchantRegVillageInquiryResponseModel {
	func toMerchantVillageEntity() -> MerchantRegVillageEntity {
		let entity = MerchantRegVillageEntity()
		entity.currentPage = page
		entity.maxPage = maxPage
		entity.villages = addressList.map { $0.toMerchantLocationEntity() }

		return entity
	}
}

extension MerchantRegVillageDataResponseModel {
	func toMerchantLocationEntity() -> MerchantRegLocationEntity {
		let entity = MerchantRegLocationEntity()
		entity.postalId = postalId
		entity.postalCode = postalCode
		entity.villageId = villageId
		entity.villageName = villageName
		entity.subdistrictId = subdistrictId
		entity.subdistrictName = subdistrictName
		entity.regencyId = regencyId
		entity.regencyName = regencyName
		entity.provinceId = provinceId
		entity.provinceName = provinceName
		entity.cityTagQris = cityTagQris
		entity.agentBankCode = agentbankCode
		entity.agentBankName = agentbankName

		return entity
	}
}

extension MerchantRegPrepareProductResponseModel {
	func toMerchantRegPrepareProductDataEntity() -> MerchantRegPrepareProductEntity {
		let entity = MerchantRegPrepareProductEntity()
		entity.categories = merchantCategories.map { $0.toMerchantRegCategoryEntity() }
		entity.facilities = edcFacilities?.map { $0.toLocalizableEntity() }
		entity.ownershipStatus = ownershipStatus?.map { $0.toLocalizableEntity() }
		entity.locationTypes = locationTypes.map { $0.toLocalizableEntity() }

		return entity
	}
}

extension MerchantRegProductInfoResponseModel {
	func toMerchantRegProductInfoEntity() -> MerchantRegProductInfoEntity {
		let entity = MerchantRegProductInfoEntity()
		entity.htmlContent = html ?? ""
		entity.url = url ?? ""

		return entity
	}
}

extension MerchantRegPrepareProductCategoryResponseModel {
	func toMerchantRegCategoryEntity() -> MerchantRegCategoryEntity {
		let entity = MerchantRegCategoryEntity()
		entity.contentId = contentId
		entity.content = LocalizableEntity(code: id, indonesian: indonesian, english: english)
		entity.isHighRiskBased = isHighRiskBased
		entity.isProfessionalLicense = isProfessionalLicense

		return entity
	}
}

extension MerchantRegPrepareProductOwnershipStatusResponseModel {
	func toLocalizableEntity() -> LocalizableEntity {
		LocalizableEntity(code: id, indonesian: indonesian, english: english)
	}
}

extension MerchantRegPrepareProductLocationTypeResponseModel {
	func toLocalizableEntity() -> LocalizableEntity {
		LocalizableEntity(code: id, indonesian: indonesian, english: english)
	}
}

extension MerchantRegPrepareProductEdcFacilityResponseModel {
	func toLocalizableEntity() -> LocalizableEntity {
		LocalizableEntity(code: id, indonesian: indonesian, english: english)
	}
}

extension MerchantRegValidateMerchantResponseModel {
	func toMerchantRegQrisDataEntity(revenue: Double) -> MerchantRegQrisEntity {
		let entity = MerchantRegQrisEntity()
		entity.criteriaCode = merchantCriteriaCode
		entity.isUmi = flagUmi
		entity.businessAverageMonthlyRevenue = revenue

		return entity
	}
}

extension MerchantRegPrepareEddResponseModel {
	func toMerchantRegPrepareEntity() -> MerchantRegPrepareEddEntity {
		let entity = MerchantRegPrepareEddEntity()
		entity.countries = countries
		entity.sourceOfWealths = sourceOfWealths.map { $0.toLocalizableEntity() }
		return entity
	}
}

extension MerchantRegPrepareEddSourceOfWealthResponseModel {
	func toLocalizableEntity() -> LocalizableEntity {
		LocalizableEntity(code: id, indonesian: indonesian, english: english)
	}
}

// MARK: - Entity to Request Model Mappers
extension MerchantRegVillageEntity {
	func toRequestModel() -> MerchantRegVillageInquiryRequestModel {
		MerchantRegVillageInquiryRequestModel(keyword: keyword ?? "", page: "\(currentPage)")
	}
}

extension MerchantRegQrisEntity {
	func toMerchantRegValidateMerchantRequestModel() -> MerchantRegValidateMerchantRequestModel {
		MerchantRegValidateMerchantRequestModel(
			revenue: businessAverageMonthlyRevenue?.formatted(.number.grouping(.never)) ?? ""
		)
	}
}

// MARK: - MerchantLocation Mapper
extension MerchantRegLocationEntity {
	func toDTO() -> MerchantRegLocationDTO {
		MerchantRegLocationDTO(
			address: address,
			longitude: longitude,
			latitude: latitude,
			postalId: postalId,
			postalCode: postalCode,
			villageId: villageId,
			villageName: villageName,
			subdistrictId: subdistrictId,
			subdistrictName: subdistrictName,
			regencyId: regencyId,
			regencyName: regencyName,
			provinceId: provinceId,
			provinceName: provinceName,
			cityTagQris: cityTagQris,
			agentBankCode: agentBankCode,
			agentBankName: agentBankName,
			streetName: streetName,
			buildingName: buildingName
		)
	}
}

extension MerchantRegLocationDTO {
	func toEntity() -> MerchantRegLocationEntity {
		let entity = MerchantRegLocationEntity()
		entity.address = address
		entity.longitude = longitude
		entity.latitude = latitude
		entity.postalId = postalId
		entity.postalCode = postalCode
		entity.villageId = villageId
		entity.villageName = villageName
		entity.subdistrictId = subdistrictId
		entity.subdistrictName = subdistrictName
		entity.regencyId = regencyId
		entity.regencyName = regencyName
		entity.provinceId = provinceId
		entity.provinceName = provinceName
		entity.cityTagQris = cityTagQris
		entity.agentBankCode = agentBankCode
		entity.agentBankName = agentBankName
		entity.streetName = streetName
		entity.buildingName = buildingName

		return entity
	}
}

// MARK: - MerchantProductData Mapper
extension MerchantRegEdcEntity {
	func toDTO() -> MerchantRegEdcDataDTO {
		MerchantRegEdcDataDTO(
			businessName: businessName,
			selectedOwnershipStatus: selectedBusinessOwnershipStatus?.toMerchantRegLocalizedDTO(),
			selectedEdcFromAnotherBankOption: selectedHaveOtherEdcOption,
			edcIssuingInstitution: otherEdcInstitution,
			cashierTableCount: cashierTableCount,
			desiredEdcCount: desiredEdcCount,
			selectedEdcFacilities: selectedEdcFacilities?.map { $0.toMerchantRegLocalizedDTO() },
			productData: MerchantRegProductDataDTO(
				businessAddress: businessAddress?.toDTO(),
				selectedBusinessType: selectedBusinessType?.toDTO(),
				businessEstablishmentDate: businessEstablishmentDate,
				selectedBusinessLocation: selectedBusinessLocation?.toMerchantRegLocalizedDTO(),
				businessAverageMonthlyRevenue: businessAverageMonthlyRevenue,
				selectedReceiverOption: selectedReceiverOption,
				otherReceiverName: otherReceiverName,
				otherReceiverPhoneNumber: otherReceiverPhoneNumber
			),
			averageAmountPerTransaction: averageAmountPerTransaction,
			lowestItemPrice: lowestItemPrice,
			highestItemPrice: highestItemPrice
		)
	}
}

extension MerchantRegEddEntity {
	func toDTO() -> MerchantRegEddDataDTO {
		MerchantRegEddDataDTO(
			selectedSourceOfWealths: selectedSourceOfWealths?.map { $0.toMerchantRegLocalizedDTO() },
			residenceSinceDate: residenceSinceDate,
			hasAnotherBankOption: hasAnotherBankOption,
			bankOrInstitution: otherBankName,
			hasCountryRelationOption: hasCountryRelationOption,
			selectedCountryRelations: selectedCountryRelations,
			otherSourceOfWealth: otherSourceOfWealth
		)
	}
}

extension MerchantRegQrisEntity {
	func toDTO() -> MerchantRegQrisDataDTO {
		MerchantRegQrisDataDTO(
			productData: MerchantRegProductDataDTO(
				businessAddress: businessAddress?.toDTO(),
				selectedBusinessType: selectedBusinessType?.toDTO(),
				businessEstablishmentDate: businessEstablishmentDate,
				selectedBusinessLocation: selectedBusinessLocation?.toMerchantRegLocalizedDTO(),
				businessAverageMonthlyRevenue: businessAverageMonthlyRevenue,
				selectedReceiverOption: selectedReceiverOption,
				otherReceiverName: otherReceiverName,
				otherReceiverPhoneNumber: otherReceiverPhoneNumber
			),
			criteriaCode: criteriaCode,
			isUmi: isUmi,
			isHavingQris: isHavingQris,
			isScanningQris: isScanningQris,
			newQrisRequestData: newQrisRequestData?.toDTO(),
			otherQrisRequestData: otherQrisRequestData?.toDTO(),
			scannedQrisRequestData: scannedQrisRequestData?.toDTO()
		)
	}
}

extension MerchantRegQrisRequestDataEntity {
	func toDTO() -> MerchantRegQrisRequestDataDTO {
		MerchantRegQrisRequestDataDTO(
			nmid: nmid,
			merchantName: merchantName,
			stickerName: stickerName,
			isMultiSettlement: isMultiSettlement
		)
	}
}

extension MerchantRegProductEntity {
	func toDTO() -> MerchantRegProductDataDTO {
		MerchantRegProductDataDTO(
			businessAddress: businessAddress?.toDTO(),
			selectedBusinessType: selectedBusinessType?.toDTO(),
			businessEstablishmentDate: businessEstablishmentDate,
			selectedBusinessLocation: selectedBusinessLocation?.toMerchantRegLocalizedDTO(),
			businessAverageMonthlyRevenue: businessAverageMonthlyRevenue,
			selectedReceiverOption: selectedReceiverOption,
			otherReceiverName: otherReceiverName,
			otherReceiverPhoneNumber: otherReceiverPhoneNumber
		)
	}
}

extension MerchantRegProductDataDTO {
	func toEntity() -> MerchantRegProductEntity {
		let entity = MerchantRegProductEntity()
		entity.businessAddress = businessAddress?.toEntity()
		entity.selectedBusinessType = selectedBusinessType?.toEntity()
		entity.businessEstablishmentDate = businessEstablishmentDate
		entity.selectedBusinessLocation = selectedBusinessLocation?.toEntity()
		entity.businessAverageMonthlyRevenue = businessAverageMonthlyRevenue
		entity.selectedReceiverOption = selectedReceiverOption
		return entity
	}
}

extension MerchantRegEdcDataDTO {
	func toEntity() -> MerchantRegEdcEntity {
		let entity = MerchantRegEdcEntity()
		entity.businessName = businessName
		entity.selectedBusinessType = productData?.selectedBusinessType?.toEntity()
		entity.selectedBusinessOwnershipStatus = selectedOwnershipStatus?.toEntity()
		entity.businessEstablishmentDate = productData?.businessEstablishmentDate
		entity.selectedBusinessLocation = productData?.selectedBusinessLocation?.toEntity()
		entity.selectedHaveOtherEdcOption = selectedEdcFromAnotherBankOption
		entity.otherEdcInstitution = edcIssuingInstitution

		entity.businessAverageMonthlyRevenue = productData?.businessAverageMonthlyRevenue
		entity.averageAmountPerTransaction = averageAmountPerTransaction
		entity.lowestItemPrice = lowestItemPrice
		entity.highestItemPrice = highestItemPrice

		entity.cashierTableCount = cashierTableCount
		entity.desiredEdcCount = desiredEdcCount
		entity.selectedEdcFacilities = selectedEdcFacilities?.map { $0.toEntity() }

		entity.businessAddress = productData?.businessAddress?.toEntity()
		entity.selectedReceiverOption = productData?.selectedReceiverOption
		entity.otherReceiverName = productData?.otherReceiverName
		entity.otherReceiverPhoneNumber = productData?.otherReceiverPhoneNumber

		return entity
	}
}

extension MerchantRegEddDataDTO {
	func toEntity() -> MerchantRegEddEntity {
		let entity = MerchantRegEddEntity()

		entity.selectedSourceOfWealths = selectedSourceOfWealths?.map { $0.toEntity() }
		entity.residenceSinceDate = residenceSinceDate
		entity.hasAnotherBankOption = hasAnotherBankOption
		entity.otherBankName = bankOrInstitution
		entity.hasCountryRelationOption = hasCountryRelationOption
		entity.selectedCountryRelations = selectedCountryRelations
		entity.otherSourceOfWealth = otherSourceOfWealth

		return entity
	}
}

extension MerchantRegQrisDataDTO {
	func toEntity() -> MerchantRegQrisEntity {
		let entity = MerchantRegQrisEntity()
		entity.businessAddress = productData?.businessAddress?.toEntity()
		entity.selectedBusinessType = productData?.selectedBusinessType?.toEntity()
		entity.businessEstablishmentDate = productData?.businessEstablishmentDate
		entity.selectedBusinessLocation = productData?.selectedBusinessLocation?.toEntity()
		entity.businessAverageMonthlyRevenue = productData?.businessAverageMonthlyRevenue
		entity.criteriaCode = criteriaCode
		entity.isUmi = isUmi
		entity.newQrisRequestData = newQrisRequestData?.toEntity()
		entity.otherQrisRequestData = otherQrisRequestData?.toEntity()
		entity.scannedQrisRequestData = scannedQrisRequestData?.toEntity()
		entity.isHavingQris = isHavingQris
		entity.isScanningQris = isScanningQris ?? false
		
		entity.selectedReceiverOption = productData?.selectedReceiverOption
		entity.otherReceiverName = productData?.otherReceiverName
		entity.otherReceiverPhoneNumber = productData?.otherReceiverPhoneNumber

		return entity
	}
}

extension MerchantRegQrisRequestDataDTO {
	func toEntity() -> MerchantRegQrisRequestDataEntity {
		let entity = MerchantRegQrisRequestDataEntity()
		entity.nmid = nmid
		entity.merchantName = merchantName
		entity.stickerName = stickerName
		entity.isMultiSettlement = isMultiSettlement ?? true

		return entity
	}
}

// MARK: - Category & Reference Mapper
extension MerchantRegCategoryEntity {
	func toDTO() -> MerchantRegCategoryDTO {
		MerchantRegCategoryDTO(
			contentId: contentId,
			content: content.toMerchantRegLocalizedDTO(),
			isHighRiskBased: isHighRiskBased,
			isProfessionalLicense: isProfessionalLicense
		)
	}
}

extension MerchantRegCategoryDTO {
	func toEntity() -> MerchantRegCategoryEntity {
		let entity = MerchantRegCategoryEntity()
		entity.contentId = contentId ?? ""
		entity.content = content?.toEntity() ?? LocalizableEntity()
		entity.isHighRiskBased = isHighRiskBased ?? false
		entity.isProfessionalLicense = isProfessionalLicense ?? false

		return entity
	}
}

extension MerchantRegLocalizedDTO {
	func toEntity() -> LocalizableEntity {
		LocalizableEntity(code: id ?? "", indonesian: indonesian ?? "", english: english ?? "")
	}
}

extension LocalizableEntity {
	func toMerchantRegLocalizedDTO() -> MerchantRegLocalizedDTO {
		MerchantRegLocalizedDTO(id: code, indonesian: indonesian, english: english)
	}
}

// MARK: - MerchantSubmitData Mapper
extension MerchantRegSubmitDataEntity {
	func toDTO() -> MerchantRegSubmitDataDTO {
		MerchantRegSubmitDataDTO(
			referralCode: referralCode,
			selectedAccount: selectedAccount?.toDTO(),
			selectedNpwpOption: selectedNpwpOption,
			selectedNpwpReasonOption: selectedNpwpReasonOption,
			npwpNumber: npwpNumber,
			selectedStatusNpwp: selectedStatusNpwp,
			registeredNpwpDate: registeredNpwpDate,
			npwpBase64Image: npwpBase64Image,
			selectedPhoneNumber: selectedPhoneNumber?.toDTO(),
			selectedAdditionalPhoneNumberOption: selectedAdditionalPhoneNumberOption,
			additionalBusinessPhoneNumber: additionalBusinessPhoneNumber,
			productType: productType?.rawValue,
			edcData: edcData?.toDTO(),
			qrisData: qrisData?.toDTO(),
			eddData: eddData?.toDTO()
		)
	}
}

extension MerchantRegSubmitDataDTO {
	func toEntity() -> MerchantRegSubmitDataEntity {
		let entity = MerchantRegSubmitDataEntity()
		entity.referralCode = referralCode
		entity.selectedAccount = selectedAccount?.toEntity()
		entity.selectedNpwpOption = selectedNpwpOption
		entity.selectedNpwpReasonOption = selectedNpwpReasonOption
		entity.npwpNumber = npwpNumber
		entity.selectedStatusNpwp = selectedStatusNpwp
		entity.registeredNpwpDate = registeredNpwpDate
		entity.npwpBase64Image = npwpBase64Image
		entity.selectedPhoneNumber = selectedPhoneNumber?.toEntity()
		entity.selectedAdditionalPhoneNumberOption = selectedAdditionalPhoneNumberOption
		entity.additionalBusinessPhoneNumber = additionalBusinessPhoneNumber
		entity.productType = MerchantRegProductType(rawValue: productType ?? "")
		entity.edcData = edcData?.toEntity()
		entity.qrisData = qrisData?.toEntity()
		entity.eddData = eddData?.toEntity()
		return entity
	}
}

// MARK: - MerchantPrepareData Mapper
extension MerchantRegPrepareDataEntity {
	func toDTO() -> MerchantRegPrepareDataDTO {
		MerchantRegPrepareDataDTO(
			accounts: accounts.map { $0.toDTO() },
			phoneNumbers: phoneNumbers.map { $0.toDTO() },
			maskedEmail: maskedEmail,
			npwp: npwp.toDTO(),
			isHighRisk: isHighRisk,
			product: product?.toDTO()
		)
	}
}

extension MerchantRegPrepareDataDTO {
	func toEntity() -> MerchantRegPrepareDataEntity {
		let entity = MerchantRegPrepareDataEntity()
		entity.accounts = accounts.map { $0.toEntity() }
		entity.phoneNumbers = phoneNumbers.map { $0.toEntity() }
		entity.maskedEmail = maskedEmail
		entity.npwp = npwp.toEntity()
		entity.product = product?.toEntity()
		entity.isHighRisk = isHighRisk ?? false
		return entity
	}
}

extension MerchantRegPrepareProductEntity {
	func toDTO() -> MerchantRegPrepareProductDTO {
		MerchantRegPrepareProductDTO(
			categories: categories?.map { $0.toDTO() },
			ownershipStatus: ownershipStatus?.map { $0.toMerchantRegLocalizedDTO() },
			locationTypes: locationTypes?.map { $0.toMerchantRegLocalizedDTO() },
			facilities: facilities?.map { $0.toMerchantRegLocalizedDTO() }
		)
	}
}

extension MerchantRegPrepareProductDTO {
	func toEntity() -> MerchantRegPrepareProductEntity {
		let entity = MerchantRegPrepareProductEntity()
		entity.categories = categories?.map { $0.toEntity() }
		entity.ownershipStatus = ownershipStatus?.map { $0.toEntity() }
		entity.locationTypes = locationTypes?.map { $0.toEntity() }
		entity.facilities = facilities?.map { $0.toEntity() }
		return entity
	}
}

// MARK: - Merchant Mapper
extension MerchantRegEntity {
	func toDTO() -> MerchantRegDTO {
		MerchantRegDTO(
			epoch: epoch,
			screenStack: screenStack,
			prepareData: prepareData?.toDTO(),
			submitData: submitData?.toDTO()
		)
	}
}

extension MerchantRegDTO {
	func toEntity() -> MerchantRegEntity {
		let entity = MerchantRegEntity()
		entity.epoch = epoch ?? 0.0
		entity.screenStack = screenStack ?? []
		entity.prepareData = prepareData?.toEntity()
		entity.submitData = submitData?.toEntity()
		return entity
	}
}

extension MerchantRegNpwpDTO {
	func toEntity() -> MerchantRegNpwpEntity {
		let entity = MerchantRegNpwpEntity()
		entity.status = status ?? ""
		entity.maskedNumber = maskedNumber ?? ""
		entity.isVerified = isVerified ?? false
		return entity
	}
}

// MARK: - Account & Phones Extensions
extension Core.AccountEntity {
	func toDTO() -> MerchantRegAccountDTO {
		MerchantRegAccountDTO(
			name: name,
			number: accountNumber,
			formattedNumber: formattedNumber,
			typeName: type?.description ?? "",
			typeCode: type?.code ?? "",
			currencyCode: currency.code,
			formattedTypeName: type?.description ?? ""
		)
	}
}

extension MerchantRegAccountDTO {
	func toEntity() -> Core.AccountEntity {
		let entity = Core.AccountEntity()
		entity.name = name ?? ""
		entity.accountNumber = number ?? ""
		entity.formattedNumber = formattedNumber ?? ""
		entity.currency.code = currencyCode ?? ""
		entity.type = AccountTypeEntity(code: typeCode ?? "", description: formattedTypeName ?? "")
		return entity
	}
}

extension PhonesEntity {
	func toDTO() -> MerchantRegPhoneNumberDTO {
		MerchantRegPhoneNumberDTO(id: phoneId, number: maskedPhoneNumber)
	}
}

extension MerchantRegPhoneNumberDTO {
	func toEntity() -> PhonesEntity {
		PhonesEntity(maskedPhoneNumber: number, phoneId: id)
	}
}

extension MerchantRegNpwpEntity {
	func toDTO() -> MerchantRegNpwpDTO {
		MerchantRegNpwpDTO(maskedNumber: maskedNumber, status: status, isVerified: isVerified)
	}
}
