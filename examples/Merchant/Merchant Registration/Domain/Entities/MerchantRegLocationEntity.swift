//
//  MerchantRegLocationEntity.swift
//  Merchant
//
//  Created by Candra Prasetya on 10/05/26.
//

public class MerchantRegLocationEntity {
	public var address: String?
	public var longitude: String?
	public var latitude: String?
	public var postalId: String?
	public var postalCode: String?
	public var villageId: String?
	public var villageName: String?
	public var subdistrictId: String?
	public var subdistrictName: String?
	public var regencyId: String?
	public var regencyName: String?
	public var provinceId: String?
	public var provinceName: String?
	public var cityTagQris: String?
	public var agentBankCode: String?
	public var agentBankName: String?
	public var streetName: String?
	public var buildingName: String?

	public init() {} // public access for instantiation
}

public class MerchantRegVillageEntity {
	public var keyword: String?
	public var villages: [MerchantRegLocationEntity]?
	public var maxPage = 0
	public var currentPage = 0

	public init() {} // public access for instantiation
}
