import { useState, useEffect, useId, type CSSProperties, memo } from "react";
import { cx } from "../../../components/ui";
import { portalToBody } from "../../../lib/portal-visibility";

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
    title: "Chief System Architect",
    color: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.15)",
    avatarChar: "⚡",
    station: "Command Center",
    task: "Orchestrating multi-agent workflow & query decomposition",
    status: "planning",
    load: 85,
    stats: "4 Sub-agents synced",
  },
  {
    id: "athena",
    name: "Athena (Coordinator)",
    role: "Research & Specs",
    title: "Specs & Inquiries Specialist",
    color: "#38bdf8",
    accentBg: "rgba(56, 189, 248, 0.15)",
    avatarChar: "🔍",
    station: "Research Deck",
    task: "Querying codebase specs & coordinating interfaces",
    status: "walking",
    load: 78,
    stats: "Contract schema verified",
  },
  {
    id: "hermes",
    name: "Hermes (Builder)",
    role: "Code & Build Specialist",
    title: "Frontend & Logic Engineer",
    color: "#10b981",
    accentBg: "rgba(16, 185, 129, 0.15)",
    avatarChar: "💻",
    station: "Dev Station Alpha",
    task: "Building TypeScript components & UI layout",
    status: "typing",
    load: 92,
    stats: "Zero lint errors",
  },
  {
    id: "apollo",
    name: "Apollo (QA)",
    role: "Test & Verification",
    title: "Quality & Security Runner",
    color: "#ec4899",
    accentBg: "rgba(236, 72, 153, 0.15)",
    avatarChar: "🧪",
    station: "Test Station & Rig",
    task: "Running regression suites & test validations",
    status: "testing",
    load: 65,
    stats: "117/117 tests passing",
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

  const activeAgent = AGENTS.find((a) => a.id === selectedAgentId) || AGENTS[0];

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
            <span className="office-header-icon">⚡</span>
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
              ? `PAUSED · MENUNGGU APPROVAL USER (${(pendingPermission?.toolName || "IZIN").toUpperCase()})`
              : isWorking
                ? "ACTIVE WORKFLOW · 4 AGENTS IN SYNC"
                : "STANDBY · READY FOR INSTRUCTIONS"}
          </span>
        </div>

        <div className="pixel-office-topbar-right">
          {/* Mode Switcher: Working / Idle */}
          <div className="pixel-mode-switch-pill" role="group" aria-label="Office State Mode">
            <button
              type="button"
              className={cx("pixel-switch-btn", isWorking && "is-active")}
              onClick={() => setManualMode("working")}
              title="Tampilkan Animasi Sedang Bekerja"
            >
              ⚡ Working
            </button>
            <button
              type="button"
              className={cx("pixel-switch-btn", !isWorking && "is-active")}
              onClick={() => setManualMode("idle")}
              title="Tampilkan Animasi Idle / Standby"
            >
              ☕ Idle
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
            {soundEnabled ? "🔊 ON" : "🔇 OFF"}
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
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Clean Modern Stage (AI Agent Team Studio) ── */}
      <div className="pixel-office-stage clean-stage">
        <svg
          viewBox="0 0 860 400"
          className="pixel-office-svg clean-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="860" height="400" rx="10" />
            </clipPath>

            {/* Hub Glow Effects */}
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
            {/* Background Floor: Deep Modern Slate */}
            <rect x="0" y="0" width="860" height="400" fill="#0b0f19" />

            {/* Subtle Studio Floor Grid */}
            <g stroke="#1e293b" strokeWidth="0.8" opacity="0.45">
              {[80, 160, 240, 320].map((y) => (
                <line key={`grid-h-${y}`} x1="0" y1={y} x2="860" y2={y} />
              ))}
              {[140, 280, 420, 560, 700].map((x) => (
                <line key={`grid-v-${x}`} x1={x} y1="0" x2={x} y2="400" strokeDasharray="4 6" />
              ))}
            </g>

            {/* Connecting Communication Beams between Hub and Stations */}
            <g opacity={isWorking ? 0.6 : 0.2}>
              {/* Center to Zeus */}
              <line x1="430" y1="200" x2="190" y2="120" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Center to Athena */}
              <line x1="430" y1="200" x2="670" y2="120" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Center to Hermes */}
              <line x1="430" y1="200" x2="190" y2="280" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Center to Apollo */}
              <line x1="430" y1="200" x2="670" y2="280" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 4" />
            </g>

            {/* ── Central "AI AGENT TEAM" Core Hub ── */}
            <g transform="translate(430, 200)">
              {/* Ambient Radial Glow */}
              <circle cx="0" cy="0" r="130" fill="url(#hubCenterGlow)" />

              {/* Orbit Rings */}
              <circle
                cx="0"
                cy="0"
                r="72"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity={isWorking ? 0.7 : 0.3}
              />
              <circle
                cx="0"
                cy="0"
                r={isWorking ? 62 + (animationTick % 12) * 0.5 : 62}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                opacity={isWorking ? 0.8 : 0.4}
              />

              {/* Core Hub Disc */}
              <circle cx="0" cy="0" r="50" fill="#0f172a" stroke="#0284c7" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="44" fill="#0369a1" opacity={isWorking ? 0.3 : 0.15} />

              {/* Central Core Label */}
              <text x="0" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="13" fontFamily="var(--font-mono, monospace)" fontWeight="800" letterSpacing="1.5">
                AI
              </text>
              <text x="0" y="8" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="var(--font-mono, monospace)" fontWeight="700" letterSpacing="1">
                AGENT TEAM
              </text>
              <text x="0" y="22" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="var(--font-mono, monospace)">
                {isWorking ? "● RUNNING" : "● STANDBY"}
              </text>
            </g>

            {/* ── 4 Dedicated Agent Pods ── */}

            {/* POD 1: ZEUS (Top Left) */}
            <g
              transform="translate(190, 120)"
              onClick={() => setSelectedAgentId("zeus")}
              style={{ cursor: "pointer" }}
            >
              {/* Desk Box */}
              <rect
                x="-80"
                y="-45"
                width="160"
                height="90"
                rx="8"
                fill="url(#deskGrad)"
                stroke={selectedAgentId === "zeus" ? "#f59e0b" : "#334155"}
                strokeWidth={selectedAgentId === "zeus" ? 2 : 1}
              />
              {/* Screen Display */}
              <rect x="-65" y="-32" width="60" height="34" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
              <line x1="-58" y1="-22" x2="-20" y2="-22" stroke="#f59e0b" strokeWidth="2" opacity="0.9" />
              <line x1="-58" y1="-14" x2="-30" y2="-14" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
              {/* Agent Avatar Icon */}
              <circle cx="25" cy="-8" r="22" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <text x="25" y="-1" textAnchor="middle" fontSize="18">⚡</text>
              {/* Name & Role */}
              <text x="-65" y="24" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="700">
                Zeus (Lead)
              </text>
              <text x="-65" y="37" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                {isWaitingPermission
                  ? `Menunggu izin: ${pendingPermission?.toolName || "Tool"}`
                  : isWorking
                    ? "Orchestrating workflow..."
                    : "Standby for query"}
              </text>
              {/* Live Status Indicator */}
              <circle
                cx="65"
                cy="-30"
                r="4"
                fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#f59e0b" : "#64748b"}
              />

              {/* Speech Bubble */}
              {zeusBubble && (
                <g transform="translate(-50, -78)">
                  <rect x="0" y="0" width="165" height="26" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="82" y="17" textAnchor="middle" fill="#fef3c7" fontSize="9" fontFamily="sans-serif" fontWeight="600">
                    {zeusBubble}
                  </text>
                </g>
              )}
            </g>

            {/* POD 2: ATHENA (Top Right) */}
            <g
              transform="translate(670, 120)"
              onClick={() => setSelectedAgentId("athena")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="-80"
                y="-45"
                width="160"
                height="90"
                rx="8"
                fill="url(#deskGrad)"
                stroke={selectedAgentId === "athena" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedAgentId === "athena" ? 2 : 1}
              />
              <rect x="-65" y="-32" width="60" height="34" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
              <line x1="-58" y1="-22" x2="-15" y2="-22" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
              <line x1="-58" y1="-14" x2="-28" y2="-14" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
              <circle cx="25" cy="-8" r="22" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <text x="25" y="-1" textAnchor="middle" fontSize="18">🔍</text>
              <text x="-65" y="24" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="700">
                Athena (Coordinator)
              </text>
              <text x="-65" y="37" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                {isWaitingPermission
                  ? "Paused (Menunggu persetujuan)"
                  : isWorking
                    ? (athenaIsWalking ? "🚶 Walking to sub-agent" : "Querying schema")
                    : "Standby & listening"}
              </text>
              <circle
                cx="65"
                cy="-30"
                r="4"
                fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#38bdf8" : "#64748b"}
              />

              {/* Dynamic Speech Bubble */}
              {athenaBubble && (
                <g transform="translate(-60, -78)">
                  <rect x="0" y="0" width="180" height="26" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="90" y="17" textAnchor="middle" fill="#e0f2fe" fontSize="9" fontFamily="sans-serif" fontWeight="600">
                    {athenaBubble}
                  </text>
                </g>
              )}
            </g>

            {/* POD 3: HERMES (Bottom Left) */}
            <g
              transform="translate(190, 280)"
              onClick={() => setSelectedAgentId("hermes")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="-80"
                y="-45"
                width="160"
                height="90"
                rx="8"
                fill="url(#deskGrad)"
                stroke={selectedAgentId === "hermes" ? "#10b981" : "#334155"}
                strokeWidth={selectedAgentId === "hermes" ? 2 : 1}
              />
              <rect x="-65" y="-32" width="60" height="34" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
              {/* Matrix Green Code */}
              <line x1="-58" y1="-24" x2="-18" y2="-24" stroke="#4ade80" strokeWidth="1.5" />
              <line x1="-58" y1="-18" x2="-28" y2="-18" stroke="#4ade80" strokeWidth="1.5" />
              <line x1="-58" y1="-12" x2="-12" y2="-12" stroke="#22c55e" strokeWidth="1.5" />
              <circle cx="25" cy="-8" r="22" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
              <text x="25" y="-1" textAnchor="middle" fontSize="18">💻</text>
              <text x="-65" y="24" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="700">
                Hermes (Builder)
              </text>
              <text x="-65" y="37" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                {isWaitingPermission
                  ? "Paused (Menunggu persetujuan)"
                  : isWorking
                    ? "Writing components & logic"
                    : "Ready to implement"}
              </text>
              <circle
                cx="65"
                cy="-30"
                r="4"
                fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#10b981" : "#64748b"}
              />

              {hermesBubble && (
                <g transform="translate(-40, -78)">
                  <rect x="0" y="0" width="165" height="26" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                  <text x="82" y="17" textAnchor="middle" fill="#dcfce7" fontSize="9" fontFamily="sans-serif" fontWeight="600">
                    {hermesBubble}
                  </text>
                </g>
              )}
            </g>

            {/* POD 4: APOLLO (Bottom Right) */}
            <g
              transform="translate(670, 280)"
              onClick={() => setSelectedAgentId("apollo")}
              style={{ cursor: "pointer" }}
            >
              <rect
                x="-80"
                y="-45"
                width="160"
                height="90"
                rx="8"
                fill="url(#deskGrad)"
                stroke={selectedAgentId === "apollo" ? "#ec4899" : "#334155"}
                strokeWidth={selectedAgentId === "apollo" ? 2 : 1}
              />
              <rect x="-65" y="-32" width="60" height="34" rx="4" fill="#020617" stroke="#475569" strokeWidth="1" />
              <line x1="-58" y1="-22" x2="-22" y2="-22" stroke="#ec4899" strokeWidth="2" opacity="0.9" />
              <line x1="-58" y1="-14" x2="-35" y2="-14" stroke="#10b981" strokeWidth="2" opacity="0.9" />
              <circle cx="25" cy="-8" r="22" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
              <text x="25" y="-1" textAnchor="middle" fontSize="18">🧪</text>
              <text x="-65" y="24" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="700">
                Apollo (QA Runner)
              </text>
              <text x="-65" y="37" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">
                {isWaitingPermission
                  ? "Paused (Menunggu persetujuan)"
                  : isWorking
                    ? "All 117 assertions green"
                    : "Test suites armed"}
              </text>
              <circle
                cx="65"
                cy="-30"
                r="4"
                fill={isWaitingPermission ? "#f59e0b" : isWorking ? "#ec4899" : "#64748b"}
              />
            </g>
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
              {activeAgent.avatarChar}
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
