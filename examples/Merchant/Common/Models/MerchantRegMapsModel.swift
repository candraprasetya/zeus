//
//  MerchantMapsModel.swift
//  Merchant
//
//  Created by Candra Prasetya on 22/04/26.
//

import CoreLocation
import SharedI18nRes
import StandardLibrary

// MARK: - AddressResult
public struct MerchantRegAddressResult {
	public var placeId = ""
	public let displayName: String
	public let street: String
	public let district: String
	public let city: String
	public let province: String
	public let postalCode: String
	public let country: String
	public let latitude: Double
	public let longitude: Double
	
	public init(
		placeId: String = "",
		displayName: String = "",
		street: String = "",
		district: String = "",
		city: String = "",
		province: String = "",
		postalCode: String = "",
		country: String = "",
		latitude: Double = 0.0,
		longitude: Double = 0.0
	) {
		self.placeId = placeId
		self.displayName = displayName
		self.street = street
		self.district = district
		self.city = city
		self.province = province
		self.postalCode = postalCode
		self.country = country
		self.latitude = latitude
		self.longitude = longitude
	}
}

// MARK: - Maps Model
public struct MerchantRegMapsSearchResult: Identifiable {
	public let id = UUID()
	public let coordinate: CLLocationCoordinate2D?
	public let address: String
	public let placeID: String?
	
	public init(coordinate: CLLocationCoordinate2D?, address: String, placeID: String? = nil) {
		self.coordinate = coordinate
		self.address = address
		self.placeID = placeID
	}
}

public struct MerchantMapsModel {
	public var initialCoordinate: CLLocationCoordinate2D?
	public var address = ""
	public var addressResult: MerchantRegAddressResult?
	
	public var onLocationSelected: ((CLLocationCoordinate2D, String) -> Void)?
	public var onLocationSelectedWithResult: ((CLLocationCoordinate2D, String, MerchantRegAddressResult) -> Void)?
	public var onDismiss: (() -> Void)?
	
	public var searchText = ""
	public var isSearching = false
	public var errorMessage: String?
	public var searchResults = [MerchantRegMapsSearchResult]()
	public var hasSearched = false	
}
