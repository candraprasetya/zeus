
//  MerchantRegVillageSelectionModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 05/05/26.
//

import Core

struct MerchantRegVillageSelectionModel {
	// MARK: - Data for logical processes
	var searchText = ""
	var currentPage = 1
	var maxPage = 1
	var village = [MerchantRegLocationModel]()

	// MARK: - Callbacks
	var onVillageSelected: ((MerchantRegLocationModel) -> Void)?
	var onDismiss: (() -> Void)?
	var isLoadingMore = false
}

struct MerchantRegLocationModel {
	var postalId = ""
	var postalCode = ""
	var villageId = ""
	var villageName = ""
	var subdistrictId = ""
	var subdistrictName = ""
	var regencyId = ""
	var regencyName = ""
	var provinceId = ""
	var provinceName = ""
	var cityTagQris = ""
	var agentBankCode = ""
	var agentBankName = ""
}
