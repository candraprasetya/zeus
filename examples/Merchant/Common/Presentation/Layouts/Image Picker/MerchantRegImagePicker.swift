//
//  MerchantRegImagePicker.swift
//  Merchant
//
//  Created by ITBCA on 23/06/26.
//

import PhotosUI
import SwiftUI
import UIKit
import UniformTypeIdentifiers

struct MerchantRegImagePicker: UIViewControllerRepresentable {
	@Environment(\.dismiss) private var dismiss
	
	var allowedExtensions: [String] = ["jpg", "jpeg", "png", "heic", "heif"]
	var onImagePicked: (UIImage, String?) -> Void
	var onInvalidFormat: (() -> Void)? = nil
	
	func makeCoordinator() -> Coordinator {
		Coordinator(self)
	}
	
	func makeUIViewController(context: Context) -> PHPickerViewController {
		var configuration = PHPickerConfiguration()
		configuration.filter = .all(of: [
			.images,
			.not(.playbackStyle(.imageAnimated))
		])
		configuration.selectionLimit = 1
		
		let picker = PHPickerViewController(configuration: configuration)
		picker.delegate = context.coordinator
		return picker
	}
	
	func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}
	
	final class Coordinator: NSObject, PHPickerViewControllerDelegate {
		let parent: MerchantRegImagePicker
		
		init(_ parent: MerchantRegImagePicker) {
			self.parent = parent
		}
		
		func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
			parent.dismiss()
			
			guard let provider = results.first?.itemProvider else { return }
			
			provider.loadFileRepresentation(forTypeIdentifier: UTType.image.identifier) { [weak self] url, _ in
				guard let self else { return }
				
				var pickedImage: UIImage? = nil
				var fileName: String? = nil
				
				if let url {
					fileName = url.lastPathComponent
					let ext = (url.pathExtension).lowercased()
					
					if !ext.isEmpty, !parent.allowedExtensions.contains(ext) {
						DispatchQueue.main.async {
							self.parent.onInvalidFormat?()
						}
						return
					}
					
					if let data = try? Data(contentsOf: url) {
						pickedImage = UIImage(data: data)
					}
				}
				
				if let image = pickedImage {
					DispatchQueue.main.async {
						self.parent.onImagePicked(image, fileName)
					}
				} else if provider.canLoadObject(ofClass: UIImage.self) {
					provider.loadObject(ofClass: UIImage.self) { image, _ in
						if let image = image as? UIImage {
							DispatchQueue.main.async {
								self.parent.onImagePicked(image, fileName)
							}
						}
					}
				}
			}
		}
	}
}
