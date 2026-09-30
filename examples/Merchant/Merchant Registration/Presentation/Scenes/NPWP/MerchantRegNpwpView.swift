
//  MerchantRegNpwpView.swift
//  Merchant
//
//  Created by Candra Prasetya on 26/04/26.
//

import CloveUI
import CloveUILib
import Core
import Localize_Swift
import SharedI18nRes
import StandardLibrary
import SwiftUI

struct MerchantRegNpwpView: BaseMutableStateView, BaseNavigationView {
	// MARK: - Properties
	var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(
		title: StringRes.merchant_npwp_npwp_number.localizedString
	)
	
	@ObservedObject var viewModel: MerchantRegNpwpViewModel
	@FocusState var fieldFocus: String?
	
	private let recurringStatusTitleOptions = [
		StringRes.merchant_npwp_status_individual.localizedString,
		StringRes.merchant_npwp_status_spouse.localizedString
	]
	
	// MARK: - Initialization
	init(viewModel: MerchantRegNpwpViewModel) {
		self.viewModel = viewModel
	}
	
	// MARK: - Body
	var body: some View {
		WhiteRoundedBackgroundView {
			constructContainerView {
				ScrollView {
					VStack(spacing: 0) {
						if !viewModel.model.capturedImageBase64.isEmpty {
							constructNpwpImageSection()
						}
						constructNpwpFormContent()
						if viewModel.model.npwpNumber.isEmpty {
							constructConfirmationCheckbox()
						}
						constructActionButton()
						Spacer()
					}
				}
				.disableBounce(in: Self.self)
			}
			.overlay(Color.clear.valueChanged(value: viewModel.model.bottomSheetIsPresented) { newValue in
				if newValue {
					BottomSheetController.shared.present(contructBirthdatePicker())
				} else {
					BottomSheetController.shared.dismiss()
				}
			})
			.overlay(
				CloveUILib.CloveBottomSheetView(
					isPresented: $viewModel.model.bottomSheetNpwpStatusIsPresented,
					title: StringRes.merchant_npwp_npwp_status.localizedString,
					data: .singleLabel(recurringStatusTitleOptions),
					onSelection: { idx in
						UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
						viewModel.model.statusNpwpValue = recurringStatusTitleOptions[idx]
					}
				), alignment: .bottom
			)
			.onLoad {
				viewModel.prepareLocalData()
			}
		}
	}
	
	// MARK: - Section Views
	private func constructNpwpImageSection() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.large.spacing) {
			constructNpwpImagePreview()
		}
		.padding(length: .large)
	}
	
	private func constructNpwpImagePreview() -> some View {
		ZStack(alignment: .bottomTrailing) {
			constructImagePreview()
			constructRetakeButton()
		}
	}
	
	@ViewBuilder
	private func constructImagePreview() -> some View {
		let displayImage: UIImage? = {
			if let image = viewModel.model.capturedImage {
				return image
			} else if !viewModel.model.capturedImageBase64.isEmpty {
				return viewModel.loadImageFromBase64(viewModel.model.capturedImageBase64)
			}
			return nil
		}()
		
		if let image = displayImage {
			Color.clear
				.aspectRatio(MerchantRegCameraOverlayAspectRatio.idCard, contentMode: .fit)
				.frame(maxWidth: .infinity)
				.overlay(
					Image(uiImage: image)
						.resizable()
						.scaledToFill()
				)
				.clipShape(RoundedRectangle(cornerRadius: 12))
		}
	}
	
	private func constructRetakeButton() -> some View {
		Button(action: viewModel.retakePhoto) {
			HStack(spacing: CloveUISpacing.xSmall.spacing) {
				Image("camera")
				
				Text(StringRes.merchant_common_button_retake_photo.localizedString)
					.font(CloveUITypography.body.medium.asSwiftUIFont())
			}
			.padding(.leading, length: .xSmall)
			.padding(.trailing, length: .medium)
			.padding(.vertical, CloveUISpacing.xSmall.spacing)
			.background(
				Rectangle()
					.fill(Color.black.opacity(0.6))
					.cornerRadius(8, corners: .topLeft)
					.cornerRadius(12, corners: .bottomRight)
			)
			.foregroundColor(.white)
		}
	}
	
	private func constructNpwpFormContent() -> some View {
		VStack(
			alignment: .leading,
			spacing: viewModel.model.capturedImageBase64.isEmpty ? CloveUISpacing.xLarge.spacing : CloveUISpacing.large.spacing
		) {
			if viewModel.model.capturedImageBase64.isEmpty {
				constructDisplayOnly(title: StringRes.merchant_npwp_npwp_number.localizedString, value: viewModel.model.npwpNumber)
				constructDisplayOnly(title: StringRes.merchant_npwp_npwp_status.localizedString, value: viewModel.model.statusNpwp)
			} else {
				constructNpwpNumberField()
				constructStatusNpwpField()
			}
			constructTanggalTerdaftarField()
		}
		.padding(length: .large)
	}
	
	private func constructNpwpNumberField() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_npwp_npwp_number.localizedString,
				textfieldValue: $viewModel.model.npwpNumberValue,
				textfieldType: .withoutIcon,
				regex: .numeric,
				allowsLeadingSpace: false,
				maxLength: 16,
				errorMessage: $viewModel.model.npwpNumberErrorText,
				helperText: StringRes.merchant_npwp_npwp_subtext.localizedString,
				isFocus: $fieldFocus,
				keyboard: .numberPad,
				validateInput: viewModel.validateNpwpNumber
			)
		}
	}
	
	private func constructStatusNpwpField() -> some View {
		CloveUILib.CloveTextFieldView(
			textfieldTitle: StringRes.merchant_npwp_npwp_status.localizedString,
			textfieldValue: $viewModel.model.statusNpwpValue,
			textfieldType: .selectable(
				icon: .image(
					Image("ArrowRight", bundle: Bundle(identifier: CloveUI.bundleID)),
					iconColor: .primary10
				),
				onTapped: viewModel.openStatusSelection
			),
			errorMessage: $viewModel.model.statusNpwpErrorText,
			isFocus: $fieldFocus
		)
	}
	
	private func constructDisplayOnly(title: String, value: String) -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: title,
				style: CloveUITypography.title.small
			)
			.foregroundColor(CloveUIColor.primary10.swiftUIColor)
			
			CloveText(
				text: value,
				style: CloveUITypography.body.large
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
		}
	}
	
	private func constructTanggalTerdaftarField() -> some View {
		VStack(alignment: .leading, spacing: CloveUISpacing.xSmall.spacing) {
			CloveUILib.CloveTextFieldView(
				textfieldTitle: StringRes.merchant_npwp_registration_date.localizedString,
				textfieldValue: $viewModel.model.registeredDate,
				textfieldType: .selectable(
					icon: .image(
						Image("CalendarOutline", bundle: Bundle(identifier: CloveUI.bundleID)),
						iconColor: .dark20
					),
					onTapped: viewModel.openDatePicker
				),
				errorMessage: $viewModel.model.registeredDateErrorText,
				isFocus: $fieldFocus
			)
			
			HStack(spacing: 2) {
				CloveText(
					text: StringRes.merchant_npwp_how_to_check_date.localizedString,
					style: CloveUITypography.body.small
				)
				.foregroundColor(CloveUIColor.dark10.swiftUIColor)
				
				CloveText(
					text: StringRes.merchant_common_here.localizedString,
					style: CloveUITypography.subtitle.small
				)
				.foregroundColor(CloveUIColor.secondary30.swiftUIColor)
				.onTap {
					MerchantRegPopUp.shared.createPopUpView(view: popUpNPWPInfo()).showPopUpView()
				}
			}
		}
	}
	
	private func constructConfirmationCheckbox() -> some View {
		HStack(spacing: CloveUISpacing.small.spacing) {
			CloveCheckBoxViewV2(
				state: viewModel.model.isConfirmationChecked,
				onStateChange: viewModel.updateCheckBoxState
			)
			
			CloveText(
				text: StringRes.merchant_npwp_tickmark_validation.localizedString,
				style: CloveUITypography.body.small
			)
			.foregroundColor(CloveUIColor.dark20.swiftUIColor)
			.multilineTextAlignment(.leading)
			.frame(maxWidth: .infinity, alignment: .leading)
		}
		.padding([.horizontal, .bottom], length: .large)
	}
	
	private func constructActionButton() -> some View {
		CloveButtonViewV2(
			type: .textOnly(textId: StringRes.general_button_save.localizedString),
			enabled: viewModel.isButtonEnabled(),
			layout: .stretch,
			onClick: viewModel.saveMerchantData
		)
		.padding([.bottom, .horizontal], length: .large)
	}
	
	private func popUpNPWPInfo() -> some View {
		VStack(spacing: CloveUISpacing.xSmall.spacing) {
			CloveText(
				text: StringRes.merchant_npwp_popup_title.localizedString,
				style: CloveUITypography.title.large
			)
			.foregroundColor(CloveUIColor.primary20.swiftUIColor)
			.multilineTextAlignment(.leading)
			.frame(maxWidth: .infinity, alignment: .leading)
			
			Image("NpwpRegisteredDate", bundle: Bundle(identifier: Merchant.bundleId))
				.resizable()
				.aspectRatio(contentMode: .fit)
				.frame(maxWidth: .infinity)
			
			VStack(alignment: .leading, spacing: CloveUISpacing.xxSmall.spacing) {
				ForEach(viewModel.model.popUpContent, id: \.self) { detail in
					HStack(alignment: .top, spacing: CloveUISpacing.xxSmall.spacing) {
						CloveText(
							text: "•",
							style: CloveUITypography.title.small
						)
						.foregroundColor(CloveUIColor.dark20.swiftUIColor)
						.multilineTextAlignment(.leading)
						
						Text(html: detail, baseFont: CloveUITypography.body.small.asUIFont())
							.foregroundColor(CloveUIColor.dark20.swiftUIColor)
							.multilineTextAlignment(.leading)
					}
					.frame(maxWidth: .infinity, alignment: .leading)
				}
			}
			
			CloveButtonViewV2(
				type: .textOnly(textId: StringRes.general_button_ok.localizedString),
				layout: .stretch,
				size: .medium,
				onClick: { MerchantRegPopUp.shared.dismissPopUp() }
			)
			.padding(.top, length: .medium)
		}
	}
	
	private func contructBirthdatePicker() -> some View {
		ZStack(alignment: .bottom) {
			Color.black.opacity(0.25)
				.edgesIgnoringSafeArea(.all)
				.onTapGesture {
					withAnimation(.easeInOut) {
						viewModel.model.bottomSheetIsPresented = false
					}
				}
			
			VStack(spacing: 0) {
				Divider()
				HStack(spacing: 0) {
					Spacer()
					Button(action: {
						withAnimation(.easeInOut) {
							viewModel.selectDate()
						}
					}
					) {
						Text(StringRes.general_button_done.localizedString)
							.foregroundColor(Color(.systemBlue))
							.font(.system(size: 17, weight: .semibold))
					}
				}
				.padding(.horizontal, length: .medium)
				.padding(.vertical, length: .small)
				.background(Color(.secondarySystemBackground))
				
				Divider()
				
				DatePicker(
					"",
					selection: $viewModel.model.selectedDate,
					in: ...Date(),
					displayedComponents: .date
				)
				.datePickerStyle(WheelDatePickerStyle())
				.environment(\.locale, Locale(identifier: Localize.currentLanguage()))
				.labelsHidden()
				.frame(maxWidth: .infinity)
				.padding(.vertical, length: .xSmall)
			}
			.frame(maxWidth: .infinity)
			.background(Color(.systemBackground))
			.transition(.move(edge: .bottom))
			.animation(.easeInOut, value: viewModel.model.bottomSheetIsPresented)
		}
		.frame(maxWidth: .infinity, maxHeight: .infinity)
	}
	
	// MARK: - Navigation
	func leftButtonTap() {
		viewModel.toPreviousScreen()
	}
	
	// MARK: - Container View
	private func constructContainerView(@ViewBuilder content: @escaping () -> some View) -> some View {
		let loadProcessIds = [viewModel.loadMerchantDataProcessId]
		let actionProcessIds = [viewModel.saveMerchantDataProcessId, viewModel.uploadDocumentProcessId]
		let allProcessIds = loadProcessIds + actionProcessIds
		
		return constructErrorContainerView(forProcesses: allProcessIds) {
			constructLoaderContainerView(
				forProcesses: [LoadingState(id: actionProcessIds)],
				content: {
					constructErrorContainerView(
						forProcesses: loadProcessIds,
						errorLayoutPosition: .emptyScreen,
						content: {
							constructSpinnerContainerView(
								forProcesses: [LoadingState(id: loadProcessIds)],
								size: .large,
								theme: .light,
								content: content
							)
						}
					)
				}
			)
		}
	}
}
