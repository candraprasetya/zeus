___FILEHEADER___

import Core

let k___FILEBASENAME___ = "___FILEBASENAME___"

final class ___FILEBASENAME___: ScreenV2<<#Input#>> {

    override var identifier: String {
        return k___FILEBASENAME___
    }

    override func build() -> ViewController {
        return generateSwiftUIViewController(
            withView: <#View#>
        )
    }
}