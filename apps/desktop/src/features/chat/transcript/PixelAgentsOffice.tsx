import { useState, useEffect, useId, useMemo, type CSSProperties, memo } from "react";
import {
  FlashIcon,
  Coffee01Icon,
  VolumeHighIcon,
  VolumeMute01Icon,
  Cancel01Icon,
  AiSparklesIcon,
  Search01Icon,
  Wrench01Icon,
  CheckCheckIcon,
  Alert02Icon,
  Clock01Icon,
  FileTextIcon,
  CodeIcon,
  WorkflowSquare01Icon,
  Time02Icon,
  Message01Icon,
  Download01Icon,
  LayoutRightIcon,
  Maximize01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { exportAuditTrailToMarkdown, type AgentAuditEvent } from "@pi-desktop/shared";
import { cx } from "../../../components/ui";
import { portalToBody } from "../../../lib/portal-visibility";
import { useSubagentsData, type ResolvedSubagent } from "../../../hooks/use-subagents-data";
import { useAppStore } from "../../../stores/app-store";
import { buildToolPresentation } from "../../../lib/tool-presentation";
import { ToolDetailBlocks } from "../../../components/ToolDetails";
import {
  getCharacterArchetype,
  getArchetypeHugeIcon,
  cleanAgentName,
  type CharacterArchetypeId,
} from "../../../components/settings/subagent-character-profiles";

export type PixelOfficeDisplayMode = "modal" | "docked" | "pip";

export interface PixelAgentsOfficeProps {
  className?: string;
  style?: CSSProperties;
  streaming?: boolean;
  thoughtText?: string;
  onClose?: () => void;
  isModal?: boolean;
  displayMode?: PixelOfficeDisplayMode;
  onToggleDisplayMode?: (mode: PixelOfficeDisplayMode) => void;
  pendingPermission?: {
    requestId?: string;
    sessionId?: string;
    toolName?: string;
    risk?: string;
    agentName?: string;
    reason?: string;
    argsPreview?: unknown;
  } | null;
}

export interface AgentMember {
  id: string;
  name: string;
  role: string;
  title: string;
  archetype?: CharacterArchetypeId;
  color: string;
  accentBg: string;
  avatarChar: string;
  station: string;
  task: string;
  status: "planning" | "typing" | "walking" | "testing" | "idle";
  load: number;
  stats: string;
  tools?: readonly string[] | string[];
}

const AGENTS: AgentMember[] = [
  {
    id: "zeus",
    name: "Zeus (Lead)",
    role: "Central Orchestrator",
    title: "Main System Coordinator",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.15)",
    avatarChar: "⚡",
    station: "Command Center",
    task: "Mengoordinasikan alur kerja sub-agen & mendistribusikan task",
    status: "planning",
    load: 85,
    stats: "Subagents active",
  },
  {
    id: "athena",
    name: "Athena (Coordinator)",
    role: "Explorer / Reviewer",
    title: "Task(explorer) & Task(code-reviewer)",
    color: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.15)",
    avatarChar: "🔍",
    station: "Research Deck",
    task: "Pencarian codebase cepat (Task:explorer) & review spesifikasi",
    status: "walking",
    load: 78,
    stats: "Read · Glob · Grep · Bash",
  },
  {
    id: "hermes",
    name: "Hermes (Builder)",
    role: "Fixer / Implementation",
    title: "Task(fixer)",
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.15)",
    avatarChar: "💻",
    station: "Dev Station Alpha",
    task: "Implementasi kode multi-file (Task:fixer) & modifikasi workspace",
    status: "typing",
    load: 92,
    stats: "Edit · Write · Grep · Bash",
  },
  {
    id: "apollo",
    name: "Apollo (QA Runner)",
    role: "Test Runner / Verification",
    title: "Task(test-runner)",
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.15)",
    avatarChar: "🧪",
    station: "Test Station & Rig",
    task: "Menjalankan suite tes (Task:test-runner), build check & validasi",
    status: "testing",
    load: 65,
    stats: "Read · Glob · Grep · Bash",
  },
];

/* ── Web Audio 8-Bit Tone Generator ── */
function playRetroTone(freq: number, type: OscillatorType = "sine", duration = 0.08) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext blocked by browser policy until gesture
  }
}

function formatRoleBadge(role: string): string {
  const clean = role.replace(/^Task\(|\)$/gi, "").trim();
  const lower = clean.toLowerCase();
  if (lower.includes("explorer")) return "Explorer";
  if (lower.includes("fixer") || lower.includes("implementation")) return "Fixer";
  if (lower.includes("test") || lower.includes("runner")) return "QA Runner";
  if (lower.includes("review")) return "Reviewer";
  if (lower.includes("design")) return "UI Design";
  if (lower.includes("architect")) return "Architect";
  return clean.length > 10 ? clean.slice(0, 9) + "…" : clean;
}

// Pre-calculated desk slot coordinates in the office (flanking collaboration zone)
const DESK_SLOTS = [
  { x: 725, y: 205, monitorType: "explorer" }, // Slot 1: Top Right (Athena / Explorer)
  { x: 175, y: 320, monitorType: "code" },     // Slot 2: Mid Left (Hermes / Fixer)
  { x: 725, y: 320, monitorType: "tests" },    // Slot 3: Mid Right (Apollo / Test Runner)
  { x: 175, y: 435, monitorType: "terminal" }, // Slot 4: Bottom Left (Reviewer / Hephaestus)
  { x: 725, y: 435, monitorType: "review" },   // Slot 5: Bottom Right (Artemis / Iris)
  { x: 450, y: 440, monitorType: "design" },   // Slot 6: Bottom Center (Reserve / 6th worker)
];

export const PixelAgentsOffice = memo(function PixelAgentsOffice({
  className,
  style,
  streaming = false,
  thoughtText,
  onClose,
  isModal = false,
  displayMode = "modal",
  onToggleDisplayMode,
  pendingPermission,
}: PixelAgentsOfficeProps) {
  const [manualMode, setManualMode] = useState<"auto" | "working" | "idle">("auto");
  const isWaitingPermission = Boolean(pendingPermission);
  const isWorking = manualMode === "auto"
    ? Boolean(streaming)
    : manualMode === "working";

  const [selectedAgentId, setSelectedAgentId] = useState<string>("zeus");
  const [logFilter, setLogFilter] = useState<"selected" | "all">("selected");
  const [officeViewMode, setOfficeViewMode] = useState<"canvas" | "pipeline" | "war-room">("canvas");
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const [isResolvingPermission, setIsResolvingPermission] = useState(false);
  const showToast = useAppStore((state) => state.showToast);

  const handleExportWarRoomAudit = async () => {
    const events: AgentAuditEvent[] = [
      {
        id: "ev-1",
        flowId: "feature-delivery",
        agentRole: "Zeus (Lead)",
        kind: "flow_started",
        summary: "Memulai workflow Feature Delivery dengan shared context scratchpad.",
        timestamp: new Date(Date.now() - 180000).toISOString(),
      },
      {
        id: "ev-2",
        flowId: "feature-delivery",
        stepId: "survey",
        agentRole: "Athena",
        kind: "handoff",
        summary: "Menyimpan 4 target file ke dalam scratchpad memory untuk Hermes.",
        timestamp: new Date(Date.now() - 120000).toISOString(),
      },
      {
        id: "ev-3",
        flowId: "feature-delivery",
        stepId: "implementation",
        agentRole: "Hermes",
        kind: "tool_dispatched",
        summary: "Eksekusi replace_file_content pada modul UI dan styling.",
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "ev-4",
        flowId: "feature-delivery",
        stepId: "verification",
        agentRole: "Apollo",
        kind: "step_completed",
        summary: "Verifikasi 3 unit test suites berjalan 100% green.",
        timestamp: new Date().toISOString(),
      },
    ];

    const md = exportAuditTrailToMarkdown(events, "Block Buzz Collaborative War Room");
    try {
      await navigator.clipboard.writeText(md);
      showToast("Signed War Room Audit Trail berhasil disalin ke clipboard!", { variant: "success" });
    } catch {
      showToast("Gagal menyalin audit trail", { variant: "error" });
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setLogFilter("selected");
  };

  const clipId = useId();

  // Animation cycle loop
  useEffect(() => {
    const intervalMs = speed === 2 ? 100 : 180;
    const timer = setInterval(() => {
      setAnimationTick((t) => (t + 1) % 120);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [speed]);

  const cycleTick = animationTick % 120;

  const {
    zeusSubagent,
    fixerSubagent,
    explorerSubagent,
    testRunnerSubagent,
    reviewerSubagent,
    uiDesignerSubagent,
    customSubagents,
    officeSubagents,
  } = useSubagentsData();

  // Real-time synchronization with Chat Session activity & tools
  const messages = useAppStore((state) => state.messages);

  const latestLiveActivity = useMemo(() => {
    if (pendingPermission) {
      const tool = pendingPermission.toolName || "Action";
      let target = "";
      if (pendingPermission.argsPreview && typeof pendingPermission.argsPreview === "object") {
        const args = pendingPermission.argsPreview as Record<string, unknown>;
        target = String(args.path || args.file || args.command || "");
      }
      return {
        type: "permission" as const,
        toolName: tool,
        target: target ? target.split(/[/\\]/).pop() || target : "",
        fullTarget: target,
        agentName: pendingPermission.agentName,
      };
    }

    for (let i = messages.length - 1; i >= Math.max(0, messages.length - 15); i--) {
      const m = messages[i];
      if (m.toolName) {
        let target = "";
        if (m.toolArgs && typeof m.toolArgs === "object") {
          const args = m.toolArgs as Record<string, unknown>;
          target = String(args.path || args.file || args.command || args.pattern || "");
        }
        return {
          type: m.toolStatus === "running" ? ("running" as const) : ("recent" as const),
          toolName: m.toolName,
          target: target ? target.split(/[/\\]/).pop() || target : "",
          fullTarget: target,
          agentName: (m as { agentName?: string }).agentName,
        };
      }
    }
    return null;
  }, [pendingPermission, messages]);

  // Extract all tool telemetry calls from chat messages across all subagents
  const allToolCalls = useMemo(() => {
    const list: Array<{
      id: string;
      time: string;
      agentId: string;
      agentName: string;
      color: string;
      toolName: string;
      status: "running" | "success" | "error" | "denied";
      text: string;
      target?: string;
    }> = [];

    for (let i = messages.length - 1; i >= 0 && list.length < 50; i--) {
      const m = messages[i];
      if (m.toolName) {
        let target = "";
        if (m.toolArgs && typeof m.toolArgs === "object") {
          const args = m.toolArgs as Record<string, unknown>;
          target = String(args.path || args.file || args.command || args.pattern || "");
        }
        const shortTarget = target ? target.split(/[/\\]/).pop() || target : "";
        const lower = m.toolName.toLowerCase();
        const msgAgentName = (m as { agentName?: string }).agentName;

        let matchedAgent = officeSubagents.find(
          (a) =>
            a.id.toLowerCase() === msgAgentName?.toLowerCase() ||
            a.name.toLowerCase().includes(msgAgentName?.toLowerCase() || ""),
        );
        if (!matchedAgent) {
          if (["read", "glob", "grep", "search", "browse"].includes(lower)) {
            matchedAgent = officeSubagents.find((a) => a.id === "explorer");
          } else if (["edit", "write", "apply", "patch"].includes(lower)) {
            matchedAgent = officeSubagents.find((a) => a.id === "fixer");
          } else if (["bash", "terminal", "test"].includes(lower)) {
            matchedAgent = officeSubagents.find((a) => a.id === "test-runner");
          }
        }

        const agentId = matchedAgent?.id || (lower === "task" ? "zeus" : "zeus");
        const agentDisplayName = matchedAgent?.name || msgAgentName || zeusSubagent.name;
        const agentColor = matchedAgent
          ? getCharacterArchetype(matchedAgent.archetype).color
          : "#f59e0b";

        const date = m.createdAt ? new Date(m.createdAt) : new Date();
        const timeStr = isNaN(date.getTime())
          ? "LIVE"
          : `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

        let actionVerb = `Eksekusi ${m.toolName}`;
        if (lower === "write") actionVerb = `Menulis file: ${shortTarget || "dokumen"}`;
        else if (lower === "edit") actionVerb = `Mengedit file: ${shortTarget || "dokumen"}`;
        else if (lower === "read") actionVerb = `Membaca file: ${shortTarget || "dokumen"}`;
        else if (lower === "glob") actionVerb = `Scan direktori: ${shortTarget || "folder"}`;
        else if (lower === "grep") actionVerb = `Cari pola kode: "${shortTarget}"`;
        else if (lower === "bash") actionVerb = `Perintah shell: ${shortTarget || "command"}`;
        else if (lower === "task") actionVerb = `Delegasi subtask: ${shortTarget || "pekerjaan"}`;

        list.push({
          id: m.id || `${i}-${m.toolName}`,
          time: timeStr,
          agentId,
          agentName: agentDisplayName,
          color: agentColor,
          toolName: m.toolName,
          status: m.toolStatus || "success",
          text: actionVerb,
          target: shortTarget,
        });
      }
    }
    return list;
  }, [messages, officeSubagents, zeusSubagent]);

  // Track active running delegations per subagent (e.g. parallel fixer tasks)
  const activeDelegationsPerAgent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of messages) {
      if (m.toolName?.toLowerCase() === "task") {
        let agentKey = "fixer";
        if (m.toolArgs && typeof m.toolArgs === "object") {
          const args = m.toolArgs as Record<string, unknown>;
          if (typeof args.agent === "string") {
            agentKey = args.agent.toLowerCase();
          }
        }
        if (m.toolStatus === "running" || !m.toolStatus) {
          counts.set(agentKey, (counts.get(agentKey) || 0) + 1);
        }
      }
    }
    return counts;
  }, [messages]);

  // Identify which subagent is requesting permission
  const reportingWorker = useMemo(() => {
    if (!pendingPermission) return null;
    const agentName = (pendingPermission.agentName || "").toLowerCase();
    const tool = (pendingPermission.toolName || "").toLowerCase();

    // 1. Direct match on id or name
    const matchByName = officeSubagents.find(
      (a) => a.id.toLowerCase() === agentName || a.name.toLowerCase().includes(agentName),
    );
    if (matchByName) return matchByName;

    // 2. Match by typical tools
    const matchByTool = officeSubagents.find((a) =>
      a.tools.some((t) => t.toLowerCase() === tool),
    );
    if (matchByTool) return matchByTool;

    // 3. Fallback to fixer / hermes or first office subagent
    return officeSubagents.find((a) => a.id === "fixer") || officeSubagents[0] || null;
  }, [pendingPermission, officeSubagents]);

  // Structured presentation for pending permission arguments
  const permArgBlocks = useMemo(() => {
    if (!pendingPermission) return [];
    return buildToolPresentation({
      toolName: pendingPermission.toolName,
      toolArgs: pendingPermission.argsPreview,
    });
  }, [pendingPermission]);

  // Extract target file or command from pending permission
  const permTargetInfo = useMemo(() => {
    if (!pendingPermission) return null;
    let target = "";
    let content = "";
    if (pendingPermission.argsPreview && typeof pendingPermission.argsPreview === "object") {
      const args = pendingPermission.argsPreview as Record<string, unknown>;
      target = String(args.path || args.file || args.command || args.pattern || "");
      if (typeof args.content === "string") {
        content = args.content;
      }
    }
    const tool = (pendingPermission.toolName || "").toLowerCase();
    let actionDesc = "menjalankan aksi";
    if (tool === "write") actionDesc = "menulis / membuat file";
    else if (tool === "edit") actionDesc = "mengedit file";
    else if (tool === "bash") actionDesc = "menjalankan perintah shell";
    else if (tool === "read") actionDesc = "membaca file";

    return {
      target,
      content,
      actionDesc,
      isCommand: tool === "bash",
    };
  }, [pendingPermission]);

  // Determine active working subagent based on chat tools
  const activeChatWorkerId = useMemo(() => {
    if (reportingWorker) return reportingWorker.id;
    if (!latestLiveActivity) return null;
    if (latestLiveActivity.agentName) {
      const found = officeSubagents.find(
        (a) =>
          a.id.toLowerCase() === latestLiveActivity.agentName?.toLowerCase() ||
          a.name.toLowerCase().includes(latestLiveActivity.agentName?.toLowerCase() || ""),
      );
      if (found) return found.id;
    }
    const lower = latestLiveActivity.toolName.toLowerCase();
    if (["read", "glob", "grep", "search", "browse", "browserpreview"].includes(lower)) return "explorer";
    if (["edit", "write", "apply", "patch"].includes(lower)) return "fixer";
    if (["bash", "terminal", "test"].includes(lower)) return "test-runner";
    return null;
  }, [reportingWorker, latestLiveActivity, officeSubagents]);

  // Dynamic speech bubbles reflecting live chat actions
  const athenaIsWalking = isWorking && cycleTick > 30 && cycleTick < 75 && !isWaitingPermission;
  const athenaBubble = isWaitingPermission
    ? (reportingWorker?.id === "explorer"
        ? `Butuh izin ${pendingPermission?.toolName || "tool"}!`
        : "Eksekusi dijeda: Menunggu user menyetujui izin di chat.")
    : isWorking
      ? latestLiveActivity?.toolName.toLowerCase() === "read"
        ? `Membaca ${latestLiveActivity.target || "file"}...`
        : cycleTick < 40
          ? "Memeriksa kontrak & arsitektur proyek..."
          : cycleTick < 70
            ? "Hermes, ada pembaruan schema?"
            : "Semua spesifikasi tersinkronisasi!"
      : "Tim AI standby & siap menerima instruksi";

  const hermesBubble = isWaitingPermission
    ? (reportingWorker?.id === "fixer"
        ? `Izin menulis ${latestLiveActivity?.target || "file"} diperlukan!`
        : `Menunggu izin untuk ${pendingPermission?.toolName || "tool"}...`)
    : isWorking
      ? ["write", "edit", "apply"].includes(latestLiveActivity?.toolName.toLowerCase() || "")
        ? `Menulis ${latestLiveActivity?.target || "kode"}...`
        : cycleTick > 45 && cycleTick < 85
          ? "Sudah siap di @shared/contracts!"
          : null
      : null;

  const zeusBubble = isWaitingPermission
    ? `Butuh izin user untuk "${pendingPermission?.toolName}"!`
    : isWorking
      ? latestLiveActivity
        ? `Mengoordinasikan: ${latestLiveActivity.toolName} ${latestLiveActivity.target}`
        : cycleTick > 80 && cycleTick < 110
          ? "Lanjutkan eksekusi dan validasi!"
          : "Mengoordinasikan alur kerja sub-agent..."
      : null;

  // Sound triggers
  useEffect(() => {
    if (!soundEnabled || !isWorking) return;
    if (cycleTick === 40 || cycleTick === 75) {
      playRetroTone(587.33, "triangle", 0.05);
    }
  }, [cycleTick, soundEnabled, isWorking]);

  // Scalable Studio Wing layout (5 subagents per wing to prevent desk overlap)
  const WING_CAPACITY = 5;
  const [activeWing, setActiveWing] = useState(0);
  const totalWings = Math.max(1, Math.ceil(officeSubagents.length / WING_CAPACITY));

  // Auto-switch to reporting worker's wing if permission is needed
  useEffect(() => {
    if (!reportingWorker) return;
    const idx = officeSubagents.findIndex((w) => w.id === reportingWorker.id);
    if (idx >= 0) {
      const targetWing = Math.floor(idx / WING_CAPACITY);
      setActiveWing(targetWing);
    }
  }, [reportingWorker, officeSubagents]);

  // Keep officeSubagents.map compatibility and slice displayed wing workers
  const allWorkerIds = useMemo(() => officeSubagents.map((s) => s.id), [officeSubagents]);
  const displayedWorkers = useMemo(() => {
    if (officeSubagents.length <= WING_CAPACITY) return officeSubagents;
    return officeSubagents.slice(activeWing * WING_CAPACITY, (activeWing + 1) * WING_CAPACITY);
  }, [officeSubagents, activeWing]);

  // Dynamic agents roster for telemetry & selection
  const dynamicAgents: AgentMember[] = useMemo(() => {
    const list: AgentMember[] = [
      {
        id: "zeus",
        name: zeusSubagent.name,
        role: "Main System Coordinator",
        title: zeusSubagent.tag,
        archetype: zeusSubagent.archetype || "zeus",
        color: "#f59e0b",
        accentBg: "rgba(245, 158, 11, 0.15)",
        avatarChar: "⚡",
        station: "Command Center",
        task: zeusSubagent.description,
        status: "planning",
        load: 85,
        stats: zeusSubagent.tools.join(" · "),
        tools: zeusSubagent.tools,
      },
    ];

    officeSubagents.forEach((sub, idx) => {
      const arch = getCharacterArchetype(sub.archetype);
      list.push({
        id: sub.id,
        name: sub.name,
        role: sub.tag,
        title: sub.role || sub.name,
        archetype: sub.archetype,
        color: arch.color,
        accentBg: arch.accentBg,
        avatarChar: arch.avatarEmoji,
        station: `Workstation #${idx + 1}`,
        task: sub.description,
        status: isWaitingPermission && reportingWorker?.id === sub.id ? "walking" : isWorking ? "typing" : "idle",
        load: 75 + ((idx * 7) % 20),
        stats: sub.tools.join(" · "),
        tools: sub.tools,
      });
    });

    // Ensure backwards compatibility with fallback agents
    if (!list.some((a) => a.id === "athena")) {
      list.push({
        id: "athena",
        name: `Athena · ${explorerSubagent.name}`,
        role: explorerSubagent.tag,
        title: explorerSubagent.name,
        archetype: "athena",
        color: "#38bdf8",
        accentBg: "rgba(56, 189, 248, 0.15)",
        avatarChar: "🔍",
        station: "Research Deck",
        task: explorerSubagent.description,
        status: "walking",
        load: 78,
        stats: explorerSubagent.tools.join(" · "),
        tools: explorerSubagent.tools,
      });
    }
    if (!list.some((a) => a.id === "hermes")) {
      list.push({
        id: "hermes",
        name: `Hermes · ${fixerSubagent.name}`,
        role: fixerSubagent.tag,
        title: fixerSubagent.name,
        archetype: "hermes",
        color: "#10b981",
        accentBg: "rgba(16, 185, 129, 0.15)",
        avatarChar: "💻",
        station: "Dev Station Alpha",
        task: fixerSubagent.description,
        status: "typing",
        load: 92,
        stats: fixerSubagent.tools.join(" · "),
        tools: fixerSubagent.tools,
      });
    }
    if (!list.some((a) => a.id === "apollo")) {
      list.push({
        id: "apollo",
        name: `Apollo · ${testRunnerSubagent.name}`,
        role: testRunnerSubagent.tag,
        title: testRunnerSubagent.name,
        archetype: "apollo",
        color: "#ec4899",
        accentBg: "rgba(236, 72, 153, 0.15)",
        avatarChar: "🧪",
        station: "Test Station & Rig",
        task: testRunnerSubagent.description,
        status: "testing",
        load: 65,
        stats: testRunnerSubagent.tools.join(" · "),
        tools: testRunnerSubagent.tools,
      });
    }

    return list;
  }, [zeusSubagent, officeSubagents, isWaitingPermission, reportingWorker, isWorking, explorerSubagent, fixerSubagent, testRunnerSubagent]);

  const activeAgent =
    dynamicAgents.find((a) => a.id === selectedAgentId) ||
    dynamicAgents[0] ||
    AGENTS[0];

  // Tool capabilities as an array of tags
  const activeAgentTools = useMemo(() => {
    if (activeAgent.tools && activeAgent.tools.length > 0) {
      return activeAgent.tools;
    }
    if (activeAgent.stats) {
      return activeAgent.stats.split(" · ").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [activeAgent]);

  // Concise tab label for activity log filter to prevent tab truncation
  const shortAgentTabLabel = useMemo(() => {
    if (activeAgent.id === "zeus") return "Zeus";
    const name = cleanAgentName(activeAgent.name);
    return name.split(/[\s·]/)[0] || name;
  }, [activeAgent]);

  // Filtered tool calls for the selected agent
  const selectedAgentCalls = useMemo(() => {
    return allToolCalls.filter((c) => {
      if (selectedAgentId === "zeus") {
        return c.agentId === "zeus" || c.toolName.toLowerCase() === "task";
      }
      if (selectedAgentId === "fixer") {
        return (
          c.agentId === "fixer" ||
          ["write", "edit", "apply", "patch"].includes(c.toolName.toLowerCase())
        );
      }
      if (selectedAgentId === "explorer") {
        return (
          c.agentId === "explorer" ||
          ["read", "glob", "grep", "search", "browse"].includes(c.toolName.toLowerCase())
        );
      }
      if (selectedAgentId === "test-runner") {
        return (
          c.agentId === "test-runner" ||
          ["bash", "terminal", "test"].includes(c.toolName.toLowerCase())
        );
      }
      return c.agentId === selectedAgentId;
    });
  }, [allToolCalls, selectedAgentId]);

  // Contextual fallback telemetry logs for selected agent
  const fallbackSelectedAgentLogs = useMemo(() => {
    const id = activeAgent.id.toLowerCase();
    const name = cleanAgentName(activeAgent.name);
    const color = activeAgent.color;

    if (id === "zeus") {
      return [
        {
          id: "zeus-1",
          time: "15:20",
          agentId: "zeus",
          agentName: name,
          color,
          toolName: "Task",
          status: "success" as const,
          text: isWorking
            ? "Mengoordinasikan alur kerja sub-agent untuk menyelesaikan tugas."
            : "Sistem idle, memantau kesiapan seluruh agen.",
        },
        {
          id: "zeus-2",
          time: "15:22",
          agentId: "zeus",
          agentName: name,
          color,
          toolName: "Orchestrate",
          status: "success" as const,
          text: "Memastikan arsitektur sistem tetap bersih dan bebas dari slop.",
        },
      ];
    }
    if (id === "fixer" || activeAgent.archetype === "hermes") {
      return [
        {
          id: "hermes-1",
          time: "15:22",
          agentId: "fixer",
          agentName: name,
          color,
          toolName: "Write",
          status: "success" as const,
          text: isWorking
            ? "Implementasi kode bersih, bebas dari slop."
            : "Workspace bersih, siap menerima tugas penulisan kode.",
        },
        {
          id: "hermes-2",
          time: "15:24",
          agentId: "fixer",
          agentName: name,
          color,
          toolName: "Edit",
          status: "success" as const,
          text: "Pemeriksaan syntax dan kontrak file target selesai.",
        },
      ];
    }
    if (id === "explorer" || activeAgent.archetype === "athena") {
      return [
        {
          id: "athena-1",
          time: "15:21",
          agentId: "explorer",
          agentName: name,
          color,
          toolName: "Read",
          status: "success" as const,
          text: isWorking
            ? "Sinkronisasi spesifikasi & tipe kontrak selesai."
            : "Spesifikasi siap digunakan kapan saja.",
        },
        {
          id: "athena-2",
          time: "15:23",
          agentId: "explorer",
          agentName: name,
          color,
          toolName: "Grep",
          status: "success" as const,
          text: "Penyusunan peta referensi modul dan dependensi proyek.",
        },
      ];
    }
    if (id === "test-runner" || activeAgent.archetype === "apollo") {
      return [
        {
          id: "apollo-1",
          time: "15:23",
          agentId: "test-runner",
          agentName: name,
          color,
          toolName: "Bash",
          status: "success" as const,
          text: "Semua pengujian dan boundary security terverifikasi (117/117 pass).",
        },
        {
          id: "apollo-2",
          time: "15:24",
          agentId: "test-runner",
          agentName: name,
          color,
          toolName: "Test",
          status: "success" as const,
          text: "Test environment siap menjalankan suite pengujian otomatis.",
        },
      ];
    }
    return [
      {
        id: `${activeAgent.id}-1`,
        time: "15:20",
        agentId: activeAgent.id,
        agentName: name,
        color,
        toolName: activeAgent.stats.split(" · ")[0] || "Ready",
        status: "success" as const,
        text: activeAgent.task || "Standby mode · Siap memproses prompt atau tugas baru.",
      },
    ];
  }, [activeAgent, isWorking]);

  // Unified log items to display based on active tab filter
  const displayedLogItems = useMemo(() => {
    if (logFilter === "selected") {
      return selectedAgentCalls.length > 0 ? selectedAgentCalls : fallbackSelectedAgentLogs;
    }
    return allToolCalls.length > 0
      ? allToolCalls
      : [
          {
            id: "all-1",
            time: "15:20",
            agentId: "zeus",
            agentName: zeusSubagent.name,
            color: "#f59e0b",
            toolName: "Task",
            status: "success" as const,
            text: isWorking
              ? "Mengkoordinasikan sub-agen untuk menyelesaikan tugas."
              : "Sistem idle, seluruh agen standby.",
          },
          {
            id: "all-2",
            time: "15:21",
            agentId: "explorer",
            agentName: explorerSubagent.name,
            color: "#38bdf8",
            toolName: "Read",
            status: "success" as const,
            text: isWorking
              ? "Sinkronisasi spesifikasi & tipe kontrak selesai."
              : "Spesifikasi siap digunakan kapan saja.",
          },
          {
            id: "all-3",
            time: "15:22",
            agentId: "fixer",
            agentName: fixerSubagent.name,
            color: "#10b981",
            toolName: "Write",
            status: "success" as const,
            text: isWorking
              ? "Implementasi kode bersih, bebas dari slop."
              : "Workspace bersih, siap menerima tugas.",
          },
          {
            id: "all-4",
            time: "15:23",
            agentId: "test-runner",
            agentName: testRunnerSubagent.name,
            color: "#ec4899",
            toolName: "Bash",
            status: "success" as const,
            text: "Semua pengujian dan boundary security terverifikasi (117/117 pass).",
          },
        ];
  }, [
    logFilter,
    selectedAgentCalls,
    fallbackSelectedAgentLogs,
    allToolCalls,
    isWorking,
    zeusSubagent,
    explorerSubagent,
    fixerSubagent,
    testRunnerSubagent,
  ]);

  // Resolve permission directly from Office
  const handleResolvePermission = async (decision: "allow-once" | "allow-session" | "deny") => {
    if (!pendingPermission) return;
    const store = useAppStore.getState();
    const sessionId = pendingPermission.sessionId || store.activeSessionId;
    const requestId = pendingPermission.requestId;
    if (!sessionId || !requestId) return;

    setIsResolvingPermission(true);
    try {
      await store.resolvePermission(sessionId, requestId, decision);
    } catch (err) {
      console.error("Failed to resolve permission from Virtual Office:", err);
    } finally {
      setIsResolvingPermission(false);
    }
  };

  // Helper to render anime chibi character based on archetype
  const renderChibiSprite = (
    archetype: CharacterArchetypeId = "hermes",
    working: boolean = false,
    options?: { isWalking?: boolean; walkingLegPhase?: number },
  ) => {
    const isWalking = options?.isWalking ?? false;
    const legPhase = options?.walkingLegPhase ?? (cycleTick % 6);
    const arch = getCharacterArchetype(archetype);

    return (
      <g>
        {isWalking && (
          // Stepping legs
          <>
            <line x1="-5" y1="12" x2={legPhase < 3 ? -8 : -2} y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <line x1="5" y1="12" x2={legPhase < 3 ? 2 : 8} y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* Outfit Body */}
        {archetype === "zeus" ? (
          // Executive Navy Blazer with Gold Tie
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <polygon points="-3,-6 3,-6 0,-1" fill="#f8fafc" />
            <polygon points="-1.5,-2 1.5,-2 1,7 0,8 -1,7" fill="#f59e0b" />
            <polygon points="-6,-2 -4,-2 -5,1 -3,1 -6,6 -5,2 -7,2" fill="#fbbf24" />
          </>
        ) : archetype === "athena" ? (
          // Smart Knit Vest over Shirt
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />
            <polygon points="-4,-6 4,-6 0,-1" fill="#f8fafc" />
          </>
        ) : archetype === "apollo" ? (
          // White Lab Coat over Red Tee
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="-4" y="-6" width="8" height="15" fill="#f43f5e" />
            <rect x="2" y="-1" width="5" height="6" rx="0.5" fill="#38bdf8" />
          </>
        ) : archetype === "hephaestus" ? (
          // Work Apron over Charcoal Shirt
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
            <rect x="-7" y="-4" width="14" height="14" rx="2" fill="#78350f" stroke="#b45309" strokeWidth="0.8" />
          </>
        ) : archetype === "artemis" ? (
          // Tactical Violet Jacket
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#3b0764" stroke="#581c87" strokeWidth="1" />
            <polygon points="-3,-6 3,-6 0,-2" fill="#c084fc" />
          </>
        ) : archetype === "iris" ? (
          // Chic Pastel Cyan Sweater
          <>
            <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#0e7490" stroke="#06b6d4" strokeWidth="1" />
            <circle cx="0" cy="2" r="3" fill="#67e8f9" opacity="0.6" />
          </>
        ) : (
          // Hermes: Cozy Emerald Developer Hoodie with Headphones
          <>
            <rect x="-11" y="-6" width="22" height="16" rx="4" fill="#065f46" stroke="#047857" strokeWidth="1" />
            <rect x="-7" y="1" width="14" height="6" rx="2" fill="#047857" />
            {/* Headphones around neck */}
            <path d="M -9 -2 Q 0 5 9 -2" stroke="#0f172a" strokeWidth="2.5" fill="none" />
            <circle cx="-9" cy="-2" r="2.8" fill="#10b981" />
            <circle cx="9" cy="-2" r="2.8" fill="#10b981" />
          </>
        )}

        {/* Head (Warm Anime Skin) */}
        <circle cx="0" cy="-18" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
        {/* Rosy Cheeks */}
        <ellipse cx="-8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
        <ellipse cx="8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

        {/* Anime Eyes */}
        {cycleTick % 30 < 3 ? (
          // Happy Blink (⌒ ⌒)
          <>
            <path d="M -9 -18 Q -6 -21 -3 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 3 -18 Q 6 -21 9 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          // Sparkling anime eyes with archetype pupil color
          <>
            <ellipse cx="-6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
            <ellipse cx="6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
            <circle cx="-6" cy="-17.5" r="2.2" fill={arch.color} />
            <circle cx="6" cy="-17.5" r="2.2" fill={arch.color} />
            <circle cx="-7" cy="-19.5" r="1.3" fill="#ffffff" />
            <circle cx="5" cy="-19.5" r="1.3" fill="#ffffff" />
            <circle cx="-5" cy="-16.5" r="0.7" fill="#ffffff" />
            <circle cx="7" cy="-16.5" r="0.7" fill="#ffffff" />
          </>
        )}

        {/* Glasses for Athena */}
        {archetype === "athena" && (
          <>
            <circle cx="-6" cy="-18" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="6" cy="-18" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="-1" y1="-18" x2="1" y2="-18" stroke="#e2e8f0" strokeWidth="1" />
          </>
        )}

        {/* Goggles for Hephaestus */}
        {archetype === "hephaestus" && (
          <g transform="translate(0, -25)">
            <rect x="-10" y="0" width="20" height="4" rx="2" fill="#0f172a" />
            <circle cx="-5" cy="2" r="3.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
            <circle cx="5" cy="2" r="3.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
          </g>
        )}

        {/* Smile */}
        <path d="M -2.5 -12 Q 0 -10.5 2.5 -12" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

        {/* Anime Hair Styles */}
        {archetype === "zeus" ? (
          // Spiky Blonde with Ahoge Cowlick
          <>
            <path
              d="M -15 -20 Q -8 -32 0 -33 Q 8 -32 15 -20 Q 12 -12 14 -6 Q 9 -12 7 -18 Q 2 -14 0 -18 Q -3 -14 -7 -18 Q -9 -12 -14 -6 Q -12 -12 -15 -20 Z"
              fill="#f59e0b"
            />
            <path d="M -8 -26 Q 0 -30 8 -26" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
            <path
              d="M 0 -32 Q 6 -42 12 -40 Q 6 -36 1 -30"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.4"
              strokeLinecap="round"
              transform={`rotate(${Math.sin(cycleTick * 0.2) * 6} 0 -32)`}
            />
          </>
        ) : archetype === "athena" ? (
          // Navy Bob with Side Ponytail
          <>
            <path
              d="M -15 -18 Q -10 -32 0 -33 Q 10 -32 15 -18 Q 12 -12 14 -5 Q 8 -12 6 -17 Q 0 -14 -6 -17 Q -10 -12 -14 -5 Q -12 -12 -15 -18 Z"
              fill="#0369a1"
            />
            <path d="M 12 -24 Q 24 -30 25 -16 Q 22 -10 14 -18" fill="#0284c7" />
            <circle cx="13" cy="-22" r="2.5" fill="#38bdf8" />
          </>
        ) : archetype === "apollo" ? (
          // Magenta styled hair
          <>
            <path
              d="M -15 -18 Q -10 -32 0 -33 Q 10 -32 15 -18 Q 13 -12 15 -5 Q 9 -12 7 -17 Q 0 -13 -6 -17 Q -10 -12 -14 -5 Q -12 -12 -15 -18 Z"
              fill="#ec4899"
            />
            <circle cx="12" cy="-24" r="2" fill="#38bdf8" />
          </>
        ) : archetype === "artemis" ? (
          // Silver-Violet Twin Tails
          <>
            <path
              d="M -15 -18 Q -8 -32 0 -32 Q 8 -32 15 -18 Q 12 -12 14 -6 Q 8 -13 6 -18 Q 0 -14 -6 -18 Q -8 -13 -14 -6 Q -12 -12 -15 -18 Z"
              fill="#7e22ce"
            />
            {/* Twin Tails */}
            <path d="M -13 -22 Q -22 -28 -24 -12 Q -20 -8 -14 -16" fill="#a855f7" />
            <path d="M 13 -22 Q 22 -28 24 -12 Q 20 -8 14 -16" fill="#a855f7" />
          </>
        ) : archetype === "iris" ? (
          // Soft Coral/Lavender with Beret
          <>
            <path
              d="M -15 -18 Q -8 -30 0 -31 Q 8 -30 15 -18 Q 12 -10 13 -4 Q 8 -12 5 -17 Q 0 -13 -5 -17 Q -8 -12 -13 -4 Q -12 -10 -15 -18 Z"
              fill="#f472b6"
            />
            <ellipse cx="2" cy="-30" rx="14" ry="5" fill="#0891b2" stroke="#0e7490" strokeWidth="0.8" />
            <circle cx="2" cy="-35" r="1.5" fill="#0e7490" />
          </>
        ) : archetype === "hephaestus" ? (
          // Auburn with Bandana
          <>
            <path
              d="M -15 -20 Q -8 -32 0 -32 Q 8 -32 15 -20 Q 12 -12 14 -6 Q 8 -14 0 -16 Q -8 -14 -14 -6 Q -12 -12 -15 -20 Z"
              fill="#c2410c"
            />
            <rect x="-14" y="-27" width="28" height="5" rx="2" fill="#ea580c" />
          </>
        ) : (
          // Hermes: Dark Emerald Messy Spikes
          <>
            <path
              d="M -15 -18 Q -8 -32 0 -32 Q 8 -32 15 -18 Q 13 -12 15 -5 Q 9 -12 7 -17 Q 0 -13 -6 -17 Q -10 -12 -14 -5 Q -12 -12 -15 -18 Z"
              fill="#0f766e"
            />
            <path d="M -5 -30 Q 0 -38 5 -32 Q 2 -28 -3 -27" fill="#10b981" />
          </>
        )}

        {/* Hands / Interaction */}
        {!isWalking && (
          working ? (
            // Typing motion
            <>
              <circle cx="-7" cy={5 + (cycleTick % 4 < 2 ? 0 : 2)} r="2.8" fill="#fed7aa" />
              <circle cx="7" cy={5 + (cycleTick % 4 < 2 ? 2 : 0)} r="2.8" fill="#fed7aa" />
            </>
          ) : (
            // Holding Coffee Mug
            <>
              <circle cx="-6" cy="4" r="2.5" fill="#fed7aa" />
              <rect x="3" y="1" width="6" height="7" rx="1.5" fill={arch.color} stroke="#0f172a" strokeWidth="0.8" />
              <path
                d={`M 6 ${-2 - (cycleTick % 6) * 0.8} Q 8 ${-5 - (cycleTick % 6) * 0.8} 6 ${-8 - (cycleTick % 6) * 0.8}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.8"
                opacity="0.7"
              />
            </>
          )
        )}
      </g>
    );
  };

  // Render Junior Assistant / Mini Chibi Helper ("Anak Buah" / Sub-Squad Minion)
  const renderMiniHelperSprite = (
    archetype: CharacterArchetypeId,
    working: boolean,
  ) => {
    const arch = getCharacterArchetype(archetype);
    const bounce = working
      ? Math.sin((cycleTick + 5) * 0.45) * 2.5
      : Math.sin(cycleTick * 0.15) * 0.8;
    const isBlinking = cycleTick % 26 < 2;

    return (
      <g
        className="mini-helper-sprite"
        transform={`scale(0.58) translate(0, ${bounce})`}
      >
        {/* Helper Shadow */}
        <ellipse cx="0" cy="8" rx="8" ry="3" fill="#000000" opacity="0.35" />

        {/* Small Body & Outfit matching Lead Archetype */}
        <rect
          x="-7"
          y="-3"
          width="14"
          height="11"
          rx="3"
          fill={arch.color}
          stroke="#0f172a"
          strokeWidth="0.8"
        />
        {/* Team Apron / Inner Vest */}
        <rect
          x="-3"
          y="-3"
          width="6"
          height="8"
          fill={arch.accentBg}
          opacity="0.9"
        />

        {/* Tiny Round Head */}
        <circle
          cx="0"
          cy="-11"
          r="9"
          fill="#fed7aa"
          stroke="#fbcfe8"
          strokeWidth="0.5"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="-5" cy="-8" rx="2" ry="1.2" fill="#fb7185" opacity="0.65" />
        <ellipse cx="5" cy="-8" rx="2" ry="1.2" fill="#fb7185" opacity="0.65" />

        {/* Anime Eyes */}
        {isBlinking ? (
          <>
            <path
              d="M -6 -11 Q -4 -13 -2 -11"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 2 -11 Q 4 -13 6 -11"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="-4" cy="-11" r="2" fill="#1e293b" />
            <circle cx="4" cy="-11" r="2" fill="#1e293b" />
            <circle cx="-4" cy="-11" r="1.1" fill={arch.color} />
            <circle cx="4" cy="-11" r="1.1" fill={arch.color} />
            <circle cx="-4.6" cy="-11.8" r="0.6" fill="#ffffff" />
            <circle cx="3.4" cy="-11.8" r="0.6" fill="#ffffff" />
          </>
        )}

        {/* Cute Ahoge / Mini Cap / Hair */}
        <path
          d="M -10 -13 Q -5 -21 0 -21 Q 5 -21 10 -13 Q 8 -9 9 -5 Q 5 -10 0 -11 Q -5 -10 -9 -5 Q -8 -9 -10 -13 Z"
          fill={arch.color}
        />
        {/* Animated Sprightly Ahoge Cowlick */}
        <path
          d="M 0 -21 Q 4 -28 7 -26 Q 3 -24 0 -20"
          fill="none"
          stroke={arch.color}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${Math.sin((cycleTick + 3) * 0.3) * 10} 0 -21)`}
        />

        {/* Hands & Specialty Tool/Tablet */}
        {working ? (
          <>
            {/* Actively Holding & Tapping Mini Tablet / Device */}
            <rect
              x="-6"
              y="1"
              width="12"
              height="8"
              rx="1.5"
              fill="#0f172a"
              stroke={arch.color}
              strokeWidth="0.8"
            />
            {/* Live Data / Code Screen */}
            <rect
              x="-4.5"
              y="2.5"
              width="9"
              height="5"
              rx="1"
              fill="#020617"
            />
            <line
              x1="-3"
              y1="4"
              x2={1 + (cycleTick % 4)}
              y2="4"
              stroke={arch.color}
              strokeWidth="0.9"
            />
            <line
              x1="-3"
              y1="6"
              x2="2"
              y2="6"
              stroke="#38bdf8"
              strokeWidth="0.7"
            />

            {/* Little Hands Tapping */}
            <circle cx="-5" cy={4 + (cycleTick % 4 < 2 ? 0 : 1)} r="1.6" fill="#fed7aa" />
            <circle cx="5" cy={4 + (cycleTick % 4 < 2 ? 1 : 0)} r="1.6" fill="#fed7aa" />

            {/* Floating Spark / Activity Bubble above Head */}
            <g
              transform={`translate(0, ${-25 - (cycleTick % 8) * 0.8})`}
              opacity={Math.max(0.2, 1 - (cycleTick % 8) * 0.1)}
            >
              <circle cx="0" cy="0" r="4.5" fill="#1e293b" stroke={arch.color} strokeWidth="0.8" />
              {archetype === "hermes" ? (
                // Mini gear / code bracket
                <text x="0" y="2.5" textAnchor="middle" fill="#10b981" fontSize="5.5" fontWeight="bold">
                  ⚙
                </text>
              ) : archetype === "athena" ? (
                // Mini scan / doc
                <text x="0" y="2.5" textAnchor="middle" fill="#38bdf8" fontSize="5.5" fontWeight="bold">
                  📄
                </text>
              ) : archetype === "apollo" ? (
                // Mini checkmark
                <text x="0" y="2.5" textAnchor="middle" fill="#ec4899" fontSize="5.5" fontWeight="bold">
                  ✓
                </text>
              ) : (
                <text x="0" y="2.5" textAnchor="middle" fill={arch.color} fontSize="5" fontWeight="bold">
                  ⚡
                </text>
              )}
            </g>
          </>
        ) : (
          <>
            {/* Resting / Holding Clipboard */}
            <rect
              x="1"
              y="0"
              width="7"
              height="8"
              rx="1.2"
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="0.6"
            />
            <line x1="2.5" y1="2.5" x2="6.5" y2="2.5" stroke="#94a3b8" strokeWidth="0.6" />
            <line x1="2.5" y1="4.5" x2="5.5" y2="4.5" stroke="#94a3b8" strokeWidth="0.6" />
            <circle cx="-3" cy="3" r="1.5" fill="#fed7aa" />
            <circle cx="2" cy="4" r="1.5" fill="#fed7aa" />
          </>
        )}
      </g>
    );
  };

  // Check if a worker subagent is currently walking to report permission
  const isWorkerReporting = (worker: ResolvedSubagent) => {
    return isWaitingPermission && reportingWorker?.id === worker.id;
  };

  return (
    <div
      className={cx(
        "pixel-office-container",
        "clean-office-theme",
        isModal && "pixel-office-modal-mode",
        displayMode === "docked" && "is-docked",
        displayMode === "pip" && "is-pip",
        className,
      )}
      style={style}
      data-testid="pixel-agents-office"
    >
      {/* ── 1. Sleek Modern Top Bar ── */}
      <div className="pixel-office-topbar">
        <div className="pixel-office-title-group">
          <div className="pixel-office-live-badge">
            <span
              className={cx(
                "live-indicator-dot",
                isWaitingPermission
                  ? "is-paused"
                  : isWorking
                    ? "is-working"
                    : "is-idle",
              )}
            />
            <span className="live-text">
              {isWaitingPermission
                ? "PAUSED (MENUNGGU APPROVAL)"
                : isWorking
                  ? "LIVE (SEDANG BEKERJA)"
                  : "STANDBY (IDLE)"}
            </span>
          </div>
          <span className="pixel-office-divider">/</span>
          <span className="pixel-office-room-label">
            Zeus HQ · Tokyo Tech Twilight Office
          </span>
          <span className="pixel-office-subagent-badge">
            {officeSubagents.length} Sub-Agents Active
          </span>
          {totalWings > 1 && (
            <div className="pixel-office-wing-switcher" role="tablist" aria-label="Office Wings">
              {Array.from({ length: totalWings }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeWing === i}
                  className={cx("wing-btn", activeWing === i && "is-active")}
                  onClick={() => setActiveWing(i)}
                  title={`Tampilkan Sub-Agent di Wing ${String.fromCharCode(65 + i)}`}
                >
                  Wing {String.fromCharCode(65 + i)} ({i * WING_CAPACITY + 1}-{Math.min((i + 1) * WING_CAPACITY, officeSubagents.length)})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pixel-office-controls">
          {/* Studio View Mode Switcher: Studio Canvas vs CrewAI Pipeline vs Buzz War Room */}
          <div className="pixel-mode-segmented-control" role="group" aria-label="Office View Mode">
            <button
              type="button"
              className={cx("mode-btn", officeViewMode === "canvas" && "is-active")}
              onClick={() => setOfficeViewMode("canvas")}
              title="Studio Canvas View"
            >
              Studio
            </button>
            <button
              type="button"
              className={cx("mode-btn", officeViewMode === "pipeline" && "is-active")}
              onClick={() => setOfficeViewMode("pipeline")}
              title="CrewAI Task Flow Pipeline"
            >
              <HugeiconsIcon icon={WorkflowSquare01Icon} size={12} className="btn-icon" />
              Pipeline
            </button>
            <button
              type="button"
              className={cx("mode-btn", officeViewMode === "war-room" && "is-active")}
              onClick={() => setOfficeViewMode("war-room")}
              title="Block Buzz War Room & Audit Trail"
            >
              <HugeiconsIcon icon={Message01Icon} size={12} className="btn-icon" />
              War Room
            </button>
          </div>

          <div className="pixel-mode-segmented-control" role="group" aria-label="Mode Operasi">
            <button
              type="button"
              className={cx("mode-btn", manualMode === "auto" && "is-active")}
              onClick={() => setManualMode("auto")}
              title="Mengikuti status chat session secara otomatis"
            >
              Auto
            </button>
            <button
              type="button"
              className={cx("mode-btn", manualMode === "working" && "is-active")}
              onClick={() => setManualMode("working")}
              title="Paksa mode bekerja (simulasi multi-agent)"
            >
              <HugeiconsIcon icon={FlashIcon} size={12} className="btn-icon" />
              Work
            </button>
            <button
              type="button"
              className={cx("mode-btn", manualMode === "idle" && "is-active")}
              onClick={() => setManualMode("idle")}
              title="Paksa mode standby"
            >
              <HugeiconsIcon icon={Coffee01Icon} size={12} className="btn-icon" />
              Standby
            </button>
          </div>

          <button
            type="button"
            className={cx("pixel-icon-btn", soundEnabled && "is-active")}
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? "Mute office ambient SFX" : "Enable 8-bit ambient SFX"}
            aria-label="Toggle ambient SFX"
          >
            <HugeiconsIcon
              icon={soundEnabled ? VolumeHighIcon : VolumeMute01Icon}
              size={14}
            />
          </button>

          <button
            type="button"
            className="pixel-speed-btn"
            onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
            title="Kecepatan animasi kerja tim agen"
          >
            {speed}x
          </button>

          {isModal && onToggleDisplayMode && (
            <div className="pixel-dock-mode-toggles" role="group" aria-label="Layout Tampilan">
              <button
                type="button"
                className={cx("pixel-icon-btn", displayMode === "modal" && "is-active")}
                onClick={() => onToggleDisplayMode("modal")}
                title="Mode Dialog Layar Penuh (Center Modal)"
                aria-label="Mode Dialog Penuh"
              >
                <HugeiconsIcon icon={Maximize01Icon} size={13} />
              </button>
              <button
                type="button"
                className={cx("pixel-icon-btn", displayMode === "docked" && "is-active")}
                onClick={() => onToggleDisplayMode("docked")}
                title="Dock ke Sisi Kanan (Split View dengan Chat - Bebas Ngetik & Baca)"
                aria-label="Dock ke Sisi Kanan"
              >
                <HugeiconsIcon icon={LayoutRightIcon} size={13} />
              </button>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              className="pixel-close-modal-btn"
              onClick={onClose}
              title="Tutup Office (ESC)"
              aria-label="Close Virtual Office Modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Interactive Permission Approval HUD ── */}
      {isWaitingPermission && pendingPermission && (
        <div className="pixel-office-permission-hud" role="alert" aria-live="assertive">
          <div className="hud-header">
            <span className="hud-badge-warning">
              <HugeiconsIcon icon={FlashIcon} size={14} />
              PERSETUJUAN DIPERLUKAN DI VIRTUAL OFFICE
            </span>
            <span className="hud-risk-tag">
              {(pendingPermission.risk || "HIGH").toUpperCase()} RISK
            </span>
          </div>
          <div className="hud-body">
            <div className="hud-agent-line">
              <span className="hud-agent-name">
                {reportingWorker?.name || pendingPermission.agentName || "Sub-Agent"}
              </span>
              <span className="hud-action-text">
                berjalan ke Zeus & meminta izin {permTargetInfo?.actionDesc || "eksekusi tool"}:
              </span>
              <code className="hud-tool-tag">{pendingPermission.toolName || "Action"}</code>
            </div>

            {/* Prominent Target File / Resource Badge */}
            {permTargetInfo?.target && (
              <div className="hud-target-row">
                <HugeiconsIcon
                  icon={permTargetInfo.isCommand ? CodeIcon : FileTextIcon}
                  size={14}
                  className="hud-target-icon"
                />
                <span className="hud-target-label">
                  {permTargetInfo.isCommand ? "Perintah Shell:" : "Target File:"}
                </span>
                <code className="hud-target-path" title={permTargetInfo.target}>
                  {permTargetInfo.target}
                </code>
              </div>
            )}

            {/* Structured / Syntax-Highlighted Preview Box */}
            {(pendingPermission.argsPreview !== undefined || pendingPermission.reason) && (
              <div className="hud-preview-box">
                {permArgBlocks.length > 0 ? (
                  <ToolDetailBlocks blocks={permArgBlocks} />
                ) : permTargetInfo?.content ? (
                  <pre className="hud-formatted-code">
                    <code>{permTargetInfo.content}</code>
                  </pre>
                ) : (
                  <pre className="hud-formatted-code">
                    <code>
                      {typeof pendingPermission.argsPreview === "string"
                        ? pendingPermission.argsPreview
                        : pendingPermission.argsPreview
                          ? JSON.stringify(pendingPermission.argsPreview, null, 2)
                          : pendingPermission.reason}
                    </code>
                  </pre>
                )}
              </div>
            )}
          </div>
          <div className="hud-actions">
            <button
              type="button"
              className="hud-btn hud-btn-deny"
              disabled={isResolvingPermission}
              onClick={() => void handleResolvePermission("deny")}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} />
              Tolak (Reject)
            </button>
            <button
              type="button"
              className="hud-btn hud-btn-session"
              disabled={isResolvingPermission}
              onClick={() => void handleResolvePermission("allow-session")}
            >
              <HugeiconsIcon icon={Clock01Icon} size={14} />
              Izinkan untuk Sesi Ini
            </button>
            <button
              type="button"
              className="hud-btn hud-btn-allow"
              disabled={isResolvingPermission}
              onClick={() => void handleResolvePermission("allow-once")}
            >
              <HugeiconsIcon icon={CheckCheckIcon} size={14} />
              Izinkan Sekali (Allow Once)
            </button>
          </div>
        </div>
      )}

      {/* ── 3. High-Definition Isometric Anime Studio Canvas ── */}
      {officeViewMode === "canvas" && (
        <div className="pixel-office-canvas-wrap">

        <svg
          viewBox="0 0 900 510"
          className="pixel-office-svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="AI Agents Collaborative Engineering Office"
        >
          <defs>
            <clipPath id={`${clipId}-frame`}>
              <rect x="0" y="0" width="900" height="510" rx="20" />
            </clipPath>

            <pattern id="parquetFloor" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#141c2c" />
              <rect x="0" y="0" width="19.5" height="19.5" fill="#192336" />
              <rect x="20" y="20" width="19.5" height="19.5" fill="#192336" />
              <rect x="20" y="0" width="19.5" height="19.5" fill="#1c273c" />
              <rect x="0" y="20" width="19.5" height="19.5" fill="#1c273c" />
              <line x1="0" y1="20" x2="40" y2="20" stroke="#121824" strokeWidth="0.8" />
              <line x1="20" y1="0" x2="20" y2="40" stroke="#121824" strokeWidth="0.8" />
            </pattern>

            <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="85%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>

            <linearGradient id="woodDeskTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#243048" />
              <stop offset="100%" stopColor="#182236" />
            </linearGradient>

            <radialGradient id="hubCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g clipPath={`url(#${clipId}-frame)`}>
            {/* ── A. Tokyo Twilight Panorama & Window Bay ── */}
            <rect x="0" y="0" width="900" height="130" fill="#0f172a" />
            <rect x="150" y="10" width="600" height="104" rx="8" fill="#182234" stroke="#334155" strokeWidth="2" />
            <rect x="154" y="14" width="592" height="96" rx="6" fill="url(#twilightSky)" />

            {/* Skyline Buildings */}
            <g fill="#0b1120">
              <rect x="165" y="48" width="24" height="62" rx="1" />
              <rect x="195" y="38" width="32" height="72" rx="1" />
              <rect x="235" y="55" width="28" height="55" rx="1" />
              <rect x="270" y="30" width="38" height="80" rx="1" />
              <rect x="315" y="45" width="30" height="65" rx="1" />
              <polygon points="380,20 384,20 387,110 377,110" fill="#e11d48" opacity="0.9" />
              <line x1="382" y1="12" x2="382" y2="20" stroke="#f8fafc" strokeWidth="1" />
              <rect x="435" y="40" width="36" height="70" rx="1" />
              <rect x="480" y="28" width="42" height="82" rx="1" />
              <rect x="530" y="50" width="28" height="60" rx="1" />
              <rect x="565" y="36" width="34" height="74" rx="1" />
              <rect x="608" y="44" width="30" height="66" rx="1" />
              <rect x="645" y="34" width="38" height="76" rx="1" />
              <rect x="690" y="52" width="28" height="58" rx="1" />
              <rect x="722" y="42" width="20" height="68" rx="1" />
            </g>

            {/* Wall Clock (Center) */}
            <g transform="translate(450, 38)">
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="12" fill="#0f172a" />
              <line x1="0" y1="-10" x2="0" y2="-8" stroke="#94a3b8" strokeWidth="1" />
              <line x1="10" y1="0" x2="8" y2="0" stroke="#94a3b8" strokeWidth="1" />
              <line x1="0" y1="10" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1" />
              <line x1="-10" y1="0" x2="-8" y2="0" stroke="#94a3b8" strokeWidth="1" />
              <line x1="0" y1="0" x2="4" y2="-4" stroke="#f8fafc" strokeWidth="1.2" strokeLinecap="round" />
              <line
                x1="0"
                y1="0"
                x2={7 * Math.cos(((cycleTick * 3) * Math.PI) / 180)}
                y2={7 * Math.sin(((cycleTick * 3) * Math.PI) / 180)}
                stroke="#f59e0b"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="1.5" fill="#f59e0b" />
            </g>

            {/* Baseboard Trim */}
            <rect x="0" y="130" width="900" height="6" fill="#293548" />

            {/* ── B. Office Parquet Floor ── */}
            <rect x="0" y="136" width="900" height="374" fill="url(#parquetFloor)" />
            <g stroke="#1b2538" strokeWidth="0.8" opacity="0.6">
              {[185, 235, 285, 335, 385, 435, 485].map((y) => (
                <line key={`floor-h-${y}`} x1="0" y1={y} x2="900" y2={y} />
              ))}
              {[80, 200, 320, 440, 560, 680, 800].map((x) => (
                <line key={`floor-v1-${x}`} x1={x} y1="136" x2={x} y2="235" strokeDasharray="2 12" />
              ))}
              {[140, 260, 380, 500, 620, 740, 860].map((x) => (
                <line key={`floor-v2-${x}`} x1={x} y1="235" x2={x} y2="335" strokeDasharray="2 12" />
              ))}
              {[80, 200, 320, 440, 560, 680, 800].map((x) => (
                <line key={`floor-v3-${x}`} x1={x} y1="335" x2={x} y2="435" strokeDasharray="2 12" />
              ))}
              {[140, 260, 380, 500, 620, 740, 860].map((x) => (
                <line key={`floor-v4-${x}`} x1={x} y1="435" x2={x} y2="510" strokeDasharray="2 12" />
              ))}
            </g>

            {/* ── C. Central Collaboration Zone (AI AGENT TEAM) ── */}
            <g transform="translate(450, 325)">
              <circle cx="0" cy="0" r="70" fill="#161f30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />
              <circle cx="0" cy="0" r="64" fill="#111827" />
              <circle cx="0" cy="0" r="56" fill="url(#hubCenterGlow)" />
              <circle cx="0" cy="0" r="44" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="40" fill="#0f172a" />

              <circle
                cx="0"
                cy="0"
                r={isWorking ? 34 + (animationTick % 8) * 0.4 : 34}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.9"
              />

              <text
                x="0"
                y="-8"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="8"
                fontWeight="700"
                fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif"
                letterSpacing="1.2"
              >
                AI AGENT TEAM
              </text>
              <text
                x="0"
                y="7"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="7"
                fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif"
              >
                AUTONOMOUS HUB
              </text>
              <circle
                cx="0"
                cy="22"
                r="3.5"
                fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#10b981" : "#64748b"}
              />
            </g>

            {/* ═══════════ POD 1: ZEUS (Lead Orchestrator - Top Left) ═══════════ */}
            <g
              transform="translate(175, 205)"
              onClick={() => handleSelectAgent("zeus")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="-88"
                y="-46"
                width="176"
                height="94"
                rx="16"
                fill="#131b29"
                stroke={selectedAgentId === "zeus" ? "#f59e0b" : "#283548"}
                strokeWidth={selectedAgentId === "zeus" ? 2 : 1}
              />

              {/* Office Chair */}
              <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
              <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

              {/* Chibi Zeus */}
              <g transform="translate(25, -16)">
                {renderChibiSprite("zeus", isWorking)}
              </g>

              {/* Zeus Junior Dispatch Helper ("Anak Buah" Zeus) */}
              <g transform="translate(62, -14)">
                {renderMiniHelperSprite("zeus", isWorking)}
              </g>

              {/* Zeus Squad Pill Badge */}
              {isWorking && (
                <g transform="translate(44, -36)">
                  <rect
                    x="-2"
                    y="-1"
                    width="36"
                    height="11"
                    rx="5.5"
                    fill="rgba(245, 158, 11, 0.2)"
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                  />
                  <text
                    x="16"
                    y="7"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="5.5"
                    fontWeight="700"
                    fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif"
                  >
                    DISPATCH
                  </text>
                </g>
              )}

              {/* Executive Wooden Desk */}
              <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

              {/* Monitors on Desk */}
              <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
              <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#0b0f19" />
              <circle cx="-50" cy="-24" r="3" fill="#f59e0b" />
              <line x1="-47" y1="-24" x2="-35" y2="-28" stroke="#38bdf8" strokeWidth="1" />
              <line x1="-47" y1="-24" x2="-35" y2="-20" stroke="#10b981" strokeWidth="1" />
              <circle cx="-35" cy="-28" r="2.5" fill="#38bdf8" />
              <circle cx="-35" cy="-20" r="2.5" fill="#10b981" />
              <circle cx="-25" cy="-20" r="2" fill="#ec4899" />
              <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

              <rect x="-6" y="-32" width="24" height="26" rx="3" fill="#020617" stroke="#475569" strokeWidth="1" />
              <line x1="-3" y1="-26" x2="14" y2="-26" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-3" y1="-20" x2="10" y2="-20" stroke="#94a3b8" strokeWidth="1" />

              {/* Keyboard & Mousepad */}
              <rect x="-50" y="2" width="34" height="10" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
              <rect x="-12" y="2" width="10" height="10" rx="2" fill="#1e293b" />

              {/* Desk Front Nameplate */}
              <rect x="-76" y="12" width="152" height="20" rx="10" fill="#141a26" stroke="#2a354c" strokeWidth="0.8" />
              <text x="-66" y="25" fill="#f8fafc" fontSize="8" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                {cleanAgentName(zeusSubagent.name)}
              </text>
              <rect x="24" y="15" width="46" height="14" rx="7" fill="rgba(245, 158, 11, 0.16)" />
              <text x="47" y="25" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Lead
              </text>

              {/* Live Status Indicator */}
              <circle cx="68" cy="-34" r="3.5" fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#f59e0b" : "#64748b"} />

              {/* Zeus Alert / Speech Bubble */}
              {zeusBubble && (
                <g transform="translate(-40, -82)">
                  <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                  <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#f59e0b" strokeWidth="1.2" />
                  <text x="87" y="18" textAnchor="middle" fill="#fef3c7" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                    {zeusBubble}
                  </text>
                </g>
              )}
            </g>

            {/* ═══════════ DYNAMIC WORKER SUBAGENT DESK PODS ═══════════ */}
            {displayedWorkers.map((worker, index) => {
              const slot = DESK_SLOTS[index % DESK_SLOTS.length];
              const arch = getCharacterArchetype(worker.archetype);
              const isSelected = selectedAgentId === worker.id;
              const isReporting = isWorkerReporting(worker);
              const isWalkingNow = isReporting || (worker.id === "explorer" && athenaIsWalking);

              return (
                <g
                  key={worker.id}
                  transform={`translate(${slot.x}, ${slot.y})`}
                  onClick={() => handleSelectAgent(worker.id)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x="-88"
                    y="-46"
                    width="176"
                    height="94"
                    rx="16"
                    fill="#131b29"
                    stroke={isSelected ? arch.color : "#283548"}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Office Chair */}
                  <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
                  <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

                  {/* Character sitting at desk if NOT walking */}
                  {!isWalkingNow ? (
                    <g transform="translate(25, -16)">
                      {renderChibiSprite(
                        worker.archetype,
                        isWorking && (!activeChatWorkerId || activeChatWorkerId === worker.id),
                      )}
                    </g>
                  ) : (
                    // Walking indicator at empty desk
                    <g transform="translate(10, -18)">
                      <rect
                        x="-4"
                        y="-6"
                        width="38"
                        height="16"
                        rx="4"
                        fill={isReporting ? "rgba(245, 158, 11, 0.2)" : arch.accentBg}
                        stroke={isReporting ? "#f59e0b" : arch.color}
                        strokeWidth="1"
                      />
                      <text
                        x="15"
                        y="5"
                        textAnchor="middle"
                        fill={isReporting ? "#fbbf24" : "#e0f2fe"}
                        fontSize="6.5"
                        fontWeight="bold"
                        fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif"
                      >
                        {isReporting ? "BUTUH IZIN" : "REPORT"}
                      </text>
                    </g>
                  )}

                  {/* Junior Assistant Helper ("Anak Buah" / Child Subagent Helper) */}
                  {(() => {
                    const parallelCount = activeDelegationsPerAgent.get(worker.id) || 1;
                    const isParallelActive = isWorking && parallelCount > 1;

                    return (
                      <>
                        <g transform={`translate(${isParallelActive ? 54 : 62}, -14)`}>
                          {renderMiniHelperSprite(
                            worker.archetype,
                            !isWalkingNow && isWorking && (!activeChatWorkerId || activeChatWorkerId === worker.id),
                          )}
                        </g>

                        {/* If multiple parallel subagents running, render 2nd junior helper */}
                        {isParallelActive && (
                          <g transform="translate(70, -10)">
                            {renderMiniHelperSprite(
                              worker.archetype,
                              !isWalkingNow && isWorking,
                            )}
                          </g>
                        )}

                        {/* Active Squad Indicator Pill */}
                        {isWorking && (!activeChatWorkerId || activeChatWorkerId === worker.id) && (
                          <g transform={`translate(${isParallelActive ? 36 : 44}, -36)`}>
                            <rect
                              x="-2"
                              y="-1"
                              width={isParallelActive ? 48 : 36}
                              height="11"
                              rx="5.5"
                              fill={arch.accentBg}
                              stroke={arch.color}
                              strokeWidth="0.8"
                            />
                            <text
                              x={isParallelActive ? 22 : 16}
                              y="7"
                              textAnchor="middle"
                              fill={arch.color}
                              fontSize="5.5"
                              fontWeight="700"
                              fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif"
                            >
                              {isParallelActive ? `⚡ ${parallelCount}x PARALLEL` : "SQUAD +1"}
                            </text>
                          </g>
                        )}
                      </>
                    );
                  })()}

                  {/* Wooden Desk */}
                  <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

                  {/* Monitor Screen tailored to archetype */}
                  <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
                  <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#0b0f19" />

                  {worker.archetype === "apollo" ? (
                    // Test pass checkmarks
                    <>
                      <rect x="-58" y="-28" width="35" height="4" rx="1" fill="#10b981" />
                      <rect x="-58" y="-21" width="42" height="4" rx="1" fill="#10b981" />
                      <rect x="-58" y="-14" width="28" height="4" rx="1" fill="#ec4899" />
                      <text x="-20" y="-24" fill="#4ade80" fontSize="7" fontWeight="bold">✓</text>
                      <text x="-13" y="-17" fill="#4ade80" fontSize="7" fontWeight="bold">✓</text>
                    </>
                  ) : worker.archetype === "hermes" ? (
                    // Code syntax lines
                    <>
                      <line x1="-58" y1="-26" x2="-25" y2="-26" stroke="#10b981" strokeWidth="1.8" />
                      <line x1="-58" y1="-21" x2="-35" y2="-21" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="-58" y1="-16" x2="-40" y2="-16" stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1="-58" y1="-11" x2="-28" y2="-11" stroke="#94a3b8" strokeWidth="1.2" />
                    </>
                  ) : (
                    // Tree graph or generic lines
                    <>
                      <line x1="-58" y1="-26" x2="-30" y2="-26" stroke={arch.color} strokeWidth="1.5" />
                      <line x1="-58" y1="-20" x2="-40" y2="-20" stroke="#94a3b8" strokeWidth="1.2" />
                      <line x1="-58" y1="-14" x2="-34" y2="-14" stroke="#94a3b8" strokeWidth="1.2" />
                    </>
                  )}
                  <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

                  {/* Keyboard & Mousepad */}
                  <rect x="-50" y="2" width="34" height="10" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
                  <rect x="-12" y="2" width="10" height="10" rx="2" fill="#1e293b" />

                  {/* Nameplate */}
                  <rect x="-76" y="12" width="152" height="20" rx="10" fill="#141a26" stroke="#2a354c" strokeWidth="0.8" />
                  <text x="-66" y="25" fill="#f8fafc" fontSize="8" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                    {cleanAgentName(worker.name)}
                  </text>
                  <rect x="18" y="15" width="54" height="14" rx="7" fill={arch.accentBg} />
                  <text x="45" y="25" textAnchor="middle" fill={arch.color} fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                    {formatRoleBadge(worker.role)}
                  </text>

                  <circle
                    cx="68"
                    cy="-34"
                    r="3.5"
                    fill={isWaitingPermission ? "#f59e0b" : isWorking ? arch.color : "#64748b"}
                  />

                  {/* Speech Bubbles */}
                  {!isWaitingPermission && isWorking && (
                    worker.id === "fixer" && hermesBubble ? (
                      <g transform="translate(-40, -82)">
                        <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                        <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#10b981" strokeWidth="1.2" />
                        <text x="87" y="18" textAnchor="middle" fill="#dcfce7" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                          {hermesBubble}
                        </text>
                      </g>
                    ) : worker.id === "explorer" && !athenaIsWalking && athenaBubble ? (
                      <g transform="translate(-40, -82)">
                        <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                        <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#38bdf8" strokeWidth="1.2" />
                        <text x="87" y="18" textAnchor="middle" fill="#e0f2fe" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                          {athenaBubble}
                        </text>
                      </g>
                    ) : worker.id === "test-runner" && activeChatWorkerId === "test-runner" ? (
                      <g transform="translate(-40, -82)">
                        <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                        <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#ec4899" strokeWidth="1.2" />
                        <text x="87" y="18" textAnchor="middle" fill="#fce7f3" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                          {latestLiveActivity?.target ? `Test: ${latestLiveActivity.target}` : "Menjalankan verifikasi test..."}
                        </text>
                      </g>
                    ) : activeChatWorkerId === worker.id && latestLiveActivity ? (
                      <g transform="translate(-40, -82)">
                        <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                        <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke={arch.color} strokeWidth="1.2" />
                        <text x="87" y="18" textAnchor="middle" fill="#f8fafc" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                          {latestLiveActivity.toolName}: {latestLiveActivity.target || "eksekusi"}
                        </text>
                      </g>
                    ) : null
                  )}
                </g>
              );
            })}

            {/* ═══════════ SUBAGENT WALKING TO ZEUS FOR PERMISSION ═══════════ */}
            {isWaitingPermission && reportingWorker && (() => {
              // Locate requesting worker's slot
              const workerIdx = officeSubagents.findIndex((w) => w.id === reportingWorker.id);
              const slot = DESK_SLOTS[Math.max(0, workerIdx) % DESK_SLOTS.length];
              const tWalk = Math.min(1, (cycleTick % 40) / 30); // 0 to 1
              // Walk path towards Zeus at (250, 205)
              const startX = slot.x;
              const startY = slot.y;
              const targetX = 250;
              const targetY = 205;
              const currentX = startX + (targetX - startX) * tWalk;
              const currentY = startY + (targetY - startY) * tWalk;
              const stepBob = cycleTick % 6 < 3 ? -2 : 2;

              return (
                <g transform={`translate(${currentX}, ${currentY + stepBob})`}>
                  {/* Shadow */}
                  <ellipse cx="0" cy="18" rx="14" ry="4" fill="#090d16" opacity="0.6" />

                  {/* Chibi Sprite */}
                  {renderChibiSprite(reportingWorker.archetype, true, {
                    isWalking: true,
                    walkingLegPhase: cycleTick % 6,
                  })}

                  {/* Requesting Bubble */}
                  <g transform="translate(-85, -75)">
                    <path d="M 85 28 L 85 36 L 91 28 Z" fill="#111827" />
                    <rect x="0" y="0" width="170" height="28" rx="10" fill="#111827" stroke="#f59e0b" strokeWidth="1.2" />
                    <text x="85" y="17" textAnchor="middle" fill="#fef08a" fontSize="7.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="bold">
                      Zeus, butuh izin {pendingPermission?.toolName || "tool"}!
                    </text>
                  </g>
                </g>
              );
            })()}

            {/* ═══════════ ATHENA WALKING SPRITE ACROSS FLOOR (IDLE/LIVE) ═══════════ */}
            {athenaIsWalking && (() => {
              const tWalk = (cycleTick - 30) / 44;
              const walkPhase = Math.sin(tWalk * Math.PI);
              const walkX = 725 - walkPhase * 275;
              const walkY = 205 + walkPhase * 40;
              const stepBob = cycleTick % 6 < 3 ? -2 : 2;

              return (
                <g transform={`translate(${walkX}, ${walkY + stepBob})`}>
                  <ellipse cx="0" cy="18" rx="14" ry="4" fill="#090d16" opacity="0.6" />
                  {renderChibiSprite("athena", true, {
                    isWalking: true,
                    walkingLegPhase: cycleTick % 6,
                  })}
                  <g transform="translate(-75, -70)">
                    <path d="M 75 28 L 75 35 L 81 28 Z" fill="#111827" />
                    <rect x="0" y="0" width="150" height="28" rx="10" fill="#111827" stroke="#38bdf8" strokeWidth="1" />
                    <text x="75" y="17" textAnchor="middle" fill="#e0f2fe" fontSize="7.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="bold">
                      {athenaBubble.slice(0, 24)}...
                    </text>
                  </g>
                </g>
              );
            })()}
          </g>
        </svg>
      </div>
      )}

      {/* ── Alternate View: CrewAI Task Flow Pipeline ── */}
      {officeViewMode === "pipeline" && (
        <div className="pixel-office-pipeline-view">
          <div className="pipeline-view-header">
            <div className="pipeline-header-title">
              <HugeiconsIcon icon={WorkflowSquare01Icon} size={18} color="#f59e0b" />
              <span>Multi-Agent Task Flow: Feature Delivery</span>
            </div>
            <span className="pipeline-view-status-chip">SEQUENTIAL TASK PIPELINE</span>
          </div>

          <div className="pipeline-steps-grid">
            {[
              {
                step: "01",
                role: "Explorer",
                agent: "Athena",
                title: "Codebase Survey & Reconnaissance",
                desc: "Memindai arsitektur, symbol call-sites, dan file target.",
                status: isWorking ? "Completed" : "Standby",
                output: "Discovered 4 affected files: shared, agent-runtime, desktop",
              },
              {
                step: "02",
                role: "Fixer",
                agent: "Hermes",
                title: "Code Implementation & Patching",
                desc: "Menulis modifikasi kode dan memvalidasi kontrak schema.",
                status: isWaitingPermission ? "Waiting Permission" : isWorking ? "Running" : "Standby",
                output: "Applying changes with shared context buffer injection",
              },
              {
                step: "03",
                role: "Code Reviewer",
                agent: "Artemis",
                title: "Quality & Security Audit",
                desc: "Memeriksa edge-case, regresi tipe, dan kompatibilitas API.",
                status: "Queued",
                output: "Pending completion of step 2",
              },
              {
                step: "04",
                role: "Test Runner",
                agent: "Apollo",
                title: "Automated Suite Verification",
                desc: "Eksekusi test runner dan verifikasi green status.",
                status: "Queued",
                output: "Pending completion of step 3",
              },
            ].map((st) => (
              <div key={st.step} className={cx("pipeline-step-card", st.status === "Running" && "is-active")}>
                <div className="step-card-top">
                  <span className="step-num">{st.step}</span>
                  <span className="step-role-badge">{st.role} ({st.agent})</span>
                  <span className={cx("step-status-chip", st.status === "Running" ? "is-live" : st.status.includes("Waiting") ? "is-warning" : "is-idle")}>
                    {st.status}
                  </span>
                </div>
                <h4 className="step-card-title">{st.title}</h4>
                <p className="step-card-desc">{st.desc}</p>
                <div className="step-card-scratchpad">
                  <span className="scratchpad-label">Shared Scratchpad Output:</span>
                  <code className="scratchpad-val">{st.output}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Alternate View: Block Buzz War Room & Audit Trail ── */}
      {officeViewMode === "war-room" && (
        <div className="pixel-office-war-room-view">
          <div className="war-room-header">
            <div className="war-room-title">
              <HugeiconsIcon icon={Message01Icon} size={18} color="#38bdf8" />
              <span>Block Buzz Collaborative War Room &amp; Audit Trail</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="war-room-relay-badge">Signed Event Relay: Localhost</span>
              <button
                type="button"
                className="war-room-export-btn"
                data-testid="war-room-export-btn"
                onClick={handleExportWarRoomAudit}
                title="Ekspor riwayat event audit ke Markdown"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 11.5,
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#7dd3fc",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  cursor: "pointer",
                }}
              >
                <HugeiconsIcon icon={Download01Icon} size={13} />
                <span>Export MD</span>
              </button>
            </div>
          </div>

          <div className="war-room-timeline">
            {[
              {
                id: "ev-1",
                time: "Baru saja",
                agent: "Zeus (Lead)",
                role: "Orchestrator",
                event: "Flow Started",
                detail: "Memulai workflow Feature Delivery dengan shared context scratchpad.",
              },
              {
                id: "ev-2",
                time: "1 menit lalu",
                agent: "Athena",
                role: "Explorer",
                event: "Task Completed & Context Handoff",
                detail: "Menyimpan 4 target file ke dalam scratchpad memory untuk Hermes.",
              },
              {
                id: "ev-3",
                time: "2 menit lalu",
                agent: "Hermes",
                role: "Fixer",
                event: "Tool Execution Dispatched",
                detail: "Eksekusi replace_file_content pada modul UI dan styling.",
              },
              {
                id: "ev-4",
                time: "3 menit lalu",
                agent: "Apollo",
                role: "Test Runner",
                event: "Suite Validation Asserted",
                detail: "Verifikasi 3 unit test suites berjalan 100% green.",
              },
            ].map((ev) => (
              <div key={ev.id} className="war-room-timeline-item">
                <div className="timeline-item-time">{ev.time}</div>
                <div className="timeline-item-body">
                  <div className="timeline-item-header">
                    <span className="timeline-agent-name">{ev.agent}</span>
                    <span className="timeline-agent-role">({ev.role})</span>
                    <span className="timeline-event-badge">{ev.event}</span>
                  </div>
                  <p className="timeline-event-detail">{ev.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── 4. Tactical Status, Active Dossier & Telemetry ── */}
      <div className="pixel-office-dossier-grid">
        {/* Active Selected Agent Dossier Card */}
        <div className="pixel-agent-card clean-card">
          <div className="pixel-card-header">
            <div
              className="pixel-card-avatar"
              style={{
                backgroundColor: activeAgent.accentBg,
                color: activeAgent.color,
                border: `1.5px solid ${activeAgent.color}`,
              }}
            >
              <HugeiconsIcon icon={getArchetypeHugeIcon(activeAgent.archetype)} size={20} />
            </div>
            <div className="pixel-card-identity">
              <span className="agent-identity-name">{cleanAgentName(activeAgent.name)}</span>
              <span className="agent-identity-role" style={{ color: activeAgent.color }}>
                {activeAgent.role}
              </span>
            </div>
            <div className="pixel-card-status-badge">
              <span
                className="status-dot-mini"
                style={{
                  backgroundColor: isWaitingPermission
                    ? "#f59e0b"
                    : isWorking
                      ? activeAgent.color
                      : "#64748b",
                }}
              />
              <span className="status-text-mini">
                {isWaitingPermission
                  ? "PAUSED (NEED APPROVAL)"
                  : isWorking
                    ? "ACTIVE"
                    : "STANDBY"}
              </span>
            </div>
          </div>

          <div className="pixel-card-metrics dossier-spec-grid">
            <div className="dossier-spec-row">
              <div className="dossier-spec-item">
                <span className="metric-label dossier-spec-label">LOAD</span>
                <div className="dossier-load-bar-wrap">
                  <div className="metric-bar-track dossier-load-track">
                    <div
                      className="metric-bar-fill dossier-load-fill"
                      style={{
                        width: `${isWorking ? activeAgent.load : 18}%`,
                        backgroundColor: activeAgent.color,
                      }}
                    />
                  </div>
                  <span className="metric-value dossier-load-val">
                    {isWorking ? `${activeAgent.load}%` : "18%"}
                  </span>
                </div>
              </div>

              <div className="dossier-spec-item dossier-spec-squad">
                <span className="metric-label dossier-spec-label" title="SUB-SQUAD / ANAK BUAH">
                  SUB-SQUAD / ANAK BUAH
                </span>
                <span
                  className="metric-value dossier-squad-badge"
                  style={{
                    color: activeAgent.color,
                    background: activeAgent.accentBg,
                    border: `1px solid ${activeAgent.color}40`,
                  }}
                >
                  {activeAgent.id === "zeus"
                    ? "Chief Dispatcher (Standby)"
                    : (activeDelegationsPerAgent.get(activeAgent.id) || 1) > 1
                      ? `⚡ ${activeDelegationsPerAgent.get(activeAgent.id)}x Parallel (Aktif)`
                      : "1x Junior Helper (Aktif)"}
                </span>
              </div>
            </div>

            {activeAgentTools.length > 0 && (
              <div className="dossier-tools-section">
                <div className="dossier-tools-header">
                  <span className="metric-label dossier-spec-label">TOOLS &amp; SKILLS</span>
                  <span className="dossier-tools-count">{activeAgentTools.length} tools</span>
                </div>
                <div className="dossier-tool-chips" role="list" aria-label="Available tools">
                  {activeAgentTools.map((tool) => (
                    <span key={tool} className="dossier-tool-chip" role="listitem">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pixel-card-task">
            <span className="task-label">CURRENT FOCUS:</span>
            <span className="task-desc">
              {isWaitingPermission
                ? `Agen dijeda sementara: Menunggu persetujuan user untuk tool "${pendingPermission?.toolName || "action"}" di chat.`
                : isWorking
                  ? activeAgent.task
                  : "Standby mode · Siap memproses prompt atau tugas baru dari pengguna."}
            </span>
          </div>

          {thoughtText && isWorking && (
            <div className="pixel-live-thought-snippet">
              <span className="snippet-tag">LIVE STREAMING THOUGHT:</span>
              <span className="snippet-text">{thoughtText.slice(-120)}</span>
            </div>
          )}
        </div>

        {/* Action Log Panel */}
        <div className="pixel-action-log-panel clean-log-panel">
          <div className="pixel-log-header">
            <div className="pixel-log-header-left">
              <span className="pixel-log-title">
                {logFilter === "selected" ? (
                  <>
                    <span className="pixel-log-agent-chip" style={{ color: activeAgent.color }}>
                      {cleanAgentName(activeAgent.name)}
                    </span>{" "}
                    ACTIVITY LOG
                  </>
                ) : (
                  "AI AGENT TEAM TELEMETRY"
                )}
              </span>
              <span className="pixel-log-count">
                {displayedLogItems.length} ACTIONS
              </span>
            </div>

            <div className="pixel-log-filter-tabs" role="tablist" aria-label="Log View Filter">
              <button
                type="button"
                role="tab"
                aria-selected={logFilter === "selected"}
                className={cx("log-filter-btn", logFilter === "selected" && "is-active")}
                onClick={() => setLogFilter("selected")}
                title={`Tampilkan riwayat log khusus ${cleanAgentName(activeAgent.name)}`}
              >
                {shortAgentTabLabel}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={logFilter === "all"}
                className={cx("log-filter-btn", logFilter === "all" && "is-active")}
                onClick={() => setLogFilter("all")}
                title="Tampilkan seluruh aktivitas tim agent"
              >
                Semua Tim
              </button>
            </div>
          </div>

          <div className="pixel-log-list">
            {isWaitingPermission && logFilter === "all" && (
              <div
                className="pixel-log-row is-warning-row"
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  borderLeft: "3px solid #f59e0b",
                  paddingLeft: 6,
                }}
              >
                <span className="pixel-log-time" style={{ color: "#f59e0b" }}>
                  LIVE
                </span>
                <span className="pixel-log-sender" style={{ color: "#f59e0b" }}>
                  System:
                </span>
                <span className="pixel-log-text" style={{ color: "#fef3c7" }}>
                  <HugeiconsIcon icon={Alert02Icon} size={12} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                  Menunggu persetujuan user untuk &quot;{pendingPermission?.toolName || "action"}&quot; (
                  {pendingPermission?.risk || "high"} risk). Agen dijeda sementara demi keamanan.
                </span>
              </div>
            )}
            {displayedLogItems.length > 0 ? (
              displayedLogItems.map((call) => (
                <div key={call.id} className="pixel-log-row">
                  <span className="pixel-log-time">{call.time}</span>
                  <span className="pixel-log-sender" style={{ color: call.color }}>
                    {cleanAgentName(call.agentName)}:
                  </span>
                  {call.toolName && (
                    <span
                      className="pixel-log-tool-tag"
                      style={{
                        color: call.color,
                        borderColor: `${call.color}40`,
                        background: `${call.color}15`,
                      }}
                    >
                      {call.toolName}
                    </span>
                  )}
                  <span className="pixel-log-text">{call.text}</span>
                </div>
              ))
            ) : (
              <div className="pixel-log-empty">
                <span className="pixel-log-text">
                  Belum ada log aktivitas tercatat untuk agen ini.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export interface PixelAgentsOfficeModalProps extends PixelAgentsOfficeProps {
  isOpen: boolean;
  initialDisplayMode?: PixelOfficeDisplayMode;
}

export function PixelAgentsOfficeModal({
  isOpen,
  onClose,
  initialDisplayMode = "modal",
  ...props
}: PixelAgentsOfficeModalProps) {
  const [displayMode, setDisplayMode] = useState<PixelOfficeDisplayMode>(initialDisplayMode);

  // ESC key listener to reliably close the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDocked = displayMode === "docked";
  const isPip = displayMode === "pip";

  // Mount directly to document.body via portalToBody with explicit pointer-events
  return portalToBody(
    <div
      className={cx(
        "overlay pixel-office-modal-backdrop",
        isDocked && "is-docked",
        isPip && "is-pip",
      )}
      onClick={isDocked || isPip ? undefined : onClose}
      style={{
        pointerEvents: isDocked || isPip ? "none" : "auto",
        cursor: isDocked || isPip ? "default" : "pointer",
      }}
    >
      <div
        className={cx(
          "pixel-office-modal-dialog",
          isDocked && "is-docked",
          isPip && "is-pip",
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal={!isDocked && !isPip}
        aria-label="AI Agent Team Virtual Office"
        style={{ cursor: "default", pointerEvents: "auto" }}
      >
        <PixelAgentsOffice
          {...props}
          isModal
          displayMode={displayMode}
          onToggleDisplayMode={setDisplayMode}
          onClose={onClose}
        />
      </div>
    </div>,
  );
}

// Backward-compatible alias
export const IsometricThinkingOffice = PixelAgentsOffice;
export type IsometricThinkingOfficeProps = PixelAgentsOfficeProps;
