import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconBot,
  IconListChecks,
  IconPalette,
  IconPerson,
  IconShield,
  IconTarget,
} from "../../components/icons";
import {
  ZEUS_SQUAD_CHANGE_EVENT,
  resolveActivePipelineId,
  resolveActiveTeamId,
  resolveActiveTeamIdForSession,
  resolveSquadMembersForTeam,
  resolveSquadPipelines,
  resolveSquadTeams,
  resolveZeusSquadMembers,
  setSessionTeamId,
  type SquadPipeline,
  type SquadTeam,
  type ZeusSquadIconId,
  type ZeusSquadMember,
} from "./zeus-squad";

export * from "./zeus-squad";
export * from "./zeus-squad-templates";

/** Renderer icon component shared by the strip, the panel, and Settings. */
export type ZeusSquadIcon = typeof IconBot;

export const ZEUS_SQUAD_ICONS: Record<ZeusSquadIconId, ZeusSquadIcon> = {
  bot: IconBot,
  palette: IconPalette,
  person: IconPerson,
  shield: IconShield,
  checks: IconListChecks,
  target: IconTarget,
};

export function getZeusSquadIcon(iconId: ZeusSquadIconId): ZeusSquadIcon {
  return ZEUS_SQUAD_ICONS[iconId] ?? ZEUS_SQUAD_ICONS.bot;
}

/** A roster member with its renderer icon resolved. */
export type ZeusSquadTeamMember = ZeusSquadMember & { icon: ZeusSquadIcon };

function withIcon(member: ZeusSquadMember): ZeusSquadTeamMember {
  return { ...member, icon: getZeusSquadIcon(member.iconId) };
}

function resolveTeam(sessionId?: string): ZeusSquadTeamMember[] {
  return resolveSquadMembersForTeam(resolveActiveTeamIdForSession(sessionId)).map(withIcon);
}

/** Everything Settings drives from one store: teams, members, pipelines. */
export interface SquadWorkspace {
  teams: SquadTeam[];
  activeTeamId: string;
  /** Every member of every team — the card sheet assigns across these. */
  members: ZeusSquadTeamMember[];
  pipelines: SquadPipeline[];
  activePipelineId: string | null;
}

function resolveWorkspace(): SquadWorkspace {
  return {
    teams: resolveSquadTeams(),
    activeTeamId: resolveActiveTeamId(),
    members: resolveZeusSquadMembers().map(withIcon),
    pipelines: resolveSquadPipelines(),
    activePipelineId: resolveActivePipelineId(),
  };
}

function resolveWorkspaceForSession(sessionId: string | undefined): SquadWorkspace {
  return {
    teams: resolveSquadTeams(),
    activeTeamId: resolveActiveTeamIdForSession(sessionId),
    members: resolveZeusSquadMembers().map(withIcon),
    pipelines: resolveSquadPipelines(),
    activePipelineId: resolveActivePipelineId(),
  };
}

/** Re-runs `read` whenever any surface changes the squad store. */
function useSquadStore<T>(read: () => T): T {
  const [value, setValue] = useState<T>(read);
  // The subscriber must not resubscribe when the caller passes a fresh
  // snapshot function each render, so it reads through a ref.
  const readRef = useRef(read);
  readRef.current = read;

  useEffect(() => {
    const sync = () => setValue(readRef.current());
    sync();
    window.addEventListener(ZEUS_SQUAD_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ZEUS_SQUAD_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return value;
}

/**
 * The active team's roster for the strip, the Live Office, and the Squad tab.
 * Re-renders on any create, edit, enablement flip, removal, or team switch.
 */
export function useZeusSquad(sessionId?: string): ZeusSquadTeamMember[] {
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  return useSquadStore(useCallback(() => resolveTeam(sessionIdRef.current), []));
}

/** Live teams / members / pipelines for Settings and the session-aware office. */
export function useSquadWorkspace(sessionId?: string): SquadWorkspace {
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  return useSquadStore(
    useCallback(
      () =>
        sessionIdRef.current
          ? resolveWorkspaceForSession(sessionIdRef.current)
          : resolveWorkspace(),
      [],
    ),
  );
}

/**
 * Session-scoped workspace: the `activeTeamId` reflects what this session had
 * selected, independent of other sessions. Returns a stable `setTeamId`
 * callback that persists the assignment for the given session.
 */
export function useSquadWorkspaceForSession(sessionId: string | undefined): {
  workspace: SquadWorkspace;
  setTeamId: (teamId: string) => void;
} {
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const workspace = useSquadStore(
    useCallback(() => resolveWorkspaceForSession(sessionIdRef.current), []),
  );

  const setTeamId = useCallback((teamId: string) => {
    if (sessionIdRef.current) {
      setSessionTeamId(sessionIdRef.current, teamId);
    }
  }, []);

  return { workspace, setTeamId };
}
