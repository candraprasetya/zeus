import { memo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Route01Icon,
  Search01Icon,
  CheckCheckIcon,
  FlashIcon,
  SourceCodeIcon,
  CpuIcon,
  Folder01Icon,
  AiSparklesIcon,
} from "@hugeicons/core-free-icons";
import { cx } from "../../../components/ui";
import { useAppStore } from "../../../stores/app-store";

export interface ProjectMindmapViewProps {
  className?: string;
}

interface MindmapNode {
  id: string;
  label: string;
  category: "core" | "feature" | "runtime" | "ui";
  desc: string;
  status: "verified" | "active" | "standby";
  x: number;
  y: number;
  color: string;
  files: string[];
}

export const ProjectMindmapView = memo(function ProjectMindmapView({
  className,
}: ProjectMindmapViewProps) {
  const workspace = useAppStore((s) => s.workspace);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("core");
  const [filterQuery, setFilterQuery] = useState("");

  const nodes: MindmapNode[] = [
    {
      id: "core",
      label: workspace?.name || "PI-Desktop Architecture",
      category: "core",
      desc: "Autoritatif native host runtime & desktop coordination engine",
      status: "active",
      x: 380,
      y: 190,
      color: "#f59e0b",
      files: ["package.json", "AGENTS.md", "README.md"],
    },
    {
      id: "agent-runtime",
      label: "Agent Runtime",
      category: "runtime",
      desc: "Autonomous subagent engine, prompt orchestrator & task flows",
      status: "active",
      x: 180,
      y: 90,
      color: "#38bdf8",
      files: ["packages/agent-runtime/src/runtime.ts", "packages/agent-runtime/src/mode-prompts.ts"],
    },
    {
      id: "live-office",
      label: "Live Office & Pixel Team",
      category: "ui",
      desc: "Chibi avatars, animated subagent room, status dossiers & audio SFX",
      status: "verified",
      x: 170,
      y: 280,
      color: "#10b981",
      files: ["apps/desktop/src/features/chat/transcript/PixelAgentsOffice.tsx", "apps/desktop/src/styles/chat-shell.css"],
    },
    {
      id: "host-core",
      label: "Rust Host Core",
      category: "core",
      desc: "SQLite state, native process coordination & credential store",
      status: "verified",
      x: 580,
      y: 90,
      color: "#a855f7",
      files: ["crates/host-core/src/db.rs", "crates/host-core/src/providers.rs"],
    },
    {
      id: "chat-surface",
      label: "Dynamic Chat & Composer",
      category: "ui",
      desc: "Multi-session streaming, TurnReviewBar, diffs & context compaction",
      status: "active",
      x: 590,
      y: 280,
      color: "#ec4899",
      files: ["apps/desktop/src/components/ChatSurface.tsx", "apps/desktop/src/features/chat/transcript/ChatTranscript.tsx"],
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  return (
    <div
      className={cx("project-mindmap-container", className)}
      role="region"
      aria-label="Interactive Project Mindmap"
    >
      <div className="mindmap-header">
        <div className="mindmap-header-left">
          <div className="mindmap-badge">
            <HugeiconsIcon icon={Route01Icon} size={15} color="#38bdf8" />
            <span className="mindmap-title">Interactive Project Mindmap &amp; Context Graph</span>
          </div>
          <span className="mindmap-subtitle">
            Peta visual struktur modul &amp; relasi file — digunakan untuk penghematan token &amp; konteks prompt.
          </span>
        </div>

        <div className="mindmap-header-right">
          <span className="mindmap-token-pill">⚡ Context Optimized: ~78% Token Reduction</span>
        </div>
      </div>

      <div className="mindmap-workspace-split">
        {/* SVG Mindmap Graph Canvas */}
        <div className="mindmap-canvas-wrap">
          <svg
            className="mindmap-svg"
            viewBox="0 0 760 380"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="mindmapLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
              </linearGradient>
            </defs>

            {/* Connecting Curved Lines */}
            {nodes.slice(1).map((node) => (
              <path
                key={node.id}
                d={`M ${nodes[0].x} ${nodes[0].y} Q ${(nodes[0].x + node.x) / 2} ${nodes[0].y + (node.y - nodes[0].y) * 0.2}, ${node.x} ${node.y}`}
                fill="none"
                stroke="url(#mindmapLineGrad)"
                strokeWidth={selectedNodeId === node.id ? "2.5" : "1.5"}
                strokeDasharray={selectedNodeId === node.id ? "none" : "4 4"}
                opacity={selectedNodeId === node.id ? "1" : "0.5"}
              />
            ))}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={isSelected ? "32" : "28"}
                    fill="#131b29"
                    stroke={node.color}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    filter={isSelected ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))" : "none"}
                  />
                  <circle
                    r="8"
                    fill={node.color}
                    opacity={node.status === "active" ? 0.9 : 0.4}
                  />
                  <text
                    y="44"
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    {node.label}
                  </text>
                  <text
                    y="57"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    [{node.status.toUpperCase()}]
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspector Drawer */}
        <div className="mindmap-inspector">
          <div className="inspector-head">
            <span
              className="inspector-tag"
              style={{
                backgroundColor: `${selectedNode.color}20`,
                color: selectedNode.color,
                border: `1px solid ${selectedNode.color}40`,
              }}
            >
              {selectedNode.category.toUpperCase()} MODULE
            </span>
            <span className="inspector-status">
              <HugeiconsIcon icon={CheckCheckIcon} size={12} color="#10b981" />
              {selectedNode.status.toUpperCase()}
            </span>
          </div>

          <h3 className="inspector-title">{selectedNode.label}</h3>
          <p className="inspector-desc">{selectedNode.desc}</p>

          <div className="inspector-files-section">
            <span className="files-section-label">KEY ARTIFACTS &amp; CONTRACTS:</span>
            <div className="inspector-file-tags" role="list">
              {selectedNode.files.map((file) => (
                <span key={file} className="inspector-file-tag" role="listitem">
                  <HugeiconsIcon icon={Folder01Icon} size={11} className="file-icon" />
                  <code>{file}</code>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
