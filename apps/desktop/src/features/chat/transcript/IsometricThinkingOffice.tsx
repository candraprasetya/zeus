import { useState, useId, type CSSProperties } from "react";
import { cx } from "../../../components/ui";

export interface IsometricThinkingOfficeProps {
  className?: string;
  style?: CSSProperties;
  streaming?: boolean;
  thoughtText?: string;
}

export interface DeckSpace {
  id: string;
  name: string;
  load: number; // percentage
  status: string;
}

export interface DeckPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  space: string;
  focusTime: string;
  bubble: string;
  x: number;
  y: number;
}

const SPACES: DeckSpace[] = [
  { id: "studio", name: "Studio Floor", load: 82, status: "Active Discussion" },
  { id: "focus", name: "Focus Deck", load: 64, status: "Deep Architecture" },
  { id: "gallery", name: "Gallery", load: 39, status: "Output Review" },
];

const PEOPLE: DeckPerson[] = [
  {
    id: "aria",
    name: "Aria Kessler",
    role: "Design Lead",
    avatar: "👩‍💼",
    color: "#38bdf8",
    space: "Studio Floor",
    focusTime: "1h 12m",
    bubble: "Menyelaraskan user experience & layout responsiveness",
    x: 275,
    y: 195,
  },
  {
    id: "theo",
    name: "Theo Marín",
    role: "Systems Architect",
    avatar: "👨‍💻",
    color: "#10b981",
    space: "Studio Floor",
    focusTime: "2h 05m",
    bubble: "Boundary contract & type integrity review",
    x: 235,
    y: 170,
  },
  {
    id: "nadia",
    name: "Nadia Rao",
    role: "Research & Specs",
    avatar: "👩‍🔬",
    color: "#f59e0b",
    space: "Studio Floor",
    focusTime: "45m",
    bubble: "Memeriksa constraint spek ADR 0062 & D319",
    x: 295,
    y: 165,
  },
  {
    id: "esther",
    name: "Esther Howard",
    role: "QA Runner",
    avatar: "👩‍💻",
    color: "#a855f7",
    space: "Gallery",
    focusTime: "1h 40m",
    bubble: "Menjalankan automated test suite tanpa regresi",
    x: 355,
    y: 220,
  },
  {
    id: "jaylon",
    name: "Jaylon Bergson",
    role: "Core Engine",
    avatar: "👨‍🔧",
    color: "#ec4899",
    space: "Focus Deck",
    focusTime: "3h 15m",
    bubble: "Mengoptimalkan Rust host persistence pipeline",
    x: 430,
    y: 105,
  },
  {
    id: "robert",
    name: "Robert Fox",
    role: "Protocol Bridge",
    avatar: "👨‍💼",
    color: "#6366f1",
    space: "Focus Deck",
    focusTime: "55m",
    bubble: "Sinkronisasi IPC stream and real-time state",
    x: 255,
    y: 130,
  },
];

export function IsometricThinkingOffice({
  className,
  style,
  streaming = true,
  thoughtText,
}: IsometricThinkingOfficeProps) {
  const [selectedPerson, setSelectedPerson] = useState<DeckPerson>(PEOPLE[0]);
  const [activeDeck, setActiveDeck] = useState<string>("all");
  const gradientId = useId();

  return (
    <div className={cx("deck-office-wrapper", className)} style={style}>
      {/* 1. FLOATING TOP-LEFT WIDGET: LIVE SESSION CRITIQUE */}
      <div className="deck-card-top-left" aria-label="Live Session Panel">
        <div className="deck-card-header">
          <div className="deck-live-tag">
            <span className="deck-live-pip" />
            <span>LIVE SESSION</span>
          </div>
          <span className="deck-time-tag">18:42</span>
        </div>
        <div className="deck-session-title">Design Critique & Thinking</div>
        <div className="deck-session-sub">Focus Deck · screen sharing</div>
        <div className="deck-session-footer">
          <div className="deck-avatar-stack">
            <span className="deck-mini-avatar" style={{ background: "#38bdf8" }}>👩‍💼</span>
            <span className="deck-mini-avatar" style={{ background: "#10b981" }}>👨‍💻</span>
            <span className="deck-mini-avatar" style={{ background: "#f59e0b" }}>👩‍🔬</span>
            <span className="deck-avatar-plus">+4</span>
          </div>
          <div className="deck-call-controls">
            <button type="button" className="deck-ctrl-btn" title="Mic Active" aria-label="Mic">
              🎙️
            </button>
            <button type="button" className="deck-ctrl-btn end-call" title="Connected" aria-label="Status">
              📞
            </button>
          </div>
        </div>
      </div>

      {/* 2. FLOATING TOP-RIGHT WIDGET: TEAM OVERVIEW */}
      <div className="deck-card-top-right" aria-label="Team Overview Panel">
        <div className="deck-card-header">
          <span className="deck-card-title">TEAM OVERVIEW</span>
          <span className="deck-min-btn">—</span>
        </div>
        <div className="deck-metrics-grid">
          <div className="deck-metric-box">
            <span className="deck-metric-val">28</span>
            <span className="deck-metric-lbl">Active now</span>
          </div>
          <div className="deck-metric-box">
            <span className="deck-metric-val">6</span>
            <span className="deck-metric-lbl">Live spaces</span>
          </div>
        </div>
        <div className="deck-bars-list">
          {SPACES.map((space) => (
            <div
              key={space.id}
              className={cx("deck-bar-row", activeDeck === space.id && "selected")}
              onClick={() => setActiveDeck(activeDeck === space.id ? "all" : space.id)}
            >
              <span className="deck-bar-name">{space.name}</span>
              <div className="deck-bar-track">
                <div
                  className="deck-bar-fill"
                  style={{ width: `${space.load}%` }}
                />
              </div>
              <span className="deck-bar-pct">{space.load}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CENTRAL FLOATING ISOMETRIC PLATFORM CANVAS */}
      <div className="deck-center-stage">
        <svg
          viewBox="0 0 680 400"
          className="deck-isometric-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`deck-grad-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--ds-bg-surface, #ffffff)" />
              <stop offset="100%" stopColor="var(--ds-bg-base, #f4f4f7)" />
            </linearGradient>
            <filter id={`deck-shadow-${gradientId}`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#000000" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Dotted Arch Connection Lines between decks */}
          <path
            d="M 180,110 C 260,60 360,90 440,110"
            fill="none"
            stroke="var(--ds-brand-gold, #0ea5e9)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <path
            d="M 280,180 C 340,150 420,160 480,140"
            fill="none"
            stroke="var(--ds-brand-gold, #0ea5e9)"
            strokeWidth="1.8"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* PLATFORM 1: Left Mini Deck (Focus Room / Critique Deck) */}
          <g transform="translate(100, 70)" filter={`url(#deck-shadow-${gradientId})`}>
            {/* 3D Slab Thickness */}
            <polygon points="40,65 140,15 140,32 40,82" fill="var(--ds-border-default, #d1d5db)" />
            <polygon points="40,82 140,32 180,52 80,102" fill="var(--ds-border-subtle, #e5e7eb)" />
            {/* Top Slab Surface */}
            <polygon
              points="40,65 140,15 180,35 80,85"
              fill="var(--ds-bg-surface, #ffffff)"
              stroke="var(--ds-border-subtle, #e5e7eb)"
              strokeWidth="1"
            />
            {/* Grid Pattern Lines on Slab */}
            <line x1="60" y1="55" x2="160" y2="5" stroke="var(--ds-border-subtle, #e5e7eb)" strokeWidth="0.8" />
            <line x1="60" y1="75" x2="160" y2="25" stroke="var(--ds-border-subtle, #e5e7eb)" strokeWidth="0.8" />
          </g>

          {/* PLATFORM 2: Upper Right Floating Deck (Focus Deck) */}
          <g transform="translate(390, 80)" filter={`url(#deck-shadow-${gradientId})`}>
            {/* 3D Slab Thickness */}
            <polygon points="20,60 110,15 110,28 20,73" fill="var(--ds-border-default, #d1d5db)" />
            <polygon points="20,73 110,28 150,48 60,93" fill="var(--ds-border-subtle, #e5e7eb)" />
            {/* Top Slab Surface */}
            <polygon
              points="20,60 110,15 150,35 60,80"
              fill="var(--ds-bg-surface, #ffffff)"
              stroke="var(--ds-border-subtle, #e5e7eb)"
              strokeWidth="1"
            />
            {/* Deck Label */}
            <text x="75" y="45" fill="var(--ds-text-muted, #888)" fontSize="10" fontStyle="italic" transform="rotate(-15 75,45)">
              Focus Deck
            </text>
          </g>

          {/* PLATFORM 3: MAIN CENTER SLAB (Studio Floor & Gallery) */}
          <g transform="translate(180, 120)" filter={`url(#deck-shadow-${gradientId})`}>
            {/* 3D Slab Front / Right Bevels */}
            <polygon points="0,95 240,-25 240,-5 0,115" fill="var(--ds-border-default, #cbd5e1)" />
            <polygon points="0,115 240,-5 320,35 80,155" fill="var(--ds-border-subtle, #e2e8f0)" />
            {/* Top Slab Surface (Studio Floor) */}
            <polygon
              points="0,95 240,-25 320,15 80,135"
              fill="var(--ds-bg-surface, #ffffff)"
              stroke="var(--ds-border-subtle, #e2e8f0)"
              strokeWidth="1.2"
            />
            {/* Studio Floor Isometric Grid */}
            <g stroke="var(--ds-border-subtle, #e2e8f0)" strokeWidth="0.9" opacity="0.8">
              <line x1="40" y1="75" x2="280" y2="-45" />
              <line x1="80" y1="55" x2="320" y2="-65" />
              <line x1="60" y1="125" x2="300" y2="5" />
              <line x1="80" y1="5" x2="0" y2="45" />
              <line x1="160" y1="-15" x2="80" y2="25" />
              <line x1="240" y1="-35" x2="160" y2="5" />
            </g>

            {/* Gallery Lower Step */}
            <polygon points="160,115 240,75 270,90 190,130" fill="var(--ds-tile-hover, #f1f5f9)" stroke="var(--ds-border-default)" strokeWidth="0.8" />
            <text x="185" y="118" fill="var(--ds-text-muted, #94a3b8)" fontSize="10" fontStyle="italic">
              Gallery
            </text>

            {/* Studio Floor Label */}
            <text x="25" y="85" fill="var(--ds-text-muted, #94a3b8)" fontSize="11" fontStyle="italic" transform="rotate(-18 25,85)">
              Studio Floor
            </text>

            {/* Floor Targets / Rings (As seen in image) */}
            <ellipse cx="65" cy="100" rx="12" ry="6" fill="none" stroke="var(--ds-primary, #38bdf8)" strokeWidth="1.5" />
            <ellipse cx="145" cy="85" rx="14" ry="7" fill="none" stroke="var(--ds-primary, #38bdf8)" strokeWidth="1.5" />
            <ellipse cx="210" cy="115" rx="12" ry="6" fill="none" stroke="var(--ds-primary, #38bdf8)" strokeWidth="1.5" />
          </g>

          {/* 4. FLOATING PEOPLE NODES (Pin Avatars with Green Badges) */}
          {PEOPLE.map((person) => {
            const isSelected = selectedPerson?.id === person.id;
            return (
              <g
                key={person.id}
                className={cx("deck-person-node", isSelected && "is-selected")}
                transform={`translate(${person.x}, ${person.y})`}
                onClick={() => setSelectedPerson(person)}
                style={{ cursor: "pointer" }}
              >
                {/* Vertical Pin Anchor Line to Floor */}
                <line x1="0" y1="0" x2="0" y2="18" stroke="var(--ds-text-muted, #888)" strokeWidth="1.2" opacity="0.6" />
                <ellipse cx="0" cy="18" rx="5" ry="2.5" fill="rgba(0,0,0,0.15)" />

                {/* Avatar Circle Pin */}
                <circle
                  cx="0"
                  cy="0"
                  r="14"
                  fill="var(--ds-bg-surface, #ffffff)"
                  stroke={isSelected ? "var(--ds-brand-gold, #f59e0b)" : "var(--ds-border-default, #ccc)"}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  filter="drop-shadow(0 3px 6px rgba(0,0,0,0.14))"
                />

                {/* Avatar Icon */}
                <text x="0" y="5" textAnchor="middle" fontSize="13" style={{ userSelect: "none" }}>
                  {person.avatar}
                </text>

                {/* Green Live Status Dot (Top-Right of avatar) */}
                <circle cx="9" cy="-8" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        {/* 5. FLOATING CENTER POPUP CARD: SELECTED PERSON CARD (Aria Kessler Style) */}
        {selectedPerson && (
          <div className="deck-person-popup">
            <div className="deck-popup-top">
              <span className="deck-popup-avatar">{selectedPerson.avatar}</span>
              <div className="deck-popup-titles">
                <span className="deck-popup-name">{selectedPerson.name}</span>
                <span className="deck-popup-role">{selectedPerson.role}</span>
              </div>
              <span className="deck-popup-live-tag">
                <span className="deck-live-pip" />
                Live
              </span>
            </div>

            <div className="deck-popup-stats">
              <div className="deck-stat-col">
                <span className="deck-stat-lbl">SPACE</span>
                <span className="deck-stat-val">{selectedPerson.space}</span>
              </div>
              <div className="deck-stat-col">
                <span className="deck-stat-lbl">FOCUS</span>
                <span className="deck-stat-val">{selectedPerson.focusTime}</span>
              </div>
            </div>

            {thoughtText ? (
              <div className="deck-thought-feed">
                <span className="feed-tag">THINKING STREAM:</span>
                <span className="feed-text">{thoughtText.slice(-120)}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 6. FLOATING BOTTOM-LEFT WIDGET: LIVE ACTIVITY LOG */}
      <div className="deck-card-bottom-left" aria-label="Live Activity Feed">
        <div className="deck-card-header">
          <div className="deck-live-tag">
            <span className="deck-live-pip" />
            <span>LIVE ACTIVITY</span>
          </div>
        </div>
        <div className="deck-activity-list">
          <div className="deck-act-row">
            <span className="deck-act-icon ok">✓</span>
            <div className="deck-act-copy">
              <strong>Nadia Rao</strong> published <span>Q3 Systems Review</span>.
              <span className="deck-act-time">just now</span>
            </div>
          </div>
          <div className="deck-act-row">
            <span className="deck-act-icon time">🕒</span>
            <div className="deck-act-copy">
              <strong>Focus Deck</strong> reserved for thinking critique.
              <span className="deck-act-time">4 min ago</span>
            </div>
          </div>
          <div className="deck-act-row">
            <span className="deck-act-icon in">➔</span>
            <div className="deck-act-copy">
              <strong>Theo Marín</strong> checked in at <span>Studio Floor</span>.
              <span className="deck-act-time">11 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. FLOATING BOTTOM-RIGHT WIDGET: SPACE HEALTH */}
      <div className="deck-card-bottom-right" aria-label="Space Health Status">
        <div className="deck-card-header">
          <span className="deck-card-title">SPACE HEALTH</span>
        </div>
        <div className="deck-health-body">
          <div className="deck-health-gauge">
            <span className="deck-gauge-num">94</span>
          </div>
          <div className="deck-health-copy">
            <strong>Excellent</strong>
            <span>All sub-systems nominal</span>
          </div>
        </div>
        <div className="deck-health-chips">
          <span className="deck-chip ok">● Network</span>
          <span className="deck-chip ok">● Sensors 40/40</span>
          <span className="deck-chip info">● 2 sync</span>
          <span className="deck-chip warn">● 1 notice</span>
        </div>
      </div>

      {/* 8. RIGHT VERTICAL FLOATING TOOLBAR */}
      <div className="deck-right-toolbar" aria-label="Deck Tools">
        <button type="button" className="deck-tool-btn" title="Search People & Spaces">🔍</button>
        <button type="button" className="deck-tool-btn" title="Filter Decks">☰</button>
        <button type="button" className="deck-tool-btn" title="Zoom Stage">🔎</button>
        <button type="button" className="deck-tool-btn active" title="3D Layers">📦</button>
        <button type="button" className="deck-tool-btn" title="Share Space">🔗</button>
      </div>
    </div>
  );
}
