___FILEHEADER___

import CloveUI
import CloveUILib
import Core
import SwiftUI

struct ___FILEBASENAME___: BaseNavigationView {
    var navigationBarStyle = CloveUI.NavigationBarStyle.lightBackChevronWithTitle(title: "___FILEBASENAME____title".localized)

    @ObservedObject var viewModel: <#ViewModel#>

    init(viewModel: <#ViewModel#>) {
        self.viewModel = viewModel
    }

    var body: some View {
        WhiteRoundedBackgroundView {
            Text("Hello from ___FILEBASENAME___")
        }
    }

    func leftButtonTap() {
        navigationEvent.send(.previous(nil))
    }
}
