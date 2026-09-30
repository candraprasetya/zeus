//
//  MerchantRegParseQRISModel.swift
//  Merchant
//
//  Created by ITBCA on 26/06/26.
//

struct MerchantRegParseQRISModel {
	let nmid: String
	let merchantName: String
}

struct MerchantRegParseQRISError: Error {
	let type: MerchantRegParseQRISErrorType
}

enum MerchantRegParseQRISErrorType {
	case general
	case invalidQris
}
