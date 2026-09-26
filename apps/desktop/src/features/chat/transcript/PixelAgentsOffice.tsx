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
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cx } from "../../../components/ui";
import { portalToBody } from "../../../lib/portal-visibility";
import { useSubagentsData, type ResolvedSubagent } from "../../../hooks/use-subagents-data";
import { useAppStore } from "../../../stores/app-store";
import {
  getCharacterArchetype,
  type CharacterArchetypeId,
} from "../../../components/settings/subagent-character-profiles";

export interface PixelAgentsOfficeProps {
  className?: string;
  style?: CSSProperties;
  streaming?: boolean;
  thoughtText?: string;
  onClose?: () => void;
  isModal?: boolean;
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

// Pre-calculated desk slot coordinates in the office (around meeting zone)
const DESK_SLOTS = [
  { x: 670, y: 155, monitorType: "explorer" }, // Slot 1: Top Right
  { x: 200, y: 315, monitorType: "code" },     // Slot 2: Bottom Left
  { x: 670, y: 315, monitorType: "tests" },    // Slot 3: Bottom Right
  { x: 430, y: 335, monitorType: "terminal" }, // Slot 4: Bottom Center
  { x: 430, y: 155, monitorType: "review" },   // Slot 5: Top Center
  { x: 170, y: 235, monitorType: "design" },   // Slot 6: Mid Left
];

export const PixelAgentsOffice = memo(function PixelAgentsOffice({
  className,
  style,
  streaming = false,
  thoughtText,
  onClose,
  isModal = false,
  pendingPermission,
}: PixelAgentsOfficeProps) {
  const [manualMode, setManualMode] = useState<"auto" | "working" | "idle">("auto");
  const isWaitingPermission = Boolean(pendingPermission);
  const isWorking = manualMode === "auto"
    ? (isWaitingPermission ? false : Boolean(streaming))
    : manualMode === "working";

  const [selectedAgentId, setSelectedAgentId] = useState<string>("zeus");
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);
  const [isResolvingPermission, setIsResolvingPermission] = useState(false);

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

  // Athena walking loop when idle/working without pending permission
  const athenaIsWalking = isWorking && cycleTick > 30 && cycleTick < 75 && !isWaitingPermission;
  const athenaBubble = isWaitingPermission
    ? "Eksekusi dijeda: Menunggu user menyetujui izin di chat."
    : isWorking
      ? cycleTick < 40
        ? "Memeriksa kontrak DTO..."
        : cycleTick < 70
          ? "Hermes, ada pembaruan schema?"
          : "Semua spesifikasi tersinkronisasi!"
      : "Tim AI standby & siap menerima instruksi";

  const hermesBubble = isWaitingPermission
    ? `Menunggu izin untuk ${pendingPermission?.toolName || "tool"}...`
    : isWorking && cycleTick > 45 && cycleTick < 85
      ? "Sudah siap di @shared/contracts!"
      : null;

  const zeusBubble = isWaitingPermission
    ? `⚠️ Butuh izin user untuk "${pendingPermission?.toolName}"!`
    : isWorking && cycleTick > 80 && cycleTick < 110
      ? "Lanjutkan eksekusi dan validasi!"
      : null;

  // Sound triggers
  useEffect(() => {
    if (!soundEnabled || !isWorking) return;
    if (cycleTick === 40 || cycleTick === 75) {
      playRetroTone(587.33, "triangle", 0.05);
    }
  }, [cycleTick, soundEnabled, isWorking]);

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
      });
    }

    return list;
  }, [zeusSubagent, officeSubagents, isWaitingPermission, reportingWorker, isWorking, explorerSubagent, fixerSubagent, testRunnerSubagent]);

  const activeAgent =
    dynamicAgents.find((a) => a.id === selectedAgentId) ||
    dynamicAgents[0] ||
    AGENTS[0];

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
        </div>

        <div className="pixel-office-controls">
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
              PERSETUJUAN DI PERLUKAN DI VIRTUAL OFFICE
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
              <span className="hud-action-text">berjalan ke Zeus & meminta izin eksekusi tool:</span>
              <code className="hud-tool-tag">{pendingPermission.toolName || "Action"}</code>
            </div>
            {(pendingPermission.argsPreview !== undefined || pendingPermission.reason) && (
              <div className="hud-preview-box">
                <code>
                  {typeof pendingPermission.argsPreview === "string"
                    ? pendingPermission.argsPreview
                    : pendingPermission.argsPreview
                      ? JSON.stringify(pendingPermission.argsPreview, null, 2)
                      : pendingPermission.reason}
                </code>
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
      <div className="pixel-office-canvas-wrap">
        <svg
          viewBox="0 0 860 410"
          className="pixel-office-svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="AI Agents Collaborative Engineering Office"
        >
          <defs>
            <clipPath id={`${clipId}-frame`}>
              <rect x="0" y="0" width="860" height="410" rx="20" />
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
            <rect x="0" y="0" width="860" height="125" fill="#0f172a" />
            <rect x="140" y="10" width="580" height="98" rx="8" fill="#182234" stroke="#334155" strokeWidth="2" />
            <rect x="144" y="14" width="572" height="90" rx="6" fill="url(#twilightSky)" />

            {/* Skyline Buildings */}
            <g fill="#0b1120">
              <rect x="155" y="48" width="22" height="56" rx="1" />
              <rect x="182" y="38" width="30" height="66" rx="1" />
              <rect x="218" y="55" width="25" height="49" rx="1" />
              <rect x="250" y="30" width="35" height="74" rx="1" />
              <rect x="290" y="45" width="28" height="59" rx="1" />
              <polygon points="360,20 364,20 367,104 357,104" fill="#e11d48" opacity="0.9" />
              <line x1="362" y1="12" x2="362" y2="20" stroke="#f8fafc" strokeWidth="1" />
              <rect x="420" y="40" width="34" height="64" rx="1" />
              <rect x="460" y="28" width="40" height="76" rx="1" />
              <rect x="506" y="50" width="26" height="54" rx="1" />
              <rect x="538" y="36" width="32" height="68" rx="1" />
              <rect x="576" y="44" width="28" height="60" rx="1" />
              <rect x="610" y="34" width="36" height="70" rx="1" />
              <rect x="652" y="52" width="25" height="52" rx="1" />
              <rect x="682" y="42" width="28" height="62" rx="1" />
            </g>

            {/* Wall Clock (Center) */}
            <g transform="translate(430, 36)">
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
            <rect x="0" y="122" width="860" height="6" fill="#293548" />

            {/* ── B. Office Parquet Floor ── */}
            <rect x="0" y="128" width="860" height="282" fill="url(#parquetFloor)" />
            <g stroke="#1b2538" strokeWidth="0.8" opacity="0.6">
              {[165, 205, 245, 285, 325, 365].map((y) => (
                <line key={`floor-h-${y}`} x1="0" y1={y} x2="860" y2={y} />
              ))}
              {[80, 200, 320, 440, 560, 680, 800].map((x) => (
                <line key={`floor-v1-${x}`} x1={x} y1="128" x2={x} y2="205" strokeDasharray="2 12" />
              ))}
              {[140, 260, 380, 500, 620, 740].map((x) => (
                <line key={`floor-v2-${x}`} x1={x} y1="205" x2={x} y2="285" strokeDasharray="2 12" />
              ))}
            </g>

            {/* ── C. Central Collaboration Zone (AI AGENT TEAM) ── */}
            <g transform="translate(430, 235)">
              <circle cx="0" cy="0" r="78" fill="#161f30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />
              <circle cx="0" cy="0" r="72" fill="#111827" />
              <circle cx="0" cy="0" r="65" fill="url(#hubCenterGlow)" />
              <circle cx="0" cy="0" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="46" fill="#0f172a" />

              <circle
                cx="0"
                cy="0"
                r={isWorking ? 38 + (animationTick % 8) * 0.4 : 38}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.9"
              />

              <text
                x="0"
                y="-10"
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
                y="6"
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
              transform="translate(200, 155)"
              onClick={() => setSelectedAgentId("zeus")}
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
                {zeusSubagent.name}
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
            {officeSubagents.map((worker, index) => {
              const slot = DESK_SLOTS[index % DESK_SLOTS.length];
              const arch = getCharacterArchetype(worker.archetype);
              const isSelected = selectedAgentId === worker.id;
              const isReporting = isWorkerReporting(worker);
              const isWalkingNow = isReporting || (worker.id === "explorer" && athenaIsWalking);

              return (
                <g
                  key={worker.id}
                  transform={`translate(${slot.x}, ${slot.y})`}
                  onClick={() => setSelectedAgentId(worker.id)}
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
                      {renderChibiSprite(worker.archetype, isWorking)}
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
                        {isReporting ? "🚶 BUTUH IZIN" : "🚶 REPORT"}
                      </text>
                    </g>
                  )}

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
                    {worker.name}
                  </text>
                  <rect x="22" y="15" width="50" height="14" rx="7" fill={arch.accentBg} />
                  <text x="47" y="25" textAnchor="middle" fill={arch.color} fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                    {worker.role.replace("Task(", "").replace(")", "").slice(0, 8)}
                  </text>

                  <circle
                    cx="68"
                    cy="-34"
                    r="3.5"
                    fill={isWaitingPermission ? "#f59e0b" : isWorking ? arch.color : "#64748b"}
                  />

                  {/* Speech Bubbles */}
                  {worker.id === "fixer" && hermesBubble && !isWaitingPermission && (
                    <g transform="translate(-40, -82)">
                      <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                      <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#10b981" strokeWidth="1.2" />
                      <text x="87" y="18" textAnchor="middle" fill="#dcfce7" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                        {hermesBubble}
                      </text>
                    </g>
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
              // Walk path towards Zeus at (280, 165)
              const startX = slot.x;
              const startY = slot.y;
              const targetX = 280;
              const targetY = 165;
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
              const walkX = 670 - walkPhase * 280;
              const walkY = 175 + walkPhase * 55;
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
              {activeAgent.avatarChar}
            </div>
            <div className="pixel-card-identity">
              <span className="agent-identity-name">{activeAgent.name}</span>
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

          <div className="pixel-card-metrics">
            <div className="pixel-metric-item">
              <span className="metric-label">TOOLS & SKILLS</span>
              <span className="metric-value metric-value-text" title={activeAgent.stats}>
                {activeAgent.stats}
              </span>
            </div>
            <div className="pixel-metric-item">
              <span className="metric-label">LOAD</span>
              <div className="metric-bar-track">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${isWorking ? activeAgent.load : 18}%`,
                    backgroundColor: activeAgent.color,
                  }}
                />
              </div>
              <span className="metric-value">
                {isWorking ? `${activeAgent.load}%` : "18%"}
              </span>
            </div>
          </div>

          <div className="pixel-card-task">
            <span className="task-label">CURRENT FOCUS:</span>
            <span className="task-desc">
              {isWaitingPermission
                ? `⚠️ Agen dijeda sementara: Menunggu persetujuan user untuk tool "${pendingPermission?.toolName || "action"}" di chat.`
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
            <span className="pixel-log-title">AI AGENT TEAM TELEMETRY</span>
            <span className="pixel-log-count">
              {isWaitingPermission ? "PAUSED (APPROVAL NEEDED)" : isWorking ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          <div className="pixel-log-list">
            {isWaitingPermission && (
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
                  ⚠️ Menunggu persetujuan user untuk &quot;{pendingPermission?.toolName || "action"}&quot; (
                  {pendingPermission?.risk || "high"} risk). Agen dijeda sementara demi keamanan.
                </span>
              </div>
            )}
            <div className="pixel-log-row">
              <span className="pixel-log-time">15:20</span>
              <span className="pixel-log-sender" style={{ color: "#f59e0b" }}>Zeus:</span>
              <span className="pixel-log-text">
                {isWorking ? "Mengkoordinasikan sub-agen untuk menyelesaikan tugas." : "Sistem idle, seluruh agen standby."}
              </span>
            </div>
            <div className="pixel-log-row">
              <span className="pixel-log-time">15:21</span>
              <span className="pixel-log-sender" style={{ color: "#38bdf8" }}>Athena:</span>
              <span className="pixel-log-text">
                {isWorking ? "Sinkronisasi spesifikasi & tipe kontrak selesai." : "Spesifikasi siap digunakan kapan saja."}
              </span>
            </div>
            <div className="pixel-log-row">
              <span className="pixel-log-time">15:22</span>
              <span className="pixel-log-sender" style={{ color: "#10b981" }}>Hermes:</span>
              <span className="pixel-log-text">
                {isWorking ? "Implementasi kode bersih, bebas dari slop." : "Workspace bersih, siap menerima tugas."}
              </span>
            </div>
            <div className="pixel-log-row">
              <span className="pixel-log-time">15:23</span>
              <span className="pixel-log-sender" style={{ color: "#ec4899" }}>Apollo:</span>
              <span className="pixel-log-text">
                Semua pengujian dan boundary security terverifikasi (117/117 pass).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export interface PixelAgentsOfficeModalProps extends PixelAgentsOfficeProps {
  isOpen: boolean;
}

export function PixelAgentsOfficeModal({
  isOpen,
  onClose,
  ...props
}: PixelAgentsOfficeModalProps) {
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

  // Mount directly to document.body via portalToBody with explicit pointer-events
  return portalToBody(
    <div
      className="overlay pixel-office-modal-backdrop"
      onClick={onClose}
      style={{ pointerEvents: "auto", cursor: "pointer" }}
    >
      <div
        className="pixel-office-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI Agent Team Virtual Office"
        style={{ cursor: "default" }}
      >
        <PixelAgentsOffice {...props} isModal onClose={onClose} />
      </div>
    </div>,
  );
}

// Backward-compatible alias
export const IsometricThinkingOffice = PixelAgentsOffice;
export type IsometricThinkingOfficeProps = PixelAgentsOfficeProps;
