___FILEHEADER___

import Core
import RxSwift

final class ___FILEBASENAME___: BaseMutableStateViewModel {
    @Published var processStates = [ProcessState]()
    @Published var model: <#FeatureName#>Model

    var navigationEvent = Core.NavigationEvent()
    var disposeBag = DisposeBag()

    init(model: <#FeatureName#>Model) {
        self.model = model
    }

    func toPreviousScreen() {
        navigationEvent.send(.previous(nil))
    }
}
