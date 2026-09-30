//
//  MerchantRegQRISDetailFormModel.swift
//  Merchant
//
//  Created by ITBCA on 24/06/26.
//

struct MerchantRegQRISDetailFormModel {
	var nmid = ""
	var nmidErrorMessage = ""
	var merchantName = ""
	var merchantNameErrorMessage = ""
	var qrisStickerName = ""
	var qrisStickerNameErrorMessage = ""
	
	var businessCategory = ""
	var isUmi = false
	var isHavingQris = false
	var isScannedQris = false
	var isScanQrisInvalidExceedThreshold = false
	var isMultiSettlement = true
	
}
