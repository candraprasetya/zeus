//
//  String + Localized.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

import CloveUI
import Localize_Swift
import SwiftUI

extension String {
	var localized: String {
		return self.localized(in: Merchant.bundle)
	}
}
