import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GLOBAL_SCOPE, type UserSubagentRecord } from "@pi-desktop/shared";
import { api } from "../../lib/api";
import { useAppStore } from "../../stores/app-store";
import { useHostCollection } from "../../hooks/use-host-collection";
import {
  AgentCapabilityPage,
  CapabilityButton,
  CapabilityEmpty,
  CapabilityGroupHeader,
  CapabilityPanel,
  CapabilityRow,
  CapabilityRowMenu,
  CapabilityToggle,
  CapabilityToolbar,
  matchesCapabilitySearch,
  useArmedDelete,
  type CapabilityMenuItem,
} from "./AgentCapabilityLayout";
import {
  SubagentEditorSheet,
  draftFromRecord,
  emptySubagentDraft,
  mergeSubagentToolGrant,
  type SubagentDraft,
} from "./SubagentEditorSheet";
import {
  EMPTY_SUBAGENT_PAGE,
  fetchSubagentPageData,
  notifySubagentsChanged,
  toSquadMemberTemplates,
} from "./subagent-settings";
import { ZeusSquadMemberSheet } from "./ZeusSquadMemberSheet";
import { SquadNameSheet } from "./SquadNameSheet";
import { SquadPipelineCardSheet } from "./SquadPipelineCardSheet";
import {
  addSquadPipelineCard,
  createSquadPipeline,
  createSquadTeam,
  removeSquadPipeline,
  removeSquadPipelineCard,
  removeSquadTeam,
  removeZeusSquadMember,
  renameSquadPipeline,
  renameSquadTeam,
  resetZeusSquadMember,
  resolveSquadCharacter,
  saveZeusSquadMember,
  setActivePipelineId,
  setActiveTeamId,
  updateSquadPipelineCard,
  useSquadWorkspace,
  useZeusSquad,
  type SquadPipeline,
  type SquadPipelineCard,
  type SquadPipelineCardDraft,
  type SquadTeam,
  type ZeusSquadTeamMember,
} from "../../features/zeus-squad/use-zeus-squad";
import { getCharacterArchetype, getSubagentProfile, saveSubagentProfile } from "./subagent-character-profiles";
import {
  IconBot,
  IconCheck,
  IconConfig,
  IconFolderOpen,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUser,
  IconWorkflow,
} from "../icons";
import { TooltipButton } from "../ui";

const GLOBAL_SUBAGENTS_PATH = "~/.agents/subagents";

type SubagentEditorState = {
  draft: SubagentDraft;
  editing: UserSubagentRecord | null;
  /** Selected template chip; set when Copy as mine pre-fills a builtin. */
  presetId?: string;
};

export function AgentSubagentsPage() {
  const { t } = useTranslation();
  const showToast = useAppStore((state) => state.showToast);
  const {
    data: { owned, builtins },
    setData: setSubagents,
    loading,
    refreshing,
    reload: load,
  } = useHostCollection(fetchSubagentPageData, EMPTY_SUBAGENT_PAGE, (error) =>
    showToast(error instanceof Error ? error.message : String(error), { variant: "error" }),
  );
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [editor, setEditor] = useState<SubagentEditorState | null>(null);
  /** `member: null` opens the sheet in create mode. */
  const [squadSheet, setSquadSheet] = useState<{
    member: ZeusSquadTeamMember | null;
  } | null>(null);
  /** Naming a team or a pipeline: `id: null` creates, a string renames. */
  const [nameSheet, setNameSheet] = useState<{
    kind: "team" | "pipeline";
    id: string | null;
    name: string | null;
  } | null>(null);
  /** A pipeline card; `card: null` appends one to `pipelineId`. */
  const [cardSheet, setCardSheet] = useState<{
    pipelineId: string;
    card: SquadPipelineCard | null;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  // The roster the chat team strip and the Live Office render, plus the teams
  // and pipelines configured beside it — one store, so all three stay in sync.
  const squadMembers = useZeusSquad();
  const workspace = useSquadWorkspace();
  const { armed, setArmed } = useArmedDelete();

  // Built-ins stopped being roster rows of their own: the create-member sheet
  // offers them to pre-fill its form, so a pick only fills a draft and nothing
  // joins the roster until the user saves it.
  const memberTemplates = useMemo(() => toSquadMemberTemplates(builtins), [builtins]);

  /**
   * The switch flips locally first and only reverts if the host refuses, so one
   * row's request never blanks the list or freezes the others.
   */
  const toggle = async (subagent: UserSubagentRecord) => {
    if (busyId === subagent.id) return;
    const next = !subagent.enabled;
    setBusyId(subagent.id);
    setSubagents((current) => ({
      ...current,
      owned: current.owned.map((row) =>
        row.id === subagent.id ? { ...row, enabled: next } : row,
      ),
    }));
    try {
      await api.setUserSubagentEnabled(subagent.id, next);
      notifySubagentsChanged();
      showToast(
        t(next ? "settings.capabilityEnabled" : "settings.capabilityDisabled", {
          name: subagent.name || subagent.id,
        }),
        { variant: "success" },
      );
    } catch (error) {
      setSubagents((current) => ({
        ...current,
        owned: current.owned.map((row) =>
          row.id === subagent.id ? { ...row, enabled: subagent.enabled } : row,
        ),
      }));
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const openEdit = async (subagent: UserSubagentRecord) => {
    setBusyId(subagent.id);
    try {
      const result = await api.readUserSubagent(subagent.id);
      setEditor({
        draft: draftFromRecord(result.subagent ?? subagent, result.body ?? ""),
        editing: result.subagent ?? subagent,
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const save = async () => {
    if (!editor) return;
    const { draft, editing } = editor;
    const targetId = editing ? editing.id : (draft.id || draft.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-"));
    saveSubagentProfile({
      id: targetId,
      archetype: draft.archetype || "hermes",
      customName: draft.name.trim(),
      customRole: draft.role?.trim() || "Specialist",
    });
    const payload = {
      ...(draft.id ? { id: draft.id } : {}),
      name: draft.name.trim(),
      description: draft.description.trim(),
      body: draft.body,
      tools: mergeSubagentToolGrant(draft.inheritTools, draft.tools),
      // An empty string clears a pinned model; omitting it would keep the old one.
      model: draft.model.trim(),
      fallbackModels: draft.fallbackModels.map((pin) => pin.trim()),
      thinkingLevel: draft.thinkingLevel,
      // `0` clears the output cap, so the delegate follows the model again.
      maxTokens: draft.maxTokens,
      enabled: draft.enabled,
      scope: draft.scope,
    };
    setSaving(true);
    try {
      if (editing) await api.updateUserSubagent(editing.id, payload);
      else await api.createUserSubagent(payload);
      await load();
      notifySubagentsChanged();
      showToast(
        t(editing ? "settings.subagentSaved" : "settings.subagentCreated", {
          name: payload.name,
        }),
        { variant: "success" },
      );
      setEditor(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const reveal = async (subagent: UserSubagentRecord) => {
    try {
      await api.revealSubagent({ id: subagent.id, path: subagent.path });
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    }
  };

  const remove = async (subagent: UserSubagentRecord) => {
    setBusyId(subagent.id);
    try {
      await api.removeUserSubagent(subagent.id);
      await load();
      notifySubagentsChanged();
      showToast(t("settings.capabilityDeleted", { name: subagent.name || subagent.id }), {
        variant: "success",
      });
    } catch (error) {
      showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
    } finally {
      setBusyId(null);
      setArmed(null);
    }
  };

  const DEFAULT_ZEUS_NAME = "⚡ Zeus (Lead Agent)";
  const DEFAULT_ZEUS_DESC = "Mengoordinasikan alur kerja, mendistribusikan task ke sub-agent";
  const DEFAULT_ZEUS_TOOLS = ["Read", "Glob", "Grep", "Edit", "Write", "Bash"];

  const zeusOwned = owned.find((r) => r.id === "zeus");
  const zeusName = zeusOwned?.name || DEFAULT_ZEUS_NAME;
  const zeusDesc = zeusOwned?.description || DEFAULT_ZEUS_DESC;
  const zeusMatchesSearch = matchesCapabilitySearch(search, zeusName, "zeus", zeusDesc);

  const openEditZeus = async () => {
    const profile = getSubagentProfile("zeus");
    if (zeusOwned) {
      await openEdit(zeusOwned);
    } else {
      setEditor({
        draft: {
          id: "zeus",
          name: profile.customName || DEFAULT_ZEUS_NAME,
          role: profile.customRole || "Main Orchestrator",
          archetype: profile.archetype || "zeus",
          description: DEFAULT_ZEUS_DESC,
          tools: [...DEFAULT_ZEUS_TOOLS],
          inheritTools: false,
          model: "",
          fallbackModels: [],
          thinkingLevel: "",
          maxTokens: 0,
          body:
            `You are Zeus (Lead Agent) — the Main System Coordinator and Orchestrator.\n\n` +
            `## Mission\n` +
            `Mengoordinasikan alur kerja, mendistribusikan task ke sub-agent:\n` +
            `- Athena / Explorer untuk eksplorasi codebase dan verifikasi spesifikasi.\n` +
            `- Hermes / Fixer untuk implementasi kode multi-file sesuai spesifikasi.\n` +
            `- Apollo / Test runner untuk verifikasi pengujian dan validasi.\n\n` +
            `## Guidelines\n` +
            `- Pertahankan arsitektur yang bersih dan backward compatible.\n` +
            `- Delegasikan sub-task dengan instruksi dan acceptance criteria yang jelas.\n` +
            `- Rangkum hasil pekerjaan sub-agent kepada user.\n`,
          enabled: true,
          scope: GLOBAL_SCOPE,
        },
        editing: null,
      });
    }
  };

  const toggleZeus = async () => {
    if (!zeusOwned) {
      const payload = {
        id: "zeus",
        name: DEFAULT_ZEUS_NAME,
        description: DEFAULT_ZEUS_DESC,
        body: "You are Zeus (Lead Agent) — Main Orchestrator.",
        tools: [...DEFAULT_ZEUS_TOOLS],
        model: "",
        fallbackModels: [],
        thinkingLevel: "" as const,
        maxTokens: 0,
        enabled: false,
        scope: GLOBAL_SCOPE,
      };
      setBusyId("zeus");
      try {
        await api.createUserSubagent(payload);
        await load();
        notifySubagentsChanged();
        showToast(
          t("settings.capabilityDisabled", { name: DEFAULT_ZEUS_NAME }),
          { variant: "success" },
        );
      } catch (error) {
        showToast(error instanceof Error ? error.message : String(error), { variant: "error" });
      } finally {
        setBusyId(null);
      }
    } else {
      await toggle(zeusOwned);
    }
  };

  /**
   * Zeus Squad lives in renderer storage, so its toggle flips immediately and
   * every consumer (the strip, the Squad tab, this list) re-renders through the
   * shared change event.
   */
  const toggleSquadMember = (member: ZeusSquadTeamMember) => {
    const next = !member.enabled;
    saveZeusSquadMember(member.id, { enabled: next });
    showToast(
      t(next ? "settings.capabilityEnabled" : "settings.capabilityDisabled", {
        name: member.name,
      }),
      { variant: "success" },
    );
  };

  const resetSquadMember = (member: ZeusSquadTeamMember) => {
    resetZeusSquadMember(member.id);
    showToast(t("settings.zeusSquad.resetDone", { name: member.name }), {
      variant: "success",
    });
  };

  const removeSquadMember = (member: ZeusSquadTeamMember) => {
    removeZeusSquadMember(member.id);
    showToast(t("settings.capabilityDeleted", { name: member.name }), {
      variant: "success",
    });
  };

  const visibleSquadMembers = useMemo(
    () =>
      squadMembers.filter((member) =>
        matchesCapabilitySearch(search, member.name, member.id, member.badge),
      ),
    [search, squadMembers],
  );

  const renderSquadMember = (member: ZeusSquadTeamMember) => {
    const menuKey = `squad:${member.id}`;
    const character = getCharacterArchetype(resolveSquadCharacter(member));
    const items: CapabilityMenuItem[] = [
      ...(member.customized && !member.custom
        ? [
            {
              key: "reset",
              label: t("settings.zeusSquad.reset"),
              icon: <IconConfig size={14} />,
              onSelect: () => {
                setMenuFor(null);
                resetSquadMember(member);
              },
            },
          ]
        : []),
      ...(member.custom
        ? [
            {
              key: "remove",
              label: t("extensions.subagents.remove"),
              icon: <IconTrash size={14} />,
              danger: true,
              onSelect: () => {
                setMenuFor(null);
                removeSquadMember(member);
              },
            },
          ]
        : []),
    ];
    return (
      <CapabilityRow
        key={menuKey}
        glyph={
          <span style={{ color: member.color, display: "inline-flex" }}>
            <member.icon size={16} />
          </span>
        }
        name={member.name}
        off={!member.enabled}
        command={member.skillId || undefined}
        badges={
          <>
            {member.badge ? (
              <span className="agent-capability-badge">{member.badge}</span>
            ) : null}
            {/* The character the Live Office draws this member as. */}
            <span className="agent-capability-badge">
              {`${character.avatarEmoji} ${character.name}`}
            </span>
          </>
        }
        description={member.description}
        meta={
          member.skills.length > 0 ? (
            <>
              {member.skills.map((skill) => (
                <code key={skill}>{skill}</code>
              ))}
            </>
          ) : undefined
        }
        menuOpen={menuFor === menuKey}
        actions={
          <>
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip={t("extensions.subagents.edit")}
              onClick={() => setSquadSheet({ member })}
            >
              <IconPencil size={15} />
            </TooltipButton>
            {items.length > 0 ? (
              <CapabilityRowMenu
                label={t("extensions.subagents.rowActions", { name: member.name })}
                items={items}
                open={menuFor === menuKey}
                onOpenChange={(open) => setMenuFor(open ? menuKey : null)}
              />
            ) : null}
            <CapabilityToggle
              checked={member.enabled}
              label={t("settings.toggleCapability", { name: member.name })}
              onChange={() => toggleSquadMember(member)}
            />
          </>
        }
      />
    );
  };

  const visibleOwned = useMemo(
    () =>
      owned
        .filter((subagent) => subagent.id !== "zeus")
        .filter((subagent) =>
          matchesCapabilitySearch(search, subagent.name, subagent.id, subagent.description),
        ),
    [search, owned],
  );

  const openCreate = () => setEditor({ draft: emptySubagentDraft(), editing: null });
  const searching = Boolean(search.trim());
  const noMatches =
    searching &&
    !zeusMatchesSearch &&
    visibleSquadMembers.length === 0 &&
    visibleOwned.length === 0;
  const showOwnedGroup = !searching || visibleOwned.length > 0;

  const renderRow = (subagent: UserSubagentRecord) => {
    const name = subagent.name || subagent.id;
    const busy = busyId === subagent.id;
    const isArmed = armed === subagent.id;
    const items: CapabilityMenuItem[] = [
      {
        key: "reveal",
        label: t("extensions.subagents.reveal"),
        icon: <IconFolderOpen size={14} />,
        onSelect: () => {
          setMenuFor(null);
          void reveal(subagent);
        },
      },
      {
        key: "remove",
        label: isArmed
          ? t("settings.capabilityRemoveConfirm")
          : t("extensions.subagents.remove"),
        icon: <IconTrash size={14} />,
        danger: true,
        onSelect: () => {
          if (isArmed) {
            setMenuFor(null);
            void remove(subagent);
          } else {
            setArmed(subagent.id);
          }
        },
      },
    ];
    return (
      <CapabilityRow
        key={subagent.id}
        glyph={<IconBot size={16} />}
        name={name}
        off={!subagent.enabled}
        menuOpen={menuFor === subagent.id}
        badges={<span className="agent-capability-badge">{t("settings.globalOnly")}</span>}
        description={subagent.description || t("settings.noCapabilityDescription")}
        meta={
          subagent.tools?.length ? (
            <>
              {subagent.tools.map((tool) => (
                <code key={tool}>{tool}</code>
              ))}
            </>
          ) : undefined
        }
        actions={
          <>
            <TooltipButton
              type="button"
              className="settings-icon-button"
              ariaLabel={t("extensions.subagents.rowActions", { name })}
              tooltip={t("extensions.subagents.edit")}
              disabled={busy}
              onClick={() => void openEdit(subagent)}
            >
              <IconPencil size={15} />
            </TooltipButton>
            <CapabilityRowMenu
              label={t("extensions.subagents.rowActions", { name })}
              items={items}
              disabled={busy}
              open={menuFor === subagent.id}
              onOpenChange={(open) => {
                setMenuFor(open ? subagent.id : null);
                if (!open) setArmed(null);
              }}
            />
            <CapabilityToggle
              checked={subagent.enabled}
              busy={busy}
              label={t("settings.toggleCapability", { name })}
              onChange={() => void toggle(subagent)}
            />
          </>
        }
      />
    );
  };

  const renderLeadAgent = () => {
    if (searching && !zeusMatchesSearch) return null;
    const isCustomized = Boolean(zeusOwned);
    const enabled = zeusOwned ? zeusOwned.enabled : true;
    const tools = zeusOwned?.tools?.length ? zeusOwned.tools : DEFAULT_ZEUS_TOOLS;
    const busy = busyId === "zeus";

    return (
      <CapabilityRow
        key="lead-agent:zeus"
        glyph={<span style={{ fontSize: 16 }}>⚡</span>}
        name={zeusName}
        off={!enabled}
        command="Main Orchestrator"
        badges={
          <>
            <span className="agent-capability-badge">Lead Agent</span>
            {isCustomized ? (
              <span
                className="agent-capability-badge"
                style={{ borderColor: "#10b981", color: "#10b981" }}
              >
                Customized
              </span>
            ) : null}
          </>
        }
        description={zeusDesc}
        meta={tools.map((tool) => (
          <code key={tool}>{tool}</code>
        ))}
        actions={
          <>
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip="Customize Lead Agent (Zeus)"
              disabled={busy}
              onClick={() => void openEditZeus()}
            >
              <IconPencil size={15} />
            </TooltipButton>
            {zeusOwned ? (
              <TooltipButton
                type="button"
                className="settings-icon-button"
                tooltip="Reset to Default"
                disabled={busy}
                onClick={() => {
                  if (zeusOwned) void remove(zeusOwned);
                }}
              >
                <IconTrash size={15} />
              </TooltipButton>
            ) : null}
            <CapabilityToggle
              checked={enabled}
              busy={busy}
              label={t("settings.toggleCapability", { name: zeusName })}
              onChange={() => void toggleZeus()}
            />
          </>
        }
      />
    );
  };

  /* ── Teams, pipelines, and their cards: all four actions go through the
      same squad store the roster reads, so the office follows instantly. ── */

  const submitNameSheet = (name: string) => {
    const sheet = nameSheet;
    setNameSheet(null);
    if (!sheet) return;
    const created = sheet.id === null;
    if (sheet.kind === "team") {
      if (sheet.id) renameSquadTeam(sheet.id, name);
      else createSquadTeam(name);
    } else if (sheet.id) {
      renameSquadPipeline(sheet.id, name);
    } else {
      // A pipeline belongs to the team being worked on, so creating one
      // while another team is open never lands it on the wrong roster.
      createSquadPipeline(name, workspace.activeTeamId);
    }
    showToast(t(created ? "settings.subagentCreated" : "settings.subagentSaved", { name }), {
      variant: "success",
    });
  };

  const deleteTeam = (team: SquadTeam) => {
    if (!removeSquadTeam(team.id)) return;
    showToast(t("settings.capabilityDeleted", { name: team.name }), { variant: "success" });
  };

  const deletePipeline = (pipeline: SquadPipeline) => {
    removeSquadPipeline(pipeline.id);
    showToast(t("settings.capabilityDeleted", { name: pipeline.name }), { variant: "success" });
  };

  const renderTeam = (team: SquadTeam) => {
    const menuKey = `team:${team.id}`;
    const isActive = team.id === workspace.activeTeamId;
    const memberCount = workspace.members.filter((member) => member.teamId === team.id).length;
    const canRemove = workspace.teams.length > 1;
    const items: CapabilityMenuItem[] = canRemove
      ? [
          {
            key: "remove",
            label: t("extensions.subagents.remove"),
            icon: <IconTrash size={14} />,
            danger: true,
            onSelect: () => {
              setMenuFor(null);
              deleteTeam(team);
            },
          },
        ]
      : [];
    return (
      <CapabilityRow
        key={team.id}
        glyph={<IconUser size={16} />}
        name={team.name}
        menuOpen={menuFor === menuKey}
        badges={
          isActive ? (
            <span className="agent-capability-badge">{t("settings.zeusSquad.active")}</span>
          ) : undefined
        }
        description={t("settings.zeusSquad.memberCount", { count: memberCount })}
        actions={
          <>
            {!isActive ? (
              <TooltipButton
                type="button"
                className="settings-icon-button"
                tooltip={t("settings.zeusSquad.showTeam")}
                ariaLabel={t("settings.zeusSquad.showTeam")}
                onClick={() => setActiveTeamId(team.id)}
              >
                <IconCheck size={15} />
              </TooltipButton>
            ) : null}
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip={t("extensions.subagents.edit")}
              ariaLabel={t("extensions.subagents.edit")}
              onClick={() => setNameSheet({ kind: "team", id: team.id, name: team.name })}
            >
              <IconPencil size={15} />
            </TooltipButton>
            {items.length > 0 ? (
              <CapabilityRowMenu
                label={t("extensions.subagents.rowActions", { name: team.name })}
                items={items}
                open={menuFor === menuKey}
                onOpenChange={(open) => setMenuFor(open ? menuKey : null)}
              />
            ) : null}
          </>
        }
      />
    );
  };

  const renderPipeline = (pipeline: SquadPipeline) => {
    const menuKey = `pipeline:${pipeline.id}`;
    const isActive = pipeline.id === workspace.activePipelineId;
    const team = workspace.teams.find((entry) => entry.id === pipeline.teamId);
    const cardCount = t("settings.zeusSquad.cardCount", { count: pipeline.cards.length });
    return (
      <CapabilityRow
        key={pipeline.id}
        glyph={<IconWorkflow size={16} />}
        name={pipeline.name}
        menuOpen={menuFor === menuKey}
        badges={
          isActive ? (
            <span className="agent-capability-badge">{t("settings.zeusSquad.active")}</span>
          ) : undefined
        }
        description={team ? `${team.name} · ${cardCount}` : cardCount}
        actions={
          <>
            {!isActive ? (
              <TooltipButton
                type="button"
                className="settings-icon-button"
                tooltip={t("settings.zeusSquad.showPipeline")}
                ariaLabel={t("settings.zeusSquad.showPipeline")}
                onClick={() => setActivePipelineId(pipeline.id)}
              >
                <IconCheck size={15} />
              </TooltipButton>
            ) : null}
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip={t("settings.zeusSquad.addCard")}
              ariaLabel={t("settings.zeusSquad.addCard")}
              onClick={() => setCardSheet({ pipelineId: pipeline.id, card: null })}
            >
              <IconPlus size={15} />
            </TooltipButton>
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip={t("extensions.subagents.edit")}
              ariaLabel={t("extensions.subagents.edit")}
              onClick={() =>
                setNameSheet({
                  kind: "pipeline",
                  id: pipeline.id,
                  name: pipeline.name,
                })
              }
            >
              <IconPencil size={15} />
            </TooltipButton>
            <CapabilityRowMenu
              label={t("extensions.subagents.rowActions", { name: pipeline.name })}
              items={[
                {
                  key: "remove",
                  label: t("extensions.subagents.remove"),
                  icon: <IconTrash size={14} />,
                  danger: true,
                  onSelect: () => {
                    setMenuFor(null);
                    deletePipeline(pipeline);
                  },
                },
              ]}
              open={menuFor === menuKey}
              onOpenChange={(open) => setMenuFor(open ? menuKey : null)}
            />
          </>
        }
      />
    );
  };

  const renderCard = (pipeline: SquadPipeline, card: SquadPipelineCard, index: number) => {
    const menuKey = `card:${pipeline.id}:${card.id}`;
    const assignee = workspace.members.find((member) => member.id === card.assigneeId);
    const team = workspace.teams.find((entry) => entry.id === card.teamId);
    return (
      <CapabilityRow
        key={card.id}
        glyph={
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--ds-text-secondary)",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        }
        name={card.title}
        menuOpen={menuFor === menuKey}
        badges={
          <span className="agent-capability-badge">
            {assignee ? assignee.name : t("settings.zeusSquad.unassigned")}
          </span>
        }
        description={card.detail || t("settings.noCapabilityDescription")}
        meta={team ? <code>{team.name}</code> : undefined}
        actions={
          <>
            <TooltipButton
              type="button"
              className="settings-icon-button"
              tooltip={t("extensions.subagents.edit")}
              ariaLabel={t("extensions.subagents.edit")}
              onClick={() => setCardSheet({ pipelineId: pipeline.id, card })}
            >
              <IconPencil size={15} />
            </TooltipButton>
            <CapabilityRowMenu
              label={t("extensions.subagents.rowActions", { name: card.title })}
              items={[
                {
                  key: "remove",
                  label: t("extensions.subagents.remove"),
                  icon: <IconTrash size={14} />,
                  danger: true,
                  onSelect: () => {
                    setMenuFor(null);
                    removeSquadPipelineCard(pipeline.id, card.id);
                    showToast(t("settings.capabilityDeleted", { name: card.title }), {
                      variant: "success",
                    });
                  },
                },
              ]}
              open={menuFor === menuKey}
              onOpenChange={(open) => setMenuFor(open ? menuKey : null)}
            />
          </>
        }
      />
    );
  };

  const activeTeamName =
    workspace.teams.find((team) => team.id === workspace.activeTeamId)?.name ??
    t("settings.zeusSquad.groupLabel");

  const addButton = (
    <CapabilityButton variant="primary" onClick={openCreate}>
      <IconPlus size={14} />
      {t("extensions.subagents.add")}
    </CapabilityButton>
  );

  return (
    <AgentCapabilityPage
      className="agent-subagents-page"
      toolbar={
        <CapabilityToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t("extensions.subagents.searchPlaceholder")}
          actions={addButton}
        />
      }
    >
      <CapabilityPanel
        loading={loading}
        refreshing={refreshing}
        loadingLabel={t("settings.loadingCapabilities")}
      >
        {noMatches ? (
          <CapabilityEmpty
            message={t("settings.capabilityNoMatches")}
            icon={<IconBot size={18} />}
          />
        ) : (
          <>
            {/* One squad, three surfaces: the team list, the active team's
                roster, and the pipeline the Live Office draws all come from
                the same store, so Settings is the single place to configure
                them. */}
            {!searching ? (
              <CapabilityGroupHeader
                label={t("settings.zeusSquad.teams")}
                count={workspace.teams.length}
                action={
                  <TooltipButton
                    type="button"
                    className="settings-icon-button"
                    tooltip={t("settings.zeusSquad.addTeam")}
                    ariaLabel={t("settings.zeusSquad.addTeam")}
                    onClick={() => setNameSheet({ kind: "team", id: null, name: null })}
                  >
                    <IconPlus size={15} />
                  </TooltipButton>
                }
              />
            ) : null}
            {!searching ? workspace.teams.map(renderTeam) : null}

            {visibleSquadMembers.length > 0 || !searching ? (
              <>
                <CapabilityGroupHeader
                  label={activeTeamName}
                  count={visibleSquadMembers.length}
                  action={
                    <TooltipButton
                      type="button"
                      className="settings-icon-button"
                      tooltip={t("settings.zeusSquad.add")}
                      ariaLabel={t("settings.zeusSquad.add")}
                      onClick={() => setSquadSheet({ member: null })}
                    >
                      <IconPlus size={15} />
                    </TooltipButton>
                  }
                />
                {visibleSquadMembers.map(renderSquadMember)}
              </>
            ) : null}

            {!searching ? (
              <>
                <CapabilityGroupHeader
                  label={t("settings.zeusSquad.pipelines")}
                  count={workspace.pipelines.length}
                  action={
                    <TooltipButton
                      type="button"
                      className="settings-icon-button"
                      tooltip={t("settings.zeusSquad.addPipeline")}
                      ariaLabel={t("settings.zeusSquad.addPipeline")}
                      onClick={() => setNameSheet({ kind: "pipeline", id: null, name: null })}
                    >
                      <IconPlus size={15} />
                    </TooltipButton>
                  }
                />
                {workspace.pipelines.length === 0 ? (
                  <CapabilityEmpty
                    message={t("settings.zeusSquad.noPipelines")}
                    icon={<IconWorkflow size={18} />}
                    action={
                      <CapabilityButton
                        variant="primary"
                        onClick={() => setNameSheet({ kind: "pipeline", id: null, name: null })}
                      >
                        <IconPlus size={14} />
                        {t("settings.zeusSquad.addPipeline")}
                      </CapabilityButton>
                    }
                  />
                ) : (
                  workspace.pipelines.flatMap((pipeline) => [
                    renderPipeline(pipeline),
                    ...pipeline.cards.map((card, index) => renderCard(pipeline, card, index)),
                  ])
                )}
              </>
            ) : null}
            {(!searching || zeusMatchesSearch) ? (
              <>
                <CapabilityGroupHeader
                  label="Lead Orchestrator"
                  count={1}
                />
                {renderLeadAgent()}
              </>
            ) : null}
            {showOwnedGroup ? (
              <>
                <CapabilityGroupHeader
                  label={t("settings.globalLevel")}
                  path={GLOBAL_SUBAGENTS_PATH}
                  count={visibleOwned.length}
                />
                {visibleOwned.length === 0 ? (
                  <CapabilityEmpty
                    message={t("settings.subagentsEmpty")}
                    icon={<IconBot size={18} />}
                    action={addButton}
                  />
                ) : (
                  visibleOwned.map(renderRow)
                )}
              </>
            ) : null}
          </>
        )}
      </CapabilityPanel>

      {squadSheet ? (
        <ZeusSquadMemberSheet
          key={squadSheet.member?.id ?? "new"}
          member={squadSheet.member}
          templates={memberTemplates}
          onClose={() => setSquadSheet(null)}
          onSaved={(name, created) => {
            setSquadSheet(null);
            showToast(t(created ? "settings.subagentCreated" : "settings.subagentSaved", { name }), {
              variant: "success",
            });
          }}
        />
      ) : null}

      {nameSheet ? (
        <SquadNameSheet
          key={`${nameSheet.kind}:${nameSheet.id ?? "new"}`}
          title={t(
            nameSheet.kind === "team"
              ? nameSheet.id
                ? "settings.zeusSquad.renameTeamTitle"
                : "settings.zeusSquad.newTeamTitle"
              : nameSheet.id
                ? "settings.zeusSquad.renamePipelineTitle"
                : "settings.zeusSquad.newPipelineTitle",
          )}
          label={t(
            nameSheet.kind === "team"
              ? "settings.zeusSquad.teamName"
              : "settings.zeusSquad.pipelineName",
          )}
          submitLabel={
            nameSheet.id
              ? t("common.save")
              : t(
                  nameSheet.kind === "team"
                    ? "settings.zeusSquad.addTeam"
                    : "settings.zeusSquad.addPipeline",
                )
          }
          initial={nameSheet.name}
          onClose={() => setNameSheet(null)}
          onSubmit={submitNameSheet}
        />
      ) : null}

      {cardSheet ? (
        <SquadPipelineCardSheet
          key={cardSheet.card?.id ?? "new"}
          card={cardSheet.card}
          pipelineTeamId={
            workspace.pipelines.find((pipeline) => pipeline.id === cardSheet.pipelineId)
              ?.teamId ?? workspace.activeTeamId
          }
          onClose={() => setCardSheet(null)}
          onSubmit={(draft) => {
            const editingCard = cardSheet.card;
            if (editingCard) updateSquadPipelineCard(cardSheet.pipelineId, editingCard.id, draft);
            else addSquadPipelineCard(cardSheet.pipelineId, draft);
            setCardSheet(null);
            showToast(
              t(editingCard ? "settings.subagentSaved" : "settings.subagentCreated", {
                name: draft.title,
              }),
              { variant: "success" },
            );
          }}
        />
      ) : null}

      {editor ? (
        <SubagentEditorSheet
          draft={editor.draft}
          setDraft={(draft) => setEditor((current) => (current ? { ...current, draft } : current))}
          editing={editor.editing}
          initialPresetId={editor.presetId}
          saving={saving}
          onClose={() => {
            if (!saving) setEditor(null);
          }}
          onSave={() => void save()}
          onReveal={editor.editing ? () => void reveal(editor.editing!) : undefined}
        />
      ) : null}
    </AgentCapabilityPage>
  );
}
