import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  DEFAULT_TEAM_ID,
  DEFAULT_ZEUS_SQUAD,
  ZEUS_SQUAD_COLORS,
  ZEUS_SQUAD_STORAGE_KEY,
  addSquadPipelineCard,
  createSquadPipeline,
  createSquadTeam,
  createZeusSquadMember,
  nearestSquadColor,
  removeSquadPipelineCard,
  removeSquadTeam,
  removeZeusSquadMember,
  renameSquadTeam,
  resetZeusSquadMember,
  resolveActivePipeline,
  resolveActivePipelineId,
  resolveActiveTeamId,
  resolveActiveTeamIdForSession,
  resolveSquadMembersForTeam,
  resolveSquadMemberTemplates,
  resolveSquadPipelines,
  resolveSquadTeams,
  resolveZeusSquadMembers,
  saveZeusSquadMember,
  setSessionTeamId,
  updateSquadPipelineCard,
} from "../src/features/zeus-squad/zeus-squad.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

/** The roster persists in localStorage; give Node one so the store is real. */
const memory = new Map();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
  },
});

const startClean = () => memory.delete(ZEUS_SQUAD_STORAGE_KEY);

const SQUAD_IDS = [
  "ui-designer",
  "ux-designer",
  "android-lead",
  "ios-lead",
  "security-checker",
  "qa-specialist",
];

const draft = (name) => ({
  name,
  badge: "Analytics",
  description: "",
  iconId: "target",
  color: "#f59e0b",
});

test("workspace view tabs sit outside the conversation topbar drag region", async () => {
  const chatShellCss = await read("../src/styles/chat-shell.css");

  // `.conversation-topbar` owns the pane's first --ds-toolbar-height band and
  // marks it `-webkit-app-region: drag`. A control rendered inside that band
  // loses its click to the window on macOS and never shows the pointer
  // cursor, so the strip has to clear the band and opt out of the region.
  const rule = chatShellCss.match(/\.team-roster-container \{[^}]*\}/);
  assert.ok(rule, "team-roster-container rule is missing");
  assert.match(rule[0], /margin-top: var\(--ds-toolbar-height\)/);
  assert.match(rule[0], /app-region: no-drag/);
  assert.match(rule[0], /-webkit-app-region: no-drag/);
});

test("team strip, Squad tab and Settings read one Zeus Squad roster", async () => {
  const [squadSrc, teamSrc, rosterSrc, squadTabSrc, subagentsPageSrc] =
    await Promise.all([
      read("../src/features/zeus-squad/zeus-squad.ts"),
      read("../src/features/zeus-squad/use-zeus-squad.ts"),
      read("../src/features/chat/transcript/TeamRosterBar.tsx"),
      read("../src/components/workpanel/SquadTab.tsx"),
      read("../src/components/settings/AgentSubagentsPage.tsx"),
    ]);

  // One pure store owns the roster; one React entry binds icons and the hook.
  assert.match(squadSrc, /export const DEFAULT_ZEUS_SQUAD/);
  assert.match(teamSrc, /export function useZeusSquad/);
  assert.match(teamSrc, /export \* from "\.\/zeus-squad"/);

  // The roster lives in the office now: the bar only routes views, and the
  // office draws the active team's enabled members from the same store.
  assert.doesNotMatch(rosterSrc, /useSubagentsData/);
  assert.doesNotMatch(rosterSrc, /getCharacterArchetype/);
  assert.doesNotMatch(rosterSrc, /useZeusSquad/);
  const officeSrc = await read("../src/features/chat/transcript/PixelAgentsOffice.tsx");
  assert.match(officeSrc, /useZeusSquad\(\)/);
  assert.match(officeSrc, /filter\(\(member\) => member\.enabled\)/);

  // The Work Panel Squad tab and Settings edit the same list.
  assert.doesNotMatch(squadTabSrc, /DEFAULT_SQUAD_ROLES/);
  assert.match(squadTabSrc, /useZeusSquad\(\)/);
  assert.match(subagentsPageSrc, /useZeusSquad\(\)/);
  assert.match(subagentsPageSrc, /settings\.zeusSquad\.groupLabel/);

  // The roster is configurable, not a fixed coding crew.
  assert.match(subagentsPageSrc, /settings\.zeusSquad\.add/);
  assert.match(subagentsPageSrc, /removeZeusSquadMember/);
  assert.match(
    await read("../src/components/settings/ZeusSquadMemberSheet.tsx"),
    /createZeusSquadMember\(draft\)/,
  );
});

test("the shipped squad is the six default roles, all enabled, in default order", () => {
  startClean();
  assert.deepEqual(
    DEFAULT_ZEUS_SQUAD.map((member) => member.id),
    SQUAD_IDS,
  );

  const roster = resolveZeusSquadMembers();
  assert.deepEqual(
    roster.map((member) => member.id),
    SQUAD_IDS,
  );
  assert.ok(roster.every((member) => member.enabled));
  assert.ok(roster.every((member) => !member.customized && !member.custom));
  // A shipped role always carries the skill binding and prompt template the
  // Squad Roles tab renders.
  assert.ok(roster.every((member) => member.skillId && member.samplePrompt));
});

test("a user creates, edits, and removes their own squad member", () => {
  startClean();

  const id = createZeusSquadMember(draft("Data Analyst"));
  assert.equal(id, "custom-data-analyst");

  let roster = resolveZeusSquadMembers();
  assert.equal(roster.length, SQUAD_IDS.length + 1);
  const added = roster.at(-1);
  assert.equal(added.id, id);
  assert.equal(added.name, "Data Analyst");
  assert.equal(added.badge, "Analytics");
  assert.equal(added.iconId, "target");
  assert.equal(added.custom, true);
  assert.equal(added.enabled, true);
  // Nothing shipped was disturbed.
  assert.ok(roster.slice(0, SQUAD_IDS.length).every((member) => !member.custom));

  // A second member with the same name still gets its own id.
  const secondId = createZeusSquadMember(draft("Data Analyst"));
  assert.equal(secondId, "custom-data-analyst-2");

  // Editing a custom member changes it in place instead of stacking overrides.
  saveZeusSquadMember(secondId, { badge: "Reporting", enabled: false });
  roster = resolveZeusSquadMembers();
  const edited = roster.find((member) => member.id === secondId);
  assert.equal(edited.badge, "Reporting");
  assert.equal(edited.enabled, false);
  const stored = JSON.parse(memory.get(ZEUS_SQUAD_STORAGE_KEY));
  assert.equal(stored.overrides?.[secondId], undefined);

  removeZeusSquadMember(secondId);
  roster = resolveZeusSquadMembers();
  assert.equal(
    roster.some((member) => member.id === secondId),
    false,
  );
  assert.equal(
    roster.some((member) => member.id === id),
    true,
  );
});

test("a shipped member is edited through an override and resets to its default", () => {
  startClean();
  const shipped = resolveZeusSquadMembers().find((member) => member.id === "android-lead");
  assert.equal(shipped.name, "Evan");
  assert.equal(shipped.enabled, true);

  saveZeusSquadMember("android-lead", { name: "Evan II", enabled: false });
  let roster = resolveZeusSquadMembers();
  let changed = roster.find((member) => member.id === "android-lead");
  assert.equal(changed.name, "Evan II");
  assert.equal(changed.enabled, false);
  assert.equal(changed.customized, true);
  // The default itself is untouched, so reset has something to restore.
  assert.equal(DEFAULT_ZEUS_SQUAD.find((member) => member.id === "android-lead").name, "Evan");

  resetZeusSquadMember("android-lead");
  roster = resolveZeusSquadMembers();
  changed = roster.find((member) => member.id === "android-lead");
  assert.equal(changed.name, "Evan");
  assert.equal(changed.enabled, true);
  assert.equal(changed.customized, false);

  // Hiding a member keeps it listed so Settings can switch it back on, and it
  // is what the team strip filters out.
  saveZeusSquadMember("qa-specialist", { enabled: false });
  const visible = resolveZeusSquadMembers().filter((member) => member.enabled);
  assert.equal(
    visible.some((member) => member.id === "qa-specialist"),
    false,
  );
  assert.equal(
    resolveZeusSquadMembers().some((member) => member.id === "qa-specialist"),
    true,
  );
});

test("storage written before members were addable still resolves", () => {
  startClean();
  memory.set(
    ZEUS_SQUAD_STORAGE_KEY,
    JSON.stringify({ "android-lead": { name: "Old Name", badge: "Kotlin" } }),
  );

  const roster = resolveZeusSquadMembers();
  const member = roster.find((entry) => entry.id === "android-lead");
  assert.equal(member.name, "Old Name");
  assert.equal(member.badge, "Kotlin");
  assert.equal(member.customized, true);
  assert.equal(roster.length, SQUAD_IDS.length);
});

test("a team owns its roster and the pipeline the Live Office draws", () => {
  startClean();

  // The default team ships first and holds the shipped squad.
  assert.deepEqual(resolveSquadTeams(), [{ id: "zeus-squad", name: "Zeus Squad" }]);
  assert.equal(resolveActiveTeamId(), "zeus-squad");
  assert.equal(resolveSquadMembersForTeam("zeus-squad").length, SQUAD_IDS.length);
  // Shipped members carry skills and a character like any custom row.
  const shipped = resolveZeusSquadMembers()[0];
  assert.ok(shipped.skills.length > 0);
  assert.ok(shipped.character);
  assert.equal(shipped.teamId, "zeus-squad");

  // Creating a team switches to it, so the next action fills its roster.
  const teamId = createSquadTeam("iOS Project");
  assert.equal(teamId, "team-ios-project");
  assert.equal(resolveActiveTeamId(), teamId);
  assert.deepEqual(resolveSquadMembersForTeam(teamId), []);

  // A member created now lands on the active team, not the default one.
  const memberId = createZeusSquadMember(draft("Citra"));
  assert.equal(
    resolveSquadMembersForTeam(teamId).some((member) => member.id === memberId),
    true,
  );
  saveZeusSquadMember(memberId, { skills: ["SwiftUI", "XCTest"] });
  assert.deepEqual(
    resolveZeusSquadMembers().find((member) => member.id === memberId).skills,
    ["SwiftUI", "XCTest"],
  );

  // A pipeline belongs to a team; the active one is what the office renders.
  const pipelineId = createSquadPipeline("Mobile Dev", teamId);
  assert.equal(resolveActivePipelineId(), pipelineId);
  assert.equal(resolveActivePipeline().teamId, teamId);
  assert.equal(resolveSquadPipelines().length, 1);

  const cardId = addSquadPipelineCard(pipelineId, {
    title: "Wireframe",
    detail: "Sketch the screens",
    teamId,
    assigneeId: memberId,
  });
  assert.equal(cardId, "card-1");
  assert.deepEqual(
    resolveActivePipeline().cards.map((card) => [card.title, card.assigneeId]),
    [["Wireframe", memberId]],
  );

  updateSquadPipelineCard(pipelineId, cardId, { title: "Wireframe v2" });
  assert.equal(resolveActivePipeline().cards[0].title, "Wireframe v2");

  // Deleting the assignee leaves the card, not a dangling id.
  removeZeusSquadMember(memberId);
  assert.equal(resolveActivePipeline().cards[0].assigneeId, "");

  removeSquadPipelineCard(pipelineId, cardId);
  assert.deepEqual(resolveActivePipeline().cards, []);

  // Renaming keeps the id, so the active pipeline stays selected.
  renameSquadTeam(teamId, "iOS App");
  assert.equal(resolveSquadTeams().find((team) => team.id === teamId).name, "iOS App");
  assert.equal(resolveActiveTeamId(), teamId);

  // Deleting a team never deletes people: custom members move to the team
  // taking over, and the pipelines owned by that team go with it.
  const movedId = createZeusSquadMember(draft("Bayu"));
  assert.equal(
    resolveSquadMembersForTeam(teamId).some((member) => member.id === movedId),
    true,
  );
  assert.equal(removeSquadTeam(teamId), true);
  assert.equal(resolveActiveTeamId(), "zeus-squad");
  assert.deepEqual(resolveSquadPipelines(), []);
  const moved = resolveZeusSquadMembers().find((member) => member.id === movedId);
  assert.equal(moved.teamId, "zeus-squad");
  // The last remaining team cannot go.
  assert.equal(removeSquadTeam("zeus-squad"), false);
  assert.deepEqual(resolveSquadTeams(), [{ id: "zeus-squad", name: "Zeus Squad" }]);
});

test("each session retains its own assigned team independently", () => {
  startClean();
  const testTeamId = createSquadTeam("Tim Tes");
  const session1 = "session-1-zeus";
  const session2 = "session-2-tes";

  // Assign session1 to default team "zeus-squad"
  setSessionTeamId(session1, "zeus-squad");
  // Assign session2 to newly created team "Tim Tes"
  setSessionTeamId(session2, testTeamId);

  // Switching between sessions resolves each session's assigned team independently
  assert.equal(resolveActiveTeamIdForSession(session1), "zeus-squad");
  assert.equal(resolveActiveTeamIdForSession(session2), testTeamId);

  // Fallback without sessionId returns the last active team
  assert.equal(resolveActiveTeamIdForSession(undefined), testTeamId);
});

test("Settings and the office configure teams, members and pipelines from one store", async () => {
  const [pageSrc, memberSheetSrc, cardSheetSrc, officeSrc, hookSrc] =
    await Promise.all([
      read("../src/components/settings/AgentSubagentsPage.tsx"),
      read("../src/components/settings/ZeusSquadMemberSheet.tsx"),
      read("../src/components/settings/SquadPipelineCardSheet.tsx"),
      read("../src/features/chat/transcript/PixelAgentsOffice.tsx"),
      read("../src/features/zeus-squad/use-zeus-squad.ts"),
    ]);

  // Settings: teams group, the active team's members, then the pipelines.
  assert.match(pageSrc, /settings\.zeusSquad\.teams/);
  assert.match(pageSrc, /settings\.zeusSquad\.pipelines/);
  assert.match(pageSrc, /createSquadTeam\(/);
  assert.match(pageSrc, /renameSquadTeam\(/);
  assert.match(pageSrc, /removeSquadTeam\(/);
  assert.match(pageSrc, /setActiveTeamId\(/);
  assert.match(pageSrc, /addSquadPipelineCard\(/);
  assert.match(pageSrc, /setActivePipelineId\(/);
  assert.match(pageSrc, /<SquadNameSheet/);
  assert.match(pageSrc, /<SquadPipelineCardSheet/);
  // A member row reads like a built-in one: skill chips, then the character.
  assert.match(pageSrc, /member\.skills\.map/);
  assert.match(pageSrc, /resolveSquadCharacter\(member\)/);

  // The member sheet edits skills, character, and team beside name and icon.
  assert.match(memberSheetSrc, /settings\.zeusSquad\.skills/);
  assert.match(memberSheetSrc, /settings\.zeusSquad\.character/);
  assert.match(memberSheetSrc, /CHARACTER_ARCHETYPES/);
  assert.match(memberSheetSrc, /teamId/);

  // The card sheet picks the team and one of its members to assign.
  assert.match(cardSheetSrc, /settings\.zeusSquad\.cardAssignee/);
  assert.match(cardSheetSrc, /member\.teamId === teamId/);

  // The office renders the store's active pipeline instead of a fixed crew.
  assert.match(officeSrc, /useSquadWorkspace\(\)/);
  assert.match(officeSrc, /pipelineStages/);

  // One React entry still exposes the single roster and the workspace.
  assert.match(hookSrc, /export function useZeusSquad/);
  assert.match(hookSrc, /export function useSquadWorkspace/);
});

test("create-member suggestions fill a draft and never store themselves", () => {
  startClean();

  const builtin = {
    id: "builtin:explorer",
    name: "Explorer",
    badge: "Task(explorer)",
    description: "Search the codebase",
    skills: ["Read", "Grep"],
    iconId: "person",
    color: "#06b6d4",
  };

  // The default team already holds every shipped role, so only what the page
  // passes in comes back — offered, not stored.
  const held = resolveSquadMemberTemplates(DEFAULT_TEAM_ID, [builtin]);
  assert.deepEqual(
    held.map((template) => template.name),
    ["Explorer"],
  );
  assert.equal(resolveZeusSquadMembers().length, SQUAD_IDS.length);

  // A team with no members yet is offered every shipped role, and a repeat by
  // name is dropped even when it arrives under a different id.
  const teamId = createSquadTeam("Design Pod");
  const fresh = resolveSquadMemberTemplates(teamId, [
    builtin,
    { ...builtin, id: "builtin:ui-designer", name: "UI Designer" },
  ]);
  assert.deepEqual(
    fresh.map((template) => template.name),
    [...DEFAULT_ZEUS_SQUAD.map((role) => role.name), "Explorer"],
  );
  assert.equal(resolveZeusSquadMembers().length, SQUAD_IDS.length);

  assert.equal(removeSquadTeam(teamId), true);
});

test("a suggestion built from a character color lands on an offered swatch", () => {
  startClean();

  assert.ok(ZEUS_SQUAD_COLORS.includes(nearestSquadColor("#ec4899")));
  assert.equal(nearestSquadColor("#06b6d4"), "#06b6d4");
  // Anything unparseable falls back to the first swatch, never an off-list hex.
  assert.equal(nearestSquadColor("not-a-color"), ZEUS_SQUAD_COLORS[0]);
});

test("the member sheet offers built-ins and shipped roles as pre-fills only", async () => {
  const [pageSrc, sheetSrc, settingsSrc] = await Promise.all([
    read("../src/components/settings/AgentSubagentsPage.tsx"),
    read("../src/components/settings/ZeusSquadMemberSheet.tsx"),
    read("../src/components/settings/subagent-settings.ts"),
  ]);

  // Settings hands the built-in catalog over as suggestions instead of
  // listing those built-ins as roster rows of their own.
  assert.match(pageSrc, /toSquadMemberTemplates\(builtins\)/);
  assert.match(pageSrc, /templates=\{memberTemplates\}/);
  assert.match(settingsSrc, /export function toSquadMemberTemplates/);
  assert.match(settingsSrc, /badge: `Task\(\$\{row\.name\}\)`/);

  // A tap only fills the fields; the member joins the roster on save.
  assert.match(sheetSrc, /resolveSquadMemberTemplates\(teamId, templates\)/);
  assert.match(sheetSrc, /const applyTemplate/);
  assert.match(sheetSrc, /settings\.zeusSquad\.templates/);
  assert.match(sheetSrc, /createZeusSquadMember\(draft\)/);
});
