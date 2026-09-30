//
//  MerchantRegDIManager.swift
//  Merchant
//
//  Created by Candra Prasetya on 30/03/26.
//

import Swinject

public final class MerchantRegDIManager {
	public static let merchantRepositoryInjection: Container = {
		let container = Container()

		container.register(MerchantRegRepository.self) { _ in
			MerchantRepositoryImpl()
		}

		return container
	}()
}
