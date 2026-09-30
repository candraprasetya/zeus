//
//  MerchantRegRepository.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

import RxSwift

public protocol MerchantRegRepository {
	func prepare() async throws -> MerchantRegEntity
	func inquiryStatus() async throws -> MerchantRegEntity
	func prepareProduct(type: MerchantRegProductType) async throws -> MerchantRegPrepareProductEntity
	func inquiryVillage(data: MerchantRegVillageEntity) async throws -> MerchantRegVillageEntity
	func validateMerchant(data: MerchantRegQrisEntity) async throws -> MerchantRegQrisEntity
	func validateQris(nmid: String?, stickerName: String?) async throws -> Void
	func inquiryProductInfo(type: MerchantRegProductInfoType) async throws -> MerchantRegProductInfoEntity
	func saveLocalData(data: MerchantRegEntity) async throws
	func loadLocalData() async throws -> MerchantRegEntity
	func deleteLocalMerchantData() async throws
	func prepareEdd() async throws -> MerchantRegPrepareEddEntity
//	func uploadFile(data: MerchantEntity) async throws -> MerchantEntity
}
