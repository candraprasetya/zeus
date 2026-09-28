/**
 * The one Zeus Squad roster — data, persistence, and resolution.
 *
 * This module is deliberately free of React and of renderer icons so it can
 * be exercised directly by tests: everything here is plain data plus a
 * localStorage store. The React hook and the icon registry live in
 * `use-zeus-squad.ts`, which re-exports this module for consumers.
 *
 * The chat team strip, the Work Panel "Squad Roles" tab, and Settings >
 * Subagents all read this roster instead of keeping their own copy, so a
 * rename, a toggle, or a newly added member made in one place is the same
 * change everywhere.
 *
 * The roster is not a fixed coding crew: the six shipped roles are defaults,
 * not a contract. A user adds their own roles, edits any of them, and hides
 * the ones they do not need — the store keeps only their changes beside the
 * shipped list, so new defaults keep flowing in.
 */

export type ZeusSquadCategory = "Design" | "Mobile Dev" | "Quality & Security" | "Custom";

export type ZeusSquadIconId = "bot" | "palette" | "person" | "shield" | "checks" | "target";

export const ZEUS_SQUAD_ICON_IDS: readonly ZeusSquadIconId[] = [
  "bot",
  "palette",
  "person",
  "shield",
  "checks",
  "target",
];

/** Swatch set offered when a member is created or recolored. */
export const ZEUS_SQUAD_COLORS: readonly string[] = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
];

export interface ZeusSquadMemberDefinition {
  id: string;
  name: string;
  /** Long role title, shown on the Squad Roles detail card. */
  title: string;
  /** Short badge line: what the team strip and Settings rows show. */
  badge: string;
  category?: ZeusSquadCategory;
  description: string;
  /** Shipped skill binding; user-created members have none. */
  skillId: string;
  /** Skill chips a Settings row lists next to the command, built-in style. */
  skills: string[];
  /**
   * Character the Live Office draws this member as. Held as a plain string so
   * this module stays free of renderer icon imports; the sheet validates it
   * against the character registry and the office resolves it there.
   */
  character?: string;
  checklist: string[];
  samplePrompt: string;
  iconId: ZeusSquadIconId;
  color: string;
}

export interface ZeusSquadMemberOverride {
  name?: string;
  badge?: string;
  description?: string;
  iconId?: ZeusSquadIconId;
  color?: string;
  enabled?: boolean;
  skills?: string[];
  character?: string;
  /** Moves a member to another team; absent keeps the current one. */
  teamId?: string;
}

/** A member the user created: stored whole, with no shipped definition. */
export interface ZeusSquadCustomMember {
  id: string;
  name: string;
  /** User-created members have no shipped long title. */
  title: string;
  badge: string;
  description: string;
  iconId: ZeusSquadIconId;
  color: string;
  enabled: boolean;
  /** Owning team; the store coerces it back if the team is gone. */
  teamId: string;
  skills: string[];
  character?: string;
}

/** What the sheet fills in, for both a new member and an existing one. */
export interface ZeusSquadMemberDraft {
  name: string;
  badge: string;
  description: string;
  iconId: ZeusSquadIconId;
  color: string;
  /** Defaults to the active team when a caller omits it. */
  teamId?: string;
  skills?: string[];
  character?: string;
}

export interface ZeusSquadMember extends ZeusSquadMemberDefinition {
  enabled: boolean;
  /** True when a shipped member differs from its default. */
  customized: boolean;
  /** True for a member the user created (editable and removable, not resettable). */
  custom: boolean;
  /** Team this member belongs to; shipped defaults live on the default team. */
  teamId: string;
}

export const ZEUS_SQUAD_STORAGE_KEY = "zeus.squad_members.v1";
export const ZEUS_SQUAD_CHANGE_EVENT = "zeus:squad-changed";

/** The team the six shipped roles belong to, and the one a fresh install opens on. */
export const DEFAULT_TEAM_ID = "zeus-squad";

export interface SquadTeam {
  id: string;
  name: string;
}

/**
 * One pipeline stage. `teamId` and `assigneeId` are the assignment the user
 * picks in the card sheet; both are re-pointed at a safe value on read when
 * the team or member they name no longer exists.
 */
export interface SquadPipelineCard {
  id: string;
  title: string;
  detail: string;
  teamId: string;
  assigneeId: string;
}

export interface SquadPipeline {
  id: string;
  name: string;
  teamId: string;
  cards: SquadPipelineCard[];
}

export const DEFAULT_SQUAD_TEAMS: readonly SquadTeam[] = [
  { id: DEFAULT_TEAM_ID, name: "Zeus Squad" },
];

/**
 * Icon → character, so a member that never picked a character still gets a
 * face in the Live Office. The office resolves the id through the character
 * registry, which falls back to its first archetype for an unknown id.
 */
export const ZEUS_SQUAD_ICON_CHARACTERS: Readonly<Record<ZeusSquadIconId, string>> = {
  bot: "hephaestus",
  palette: "iris",
  person: "athena",
  shield: "artemis",
  checks: "apollo",
  target: "hermes",
};

/** The character this member is drawn as: its own pick, else its icon's. */
export function resolveSquadCharacter(
  member: Pick<ZeusSquadMember, "iconId" | "character">,
): string {
  return member.character || ZEUS_SQUAD_ICON_CHARACTERS[member.iconId] || "hephaestus";
}

export const DEFAULT_ZEUS_SQUAD: readonly ZeusSquadMemberDefinition[] = [
  {
    id: "ui-designer",
    name: "UI Designer",
    title: "Banking Design System Specialist",
    badge: "Design Tokens & System",
    category: "Design",
    description:
      "Mengonversi blueprint & wireframe ke Design Tokens bank (Light/Dark mode), skala tipografi, 4/8pt grid, dan komponen siap pakai untuk Compose & SwiftUI.",
    skillId: "zeus-ui-designer",
    skills: ["Design Tokens", "Compose", "SwiftUI"],
    character: "iris",
    checklist: [
      "Zero hardcoded color (Wajib semantic token bank)",
      "Typography scale baku (Display, Headline, Body, Caption)",
      "8pt/4pt Spacing & Radius grid",
      "Asset vector & Icon spec siap import",
    ],
    samplePrompt:
      "Tolong susun token warna semantik dan spesifikasi komponen Compose & SwiftUI untuk fitur: ",
    iconId: "palette",
    color: "#06b6d4",
  },
  {
    id: "ux-designer",
    name: "UX Designer",
    title: "Banking Customer Journey & Flow Architect",
    badge: "User Flow & a11y",
    category: "Design",
    description:
      "Merancang alur perjalanan nasabah, diagram flow interaktif Mermaid, handling 5 state layar (Shimmer, Empty, Partial/Offline 2G, Error), dan kepatuhan a11y WCAG AAA.",
    skillId: "zeus-ux-designer",
    skills: ["User Flow", "Mermaid", "WCAG AAA"],
    character: "athena",
    checklist: [
      "5 Interactive States (Shimmer, Populated, Empty, Offline, Error)",
      "Diagram alur Mermaid (Happy path & Negative branch)",
      "Touch target min 48x48dp (Android) & 44x44pt (iOS)",
      "Screen Reader label accessibility (a11y)",
    ],
    samplePrompt:
      "Rancang Customer Journey dan matriks 5 state interaktif lengkap dengan diagram Mermaid untuk fitur: ",
    iconId: "person",
    color: "#8b5cf6",
  },
  {
    id: "android-lead",
    name: "Evan",
    title: "Team Lead Android Native (Kotlin & Compose)",
    badge: "Android Native / Kotlin",
    category: "Mobile Dev",
    description:
      "Spesialis Android Native Kotlin, Clean Architecture (Domain, Data, Presentation), Coroutines StateFlow, Hilt DI, Room DB, dan enkripsi AndroidKeyStore.",
    skillId: "zeus-squad",
    skills: ["Kotlin", "Compose", "Hilt"],
    character: "hermes",
    checklist: [
      "Clean Architecture (Domain/Data/Presentation)",
      "Jetpack Compose UI dengan BankTheme tokens",
      "Coroutines & StateFlow unidirectional data flow",
      "AndroidKeyStore & FLAG_SECURE window protection",
    ],
    samplePrompt:
      "Evan, tolong implementasikan modul Android Native Kotlin dengan Clean Architecture untuk fitur: ",
    iconId: "bot",
    color: "#10b981",
  },
  {
    id: "ios-lead",
    name: "Candra",
    title: "Team Lead iOS Native (Swift & SwiftUI)",
    badge: "iOS Native / SwiftUI",
    category: "Mobile Dev",
    description:
      "Spesialis iOS Native Swift, Clean Architecture, SwiftUI declarative views, Swift Concurrency (async/await), Combine/Observation, dan Keychain Services.",
    skillId: "zeus-squad",
    skills: ["Swift", "SwiftUI", "Concurrency"],
    character: "hephaestus",
    checklist: [
      "Clean Architecture (Domain/Data/Presentation)",
      "SwiftUI declarative views dengan ThemeModifier",
      "Swift Concurrency (async/await & Task lifecycle)",
      "Keychain Services & background snapshot masking",
    ],
    samplePrompt:
      "Candra, tolong implementasikan modul iOS Native SwiftUI dengan Clean Architecture untuk fitur: ",
    iconId: "bot",
    color: "#3b82f6",
  },
  {
    id: "security-checker",
    name: "Security Checker",
    title: "Banking Security & OWASP MASVS Auditor",
    badge: "OWASP MASVS & PCI-DSS",
    category: "Quality & Security",
    description:
      "Audit kepatuhan standar bank PCI-DSS & MASVS: Keystore/Keychain, Certificate Pinning, Anti-Root/Jailbreak, Anti-tamper, memory wipe, dan zero plain-text logging.",
    skillId: "zeus-security",
    skills: ["MASVS", "Pinning", "Keystore"],
    character: "artemis",
    checklist: [
      "MASVS-STORAGE (No plain credentials, Hardware Keystore/Keychain)",
      "MASVS-CRYPTO (AES-GCM, Bcrypt $2b$, Argon2id)",
      "MASVS-NETWORK (TLS 1.3 & Certificate Pinning)",
      "Anti-Root / Jailbreak & Memory Sensitive Data Wipe",
    ],
    samplePrompt:
      "Audit celah keamanan arsitektur, proteksi keystore/keychain, dan sertifikasi MASVS untuk kode berikut: ",
    iconId: "shield",
    color: "#ef4444",
  },
  {
    id: "qa-specialist",
    name: "Quality Assurance (QA)",
    title: "Banking QA & Data Dictionary Validator",
    badge: "BDD & Data Dictionary",
    category: "Quality & Security",
    description:
      "Memvalidasi kesesuaian implementasi terhadap Excel Data Dictionary & Blueprint, BDD Gherkin scenarios, skenario boundary testing, dan resilient error handling.",
    skillId: "zeus-qa",
    skills: ["Gherkin", "Boundary", "Data Dictionary"],
    character: "apollo",
    checklist: [
      "Validasi field & regex terhadap Excel Data Dictionary",
      "BDD Gherkin scenario (Given-When-Then)",
      "Boundary Value Testing (Saldo 0, max limit, invalid chars)",
      "Simulasi Timeout 504 & Session Expiry",
    ],
    samplePrompt:
      "Buatkan skenario pengujian BDD Gherkin dan test cases komprehensif berdasarkan Data Dictionary untuk fitur: ",
    iconId: "checks",
    color: "#f59e0b",
  },
];

interface ZeusSquadStore {
  /** Per-member edits to the shipped defaults, keyed by member id. */
  overrides: Record<string, ZeusSquadMemberOverride>;
  /** Members the user created, in creation order. */
  custom: ZeusSquadCustomMember[];
  /** Teams the user created. Absent reads as just the default team. */
  teams?: SquadTeam[];
  /**
   * Global fallback active team (used when no session-specific assignment
   * exists). Kept for backward-compat with stores written before per-session
   * team scoping was added.
   */
  activeTeamId?: string;
  /** Pipelines the user created; each one belongs to a team. */
  pipelines?: SquadPipeline[];
  activePipelineId?: string;
  /**
   * Per-session team assignment: maps a session id to the team id selected
   * while that session was active. Takes precedence over `activeTeamId` so
   * switching sessions restores each session's own team independently.
   */
  sessionTeams?: Record<string, string>;
}

/** A fresh store — never shared, so a failed write cannot leak into the next read. */
function emptyStore(): ZeusSquadStore {
  return { overrides: {}, custom: [], teams: [], pipelines: [] };
}

/** Window storage in the app; a test can install its own on `globalThis`. */
function storage(): Storage | undefined {
  const fromWindow = typeof window === "undefined" ? undefined : window.localStorage;
  const fromGlobal = (globalThis as { localStorage?: Storage }).localStorage;
  return fromWindow ?? fromGlobal;
}

function notify(detail: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ZEUS_SQUAD_CHANGE_EVENT, { detail }));
}

function readStore(): ZeusSquadStore {
  try {
    const raw = storage()?.getItem(ZEUS_SQUAD_STORAGE_KEY) ?? null;
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyStore();
    const record = parsed as Partial<ZeusSquadStore> & Record<string, unknown>;
    // The shape before members were addable was the overrides map itself;
    // keep reading it so those edits survive the upgrade.
    if (!record.overrides && !record.custom) {
      return {
        overrides: parsed as Record<string, ZeusSquadMemberOverride>,
        custom: [],
        teams: [],
        pipelines: [],
      };
    }
    return {
      overrides:
        record.overrides && typeof record.overrides === "object" ? record.overrides : {},
      custom: Array.isArray(record.custom)
        ? (record.custom as ZeusSquadCustomMember[])
        : [],
      // Teams, pipelines, and the active ids are all optional: a store written
      // before they existed simply reads as the default team with no pipeline.
      teams: Array.isArray(record.teams) ? (record.teams as SquadTeam[]) : [],
      activeTeamId:
        typeof record.activeTeamId === "string" ? record.activeTeamId : undefined,
      pipelines: Array.isArray(record.pipelines)
        ? (record.pipelines as SquadPipeline[])
        : [],
      activePipelineId:
        typeof record.activePipelineId === "string" ? record.activePipelineId : undefined,
      sessionTeams:
        record.sessionTeams &&
        typeof record.sessionTeams === "object" &&
        !Array.isArray(record.sessionTeams)
          ? (record.sessionTeams as Record<string, string>)
          : undefined,
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: ZeusSquadStore, detail: string): void {
  try {
    storage()?.setItem(ZEUS_SQUAD_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage write errors; the defaults stay in effect.
    return;
  }
  notify(detail);
}

function resolveIconId(iconId: ZeusSquadIconId | undefined): ZeusSquadIconId {
  return iconId && ZEUS_SQUAD_ICON_IDS.includes(iconId) ? iconId : "bot";
}

function resolveCustom(member: ZeusSquadCustomMember, store: ZeusSquadStore): ZeusSquadMember {
  return {
    id: member.id,
    name: member.name,
    title: member.title,
    badge: member.badge,
    category: "Custom",
    description: member.description,
    skillId: "",
    skills: Array.isArray(member.skills) ? member.skills.filter(Boolean) : [],
    character: member.character,
    checklist: [],
    samplePrompt: "",
    iconId: resolveIconId(member.iconId),
    color: member.color || ZEUS_SQUAD_COLORS[0],
    enabled: member.enabled ?? true,
    customized: false,
    custom: true,
    teamId: coerceTeamId(store, member.teamId || DEFAULT_TEAM_ID),
  };
}

/**
 * The roster in default order with the user's changes applied, followed by
 * the members the user created. Disabled members stay in the list so Settings
 * can switch them back on; callers that render the live team filter on
 * `enabled`.
 */
export function resolveZeusSquadMembers(): ZeusSquadMember[] {
  const store = readStore();
  const shipped = DEFAULT_ZEUS_SQUAD.map((member) => {
    const override = store.overrides[member.id];
    const name = override?.name?.trim();
    const badge = override?.badge?.trim();
    const description = override?.description ?? member.description;
    const iconId = override?.iconId ?? member.iconId;
    const color = override?.color ?? member.color;
    const skills = override?.skills ?? member.skills;
    const character = override?.character ?? member.character;
    // A member whose team was deleted falls back to the surviving first team
    // instead of disappearing from every roster.
    const teamId = coerceTeamId(store, override?.teamId ?? DEFAULT_TEAM_ID);
    return {
      ...member,
      name: name || member.name,
      badge: badge || member.badge,
      description,
      iconId,
      color,
      skills,
      character,
      teamId,
      enabled: override?.enabled ?? true,
      customized:
        Boolean(name && name !== member.name) ||
        Boolean(badge && badge !== member.badge) ||
        description !== member.description ||
        iconId !== member.iconId ||
        color !== member.color ||
        skills !== member.skills ||
        character !== member.character ||
        Boolean(override?.teamId),
      custom: false,
    };
  });
  return [...shipped, ...store.custom.map((member) => resolveCustom(member, store))];
}

/** One team's roster; the strip, the office, and the pipeline read the active team's. */
export function resolveSquadMembersForTeam(teamId: string): ZeusSquadMember[] {
  return resolveZeusSquadMembers().filter((member) => member.teamId === teamId);
}

/**
 * A starting point for the create-member sheet: a shipped role that is not in
 * this team yet, or a built-in subagent the page offers the same way.
 *
 * Templates are suggestions only — they pre-fill the form, and nothing joins
 * the roster until the user saves, so built-ins never become members of their
 * own.
 */
export interface SquadMemberTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  skills: string[];
  character?: string;
  iconId: ZeusSquadIconId;
  color: string;
}

/**
 * The create-member suggestions for one team: every shipped role it does not
 * hold yet, then whatever the caller adds (the built-in subagents), dropping
 * anything already on the roster and any repeat by name so the sheet never
 * offers a duplicate.
 */
export function resolveSquadMemberTemplates(
  teamId: string,
  extra: readonly SquadMemberTemplate[] = [],
): SquadMemberTemplate[] {
  const members = resolveSquadMembersForTeam(teamId);
  const takenIds = new Set(members.map((member) => member.id));
  const takenNames = new Set(members.map((member) => member.name.trim().toLowerCase()));
  const shipped: SquadMemberTemplate[] = DEFAULT_ZEUS_SQUAD.filter(
    (role) => !takenIds.has(role.id),
  ).map((role) => ({
    id: role.id,
    name: role.name,
    badge: role.badge,
    description: role.description,
    skills: [...role.skills],
    character: role.character,
    iconId: role.iconId,
    color: role.color,
  }));

  const suggestions: SquadMemberTemplate[] = [];
  for (const candidate of [...shipped, ...extra]) {
    const key = candidate.name.trim().toLowerCase();
    if (!key || takenNames.has(key)) continue;
    takenNames.add(key);
    suggestions.push(candidate);
  }
  return suggestions;
}

/**
 * The offered swatch nearest to `hex`, so a suggestion built from a character
 * color lands on one the sheet actually highlights.
 */
export function nearestSquadColor(hex: string): string {
  const target = parseHexColor(hex);
  if (!target) return ZEUS_SQUAD_COLORS[0];
  let best = ZEUS_SQUAD_COLORS[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const swatch of ZEUS_SQUAD_COLORS) {
    const rgb = parseHexColor(swatch);
    if (!rgb) continue;
    const distance =
      (target[0] - rgb[0]) ** 2 + (target[1] - rgb[1]) ** 2 + (target[2] - rgb[2]) ** 2;
    if (distance < bestDistance) {
      best = swatch;
      bestDistance = distance;
    }
  }
  return best;
}

function parseHexColor(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/**
 * Writes one member's change. A shipped member keeps an override beside its
 * default; a user-created member is edited in place, because it has no
 * default to fall back to.
 */
export function saveZeusSquadMember(id: string, override: ZeusSquadMemberOverride): void {
  const store = readStore();
  const customIndex = store.custom.findIndex((member) => member.id === id);
  if (customIndex >= 0) {
    const current = store.custom[customIndex];
    store.custom[customIndex] = {
      ...current,
      ...override,
      id: current.id,
      name: override.name?.trim() || current.name,
      badge: override.badge?.trim() || current.badge,
      description: override.description ?? current.description,
      iconId: override.iconId ?? current.iconId,
      color: override.color ?? current.color,
      enabled: override.enabled ?? current.enabled,
      skills: override.skills ?? current.skills,
      character: override.character ?? current.character,
      teamId: override.teamId ?? current.teamId,
    };
    writeStore(store, id);
    return;
  }

  const next: ZeusSquadMemberOverride = { ...store.overrides[id], ...override };
  if (next.name !== undefined && !next.name.trim()) delete next.name;
  if (next.badge !== undefined && !next.badge.trim()) delete next.badge;
  // Back to the default team means no team override is needed.
  if (next.teamId === DEFAULT_TEAM_ID) delete next.teamId;
  if (Object.keys(next).length === 0) delete store.overrides[id];
  else store.overrides[id] = next;
  writeStore(store, id);
}

/** Drops the override so a shipped member falls back to its default. */
export function resetZeusSquadMember(id: string): void {
  const store = readStore();
  if (!(id in store.overrides)) return;
  delete store.overrides[id];
  writeStore(store, id);
}

/**
 * Removes a user-created member. A shipped member has no "remove": it stays
 * listed so it can always be switched back on, so the same call restores it
 * to its default instead.
 */
export function removeZeusSquadMember(id: string): void {
  const store = readStore();
  const custom = store.custom.filter((member) => member.id !== id);
  const wasCustom = custom.length !== store.custom.length;
  store.custom = custom;
  if (id in store.overrides) delete store.overrides[id];
  writeStore(store, wasCustom ? id : `reset:${id}`);
}

/** Appends a user-created member and returns the id it was stored under. */
export function createZeusSquadMember(draft: ZeusSquadMemberDraft): string {
  const store = readStore();
  const taken = new Set([
    ...DEFAULT_ZEUS_SQUAD.map((member) => member.id),
    ...store.custom.map((member) => member.id),
  ]);
  const base =
    draft.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "member";
  let id = `custom-${base}`;
  for (let suffix = 2; taken.has(id); suffix += 1) id = `custom-${base}-${suffix}`;

  store.custom.push({
    id,
    name: draft.name.trim() || base,
    title: "",
    badge: draft.badge.trim(),
    description: draft.description.trim(),
    iconId: resolveIconId(draft.iconId),
    color: draft.color || ZEUS_SQUAD_COLORS[0],
    enabled: true,
    teamId: draft.teamId || resolveActiveTeamId(),
    skills: Array.isArray(draft.skills) ? draft.skills.filter(Boolean) : [],
    character: draft.character,
  });
  writeStore(store, id);
  return id;
}

/* ── Teams ─────────────────────────────────────────────────────────── */

/** Stored teams, or just the default one until the user makes another. */
function storeTeams(store: ZeusSquadStore): SquadTeam[] {
  return store.teams && store.teams.length > 0 ? store.teams : [...DEFAULT_SQUAD_TEAMS];
}

/** Points a possibly stale team id at a team that still exists. */
function coerceTeamId(store: ZeusSquadStore, teamId: string | undefined): string {
  const teams = storeTeams(store);
  return teamId && teams.some((team) => team.id === teamId) ? teamId : teams[0].id;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `team-ios-project`, then `-2`, `-3` … until the id is free. */
function uniqueId(prefix: string, base: string, taken: ReadonlySet<string>): string {
  let id = `${prefix}${base}`;
  for (let suffix = 2; taken.has(id); suffix += 1) id = `${prefix}${base}-${suffix}`;
  return id;
}

/** Every team in creation order — always at least the default one. */
export function resolveSquadTeams(): SquadTeam[] {
  return storeTeams(readStore());
}

/** The team the strip, the Live Office, and the member list are showing. */
export function resolveActiveTeamId(): string {
  const store = readStore();
  const teams = storeTeams(store);
  const requested = store.activeTeamId;
  return requested && teams.some((team) => team.id === requested) ? requested : teams[0].id;
}

/**
 * Returns the team assigned to a specific session. When `sessionId` is
 * provided and the session has an explicit assignment it takes precedence over
 * the global `activeTeamId`. Falls back gracefully so callers that have no
 * session context behave identically to the pre-scoping code.
 */
export function resolveActiveTeamIdForSession(sessionId: string | undefined): string {
  const store = readStore();
  const teams = storeTeams(store);
  if (sessionId) {
    const scoped = store.sessionTeams?.[sessionId];
    if (scoped && teams.some((team) => team.id === scoped)) return scoped;
  }
  const requested = store.activeTeamId;
  return requested && teams.some((team) => team.id === requested) ? requested : teams[0].id;
}

/** Switches the visible roster. An unknown id is ignored. */
export function setActiveTeamId(teamId: string): boolean {
  const store = readStore();
  const teams = storeTeams(store);
  if (!teams.some((team) => team.id === teamId)) return false;
  if (store.activeTeamId === teamId) return true;
  store.teams = teams;
  store.activeTeamId = teamId;
  writeStore(store, teamId);
  return true;
}

/**
 * Assigns a team to a specific session. The global `activeTeamId` is also
 * updated so the last-active session's team remains the default for any
 * context that has no session id (e.g. the Settings page team picker).
 */
export function setSessionTeamId(sessionId: string, teamId: string): boolean {
  const store = readStore();
  const teams = storeTeams(store);
  if (!teams.some((team) => team.id === teamId)) return false;
  store.teams = teams;
  store.sessionTeams = { ...store.sessionTeams, [sessionId]: teamId };
  store.activeTeamId = teamId;
  writeStore(store, teamId);
  return true;
}

/**
 * Adds a team and switches to it, so the next action is filling its roster.
 * Returns the new team id.
 */
export function createSquadTeam(name: string): string {
  const store = readStore();
  const teams = storeTeams(store);
  const trimmed = name.trim();
  const base = slugify(trimmed) || "team";
  const id = uniqueId("team-", base, new Set(teams.map((team) => team.id)));
  store.teams = [...teams, { id, name: trimmed || id }];
  store.activeTeamId = id;
  writeStore(store, id);
  return id;
}

export function renameSquadTeam(teamId: string, name: string): boolean {
  const store = readStore();
  const teams = storeTeams(store);
  const trimmed = name.trim();
  if (!trimmed) return false;
  const index = teams.findIndex((team) => team.id === teamId);
  if (index < 0) return false;
  if (teams[index].name === trimmed) return true;
  const next = [...teams];
  next[index] = { ...next[index], name: trimmed };
  store.teams = next;
  writeStore(store, teamId);
  return true;
}

/**
 * Deletes a team without deleting people: its user-created members move to
 * the team taking over, shipped members fall back to the default team, and
 * the pipelines owned by this team go with it. The last team cannot go.
 */
export function removeSquadTeam(teamId: string): boolean {
  const store = readStore();
  const teams = storeTeams(store);
  if (teams.length <= 1) return false;
  const remaining = teams.filter((team) => team.id !== teamId);
  if (remaining.length === teams.length) return false;

  const current = store.activeTeamId;
  const fallback =
    current && current !== teamId && remaining.some((team) => team.id === current)
      ? current
      : remaining[0].id;

  for (const [id, override] of Object.entries(store.overrides)) {
    if (override.teamId !== teamId) continue;
    delete override.teamId;
    if (Object.keys(override).length === 0) delete store.overrides[id];
  }
  store.custom = store.custom.map((member) =>
    member.teamId === teamId ? { ...member, teamId: fallback } : member,
  );
  store.pipelines = (store.pipelines ?? []).filter(
    (pipeline) => pipeline.teamId !== teamId,
  );
  store.teams = remaining;
  if (store.activeTeamId === teamId) store.activeTeamId = fallback;
  if (
    store.activePipelineId &&
    !(store.pipelines ?? []).some((pipeline) => pipeline.id === store.activePipelineId)
  ) {
    delete store.activePipelineId;
  }
  writeStore(store, teamId);
  return true;
}

/* ── Pipelines ─────────────────────────────────────────────────────── */

/** What the card sheet fills in for one pipeline stage. */
export interface SquadPipelineCardDraft {
  title: string;
  detail?: string;
  teamId?: string;
  assigneeId?: string;
}

/**
 * Repoints a stored pipeline at what still exists: a team that was renamed
 * or removed, or an assignee who was deleted, must not blank out a view.
 */
function coercePipeline(store: ZeusSquadStore, pipeline: SquadPipeline): SquadPipeline {
  const teams = storeTeams(store);
  const teamId = coerceTeamId(store, pipeline.teamId);
  const knownMembers = new Set([
    ...DEFAULT_ZEUS_SQUAD.map((member) => member.id),
    ...store.custom.map((member) => member.id),
  ]);
  return {
    ...pipeline,
    teamId,
    cards: (pipeline.cards ?? []).map((card) => ({
      ...card,
      teamId: teams.some((team) => team.id === card.teamId) ? card.teamId : teamId,
      assigneeId: knownMembers.has(card.assigneeId) ? card.assigneeId : "",
    })),
  };
}

/** Every pipeline in creation order. */
export function resolveSquadPipelines(): SquadPipeline[] {
  const store = readStore();
  return (store.pipelines ?? []).map((pipeline) => coercePipeline(store, pipeline));
}

/** The pipeline the Live Office draws, or `null` when none is selected. */
export function resolveActivePipeline(): SquadPipeline | null {
  const store = readStore();
  const id = store.activePipelineId;
  if (!id) return null;
  const pipeline = (store.pipelines ?? []).find((entry) => entry.id === id);
  return pipeline ? coercePipeline(store, pipeline) : null;
}

export function resolveActivePipelineId(): string | null {
  return readStore().activePipelineId ?? null;
}

/** Selects (or clears) the pipeline the office renders. Unknown ids are ignored. */
export function setActivePipelineId(pipelineId: string | null): boolean {
  const store = readStore();
  if (pipelineId !== null && !(store.pipelines ?? []).some((p) => p.id === pipelineId)) {
    return false;
  }
  const next = pipelineId ?? undefined;
  if ((store.activePipelineId ?? undefined) === next) return true;
  if (next === undefined) delete store.activePipelineId;
  else store.activePipelineId = next;
  writeStore(store, pipelineId ?? "pipeline");
  return true;
}

/** Creates a pipeline for a team and selects it. Returns the new id. */
export function createSquadPipeline(name: string, teamId?: string): string {
  const store = readStore();
  const trimmed = name.trim();
  const base = slugify(trimmed) || "pipeline";
  const id = uniqueId(
    "pipeline-",
    base,
    new Set((store.pipelines ?? []).map((pipeline) => pipeline.id)),
  );
  const pipeline: SquadPipeline = {
    id,
    name: trimmed || id,
    teamId: coerceTeamId(store, teamId),
    cards: [],
  };
  store.pipelines = [...(store.pipelines ?? []), pipeline];
  store.activePipelineId = id;
  writeStore(store, id);
  return id;
}

export function renameSquadPipeline(pipelineId: string, name: string): boolean {
  const store = readStore();
  const trimmed = name.trim();
  if (!trimmed) return false;
  const index = (store.pipelines ?? []).findIndex((p) => p.id === pipelineId);
  if (index < 0) return false;
  const pipelines = [...(store.pipelines ?? [])];
  if (pipelines[index].name === trimmed) return true;
  pipelines[index] = { ...pipelines[index], name: trimmed };
  store.pipelines = pipelines;
  writeStore(store, pipelineId);
  return true;
}

export function removeSquadPipeline(pipelineId: string): void {
  const store = readStore();
  const pipelines = (store.pipelines ?? []).filter((p) => p.id !== pipelineId);
  if (pipelines.length === (store.pipelines ?? []).length) return;
  store.pipelines = pipelines;
  if (store.activePipelineId === pipelineId) delete store.activePipelineId;
  writeStore(store, pipelineId);
}

/** Appends a card to a pipeline. Returns the card id, or `null` if missing. */
export function addSquadPipelineCard(
  pipelineId: string,
  draft: SquadPipelineCardDraft,
): string | null {
  const store = readStore();
  const index = (store.pipelines ?? []).findIndex((p) => p.id === pipelineId);
  if (index < 0) return null;
  const pipelines = [...(store.pipelines ?? [])];
  const cards = [...(pipelines[index].cards ?? [])];
  const teams = storeTeams(store);
  let cardNumber = cards.length + 1;
  const taken = new Set(cards.map((card) => card.id));
  let id = `card-${cardNumber}`;
  for (; taken.has(id); cardNumber += 1) id = `card-${cardNumber}`;
  cards.push({
    id,
    title: draft.title.trim() || `Stage ${cardNumber}`,
    detail: draft.detail?.trim() ?? "",
    teamId:
      draft.teamId && teams.some((team) => team.id === draft.teamId)
        ? draft.teamId
        : pipelines[index].teamId,
    assigneeId: draft.assigneeId?.trim() ?? "",
  });
  pipelines[index] = { ...pipelines[index], cards };
  store.pipelines = pipelines;
  writeStore(store, id);
  return id;
}

export function updateSquadPipelineCard(
  pipelineId: string,
  cardId: string,
  draft: SquadPipelineCardDraft,
): boolean {
  const store = readStore();
  const index = (store.pipelines ?? []).findIndex((p) => p.id === pipelineId);
  if (index < 0) return false;
  const pipelines = [...(store.pipelines ?? [])];
  const cards = [...(pipelines[index].cards ?? [])];
  const cardIndex = cards.findIndex((card) => card.id === cardId);
  if (cardIndex < 0) return false;
  const current = cards[cardIndex];
  const teams = storeTeams(store);
  cards[cardIndex] = {
    ...current,
    title: draft.title.trim() || current.title,
    detail: draft.detail?.trim() ?? current.detail,
    teamId:
      draft.teamId && teams.some((team) => team.id === draft.teamId)
        ? draft.teamId
        : current.teamId,
    assigneeId: draft.assigneeId ?? current.assigneeId,
  };
  pipelines[index] = { ...pipelines[index], cards };
  store.pipelines = pipelines;
  writeStore(store, cardId);
  return true;
}

export function removeSquadPipelineCard(pipelineId: string, cardId: string): void {
  const store = readStore();
  const index = (store.pipelines ?? []).findIndex((p) => p.id === pipelineId);
  if (index < 0) return;
  const pipelines = [...(store.pipelines ?? [])];
  const cards = (pipelines[index].cards ?? []).filter((card) => card.id !== cardId);
  if (cards.length === (pipelines[index].cards ?? []).length) return;
  pipelines[index] = { ...pipelines[index], cards };
  store.pipelines = pipelines;
  writeStore(store, cardId);
}
