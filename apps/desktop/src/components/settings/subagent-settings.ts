import {
  SUBAGENT_PRESETS,
  fallbackBuiltinDefinitions,
  type SubagentDefinition,
  type UserSubagentRecord,
} from "@pi-desktop/shared";
import { api } from "../../lib/api";
import {
  ZEUS_SQUAD_ICON_CHARACTERS,
  ZEUS_SQUAD_ICON_IDS,
  nearestSquadColor,
  type SquadMemberTemplate,
  type ZeusSquadIconId,
} from "../../features/zeus-squad/zeus-squad";
import { getCharacterArchetype, getSubagentProfile } from "./subagent-character-profiles";

/**
 * One shipped default plus whether this installation still offers it.
 *
 * A switched-off builtin stays in the list on purpose: it has no document to
 * delete, so its row and its switch are the only way back on.
 */
export type BuiltinSubagentRow = SubagentDefinition & { enabled: boolean };

/** User-owned documents plus the shipped defaults, switched off ones included. */
export type SubagentPageData = {
  owned: UserSubagentRecord[];
  builtins: BuiltinSubagentRow[];
};

export const EMPTY_SUBAGENT_PAGE: SubagentPageData = {
  owned: [],
  builtins: [],
};

/**
 * Built-in subagents as create-member suggestions.
 *
 * Settings no longer lists them as roster rows of their own: the member sheet
 * fills its form from them instead, so picking one only pre-fills a draft and
 * nothing joins the roster until the user saves it.
 */
export function toSquadMemberTemplates(rows: BuiltinSubagentRow[]): SquadMemberTemplate[] {
  return rows.map((row) => {
    const character = getSubagentProfile(row.name).archetype;
    const preset = SUBAGENT_PRESETS.find((candidate) => candidate.id === row.name);
    return {
      id: `builtin:${row.name}`,
      name: preset?.name ?? prettifySubagentHandle(row.name),
      // The roster's badge line for a member that maps to a runtime delegate.
      badge: `Task(${row.name})`,
      description: row.description,
      skills: [...row.tools],
      character,
      iconId: squadIconForCharacter(character),
      color: nearestSquadColor(getCharacterArchetype(character).color),
    };
  });
}

/** The member icon that already draws this character, so a suggestion matches. */
function squadIconForCharacter(character: string): ZeusSquadIconId {
  return (
    ZEUS_SQUAD_ICON_IDS.find((id) => ZEUS_SQUAD_ICON_CHARACTERS[id] === character) ?? "bot"
  );
}

function prettifySubagentHandle(handle: string): string {
  return handle
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Fired after a subagent is enabled, disabled, created, edited, or removed.
 *
 * The office, the floating panel, and the sticky context bar read the same
 * catalog through `useSubagentsData`, which fetches once on mount; without
 * this they would keep showing a roster the user already switched off until
 * the next reload.
 */
export const SUBAGENT_CHANGE_EVENT = "zeus:subagents-changed";

export function notifySubagentsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SUBAGENT_CHANGE_EVENT));
}

/**
 * Settings lists two sources: the writable global registry, and the shipped
 * defaults `Task` offers. Catalog load failures must not hide the user list, so
 * builtins fall back to the shared preset catalog — reported enabled, because a
 * failed read cannot say which handles the user turned off.
 */
export async function fetchSubagentPageData(): Promise<SubagentPageData> {
  const ownedResult = await api.listUserSubagents({ level: "global" });
  const owned = ownedResult.subagents ?? [];
  const enabledHandles = new Set(owned.filter((row) => row.enabled).map((row) => row.id));
  try {
    const catalog = await api.subagentCatalog();
    // Older main processes answer without `builtins`; derive the group from the
    // effective catalog then, which is how this page read it before builtins
    // could be switched off at all.
    const builtins =
      catalog.builtins ??
      (catalog.subagents ?? [])
        .filter((item) => item.source === "builtin")
        .map((item) => ({ ...item, enabled: true }));
    return {
      owned,
      builtins: builtins.filter(
        (item) => item.source === "builtin" && !enabledHandles.has(item.name),
      ),
    };
  } catch {
    return {
      owned,
      builtins: fallbackBuiltinDefinitions()
        .map((item) => ({ ...item, enabled: true }))
        .filter((item) => !enabledHandles.has(item.name)),
    };
  }
}
