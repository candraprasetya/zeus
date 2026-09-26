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
import { useSubagentsData } from "../../../hooks/use-subagents-data";

export interface PixelAgentsOfficeProps {
  className?: string;
  style?: CSSProperties;
  streaming?: boolean;
  thoughtText?: string;
  onClose?: () => void;
  isModal?: boolean;
  pendingPermission?: {
    toolName?: string;
    risk?: string;
    agentName?: string;
    reason?: string;
  } | null;
}

export interface AgentMember {
  id: string;
  name: string;
  role: string;
  title: string;
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

  // Variables preserved for testing and state reflection
  const athenaIsWalking = isWorking && cycleTick > 30 && cycleTick < 75;
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

  const {
    zeusSubagent,
    fixerSubagent,
    explorerSubagent,
    testRunnerSubagent,
    customSubagents,
  } = useSubagentsData();

  const dynamicAgents: AgentMember[] = useMemo(
    () => [
      {
        id: "zeus",
        name: zeusSubagent.name,
        role: "Main System Coordinator",
        title: zeusSubagent.tag,
        color: "#f59e0b",
        accentBg: "rgba(245, 158, 11, 0.15)",
        avatarChar: "⚡",
        station: "Command Center",
        task: zeusSubagent.description,
        status: "planning",
        load: 85,
        stats: zeusSubagent.tools.join(" · "),
      },
      {
        id: "athena",
        name: `Athena · ${explorerSubagent.name}`,
        role: explorerSubagent.tag,
        title: explorerSubagent.name,
        color: "#38bdf8",
        accentBg: "rgba(56, 189, 248, 0.15)",
        avatarChar: "🔍",
        station: "Research Deck",
        task: explorerSubagent.description,
        status: "walking",
        load: 78,
        stats: explorerSubagent.tools.join(" · "),
      },
      {
        id: "hermes",
        name: `Hermes · ${fixerSubagent.name}`,
        role: fixerSubagent.tag,
        title: fixerSubagent.name,
        color: "#10b981",
        accentBg: "rgba(16, 185, 129, 0.15)",
        avatarChar: "💻",
        station: "Dev Station Alpha",
        task: fixerSubagent.description,
        status: "typing",
        load: 92,
        stats: fixerSubagent.tools.join(" · "),
      },
      {
        id: "apollo",
        name: `Apollo · ${testRunnerSubagent.name}`,
        role: testRunnerSubagent.tag,
        title: testRunnerSubagent.name,
        color: "#ec4899",
        accentBg: "rgba(236, 72, 153, 0.15)",
        avatarChar: "🧪",
        station: "Test Station & Rig",
        task: testRunnerSubagent.description,
        status: "testing",
        load: 65,
        stats: testRunnerSubagent.tools.join(" · "),
      },
    ],
    [explorerSubagent, fixerSubagent, testRunnerSubagent],
  );

  const activeAgent =
    dynamicAgents.find((a) => a.id === selectedAgentId) ||
    dynamicAgents[0] ||
    AGENTS[0];

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
        <div className="pixel-office-topbar-left">
          <div className="office-header-badge">
            <HugeiconsIcon icon={AiSparklesIcon} size={15} color="#f59e0b" strokeWidth={2} />
            <span className="pixel-office-title">AI AGENT TEAM · STUDIO</span>
          </div>
          <span className="pixel-office-subtitle">
            <span
              className={cx(
                "pixel-live-dot",
                !isWorking && !isWaitingPermission && "is-idle",
                isWaitingPermission && "is-warning",
              )}
            />
            {isWaitingPermission
              ? `Menunggu Persetujuan (${(pendingPermission?.toolName || "Izin").toUpperCase()})`
              : isWorking
                ? "Workflow Aktif · 4 Sub-agen Terhubung"
                : "Standby · Siap Menerima Instruksi"}
          </span>
        </div>

        <div className="pixel-office-topbar-right">
          {/* Mode Switcher: Working / Idle */}
          <div className="pixel-mode-switch-pill" role="group" aria-label="Office State Mode">
            <button
              type="button"
              className={cx("pixel-switch-btn", isWorking && "is-active is-working-active")}
              onClick={() => setManualMode("working")}
              title="Tampilkan Animasi Sedang Bekerja"
            >
              <HugeiconsIcon icon={FlashIcon} size={13} strokeWidth={2} />
              <span>Working</span>
            </button>
            <button
              type="button"
              className={cx("pixel-switch-btn", !isWorking && "is-active is-idle-active")}
              onClick={() => setManualMode("idle")}
              title="Tampilkan Animasi Idle / Standby"
            >
              <HugeiconsIcon icon={Coffee01Icon} size={13} strokeWidth={2} />
              <span>Idle</span>
            </button>
          </div>

          <button
            type="button"
            className={cx("pixel-office-btn", speed === 2 && "is-active")}
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
            title="Kecepatan Animasi (1x / 2x)"
          >
            {speed}x
          </button>

          <button
            type="button"
            className={cx("pixel-office-btn", soundEnabled && "is-active")}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playRetroTone(659.25, "sine", 0.08);
            }}
            title="Efek Suara Audio"
          >
            <HugeiconsIcon
              icon={soundEnabled ? VolumeHighIcon : VolumeMute01Icon}
              size={14}
              strokeWidth={1.8}
            />
            <span>{soundEnabled ? "Audio" : "Mute"}</span>
          </button>

          {onClose && (
            <button
              type="button"
              className="pixel-office-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="Tutup Virtual Office (ESC)"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Clean Modern Stage (AI Agent Team Studio) ── */}
      {/* ── 2. Japanese Anime Chibi Office Studio Stage ── */}
      <div className="pixel-office-stage clean-stage" style={{ background: "#090d16" }}>
        <svg
          viewBox="0 0 860 410"
          className="pixel-office-svg clean-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="860" height="410" rx="18" />
            </clipPath>

            {/* Office Gradients */}
            <linearGradient id="officeWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a2233" />
              <stop offset="100%" stopColor="#121824" />
            </linearGradient>

            <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="parquetFloor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#161e2e" />
              <stop offset="100%" stopColor="#0c121d" />
            </linearGradient>

            <linearGradient id="woodDeskTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c364c" />
              <stop offset="100%" stopColor="#1b2333" />
            </linearGradient>

            <radialGradient id="hubCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={isWorking ? "0.35" : "0.15"} />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <g clipPath={`url(#${clipId})`}>
            {/* ── A. Room Architecture: Cozy Japanese Tech Office ── */}
            {/* Upper Wall */}
            <rect x="0" y="0" width="860" height="125" fill="url(#officeWallGrad)" />

            {/* Panoramic Tokyo Studio Windows */}
            {/* Window 1 (Left Wing) */}
            <g transform="translate(100, 14)">
              <rect x="0" y="0" width="280" height="98" rx="4" fill="url(#twilightSky)" stroke="#334155" strokeWidth="1.5" />
              {/* Skyline Silhouettes */}
              <polygon points="20,98 20,45 45,45 45,98" fill="#090d16" />
              <polygon points="50,98 50,30 85,30 85,98" fill="#0c1322" />
              <polygon points="90,98 90,55 125,55 125,98" fill="#090d16" />
              <polygon points="135,98 150,15 152,15 165,98" fill="#070b14" /> {/* Tokyo Tower silhouette */}
              <polygon points="175,98 175,38 215,38 215,98" fill="#0a101d" />
              <polygon points="220,98 220,50 260,50 260,98" fill="#090d16" />
              {/* Warm Window Lights */}
              <circle cx="35" cy="55" r="1" fill="#fef08a" opacity="0.8" />
              <circle cx="65" cy="40" r="1.2" fill="#fef08a" opacity="0.9" />
              <circle cx="72" cy="55" r="1" fill="#38bdf8" opacity="0.8" />
              <circle cx="195" cy="50" r="1.2" fill="#fef08a" opacity="0.9" />
              <circle cx="240" cy="65" r="1" fill="#fef08a" opacity="0.8" />
              {/* Window Mullions */}
              <line x1="140" y1="0" x2="140" y2="98" stroke="#334155" strokeWidth="1.5" />
              <line x1="0" y1="50" x2="280" y2="50" stroke="#334155" strokeWidth="1" />
            </g>

            {/* Window 2 (Right Wing) */}
            <g transform="translate(480, 14)">
              <rect x="0" y="0" width="280" height="98" rx="4" fill="url(#twilightSky)" stroke="#334155" strokeWidth="1.5" />
              <polygon points="15,98 15,40 55,40 55,98" fill="#0a101d" />
              <polygon points="65,98 65,55 105,55 105,98" fill="#080e19" />
              <polygon points="115,98 115,32 160,32 160,98" fill="#0c1322" />
              <polygon points="170,98 170,48 210,48 210,98" fill="#090d16" />
              <polygon points="215,98 215,35 255,35 255,98" fill="#0a101d" />
              <circle cx="35" cy="50" r="1" fill="#fef08a" opacity="0.8" />
              <circle cx="135" cy="42" r="1.2" fill="#fef08a" opacity="0.9" />
              <circle cx="145" cy="60" r="1" fill="#38bdf8" opacity="0.8" />
              <circle cx="235" cy="45" r="1.2" fill="#fef08a" opacity="0.9" />
              <line x1="140" y1="0" x2="140" y2="98" stroke="#334155" strokeWidth="1.5" />
              <line x1="0" y1="50" x2="280" y2="50" stroke="#334155" strokeWidth="1" />
            </g>

            {/* Cozy Wall Scrum Whiteboard (Left) */}
            <g transform="translate(20, 22)">
              <rect x="0" y="0" width="65" height="75" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
              <text x="32" y="12" textAnchor="middle" fill="#334155" fontSize="7" fontWeight="700" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif">SPRINT</text>
              {/* Cute Sticky Notes */}
              <rect x="6" y="18" width="14" height="12" rx="2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
              <rect x="25" y="18" width="14" height="12" rx="2" fill="#67e8f9" stroke="#0891b2" strokeWidth="0.5" />
              <rect x="44" y="18" width="14" height="12" rx="2" fill="#f472b6" stroke="#db2777" strokeWidth="0.5" />
              <rect x="6" y="34" width="14" height="12" rx="2" fill="#4ade80" stroke="#16a34a" strokeWidth="0.5" />
              <rect x="25" y="34" width="14" height="12" rx="2" fill="#fde047" stroke="#ca8a04" strokeWidth="0.5" />
              <rect x="44" y="34" width="14" height="12" rx="2" fill="#c084fc" stroke="#9333ea" strokeWidth="0.5" />
              {/* Done checkmark */}
              <text x="51" y="43" fill="#15803d" fontSize="7" fontWeight="bold">✓</text>
            </g>

            {/* Wall Clock (Center) */}
            <g transform="translate(430, 36)">
              <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="12" fill="#0f172a" />
              {/* Clock marks */}
              <line x1="0" y1="-10" x2="0" y2="-8" stroke="#94a3b8" strokeWidth="1" />
              <line x1="10" y1="0" x2="8" y2="0" stroke="#94a3b8" strokeWidth="1" />
              <line x1="0" y1="10" x2="0" y2="8" stroke="#94a3b8" strokeWidth="1" />
              <line x1="-10" y1="0" x2="-8" y2="0" stroke="#94a3b8" strokeWidth="1" />
              {/* Hands */}
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

            {/* Coffee Shelf & Lucky Cat (Right) */}
            <g transform="translate(775, 18)">
              <rect x="0" y="0" width="65" height="80" rx="3" fill="#182234" stroke="#334155" strokeWidth="1.5" />
              {/* Shelf Planks */}
              <line x1="0" y1="26" x2="65" y2="26" stroke="#475569" strokeWidth="1.5" />
              <line x1="0" y1="52" x2="65" y2="52" stroke="#475569" strokeWidth="1.5" />
              {/* Books on Top Shelf */}
              <rect x="8" y="8" width="5" height="18" fill="#38bdf8" rx="0.5" />
              <rect x="14" y="10" width="6" height="16" fill="#f59e0b" rx="0.5" />
              <rect x="21" y="6" width="5" height="20" fill="#10b981" rx="0.5" />
              <rect x="27" y="11" width="7" height="15" fill="#ec4899" rx="0.5" />
              {/* Lucky Cat (Maneki Neko) */}
              <circle cx="50" cy="18" r="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.5" />
              <polygon points="45,13 47,8 50,13" fill="#f8fafc" />
              <polygon points="50,13 53,8 55,13" fill="#f8fafc" />
              <circle cx="48" cy="17" r="0.7" fill="#0f172a" />
              <circle cx="52" cy="17" r="0.7" fill="#0f172a" />
              <circle cx="50" cy="19" r="0.5" fill="#f43f5e" />
              {/* Waving Paw */}
              <path
                d={cycleTick % 20 < 10 ? "M 55 18 Q 58 13 55 11" : "M 55 18 Q 59 16 57 14"}
                stroke="#f8fafc"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Coffee Maker on Middle Shelf */}
              <rect x="14" y="32" width="16" height="19" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              <circle cx="22" cy="40" r="4" fill="#38bdf8" opacity="0.7" />
              <rect x="36" y="38" width="8" height="12" rx="1" fill="#e2e8f0" />
              {/* Steam from coffee */}
              <path
                d={`M 40 ${34 - (cycleTick % 8) * 0.8} Q 42 ${31 - (cycleTick % 8) * 0.8} 40 ${28 - (cycleTick % 8) * 0.8}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.8"
                opacity={0.6}
              />
            </g>

            {/* Dado Rail / Baseboard Trim */}
            <rect x="0" y="122" width="860" height="6" fill="#293548" />

            {/* ── B. Office Parquet Floor ── */}
            <rect x="0" y="128" width="860" height="282" fill="url(#parquetFloor)" />
            {/* Parquet Wooden Plank Seams */}
            <g stroke="#1b2538" strokeWidth="0.8" opacity="0.6">
              {[165, 205, 245, 285, 325, 365].map((y) => (
                <line key={`floor-h-${y}`} x1="0" y1={y} x2="860" y2={y} />
              ))}
              {[80, 200, 320, 440, 560, 680, 800].map((x, i) => (
                <line key={`floor-v1-${x}`} x1={x} y1="128" x2={x} y2="205" strokeDasharray="2 12" />
              ))}
              {[140, 260, 380, 500, 620, 740].map((x, i) => (
                <line key={`floor-v2-${x}`} x1={x} y1="205" x2={x} y2="285" strokeDasharray="2 12" />
              ))}
              {[80, 200, 320, 440, 560, 680, 800].map((x, i) => (
                <line key={`floor-v3-${x}`} x1={x} y1="285" x2={x} y2="410" strokeDasharray="2 12" />
              ))}
            </g>

            {/* Potted Office Plants */}
            {/* Plant Left (Lush Monstera) */}
            <g transform="translate(30, 160)">
              <polygon points="12,45 28,45 25,25 15,25" fill="#78350f" stroke="#92400e" strokeWidth="1" />
              <circle cx="20" cy="22" r="6" fill="#15803d" />
              <path d="M 20 25 Q 10 12 6 18 Q 12 18 20 22" fill="#16a34a" />
              <path d="M 20 24 Q 28 8 36 14 Q 28 16 20 22" fill="#22c55e" />
              <path d="M 20 22 Q 22 2 16 4 Q 18 12 20 22" fill="#4ade80" />
            </g>

            {/* Plant Right (Japanese Bonsai) */}
            <g transform="translate(820, 160)">
              <rect x="5" y="40" width="20" height="6" rx="1" fill="#475569" />
              <ellipse cx="15" cy="38" rx="12" ry="4" fill="#334155" />
              {/* Bonsai Trunk */}
              <path d="M 15 36 Q 18 28 12 22 Q 16 16 14 12" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Foliage Cloud */}
              <circle cx="10" cy="18" r="7" fill="#15803d" />
              <circle cx="16" cy="12" r="8" fill="#16a34a" />
              <circle cx="22" cy="17" r="6" fill="#22c55e" />
            </g>

            {/* ── C. Central Collaboration Zone (AI AGENT TEAM) ── */}
            <g transform="translate(430, 235)">
              {/* Meeting Area Circular Braided Rug */}
              <circle cx="0" cy="0" r="78" fill="#161f30" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.8" />
              <circle cx="0" cy="0" r="72" fill="#111827" />

              {/* Ambient Radial Core Glow */}
              <circle cx="0" cy="0" r="65" fill="url(#hubCenterGlow)" />

              {/* Central Collaboration Table */}
              <circle cx="0" cy="0" r="50" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="46" fill="#0f172a" />

              {/* Holographic Sync Ring */}
              <circle
                cx="0"
                cy="0"
                r={isWorking ? 38 + (animationTick % 8) * 0.4 : 38}
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={isWorking ? 0.9 : 0.4}
              />

              {/* Core AI AGENT TEAM Indicator */}
              <circle cx="0" cy="0" r="28" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="0" y="-5" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="700" letterSpacing="0.5">
                AI
              </text>
              <text x="0" y="6" textAnchor="middle" fill="#f8fafc" fontSize="7" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="700">
                AGENT TEAM
              </text>
              <text x="0" y="16" textAnchor="middle" fill={isWorking ? "#4ade80" : "#94a3b8"} fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                {isWorking ? "● RUNNING" : "● STANDBY"}
              </text>

              {/* Table accessories */}
              <rect x="-35" y="-12" width="10" height="7" rx="1" fill="#334155" />
              <circle cx="30" cy="14" r="3" fill="#f59e0b" />
            </g>

            {/* Dotted Communication Network Lines */}
            <g opacity={isWorking ? 0.55 : 0.2}>
              <line x1="430" y1="235" x2="200" y2="155" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="430" y1="235" x2="670" y2="155" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="430" y1="235" x2="200" y2="315" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="430" y1="235" x2="670" y2="315" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* ── D. 4 Dedicated Japanese Chibi Workstations ── */}

            {/* ═══════════ POD 1: ZEUS (Lead Orchestrator - Top Left) ═══════════ */}
            <g
              transform="translate(200, 155)"
              onClick={() => setSelectedAgentId("zeus")}
              style={{ cursor: "pointer" }}
            >
              {/* Workstation Floor Mat */}
              <rect x="-88" y="-46" width="176" height="94" rx="16" fill="#131b29" stroke={selectedAgentId === "zeus" ? "#f59e0b" : "#283548"} strokeWidth={selectedAgentId === "zeus" ? 2 : 1} />

              {/* Office Chair */}
              <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
              <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

              {/* ── Chibi Zeus Character ── */}
              <g transform="translate(25, -16)">
                {/* Chibi Torso: Stylish Dark Blazer & Gold Tie */}
                <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                {/* White Shirt V-neck & Gold Tie */}
                <polygon points="-4,-6 4,-6 0,0" fill="#f8fafc" />
                <polygon points="-1.5,-2 1.5,-2 1,7 0,8 -1,7" fill="#f59e0b" />
                {/* Lightning Lapel Pin */}
                <polygon points="-6,-2 -4,-2 -5,1 -3,1 -6,6 -5,2 -7,2" fill="#fbbf24" />

                {/* Head (Warm Anime Skin) */}
                <circle cx="0" cy="-18" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
                {/* Anime Rosy Cheeks */}
                <ellipse cx="-8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
                <ellipse cx="8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

                {/* Anime Eyes */}
                {cycleTick % 30 < 3 ? (
                  // Blinking happy eyes (⌒ ⌒)
                  <>
                    <path d="M -9 -18 Q -6 -21 -3 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 3 -18 Q 6 -21 9 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ) : (
                  // Big sparkling anime eyes with amber pupils
                  <>
                    <ellipse cx="-6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <ellipse cx="6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <circle cx="-6" cy="-17.5" r="2.2" fill="#d97706" />
                    <circle cx="6" cy="-17.5" r="2.2" fill="#d97706" />
                    <circle cx="-7" cy="-19.5" r="1.3" fill="#ffffff" />
                    <circle cx="5" cy="-19.5" r="1.3" fill="#ffffff" />
                    <circle cx="-5" cy="-16.5" r="0.7" fill="#ffffff" />
                    <circle cx="7" cy="-16.5" r="0.7" fill="#ffffff" />
                  </>
                )}
                {/* Confident anime smile */}
                <path d="M -2.5 -12 Q 0 -10.5 2.5 -12" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

                {/* Spiky Anime Golden-Blonde Hair */}
                <path
                  d="M -15 -20 Q -8 -32 0 -33 Q 8 -32 15 -20 Q 12 -12 14 -6 Q 9 -12 7 -18 Q 2 -14 0 -18 Q -3 -14 -7 -18 Q -9 -12 -14 -6 Q -12 -12 -15 -20 Z"
                  fill="#f59e0b"
                />
                {/* Hair Highlight */}
                <path d="M -8 -26 Q 0 -30 8 -26" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
                {/* Animated Ahoge / Cowlick */}
                <path
                  d="M 0 -32 Q 6 -42 12 -40 Q 6 -36 1 -30"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  transform={`rotate(${Math.sin(cycleTick * 0.2) * 6} 0 -32)`}
                />

                {/* Animated Hands */}
                {isWorking ? (
                  // Typing motion
                  <>
                    <circle cx="-7" cy={5 + (cycleTick % 4 < 2 ? 0 : 2)} r="2.8" fill="#fed7aa" />
                    <circle cx="7" cy={5 + (cycleTick % 4 < 2 ? 2 : 0)} r="2.8" fill="#fed7aa" />
                  </>
                ) : (
                  // Holding Coffee Mug
                  <>
                    <circle cx="-6" cy="4" r="2.5" fill="#fed7aa" />
                    <rect x="3" y="1" width="6" height="7" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
                    <path
                      d={`M 6 ${-2 - (cycleTick % 6) * 0.8} Q 8 ${-5 - (cycleTick % 6) * 0.8} 6 ${-8 - (cycleTick % 6) * 0.8}`}
                      fill="none"
                      stroke="#fde68a"
                      strokeWidth="0.8"
                      opacity="0.7"
                    />
                  </>
                )}
              </g>

              {/* Wooden L-Shaped Executive Desk */}
              <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

              {/* Dual Monitors on Desk */}
              {/* Monitor 1 (Main Orchestrator Graph) */}
              <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
              <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#0b0f19" />
              {/* Live Multi-Agent Orchestration Nodes */}
              <circle cx="-50" cy="-24" r="3" fill="#f59e0b" />
              <line x1="-47" y1="-24" x2="-35" y2="-28" stroke="#38bdf8" strokeWidth="1" />
              <line x1="-47" y1="-24" x2="-35" y2="-20" stroke="#10b981" strokeWidth="1" />
              <circle cx="-35" cy="-28" r="2.5" fill="#38bdf8" />
              <circle cx="-35" cy="-20" r="2.5" fill="#10b981" />
              <circle cx="-25" cy="-20" r="2" fill="#ec4899" />
              {/* Monitor Stand */}
              <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

              {/* Monitor 2 (Side Telemetry) */}
              <rect x="-6" y="-32" width="24" height="26" rx="3" fill="#020617" stroke="#475569" strokeWidth="1" />
              <line x1="-3" y1="-26" x2="14" y2="-26" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="-3" y1="-20" x2="10" y2="-20" stroke="#94a3b8" strokeWidth="1" />
              <line x1="-3" y1="-14" x2="12" y2="-14" stroke="#94a3b8" strokeWidth="1" />

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

              {/* Speech Bubble */}
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

            {/* ═══════════ POD 2: ATHENA (Explorer / Coordinator - Top Right) ═══════════ */}
            <g
              transform="translate(670, 155)"
              onClick={() => setSelectedAgentId("athena")}
              style={{ cursor: "pointer" }}
            >
              <rect x="-88" y="-46" width="176" height="94" rx="16" fill="#131b29" stroke={selectedAgentId === "athena" ? "#38bdf8" : "#283548"} strokeWidth={selectedAgentId === "athena" ? 2 : 1} />

              {/* Office Chair */}
              <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
              <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

              {/* ── Chibi Athena Character (Visible when not walking) ── */}
              {!athenaIsWalking ? (
                <g transform="translate(25, -16)">
                  {/* Outfit: Smart Knit Vest over Shirt */}
                  <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />
                  <polygon points="-4,-6 4,-6 0,-1" fill="#f8fafc" />

                  {/* Head */}
                  <circle cx="0" cy="-18" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
                  <ellipse cx="-8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
                  <ellipse cx="8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

                  {/* Eyes & Glasses */}
                  {cycleTick % 30 < 3 ? (
                    <>
                      <path d="M -9 -18 Q -6 -21 -3 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M 3 -18 Q 6 -21 9 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                    </>
                  ) : (
                    <>
                      <ellipse cx="-6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                      <ellipse cx="6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                      <circle cx="-6" cy="-17.5" r="2.2" fill="#0284c7" />
                      <circle cx="6" cy="-17.5" r="2.2" fill="#0284c7" />
                      <circle cx="-7" cy="-19.5" r="1.3" fill="#ffffff" />
                      <circle cx="5" cy="-19.5" r="1.3" fill="#ffffff" />
                    </>
                  )}
                  {/* Round Anime Glasses */}
                  <circle cx="-6" cy="-18" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <circle cx="6" cy="-18" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="-1" y1="-18" x2="1" y2="-18" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Smile */}
                  <path d="M -2 -12 Q 0 -10.5 2 -12" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Navy Anime Bob Hair with Side Ponytail */}
                  <path
                    d="M -15 -18 Q -10 -32 0 -33 Q 10 -32 15 -18 Q 12 -12 14 -5 Q 8 -12 6 -17 Q 0 -14 -6 -17 Q -10 -12 -14 -5 Q -12 -12 -15 -18 Z"
                    fill="#0369a1"
                  />
                  {/* Side Ponytail on Right */}
                  <path d="M 12 -24 Q 24 -30 25 -16 Q 22 -10 14 -18" fill="#0284c7" />
                  <circle cx="13" cy="-22" r="2.5" fill="#38bdf8" />

                  {/* Hands typing */}
                  <circle cx="-7" cy={5 + (cycleTick % 4 < 2 ? 0 : 2)} r="2.8" fill="#fed7aa" />
                  <circle cx="7" cy={5 + (cycleTick % 4 < 2 ? 2 : 0)} r="2.8" fill="#fed7aa" />
                </g>
              ) : (
                // Athena is currently walking across the floor: show "Walking" desk indicator
                <g transform="translate(10, -18)">
                  <rect x="-2" y="-6" width="34" height="16" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                  <text x="15" y="5" textAnchor="middle" fill="#e0f2fe" fontSize="7" fontWeight="bold" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif">
                    🚶 REPORT
                  </text>
                </g>
              )}

              {/* Wooden Research Desk */}
              <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

              {/* Athena Monitor (Code Explorer Tree) */}
              <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
              <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#0b0f19" />
              {/* Directory Tree Graph */}
              <line x1="-58" y1="-28" x2="-45" y2="-28" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="-54" y1="-22" x2="-38" y2="-22" stroke="#38bdf8" strokeWidth="1" />
              <line x1="-54" y1="-16" x2="-42" y2="-16" stroke="#4ade80" strokeWidth="1" />
              <line x1="-50" y1="-10" x2="-30" y2="-10" stroke="#f59e0b" strokeWidth="1" />
              <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

              {/* Reference Documentation & Mini Succulent */}
              <rect x="-5" y="-18" width="12" height="14" rx="2" fill="#0284c7" />
              <polygon points="12,-4 20,-4 18,-14 14,-14" fill="#15803d" />
              <circle cx="16" cy="-16" r="3" fill="#4ade80" />

              {/* Keyboard & Mousepad */}
              <rect x="-50" y="2" width="34" height="10" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
              <rect x="-12" y="2" width="10" height="10" rx="2" fill="#1e293b" />

              {/* Nameplate */}
              <rect x="-76" y="12" width="152" height="20" rx="10" fill="#141a26" stroke="#2a354c" strokeWidth="0.8" />
              <text x="-66" y="25" fill="#f8fafc" fontSize="8" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                {athenaIsWalking ? "Athena (Walking)" : "Athena · Explorer"}
              </text>
              <rect x="22" y="15" width="50" height="14" rx="7" fill="rgba(56, 189, 248, 0.16)" />
              <text x="47" y="25" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Explorer
              </text>

              <circle cx="68" cy="-34" r="3.5" fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#38bdf8" : "#64748b"} />

              {/* Speech Bubble when seated */}
              {!athenaIsWalking && athenaBubble && (
                <g transform="translate(-40, -82)">
                  <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                  <rect x="0" y="0" width="185" height="28" rx="12" fill="#111827" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="92" y="18" textAnchor="middle" fill="#e0f2fe" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                    {athenaBubble}
                  </text>
                </g>
              )}
            </g>

            {/* ═══════════ POD 3: HERMES (Fixer / Builder - Bottom Left) ═══════════ */}
            <g
              transform="translate(200, 315)"
              onClick={() => setSelectedAgentId("hermes")}
              style={{ cursor: "pointer" }}
            >
              <rect x="-88" y="-46" width="176" height="94" rx="16" fill="#131b29" stroke={selectedAgentId === "hermes" ? "#10b981" : "#283548"} strokeWidth={selectedAgentId === "hermes" ? 2 : 1} />

              {/* Office Chair */}
              <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
              <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

              {/* ── Chibi Hermes Character ── */}
              <g transform="translate(25, -16)">
                {/* Outfit: Dark Tech Hoodie with Green Accents */}
                <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                <line x1="-2" y1="-6" x2="-2" y2="4" stroke="#10b981" strokeWidth="1" />
                <line x1="2" y1="-6" x2="2" y2="4" stroke="#10b981" strokeWidth="1" />

                {/* Head */}
                <circle cx="0" cy="-18" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
                <ellipse cx="-8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
                <ellipse cx="8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

                {/* Eyes */}
                {cycleTick % 30 < 3 ? (
                  <>
                    <path d="M -9 -18 Q -6 -21 -3 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 3 -18 Q 6 -21 9 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="-6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <ellipse cx="6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <circle cx="-6" cy="-17.5" r="2.2" fill="#059669" />
                    <circle cx="6" cy="-17.5" r="2.2" fill="#059669" />
                    <circle cx="-7" cy="-19.5" r="1.3" fill="#ffffff" />
                    <circle cx="5" cy="-19.5" r="1.3" fill="#ffffff" />
                  </>
                )}
                <path d="M -2 -11 Q 0 -9.5 2 -11" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

                {/* Spiky Emerald-Green Anime Hair with Orange Headband */}
                <path
                  d="M -16 -20 L -20 -28 L -14 -26 L -11 -35 L -4 -28 L 2 -38 L 7 -28 L 14 -33 L 15 -25 L 21 -27 L 17 -19 Z"
                  fill="#10b981"
                />
                {/* Tech Headband */}
                <rect x="-14" y="-23" width="28" height="4.5" rx="1.5" fill="#ea580c" />
                <rect x="-3" y="-22.5" width="6" height="3" rx="0.5" fill="#fed7aa" />

                {/* Rapid Typing Hands with Green Sparkles */}
                <circle cx="-7" cy={5 + (cycleTick % 4 < 2 ? 0 : 2)} r="2.8" fill="#fed7aa" />
                <circle cx="7" cy={5 + (cycleTick % 4 < 2 ? 2 : 0)} r="2.8" fill="#fed7aa" />
                {isWorking && (
                  <circle cx={cycleTick % 8 < 4 ? -8 : 8} cy={3} r="1" fill="#4ade80" opacity="0.8" />
                )}
              </g>

              {/* Wooden Dev Desk */}
              <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

              {/* Multi-Monitor Setup (Matrix / Code) */}
              <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
              <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#052e16" />
              {/* Matrix Code Lines */}
              <line x1="-58" y1="-28" x2="-22" y2="-28" stroke="#4ade80" strokeWidth="1.5" />
              <line x1="-58" y1="-22" x2="-32" y2="-22" stroke="#4ade80" strokeWidth="1.5" />
              <line x1="-58" y1="-16" x2="-18" y2="-16" stroke="#22c55e" strokeWidth="1.5" />
              <line x1="-58" y1="-10" x2="-26" y2="-10" stroke="#86efac" strokeWidth="1.5" />
              <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

              {/* Energy Drink Can */}
              <rect x="2" y="-16" width="6" height="12" rx="2" fill="#10b981" stroke="#059669" strokeWidth="0.8" />

              {/* Mechanical Keyboard with RGB Green Glow */}
              <rect x="-50" y="2" width="34" height="10" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="0.8" />
              <rect x="-12" y="2" width="10" height="10" rx="2" fill="#1e293b" />

              {/* Nameplate */}
              <rect x="-76" y="12" width="152" height="20" rx="10" fill="#141a26" stroke="#2a354c" strokeWidth="0.8" />
              <text x="-66" y="25" fill="#f8fafc" fontSize="8" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Hermes · Fixer
              </text>
              <rect x="24" y="15" width="48" height="14" rx="7" fill="rgba(16, 185, 129, 0.16)" />
              <text x="48" y="25" textAnchor="middle" fill="#10b981" fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Fixer
              </text>

              <circle cx="68" cy="-34" r="3.5" fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#10b981" : "#64748b"} />

              {hermesBubble && (
                <g transform="translate(-40, -82)">
                  <path d="M 20 28 L 28 35 L 34 28 Z" fill="#111827" />
                  <rect x="0" y="0" width="175" height="28" rx="12" fill="#111827" stroke="#10b981" strokeWidth="1.2" />
                  <text x="87" y="18" textAnchor="middle" fill="#dcfce7" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                    {hermesBubble}
                  </text>
                </g>
              )}
            </g>

            {/* ═══════════ POD 4: APOLLO (QA Runner / Test - Bottom Right) ═══════════ */}
            <g
              transform="translate(670, 315)"
              onClick={() => setSelectedAgentId("apollo")}
              style={{ cursor: "pointer" }}
            >
              <rect x="-88" y="-46" width="176" height="94" rx="16" fill="#131b29" stroke={selectedAgentId === "apollo" ? "#ec4899" : "#283548"} strokeWidth={selectedAgentId === "apollo" ? 2 : 1} />

              {/* Office Chair */}
              <ellipse cx="25" cy="-28" rx="14" ry="5" fill="#1e293b" />
              <path d="M 13 -28 Q 25 -42 37 -28" fill="#0f172a" stroke="#475569" strokeWidth="1" />

              {/* ── Chibi Apollo Character ── */}
              <g transform={`translate(25, ${isWorking && cycleTick % 20 < 10 ? -18 : -16})`}>
                {/* Outfit: Lab Coat over Casual Tee */}
                <rect x="-10" y="-6" width="20" height="15" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="-4" y="-6" width="8" height="15" fill="#f43f5e" />
                {/* ID Badge */}
                <rect x="2" y="-1" width="5" height="6" rx="0.5" fill="#38bdf8" />

                {/* Head */}
                <circle cx="0" cy="-18" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
                <ellipse cx="-8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
                <ellipse cx="8" cy="-14" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

                {/* Eyes */}
                {cycleTick % 30 < 3 ? (
                  <>
                    <path d="M -9 -18 Q -6 -21 -3 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M 3 -18 Q 6 -21 9 -18" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <ellipse cx="-6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <ellipse cx="6" cy="-18" rx="3.5" ry="4.5" fill="#1e293b" />
                    <circle cx="-6" cy="-17.5" r="2.2" fill="#db2777" />
                    <circle cx="6" cy="-17.5" r="2.2" fill="#db2777" />
                    <circle cx="-7" cy="-19.5" r="1.3" fill="#ffffff" />
                    <circle cx="5" cy="-19.5" r="1.3" fill="#ffffff" />
                  </>
                )}
                <path d="M -2.5 -11 Q 0 -9.5 2.5 -11" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

                {/* Magenta/Pink Anime Hair */}
                <path
                  d="M -15 -18 Q -10 -32 0 -33 Q 10 -32 15 -18 Q 13 -12 15 -5 Q 9 -12 7 -17 Q 0 -13 -6 -17 Q -10 -12 -14 -5 Q -12 -12 -15 -18 Z"
                  fill="#ec4899"
                />
                <circle cx="12" cy="-24" r="2" fill="#38bdf8" />

                {/* Fist Pump / Hands */}
                <circle cx="-7" cy={5} r="2.8" fill="#fed7aa" />
                <circle cx="8" cy={isWorking && cycleTick % 20 < 10 ? -2 : 5} r="2.8" fill="#fed7aa" />
              </g>

              {/* Wooden QA Desk */}
              <rect x="-80" y="-8" width="160" height="38" rx="8" fill="url(#woodDeskTop)" stroke="#475569" strokeWidth="1" />

              {/* Test Runner Vertical Display */}
              <rect x="-65" y="-36" width="55" height="32" rx="4" fill="#020617" stroke="#64748b" strokeWidth="1" />
              <rect x="-62" y="-33" width="49" height="26" rx="2" fill="#0b0f19" />
              {/* Test Status Bars (Green Passes) */}
              <rect x="-58" y="-28" width="35" height="4" rx="1" fill="#10b981" />
              <rect x="-58" y="-21" width="42" height="4" rx="1" fill="#10b981" />
              <rect x="-58" y="-14" width="28" height="4" rx="1" fill="#ec4899" />
              <text x="-20" y="-24" fill="#4ade80" fontSize="7" fontWeight="bold">✓</text>
              <text x="-13" y="-17" fill="#4ade80" fontSize="7" fontWeight="bold">✓</text>
              <rect x="-40" y="-4" width="6" height="4" fill="#64748b" />

              {/* Test Tube Rack & Beaker */}
              <rect x="5" y="-12" width="15" height="4" fill="#64748b" rx="2" />
              <line x1="8" y1="-18" x2="8" y2="-8" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="-18" x2="15" y2="-8" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />

              {/* Keyboard */}
              <rect x="-50" y="2" width="34" height="10" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
              <rect x="-12" y="2" width="10" height="10" rx="2" fill="#1e293b" />

              {/* Nameplate */}
              <rect x="-76" y="12" width="152" height="20" rx="10" fill="#141a26" stroke="#2a354c" strokeWidth="0.8" />
              <text x="-66" y="25" fill="#f8fafc" fontSize="8" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Apollo · Tests
              </text>
              <rect x="24" y="15" width="48" height="14" rx="7" fill="rgba(236, 72, 153, 0.16)" />
              <text x="48" y="25" textAnchor="middle" fill="#ec4899" fontSize="6.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="600">
                Runner
              </text>

              <circle cx="68" cy="-34" r="3.5" fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#ec4899" : "#64748b"} />
            </g>

            {/* ═══════════ ATHENA WALKING SPRITE ACROSS FLOOR ═══════════ */}
            {athenaIsWalking && (() => {
              const tWalk = (cycleTick - 30) / 44; // 0 to 1
              const walkPhase = Math.sin(tWalk * Math.PI); // 0 -> 1 -> 0
              const walkX = 670 - walkPhase * 280; // Walks from 670 toward 390
              const walkY = 175 + walkPhase * 55;  // Walks down toward meeting table
              const stepBob = cycleTick % 6 < 3 ? -2 : 2;

              return (
                <g transform={`translate(${walkX}, ${walkY + stepBob})`}>
                  {/* Walking Shadow on Parquet */}
                  <ellipse cx="0" cy="18" rx="14" ry="4" fill="#090d16" opacity="0.6" />

                  {/* Cute Chibi Stepping Legs */}
                  <line x1="-5" y1="12" x2={cycleTick % 6 < 3 ? -8 : -2} y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                  <line x1="5" y1="12" x2={cycleTick % 6 < 3 ? 2 : 8} y2="18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

                  {/* Body & Blue Vest */}
                  <rect x="-10" y="-4" width="20" height="16" rx="3" fill="#0369a1" stroke="#0284c7" strokeWidth="1" />
                  <polygon points="-4,-4 4,-4 0,1" fill="#f8fafc" />

                  {/* Head */}
                  <circle cx="0" cy="-16" r="14" fill="#fed7aa" stroke="#fbcfe8" strokeWidth="0.5" />
                  <ellipse cx="-8" cy="-12" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />
                  <ellipse cx="8" cy="-12" rx="3.5" ry="1.8" fill="#fb7185" opacity="0.6" />

                  {/* Sparkling Eyes & Glasses */}
                  <ellipse cx="-6" cy="-16" rx="3.5" ry="4.5" fill="#1e293b" />
                  <ellipse cx="6" cy="-16" rx="3.5" ry="4.5" fill="#1e293b" />
                  <circle cx="-6" cy="-15.5" r="2" fill="#0284c7" />
                  <circle cx="6" cy="-15.5" r="2" fill="#0284c7" />
                  <circle cx="-7" cy="-17.5" r="1.3" fill="#ffffff" />
                  <circle cx="5" cy="-17.5" r="1.3" fill="#ffffff" />
                  <circle cx="-6" cy="-16" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <circle cx="6" cy="-16" r="5" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="-1" y1="-16" x2="1" y2="-16" stroke="#e2e8f0" strokeWidth="1" />
                  <path d="M -2 -10 Q 0 -8.5 2 -10" fill="none" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Hair & Swaying Ponytail */}
                  <path
                    d="M -15 -16 Q -10 -30 0 -31 Q 10 -30 15 -16 Q 12 -10 14 -3 Q 8 -10 6 -15 Q 0 -12 -6 -15 Q -10 -10 -14 -3 Q -12 -10 -15 -16 Z"
                    fill="#0369a1"
                  />
                  <path
                    d={`M 12 -22 Q ${22 + stepBob * 2} -28 24 -14 Q 21 -8 13 -16`}
                    fill="#0284c7"
                  />
                  <circle cx="13" cy="-20" r="2.5" fill="#38bdf8" />

                  {/* Holding Digital Clipboard */}
                  <rect x="-8" y="2" width="16" height="12" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="-5" y1="5" x2="5" y2="5" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="-5" y1="8" x2="2" y2="8" stroke="#4ade80" strokeWidth="1" />
                  {/* Little Chibi Hands holding tablet */}
                  <circle cx="-9" cy="8" r="2.5" fill="#fed7aa" />
                  <circle cx="9" cy="8" r="2.5" fill="#fed7aa" />

                  {/* Speech Bubble floating directly above walking Athena */}
                  {athenaBubble && (
                    <g transform="translate(-85, -68)">
                      <path d="M 85 28 L 92 34 L 97 28 Z" fill="#111827" />
                      <rect x="0" y="0" width="180" height="28" rx="12" fill="#111827" stroke="#38bdf8" strokeWidth="1.2" />
                      <text x="90" y="18" textAnchor="middle" fill="#e0f2fe" fontSize="8.5" fontFamily="'Google Sans', 'Google Sans Text', var(--font-sans), sans-serif" fontWeight="500">
                        {athenaBubble}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        </svg>
      </div>

      {/* ── 3. Bottom Panel: Agent Focus & Action Log ── */}
      <div className="pixel-office-bottom-panel clean-bottom-panel">
        {/* Selected Agent Dossier Card */}
        <div className="pixel-agent-card clean-card">
          <div className="pixel-card-header">
            <span
              className="pixel-card-avatar"
              style={{ backgroundColor: activeAgent.accentBg, border: `1px solid ${activeAgent.color}` }}
            >
              {activeAgent.id === "zeus" && (
                <HugeiconsIcon icon={FlashIcon} size={20} color={activeAgent.color} strokeWidth={2} />
              )}
              {activeAgent.id === "athena" && (
                <HugeiconsIcon icon={Search01Icon} size={20} color={activeAgent.color} strokeWidth={2} />
              )}
              {activeAgent.id === "hermes" && (
                <HugeiconsIcon icon={Wrench01Icon} size={20} color={activeAgent.color} strokeWidth={2} />
              )}
              {activeAgent.id === "apollo" && (
                <HugeiconsIcon icon={CheckCheckIcon} size={20} color={activeAgent.color} strokeWidth={2} />
              )}
            </span>
            <div className="pixel-card-identity">
              <div className="pixel-card-name-row">
                <span className="pixel-card-name">{activeAgent.name}</span>
                <span
                  className="pixel-card-badge"
                  style={{ color: activeAgent.color, borderColor: activeAgent.color }}
                >
                  {activeAgent.role}
                </span>
              </div>
              <span className="pixel-card-role">{activeAgent.title} · {activeAgent.station}</span>
            </div>
          </div>

          <div className="pixel-card-metrics">
            <div className="pixel-metric-item">
              <span className="metric-label">STATUS</span>
              <span className={cx("metric-value", isWorking ? "status-active" : "status-idle")}>
                ● {isWorking ? activeAgent.status.toUpperCase() : "STANDBY"}
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
