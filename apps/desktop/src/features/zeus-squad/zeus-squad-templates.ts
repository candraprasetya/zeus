import type { SquadMemberTemplate } from "./zeus-squad";

export interface SkillCategoryDefinition {
  category: string;
  skills: readonly string[];
}

export const PREDEFINED_SKILL_CATEGORIES: readonly SkillCategoryDefinition[] = [
  {
    category: "Design & UX",
    skills: ["Design Tokens", "Compose", "SwiftUI", "Figma", "Tailwind", "User Flow", "Mermaid", "WCAG AAA"],
  },
  {
    category: "Mobile Native",
    skills: ["Kotlin", "Compose", "Hilt", "Room DB", "StateFlow", "Swift", "SwiftUI", "Concurrency", "Zeus Mobile MCP"],
  },
  {
    category: "Security & QA",
    skills: ["Gherkin", "Boundary", "Data Dictionary", "Unit Test", "OWASP MASVS", "PCI-DSS", "Pinning"],
  },
  {
    category: "Backend & Infra",
    skills: ["REST API", "GraphQL", "PostgreSQL", "Redis", "gRPC", "Docker", "GitHub Actions", "Fastlane", "CI/CD"],
  },
  {
    category: "Product & Data",
    skills: ["PRD", "User Story", "Roadmap", "SQL", "Analytics", "Telemetry"],
  },
] as const;

/**
 * Built-in specialty templates that users can pick from when adding a squad member.
 * These include UI Designer, UX Designer, QA, Mobile Devs, plus expanded roles
 * like Backend Engineer, DevOps / CI-CD, Product Manager, Security Auditor, and Data Analyst.
 */
export const SQUAD_BUILTIN_TEMPLATES: readonly SquadMemberTemplate[] = [
  {
    id: "template:ui-designer",
    name: "UI Designer",
    badge: "Design Tokens & System",
    description:
      "Converts wireframes and blueprints into scalable design tokens (Light/Dark themes), typography scales, 4/8pt spacing grids, and production-ready components for Compose & SwiftUI.",
    skills: ["Design Tokens", "Compose", "SwiftUI", "Figma", "Tailwind"],
    character: "iris",
    iconId: "palette",
    color: "#06b6d4",
    checklist: [
      "Zero hardcoded color values (Strict semantic tokens)",
      "Standardized typography scale (Display, Headline, Body, Caption)",
      "8pt/4pt Spacing & Radius grid system",
      "Vector assets & icon specs ready for import",
    ],
    samplePrompt:
      "Please generate semantic design tokens and component specs for Compose & SwiftUI for the following feature: ",
  },
  {
    id: "template:ux-designer",
    name: "UX Designer",
    badge: "User Flow & a11y",
    description:
      "Designs end-to-end customer journeys, interactive Mermaid flow diagrams, 5-state UI matrices (Shimmer, Empty, Offline 2G, Error, Populated), and enforces WCAG AAA accessibility compliance.",
    skills: ["User Flow", "Mermaid", "WCAG AAA", "Wireframing"],
    character: "athena",
    iconId: "person",
    color: "#8b5cf6",
    checklist: [
      "5 Interactive UI States (Shimmer, Populated, Empty, Offline, Error)",
      "Mermaid sequence and flowchart diagrams (Happy & negative branches)",
      "Minimum touch targets: 48x48dp (Android) & 44x44pt (iOS)",
      "Screen reader accessibility labels (a11y audit)",
    ],
    samplePrompt:
      "Design a customer journey flow and a 5-state interactive UI matrix with Mermaid diagrams for the following feature: ",
  },
  {
    id: "template:android-dev",
    name: "Android Dev",
    badge: "Android Native / Kotlin",
    description:
      "Specialist in Android Native Kotlin, Clean Architecture (Domain, Data, Presentation), Coroutines StateFlow, Hilt DI, Room DB, AndroidKeyStore encryption, and mobile device automation via Zeus Mobile MCP.",
    skills: ["Kotlin", "Compose", "Hilt", "Room DB", "StateFlow", "Zeus Mobile MCP"],
    character: "hermes",
    iconId: "bot",
    color: "#10b981",
    checklist: [
      "Clean Architecture layers (Domain / Data / Presentation)",
      "Jetpack Compose UI adhering to design system tokens",
      "Coroutines & StateFlow unidirectional data flow",
      "AndroidKeyStore & FLAG_SECURE window protection",
      "Automated testing execution via Zeus Mobile MCP (ADB/Emulator)",
    ],
    samplePrompt:
      "Implement an Android Native Kotlin module following Clean Architecture for the following feature: ",
  },
  {
    id: "template:ios-dev",
    name: "iOS Dev",
    badge: "iOS Native / SwiftUI",
    description:
      "Specialist in iOS Native Swift, Clean Architecture, SwiftUI declarative views, Swift Concurrency (async/await), Combine/Observation, Keychain Services, and iOS automation via Zeus Mobile MCP.",
    skills: ["Swift", "SwiftUI", "Concurrency", "Combine", "Keychain", "Zeus Mobile MCP"],
    character: "hephaestus",
    iconId: "bot",
    color: "#3b82f6",
    checklist: [
      "Clean Architecture layers (Domain / Data / Presentation)",
      "Declarative SwiftUI views with ThemeModifiers",
      "Swift Concurrency (async/await & structured task lifecycles)",
      "Keychain Services & background snapshot masking",
      "Automated test execution via Zeus Mobile MCP (Simulator/Device)",
    ],
    samplePrompt:
      "Implement an iOS Native SwiftUI module with Clean Architecture for the following feature: ",
  },
  {
    id: "template:qa-engineer",
    name: "QA Specialist",
    badge: "BDD & Data Dictionary",
    description:
      "Validates implementations against Data Dictionaries, authored BDD Gherkin test scenarios, boundary value testing, and resilient failure recovery paths.",
    skills: ["Gherkin", "Boundary", "Data Dictionary", "Unit Test", "Integration Test"],
    character: "apollo",
    iconId: "checks",
    color: "#f59e0b",
    checklist: [
      "Field & regex validation against the Data Dictionary",
      "BDD Gherkin scenarios (Given-When-Then)",
      "Boundary Value Testing (Zero balance, max thresholds, invalid characters)",
      "Timeout 504 & session expiration simulation",
    ],
    samplePrompt:
      "Write comprehensive BDD Gherkin test suites and test cases based on the Data Dictionary for the following feature: ",
  },
  {
    id: "template:security-auditor",
    name: "Security Checker",
    badge: "OWASP MASVS & PCI-DSS",
    description:
      "Performs security audits adhering to OWASP MASVS and banking PCI-DSS standards: Keystore/Keychain, Certificate Pinning, Anti-Root/Jailbreak, anti-tampering, and zero plain-text logging.",
    skills: ["MASVS", "Pinning", "Keystore", "OWASP MASVS", "PCI-DSS"],
    character: "artemis",
    iconId: "shield",
    color: "#ef4444",
    checklist: [
      "MASVS-STORAGE (Hardware Keystore/Keychain, no plaintext secrets)",
      "MASVS-CRYPTO (AES-GCM, Bcrypt $2b$, Argon2id)",
      "MASVS-NETWORK (TLS 1.3 & Certificate Pinning)",
      "Anti-Root / Jailbreak detection & sensitive memory wiping",
    ],
    samplePrompt:
      "Audit the security architecture, Keystore/Keychain protection, and MASVS compliance for the following code: ",
  },
  {
    id: "template:backend-engineer",
    name: "Backend Engineer",
    badge: "REST / GraphQL & Microservices",
    description:
      "Architects resilient backend APIs, relational database schemas (PostgreSQL), ACID transaction guarantees, OAuth2/mTLS authentication, and core service integrations.",
    skills: ["REST API", "GraphQL", "PostgreSQL", "Redis", "gRPC", "Docker"],
    character: "poseidon",
    iconId: "bot",
    color: "#0ea5e9",
    checklist: [
      "Idempotency keys for all transactional mutation endpoints",
      "Strict payload validation & SQL injection sanitization",
      "Rate limiting, encrypted structured logging & audit trails",
      "ACID isolation level compliance for ledger balances",
    ],
    samplePrompt:
      "Design the backend API architecture, PostgreSQL database migration schema, and OpenAPI documentation for: ",
  },
  {
    id: "template:devops-engineer",
    name: "DevOps Engineer",
    badge: "CI/CD & Infrastructure",
    description:
      "Automates build pipelines, testing workflows, automated APK/IPA code signing, staging/production artifact deployments, and release telemetry monitoring.",
    skills: ["GitHub Actions", "Docker", "Fastlane", "Kubernetes", "CI/CD"],
    character: "helios",
    iconId: "target",
    color: "#eab308",
    checklist: [
      "Lint, build, and automated test pipelines running on pull requests",
      "Automated release notes generation & semantic versioning",
      "Secure secrets management (zero credentials in repository)",
      "Automated mobile build distribution via Fastlane",
    ],
    samplePrompt:
      "Set up a GitHub Actions CI/CD pipeline and Fastlane scripts for automated build and release distribution for: ",
  },
  {
    id: "template:product-manager",
    name: "Product Manager",
    badge: "PRD & Product Scope",
    description:
      "Formulates comprehensive Product Requirement Documents (PRDs), user stories, measurable acceptance criteria, and prioritizes squad backlog based on customer impact.",
    skills: ["PRD", "User Story", "Roadmap", "Sprint Planning", "KPI Tracking"],
    character: "hera",
    iconId: "person",
    color: "#f43f5e",
    checklist: [
      "Clear problem statement and target persona definition",
      "User stories with Gherkin-formatted Acceptance Criteria",
      "MoSCoW priority matrix (Must, Should, Could, Won't)",
      "Measurable post-launch success metrics & KPIs",
    ],
    samplePrompt:
      "Create a comprehensive Product Requirement Document (PRD) with user stories and acceptance criteria for: ",
  },
  {
    id: "template:data-analyst",
    name: "Data Analyst",
    badge: "Analytics & Telemetry",
    description:
      "Defines client-side telemetry event schemas, conversion funnel metrics, analytical dashboards, and post-launch feature performance evaluations.",
    skills: ["SQL", "Analytics", "Telemetry", "Funnel Tracking", "Data Dictionary"],
    character: "metis",
    iconId: "checks",
    color: "#84cc16",
    checklist: [
      "Standardized event tracking taxonomy and payload conventions",
      "Zero PII (Personally Identifiable Information) in event properties",
      "Full funnel drop-off analysis from flow initiation to completion",
    ],
    samplePrompt:
      "Design an analytics telemetry schema and conversion funnel metrics definition for the following user journey: ",
  },
];

export interface SquadSkillDetail {
  id: string;
  name: string;
  category: string;
  badge: string;
  summary: string;
  content: string;
  sourceRepo?: string;
  stars?: string;
}

export const SQUAD_SKILL_CATALOG: Record<string, SquadSkillDetail> = {
  "Design Tokens": {
    "id": "skill:design-tokens",
    "name": "Design Tokens",
    "category": "Design & UX",
    "badge": "Semantic Design Tokens",
    "sourceRepo": "amzn/style-dictionary",
    "stars": "5.8k",
    "summary": "Standardizes cross-platform multi-theme tokens for Jetpack Compose, SwiftUI, and Tailwind CSS.",
    "content": "# Semantic Design Tokens Specification\n\n## Purpose & Authority\nGoverns foundational design tokens eliminating hardcoded hex colors, arbitrary padding, and uncalibrated typography. Built on Amazon Style Dictionary and Tokens Studio architecture.\n\n## Platform Target Mapping\n- **Android**: Generated `ColorScheme` and `ZeusTypography` objects for Jetpack Compose.\n- **iOS**: Theme color assets and Dynamic Type font styles for SwiftUI.\n- **Web**: Scoped CSS Custom Properties with automatic `@media (prefers-color-scheme: dark)` and manual theme override classes.\n\n## Strict Rules\n- Zero hardcoded colors in UI components (`#HEX` or `rgb()` strictly forbidden).\n- Enforce standard 4pt/8pt spacing scale: 4, 8, 12, 16, 24, 32, 48, 64dp.\n- Every color must map to explicit semantic roles: `background`, `surface`, `primary`, `onPrimary`, `outline`, `error`."
  },
  "Compose": {
    "id": "skill:compose",
    "name": "Compose",
    "category": "Design & UX",
    "badge": "Jetpack Compose UI",
    "sourceRepo": "android/nowinandroid",
    "stars": "16k",
    "summary": "Declarative UI engineering for modern Android Native following Google Now-in-Android architecture.",
    "content": "# Jetpack Compose Architecture & Standards\n\n## Purpose & Authority\nProvides reactive, idiomatic Compose presentation engineering derived from Google Now-in-Android.\n\n## Principles & Invariants\n- **Unidirectional Data Flow**: State hoisting where parent composables pass immutable states down and receive lambdas for events up.\n- **Recomposition Optimization**: Strict immutability using `@Immutable` / `@Stable` data models, avoiding unstable collections (`ImmutableList`).\n- **Clean Architecture Boundaries**: Composables never execute direct I/O, database access, or network calls. All business logic delegates to `ViewModel`.\n- **Theme Token Adherence**: Consume colors and typography solely from `ZeusTheme.colors` and `ZeusTheme.typography`."
  },
  "SwiftUI": {
    "id": "skill:swiftui",
    "name": "SwiftUI",
    "category": "Design & UX",
    "badge": "SwiftUI Declarative",
    "sourceRepo": "pointfreeco/swift-composable-architecture",
    "stars": "13k",
    "summary": "Declarative UI engineering for iOS/macOS with pure state-driven rendering and view composition.",
    "content": "# SwiftUI Declarative Architecture Standards\n\n## Purpose & Authority\nDeclarative component design aligned with modern Apple HIG and The Composable Architecture (TCA) state modeling.\n\n## Core Rules\n- **State Segregation**: Use `@Observable` (iOS 17+) or `@StateObject` with clear separation between state ownership and pure projection.\n- **Custom ViewModifiers**: Encapsulate reusable card styles, elevation shadows, and input borders into composable `ViewModifier` types.\n- **Accessibility & Dynamic Type**: Views must automatically wrap and scale with Dynamic Type without clipping or text truncation.\n- **Theme Reactivity**: Multi-theme support using native Asset Catalogs and environment-bound theme tokens."
  },
  "Figma": {
    "id": "skill:figma",
    "name": "Figma",
    "category": "Design & UX",
    "badge": "Figma Blueprint Interop",
    "sourceRepo": "figma/plugin-samples",
    "stars": "4k",
    "summary": "Transforms Figma component node trees, auto-layouts, and design specs into pixel-perfect code.",
    "content": "# Figma Blueprint & Layout Translation\n\n## Purpose & Authority\nTransforms Figma design structures into clean declarative code preserving designer intent and auto-layout geometry.\n\n## Translation Checkpoints\n- **AutoLayout to Flex/Column**: Accurately translate padding, item spacing, hugging, and filling constraints.\n- **Component Variants**: Map Figma component properties directly to enum states or Boolean props.\n- **SVG Path Fidelity**: Clean vector paths, ensure proper `viewBox` dimensions, and replace hardcoded fill with currentColor tokens."
  },
  "Tailwind": {
    "id": "skill:tailwind",
    "name": "Tailwind",
    "category": "Design & UX",
    "badge": "Tailwind CSS Utility",
    "sourceRepo": "tailwindlabs/tailwindcss",
    "stars": "83k",
    "summary": "Utility-first CSS styling strictly bound to design system theme tokens and variables.",
    "content": "# Tailwind CSS Standards\n\n## Purpose & Authority\nModern utility-first responsive layout engine adhering to strict design system configurations.\n\n## Guidelines & Prohibitions\n- **No Arbitrary Values**: Forbid arbitrary brackets (`w-[37px]`, `text-[#333]`). Always use configured theme classes.\n- **CSS Custom Properties**: Leverage semantic CSS variables for instant theme switching without re-rendering JS trees.\n- **Class Grouping**: Group layout (`flex`, `grid`), sizing, spacing, typography, and visual decoration systematically."
  },
  "User Flow": {
    "id": "skill:user-flow",
    "name": "User Flow",
    "category": "Design & UX",
    "badge": "End-to-End Journeys",
    "sourceRepo": "dair-ai/Prompt-Engineering-Guide",
    "stars": "55k",
    "summary": "Maps user journeys, edge cases, and the mandatory 5-state UI matrix before code implementation.",
    "content": "# User Flow & 5-State UI Matrix\n\n## Purpose & Authority\nDefines every screen state and branch before engineering begins, eliminating uncaught edge cases and infinite spinners.\n\n## The 5 Mandatory UI States\n1. **Shimmer / Skeleton**: Exact layout skeleton during network payload retrieval.\n2. **Populated (Happy Path)**: Standard data presentation with interactive micro-animations.\n3. **Empty**: Contextual explanation with primary action to resolve emptiness (e.g. \"Add Beneficiary\").\n4. **Offline / Low-Bandwidth**: Cached data presentation with explicit stale indicator and retry button.\n5. **Error**: User-friendly explanation without technical stack traces, offering direct remediation."
  },
  "Mermaid": {
    "id": "skill:mermaid",
    "name": "Mermaid",
    "category": "Design & UX",
    "badge": "Mermaid Diagrams",
    "sourceRepo": "mermaid-js/mermaid",
    "stars": "73k",
    "summary": "Generates clear sequence diagrams, state machines, and architecture flows in markdown.",
    "content": "# Mermaid Diagram Architecture\n\n## Purpose & Authority\nVisualizes sequence flows, state machine transitions, and cross-boundary architectures directly in markdown.\n\n## Diagram Invariants\n- **Sequence Diagrams**: Detail client-to-backend lifecycles, auth validations, async workers, and timeout retries.\n- **State Diagrams**: Explicitly map state transitions for multi-step flows (e.g. Pending -> Authorized -> Settled | Failed).\n- **Legibility**: Avoid cross-linked spaghetti nodes; separate macro workflows into distinct diagrams."
  },
  "WCAG AAA": {
    "id": "skill:wcag-aaa",
    "name": "WCAG AAA",
    "category": "Design & UX",
    "badge": "Accessibility Compliance",
    "sourceRepo": "dequelabs/axe-core",
    "stars": "7k",
    "summary": "Enforces banking-grade accessibility, 7:1 contrast ratios, minimum touch targets, and TalkBack/VoiceOver tags.",
    "content": "# WCAG AAA Accessibility Standards\n\n## Purpose & Authority\nEnforces strict universal accessibility guidelines matching Deque Axe-core and banking regulatory compliance.\n\n## Non-Negotiable Thresholds\n- **Color Contrast**: Minimum 7:1 for standard text, 4.5:1 for large headlines and essential UI icons.\n- **Touch Targets**: Minimum 48x48dp (Android) and 44x44pt (iOS) with minimum 8dp clear margins.\n- **Assistive Technology**: Semantic accessibility roles, content descriptions, and live-region announcements for dynamic updates.\n- **Keyboard & Focus**: Visible focus rings with high contrast and predictable logical traversal order."
  },
  "Kotlin": {
    "id": "skill:kotlin",
    "name": "Kotlin",
    "category": "Mobile Native",
    "badge": "Kotlin Modern",
    "sourceRepo": "JetBrains/kotlin",
    "stars": "49k",
    "summary": "Idiomatic Kotlin, Clean Architecture layers, immutability, and Coroutines StateFlow.",
    "content": "# Kotlin Architecture & Clean Separation\n\n## Purpose & Authority\nEnterprise Android Kotlin architecture separating concerns across domain, data, and presentation.\n\n## Architectural Layers\n- **Domain Layer**: Pure Kotlin, UseCases with single responsibility `invoke()`, repository interfaces. Zero Android framework imports.\n- **Data Layer**: Repository implementations, Room SQLite database, network clients, and mapping between DTOs and Domain Entities.\n- **Presentation Layer**: ViewModels exposing single immutable `StateFlow` models, consumed by Compose views."
  },
  "Hilt": {
    "id": "skill:hilt",
    "name": "Hilt",
    "category": "Mobile Native",
    "badge": "Dependency Injection",
    "sourceRepo": "google/dagger",
    "stars": "18k",
    "summary": "Standardized dependency injection graphs across Android activities, viewmodels, and services.",
    "content": "# Hilt Dependency Injection Architecture\n\n## Purpose & Authority\nManages dependency graphs and component lifecycles powered by Google Dagger & Hilt.\n\n## Rules & Best Practices\n- **Interface Binding**: Prefer `@Binds` inside abstract modules over `@Provides` to reduce generated bytecode overhead.\n- **Scoping**: Scope singletons with `@Singleton` cautiously; prefer unscoped dependencies for transient operations.\n- **ViewModel Injection**: Annotate viewmodels with `@HiltViewModel` injecting repositories via constructor."
  },
  "Room DB": {
    "id": "skill:room-db",
    "name": "Room DB",
    "category": "Mobile Native",
    "badge": "Offline Persistence",
    "sourceRepo": "android/architecture-components-samples",
    "stars": "44k",
    "summary": "Authoritative offline persistence, reactive Flow queries, and automated schema migrations.",
    "content": "# Room Database & SQLite Architecture\n\n## Purpose & Authority\nAuthoritative local data persistence with reactive observables and zero unhandled schema migrations.\n\n## Persistence Invariants\n- **Migration Discipline**: Every schema change must have an automated test verifying migration from version N to N+1.\n- **Reactive Queries**: DAOs return `Flow<T>` for live updates; write operations run on background dispatchers.\n- **Foreign Keys & Indices**: Index all foreign keys and query predicate columns to prevent full table scans."
  },
  "StateFlow": {
    "id": "skill:stateflow",
    "name": "StateFlow",
    "category": "Mobile Native",
    "badge": "Reactive StateFlow",
    "sourceRepo": "Kotlin/kotlinx.coroutines",
    "stars": "13k",
    "summary": "Unidirectional data flow via Kotlin Coroutines StateFlow, SharedFlow, and Channels.",
    "content": "# Unidirectional Data Flow with StateFlow\n\n## Purpose & Authority\nMaintains single sources of truth in Android UI state without race conditions or thread stalls.\n\n## Pattern Architecture\n- **Private Mutable / Public Read-Only**: Back viewmodels with private `MutableStateFlow<UiState>` and expose read-only `StateFlow<UiState>`.\n- **One-Shot Events**: Transmit one-time events (snackbars, navigation) using `Channel<UiEvent>` consumed as Flow.\n- **Lifecycle Awareness**: In Compose, always collect state with `collectAsStateWithLifecycle()` to prevent background CPU cycles."
  },
  "Swift": {
    "id": "skill:swift",
    "name": "Swift",
    "category": "Mobile Native",
    "badge": "Modern Swift",
    "sourceRepo": "apple/swift",
    "stars": "67k",
    "summary": "Modern Swift 6 concurrency, Sendable types, structured async/await, and protocol-oriented design.",
    "content": "# Modern Swift 6 Architecture\n\n## Purpose & Authority\nHigh-performance native Apple development leveraging Swift 6 strict concurrency checks and protocol-oriented programming.\n\n## Concurrency & Safety Rules\n- **Data Race Safety**: Mark data models crossing actor boundaries as `Sendable`.\n- **Value Semantics**: Favor `struct` and `enum` over `class` to guarantee copy-on-write isolation.\n- **Structured Async**: Utilize `async`/`await` and task groups instead of legacy completion-handler callbacks."
  },
  "Concurrency": {
    "id": "skill:concurrency",
    "name": "Concurrency",
    "category": "Mobile Native",
    "badge": "Async Lifecycles",
    "sourceRepo": "apple/swift-evolution",
    "stars": "15k",
    "summary": "Thread safety, cooperative cancellation, task groups, and dead-lock prevention.",
    "content": "# Concurrency & Thread Safety Standards\n\n## Purpose & Authority\nGuarantees responsive user interfaces by orchestrating background execution without thread starvation or race conditions.\n\n## Execution Rules\n- **Cooperative Cancellation**: Check for task cancellation (`Task.isCancelled` / `ensureActive()`) in long-running loops.\n- **UI Thread Exclusivity**: Never execute I/O or cryptographic operations on the main dispatcher / UI thread.\n- **State Synchronization**: Guard shared mutable state with Actors or atomic synchronization primitives."
  },
  "Zeus Mobile MCP": {
    "id": "skill:zeus-mobile-mcp",
    "name": "Zeus Mobile MCP",
    "category": "Mobile Native",
    "badge": "Device Automation MCP",
    "sourceRepo": "modelcontextprotocol/servers",
    "stars": "60k",
    "summary": "Direct emulator/device automation via Zeus Mobile Model Context Protocol for automated UI verification.",
    "content": "# Zeus Mobile MCP Integration Directive\n\n## Purpose & Authority\nEnables autonomous agents to inspect mobile UI hierarchies, simulate user touch gestures, and verify device runtime states via Model Context Protocol.\n\n## Automation Tools Available\n- **Hierarchy Inspection**: `mobile_list_elements_on_screen` for dumping complete accessibility node trees.\n- **User Gestures**: `mobile_click_on_screen_at_coordinates`, `mobile_swipe_on_screen`, and `mobile_type_keys`.\n- **Diagnostics**: `mobile_take_screenshot`, `mobile_get_device_logs`, and `mobile_list_crashes`."
  },
  "Gherkin": {
    "id": "skill:gherkin",
    "name": "Gherkin",
    "category": "Security & QA",
    "badge": "BDD Gherkin Scenarios",
    "sourceRepo": "cucumber/cucumber-js",
    "stars": "21k",
    "summary": "Given-When-Then behavioral specifications mapping business requirements directly to executable tests.",
    "content": "# BDD Gherkin Testing Specifications\n\n## Purpose & Authority\nTranslates business logic into unambiguous, human-readable test scenarios matching Cucumber BDD standards.\n\n## Specification Pattern\n```gherkin\nFeature: Cardholder Transaction Authorization\n  Scenario: Debit transaction within daily spend limit\n    Given an authenticated customer with active balance IDR 5.000.000\n    And daily transaction spend of IDR 500.000 out of IDR 10.000.000 limit\n    When the customer initiates QRIS payment of IDR 150.000 with valid biometric PIN\n    Then the transaction should succeed with status \"SETTLED\"\n    And available balance should update to IDR 4.850.000\n```"
  },
  "Boundary": {
    "id": "skill:boundary",
    "name": "Boundary",
    "category": "Security & QA",
    "badge": "Boundary Testing",
    "sourceRepo": "goldbergyoni/javascript-testing-best-practices",
    "stars": "26k",
    "summary": "Boundary value analysis for edge cases: off-by-one errors, numerical limits, and unexpected payloads.",
    "content": "# Boundary Value & Edge-Case Testing\n\n## Purpose & Authority\nDetects off-by-one bugs, numerical overflows, and unexpected payload truncations at boundary thresholds.\n\n## Mandatory Test Vectors\n- **Zero & Negative Values**: Balances, transfer amounts, negative transaction quantities.\n- **Limit Boundaries**: `Limit - 0.01`, `Limit`, and `Limit + 0.01`.\n- **String Inputs**: Empty string, single character, max allowable character limit, special unicode/emojis."
  },
  "Data Dictionary": {
    "id": "skill:data-dictionary",
    "name": "Data Dictionary",
    "category": "Security & QA",
    "badge": "Schema & Data Dict",
    "sourceRepo": "SchemaStore/schemastore",
    "stars": "5.2k",
    "summary": "Field-level specification of data types, mandatory flags, regex formats, and PII masking rules.",
    "content": "# Data Dictionary & Schema Validation\n\n## Purpose & Authority\nAuthoritative definition of field formats, validation constraints, and masking rules matching banking core standards.\n\n## Verification Checklist\n- **Format Validation**: Exact regex validation for account numbers, identity cards, phone numbers, and IBANs.\n- **Nullability & Presence**: Unambiguous classification of required versus optional attributes.\n- **PII & Masking**: Masking rules for sensitive identifiers (e.g. `62812****8899`) in UI displays."
  },
  "Unit Test": {
    "id": "skill:unit-test",
    "name": "Unit Test",
    "category": "Security & QA",
    "badge": "Unit Testing",
    "sourceRepo": "goldbergyoni/javascript-testing-best-practices",
    "stars": "26k",
    "summary": "Fast, isolated unit testing following AAA pattern with deterministic mocks and branch coverage.",
    "content": "# Unit Testing Best Practices\n\n## Purpose & Authority\nDeterministic, lightning-fast automated tests ensuring business logic correctness without external I/O dependencies.\n\n## Testing Standards\n- **Arrange-Act-Assert**: Distinct sections setting up state, executing the target method, and asserting outcomes.\n- **Mocking Boundaries**: Mock only at network/disk/clock edges; use real business entities and pure calculations.\n- **Negative Paths**: Test failure handling, invalid inputs, and fallback states with equal rigor as happy paths."
  },
  "OWASP MASVS": {
    "id": "skill:owasp-masvs",
    "name": "OWASP MASVS",
    "category": "Security & QA",
    "badge": "Mobile App Security",
    "sourceRepo": "OWASP/owasp-mastg",
    "stars": "12k",
    "summary": "Industry benchmark for mobile app security: hardware key storage, TLS 1.3, and anti-tamper resilience.",
    "content": "# OWASP Mobile Application Security (MASVS)\n\n## Purpose & Authority\nBanking-grade mobile security standards aligned with the OWASP Mobile Application Security Verification Standard.\n\n## Critical MASVS Checkpoints\n- **MASVS-STORAGE**: Keys kept in hardware-backed Android KeyStore / Apple Secure Enclave; no plaintext secrets in storage.\n- **MASVS-CRYPTO**: Authenticated encryption with AES-GCM-256; secure random salt generation.\n- **MASVS-NETWORK**: Encrypted network communication with TLS 1.3 and active Certificate Pinning.\n- **MASVS-RESILIENCE**: Anti-root/jailbreak detection, debugger attachment prevention, and memory zeroing for sensitive buffers."
  },
  "PCI-DSS": {
    "id": "skill:pci-dss",
    "name": "PCI-DSS",
    "category": "Security & QA",
    "badge": "Payment Card Industry",
    "sourceRepo": "OWASP/owasp-mastg",
    "stars": "12k",
    "summary": "Payment card data protection: PAN masking, zero CVV storage, and background snapshot protection.",
    "content": "# PCI-DSS Compliance Guidelines\n\n## Purpose & Authority\nPayment Card Industry Data Security Standard protecting cardholder and financial transaction data.\n\n## Non-Negotiable Invariants\n- **No Plaintext PAN**: Primary Account Numbers must always be masked, displaying only the last 4 digits.\n- **CVV/PIN Prohibition**: Never store, log, or persist card verification codes or PINs under any condition.\n- **App Switcher Protection**: Obscure or blank out app preview snapshots in OS task switchers for screens displaying payment data."
  },
  "Pinning": {
    "id": "skill:pinning",
    "name": "Pinning",
    "category": "Security & QA",
    "badge": "Certificate Pinning",
    "sourceRepo": "datatheorem/TrustKit",
    "stars": "3.2k",
    "summary": "Public-key cryptographic pinning to eliminate Man-in-the-Middle (MITM) attacks.",
    "content": "# Public Key Certificate Pinning\n\n## Purpose & Authority\nThwarts MITM attacks by enforcing cryptographic checks against server public-key hashes.\n\n## Implementation Standards\n- **SPKI Hashing**: Pin Subject Public Key Information (SPKI) SHA-256 hashes rather than leaf certificate bodies.\n- **Backup Pin Sets**: Always configure at least one backup pin for certificate rotation cycles.\n- **Fail-Closed**: Abort connection immediately upon verification failure; never fall back to standard OS trust stores."
  },
  "REST API": {
    "id": "skill:rest-api",
    "name": "REST API",
    "category": "Backend & Infra",
    "badge": "RESTful Architecture",
    "sourceRepo": "OAI/OpenAPI-Specification",
    "stars": "30k",
    "summary": "RESTful API design with OpenAPI specs, RFC 7807 problem details, and idempotency guarantees.",
    "content": "# REST API & HTTP Standards\n\n## Purpose & Authority\nArchitects predictable, high-performance RESTful APIs following OpenAPI and RFC standards.\n\n## Core Directives\n- **HTTP Verbs**: Correct semantics (GET for safe reads, POST for creation, PUT/PATCH for updates, DELETE for removal).\n- **RFC 7807 Error Details**: Standardized error responses containing `type`, `title`, `status`, `detail`, and `instance`.\n- **Idempotency Keys**: Require `Idempotency-Key` headers for all financial or mutation requests to avoid duplicate processing."
  },
  "GraphQL": {
    "id": "skill:graphql",
    "name": "GraphQL",
    "category": "Backend & Infra",
    "badge": "GraphQL Schema",
    "sourceRepo": "graphql/graphql-spec",
    "stars": "15k",
    "summary": "Type-safe schemas, query complexity limiting, and DataLoader batching to prevent N+1 issues.",
    "content": "# GraphQL Architecture & Schema Standards\n\n## Purpose & Authority\nType-safe query and mutation design matching the official GraphQL specification.\n\n## Implementation Guidelines\n- **Batching & Caching**: Implement DataLoader patterns to eliminate N+1 database queries.\n- **Query Complexity Defense**: Enforce maximum query depth and complexity cost analysis to prevent Denial-of-Service attacks.\n- **Input Validation**: Strict GraphQL input type validation with descriptive custom scalars where applicable."
  },
  "PostgreSQL": {
    "id": "skill:postgresql",
    "name": "PostgreSQL",
    "category": "Backend & Infra",
    "badge": "PostgreSQL ACID",
    "sourceRepo": "postgres/postgres",
    "stars": "16k",
    "summary": "Relational database schema modeling, indexing strategies, and strict ACID transaction guarantees.",
    "content": "# PostgreSQL Architecture & Relational Modeling\n\n## Purpose & Authority\nMission-critical relational data persistence providing ACID guarantees for financial ledger operations.\n\n## Database Directives\n- **Transaction Isolation**: Enforce `SERIALIZABLE` or `REPEATABLE READ` for balance updates and multi-account transfers.\n- **Index Optimization**: Create B-Tree indices for foreign keys and timestamp filters; use `EXPLAIN ANALYZE` to confirm execution plans.\n- **Zero-Downtime Migrations**: Expand-and-contract schema migrations ensuring backward compatibility with running app versions."
  },
  "Redis": {
    "id": "skill:redis",
    "name": "Redis",
    "category": "Backend & Infra",
    "badge": "In-Memory Cache",
    "sourceRepo": "redis/redis",
    "stars": "68k",
    "summary": "In-memory caching, Redlock distributed locking, and token bucket rate-limiting algorithms.",
    "content": "# Redis Caching & Distributed Synchronization\n\n## Purpose & Authority\nSub-millisecond data access and distributed synchronization using Redis in-memory data structures.\n\n## Production Patterns\n- **Distributed Locking**: Redlock pattern with explicit TTLs to prevent deadlocks and concurrent ledger mutations.\n- **Rate Limiting**: Sliding window or token bucket algorithms for API throttle protection.\n- **Cache Invalidation**: Explicit Cache-Aside pattern with defined TTLs and event-driven cache invalidation."
  },
  "gRPC": {
    "id": "skill:grpc",
    "name": "gRPC",
    "category": "Backend & Infra",
    "badge": "Protobuf & gRPC",
    "sourceRepo": "grpc/grpc",
    "stars": "42k",
    "summary": "High-performance microservice RPC communication using Protocol Buffers and HTTP/2 multiplexing.",
    "content": "# gRPC & Protocol Buffers Standards\n\n## Purpose & Authority\nUltra-fast, type-safe inter-service communication powered by Google gRPC and Protocol Buffers.\n\n## Engineering Invariants\n- **Protobuf Schemas**: Backward-compatible proto definitions; never alter existing field tag numbers or types.\n- **Streaming & Flow Control**: Leverage HTTP/2 bidirectional streaming for high-throughput events and telemetry.\n- **Interceptors**: Uniform authentication, distributed tracing (OpenTelemetry), and deadline propagation across calls."
  },
  "Docker": {
    "id": "skill:docker",
    "name": "Docker",
    "category": "Backend & Infra",
    "badge": "Containerization",
    "sourceRepo": "docker/awesome-compose",
    "stars": "34k",
    "summary": "Multi-stage builds, non-root execution, minimal runtime images, and vulnerability-free containers.",
    "content": "# Dockerfile & Containerization Standards\n\n## Purpose & Authority\nSecure, reproducible, and minimal container images following Docker and OCI best practices.\n\n## Production Directives\n- **Multi-Stage Builds**: Compile binaries in build stages and copy only artifacts into lean base images (e.g. Alpine or Distroless).\n- **Non-Root Execution**: Always configure `USER appuser` with minimal OS privileges.\n- **Image Pinning**: Pin base images with specific version digests to prevent unexpected upstream drift."
  },
  "GitHub Actions": {
    "id": "skill:github-actions",
    "name": "GitHub Actions",
    "category": "Backend & Infra",
    "badge": "CI Automation",
    "sourceRepo": "actions/starter-workflows",
    "stars": "12k",
    "summary": "Automated linting, test suites, security scans, and build distribution pipelines.",
    "content": "# GitHub Actions CI/CD Architecture\n\n## Purpose & Authority\nAutomates code validation and continuous integration with strict quality gates and minimal token permissions.\n\n## Pipeline Standards\n- **Least Privilege**: Configure `permissions: contents: read` as default; elevate token rights only in deploy jobs.\n- **Dependency Caching**: Cache pnpm store, Gradle caches, and CocoaPods to minimize build latency.\n- **Strict Verification Gates**: Require typecheck, lint, unit tests, and security dependency audits to pass before merge."
  },
  "Fastlane": {
    "id": "skill:fastlane",
    "name": "Fastlane",
    "category": "Backend & Infra",
    "badge": "Mobile Automation",
    "sourceRepo": "fastlane/fastlane",
    "stars": "39k",
    "summary": "Automated mobile app builds, code signing certificates, test flight distribution, and Play Store releases.",
    "content": "# Fastlane Mobile Deployment Automation\n\n## Purpose & Authority\nAutomates build, signing, and release distribution for iOS and Android applications.\n\n## Automation Lanes\n- **Match / Codesigning**: Secure and automated iOS certificate and provisioning profile sync via git repo storage.\n- **Beta Distribution**: Automated build number increment, changelog generation, and upload to TestFlight and Firebase App Distribution.\n- **Release Verification**: Automated pre-flight lint checks, release notes localization, and store metadata submission."
  },
  "CI/CD": {
    "id": "skill:cicd",
    "name": "CI/CD",
    "category": "Backend & Infra",
    "badge": "Continuous Delivery",
    "sourceRepo": "actions/starter-workflows",
    "stars": "12k",
    "summary": "Enterprise deployment pipelines with blue/green rollouts, canary stages, and automated rollbacks.",
    "content": "# Enterprise CI/CD Delivery Pipeline\n\n## Purpose & Authority\nContinuous delivery orchestration guaranteeing zero-downtime releases and rapid rollback capabilities.\n\n## Delivery Directives\n- **Immutability**: Build once, promote through staging and production without modifying compiled artifacts.\n- **Canary & Phased Rollouts**: Roll out new versions incrementally (e.g. 5% -> 25% -> 100%) monitoring error telemetry.\n- **Automated Rollback**: Pre-configured health check triggers that revert deployment immediately if error rates spike."
  },
  "PRD": {
    "id": "skill:prd",
    "name": "PRD",
    "category": "Product & Data",
    "badge": "Product Requirements",
    "sourceRepo": "dair-ai/Prompt-Engineering-Guide",
    "stars": "55k",
    "summary": "Comprehensive Product Requirement Documents defining user personas, scope, risks, and KPIs.",
    "content": "# Product Requirement Document (PRD) Standards\n\n## Purpose & Authority\nComprehensive product scoping frameworks aligning business objectives with technical feasibility.\n\n## Required Sections\n1. **Executive Summary & Problem Statement**: Core user problem and business justification.\n2. **User Personas & Target Demographics**: Defined roles and primary operational environments.\n3. **Functional Scope & MoSCoW Prioritization**: Must-have, Should-have, Could-have, Won't-have breakdown.\n4. **Non-Functional Requirements**: Response time thresholds, accessibility standards, and uptime SLAs.\n5. **Measurable Success Metrics**: Specific KPIs evaluated 30-60-90 days post-launch."
  },
  "User Story": {
    "id": "skill:user-story",
    "name": "User Story",
    "category": "Product & Data",
    "badge": "User Stories & AC",
    "sourceRepo": "f/awesome-chatgpt-prompts",
    "stars": "118k",
    "summary": "Agile user stories with unambiguous acceptance criteria in Given-When-Then BDD format.",
    "content": "# Agile User Story Architecture\n\n## Purpose & Authority\nUser-centric requirements definition ensuring shared understanding between product owners and developers.\n\n## Standard Template\n- **As a** [specific user persona / role]\n- **I want to** [execute a specific action]\n- **So that** [achieve a clear business value or benefit]\n\n## Acceptance Criteria\n- Written strictly using Given-When-Then scenarios covering happy paths, validation failures, and edge cases."
  },
  "Roadmap": {
    "id": "skill:roadmap",
    "name": "Roadmap",
    "category": "Product & Data",
    "badge": "Strategic Roadmap",
    "sourceRepo": "kamranahmedse/developer-roadmap",
    "stars": "310k",
    "summary": "Strategic milestone planning, sprint schedules, dependency graphs, and resource allocation.",
    "content": "# Strategic Product Roadmap Planning\n\n## Purpose & Authority\nVisualizes milestone timelines, cross-squad dependencies, and delivery phases matching modern agile roadmaps.\n\n## Planning Framework\n- **Theme-Based Milestones**: Group deliverables by outcome (e.g. \"Instant QRIS Settlement\", \"Biometric Fast-Login\").\n- **Dependency Mapping**: Highlight blocking prerequisites (e.g. Core Banking API availability before mobile UI integration).\n- **Confidence Horizons**: High confidence for Current Sprint (Now), medium for Next Quarter (Next), strategic for Horizon (Later)."
  },
  "SQL": {
    "id": "skill:sql",
    "name": "SQL",
    "category": "Product & Data",
    "badge": "Analytical SQL",
    "sourceRepo": "dbt-labs/dbt-core",
    "stars": "10k",
    "summary": "Analytical queries, CTEs, window functions, and funnel drop-off aggregations.",
    "content": "# Analytical SQL & Metrics Transformation\n\n## Purpose & Authority\nHigh-performance analytical queries and metric models following dbt best practices.\n\n## Query Engineering Rules\n- **Modular CTEs**: Structure multi-stage data transformations with clear Common Table Expressions rather than subqueries.\n- **Window Functions**: Efficient cohort and retention analysis utilizing `LAG`, `LEAD`, `ROW_NUMBER`, and `RANK`.\n- **Performance Verification**: Confirm partition pruning and index scans via `EXPLAIN ANALYZE` on high-volume tables."
  },
  "Analytics": {
    "id": "skill:analytics",
    "name": "Analytics",
    "category": "Product & Data",
    "badge": "Telemetry & Events",
    "sourceRepo": "open-telemetry/opentelemetry-specification",
    "stars": "4.5k",
    "summary": "Event tracking schemas, funnel definitions, conversion metrics, and zero-PII telemetry.",
    "content": "# Product Analytics & Event Taxonomy\n\n## Purpose & Authority\nStandardizes user behavior tracking to measure feature adoption and conversion funnels with complete data integrity.\n\n## Analytics Principles\n- **Event Naming Taxonomy**: `[Domain] [Object] [Action]` (e.g. `Payment Transfer Completed`).\n- **Standardized Attributes**: Require global properties: `platform`, `app_version`, `session_id`, `timestamp_utc`.\n- **Zero PII**: Strictly prohibit recording passwords, tokens, full PAN, or national ID numbers in event payloads."
  },
  "Telemetry": {
    "id": "skill:telemetry",
    "name": "Telemetry",
    "category": "Product & Data",
    "badge": "Observability Metrics",
    "sourceRepo": "open-telemetry/opentelemetry-specification",
    "stars": "4.5k",
    "summary": "Application performance monitoring, crash traces, latency percentiles (p95/p99), and distributed tracing.",
    "content": "# Telemetry & Observability Architecture\n\n## Purpose & Authority\nReal-time monitoring of application health, crash telemetry, and distributed tracing matching OpenTelemetry standards.\n\n## Observability Pillars\n- **Distributed Tracing**: Propagate trace and span IDs across client requests to backend services for root-cause diagnosis.\n- **Latency SLAs**: Monitor p50, p95, and p99 latency distributions for critical user interaction endpoints.\n- **Crash Telemetry**: Capture symbolized stack traces, breadcrumb logs, and memory pressure metrics without leaking user secrets."
  }
};

export function getSquadSkillDetail(skillName: string): SquadSkillDetail {
  const trimmed = skillName.trim();
  const direct = SQUAD_SKILL_CATALOG[trimmed];
  if (direct) return direct;

  // Case-insensitive lookup fallback
  const foundKey = Object.keys(SQUAD_SKILL_CATALOG).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (foundKey) return SQUAD_SKILL_CATALOG[foundKey];

  // Dynamic fallback for user custom skills
  return {
    id: `skill:custom-${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: trimmed,
    category: "Custom Skill",
    badge: "Custom Skill",
    summary: `Custom domain skill for ${trimmed}.`,
    content: `# ${trimmed} Skill Specification

## Overview
Custom capability assigned to squad members.

## Responsibilities
- Executes tasks and automations related to ${trimmed}.
- Follows coding standards and repository architectural boundaries.`,
  };
}

