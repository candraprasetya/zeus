# TEMPLATE: IMPLEMENTATION PLAN (PRE-DEV BLUEPRINT)
# Status: PENDING_REVIEW
# Target Module: {{MODULE_NAME}}
# Architecture: Clean Architecture MVVM-C with Swinject DI
# OKF Knowledge Node: {{OKF_NODE_PATH}}

---

## 1. Presentation Layer & UI Specification (Assigned: zeus-presentation)

### 1.1 Coordinator & Navigation Flow
- **Coordinator**: `Presentation/Coordinators/{{FEATURE_NAME}}Coordinator.swift`
- **Route Identifiers**:
  - `{{ROUTE_IDENTIFIER}}` -> Navigasi ke {{SCREEN_DESCRIPTION}}
- **Navigation Dispatch**:
  - Event `toPreviousScreen()` -> `navigationEvent.send(.previous(nil))` via Coordinator.

### 1.2 Scenes Breakdown (Pola 4-File per Scene)

#### Scene: {{SCENE_NAME}} (`Presentation/Scenes/{{SCENE_NAME}}/`)
1. **`{{SCENE_NAME}}Screen.swift`**:
   - Subclass: `ScreenV2<NavigationObject>`
   - Identifier: `public let k{{SCENE_NAME}}Screen = "{{SCENE_NAME}}Screen"`
   - Controller Builder: `generateSwiftUIViewController(withView: ..., disableSwipeBack: true, backgroundType: .onBoarding)`
2. **`{{SCENE_NAME}}View.swift`**:
   - Subclass: `BaseMutableStateView, BaseNavigationView`
   - Navigation Bar: `CloveUI.NavigationBarStyle.titleOnly(title: "{{NAV_BAR_TITLE}}")`
   - Components (CloveUI): `CloveButton`, `CloveBadge`, `CloveText`, `CloveEmptyStateCard`
3. **`{{SCENE_NAME}}ViewModel.swift`**:
   - Subclass: `BaseMutableStateViewModel`
   - Observable States: `@Published var processStates = [ProcessState]()`, `@Published var model: {{SCENE_NAME}}Model`
   - Subscriptions: `DisposeBag (RxSwift)`
4. **`{{SCENE_NAME}}Model.swift`**:
   - Structures: `var status: {{FEATURE_NAME}}StatusType?`, `var referenceNumber: String?`

---

## 2. Domain Layer & Pure Business Rules (Assigned: zeus-domain)

### 2.1 Pure Entities (`Domain/Entities/`)
- **`{{ENTITY_NAME}}.swift`**:
  - Properties: `screenStack: [String]`, `id: String?`, `validationTimestamp: Int64`
  - Invariant: 100% Pure Swift, zero UIKit/SwiftUI/Framework dependency.

### 2.2 Repository Protocol (`Domain/Repository/`)
- **`{{REPOSITORY_NAME}}.swift`**:
  - Functions: `func fetchStatus(id: String) -> Single<{{ENTITY_NAME}}>`

---

## 3. Data Layer & Swinject DI Integration (Assigned: zeus-data)

### 3.1 Remote DTO Models (`Data/Sources/Remote/`)
- **`{{RESPONSE_DTO_NAME}}.swift`**: Decodable Swagger API response mapping.
- **`{{REQUEST_DTO_NAME}}.swift`**: Encodable request payload mapping.

### 3.2 Repository Implementation (`Data/Repository/`)
- **`{{REPOSITORY_NAME}}Impl.swift`**:
  - DTO to Entity mapper.
  - Network error translation from error matrix to `Core.NetworkError`.

### 3.3 Dependency Injection Container (`DI/{{FEATURE_NAME}}DIManager.swift`)
- Swinject Registration:
  ```swift
  public final class {{FEATURE_NAME}}DIManager {
      public static let repositoryInjection: Container = {
          let container = Container()
          container.register({{REPOSITORY_NAME}}.self) { resolver in
              {{REPOSITORY_NAME}}Impl(remoteDataSource: resolver.resolve(RemoteDataSource.self)!)
          }
          return container
      }()
  }
  ```

---

## 4. Quality & Anti-Slop Verification Checklist (Assigned: zeus-antislop)

- [ ] Seluruh file Screen mewarisi `ScreenV2<NavigationObject>` dan identifier berawalan `k`.
- [ ] View mengadopsi `BaseMutableStateView` dan 100% menggunakan token resmi `CloveUI`.
- [ ] Teks user-facing wajib melalui `StringRes.<key>.localizedString` (bebas hardcoded string).
- [ ] Domain layer 100% bebas framework UI maupun Network SDK.
- [ ] Seluruh dependensi terdaftar bersih pada Swinject DI Container.
- [ ] Tidak ada komentar AI generik / placeholder tak terpakai.

**Sign-off Gate Approval:**
- Developer Confirmed: `[ ] Approved`
- Tech Lead Confirmed: `[ ] Approved`
- Execution Command: `mage run zeus-orchestrator --proceed`
