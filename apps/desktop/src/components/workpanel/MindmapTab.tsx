import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";
import { useAppStore } from "../../stores/app-store";
import { TooltipButton } from "../ui";
import {
  IconClose,
  IconExternal,
  IconFileText,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTarget,
  IconWorkflow,
} from "../icons";
import { WorkTabEmpty } from "./WorkTabEmpty";

export type MindmapNode = {
  id: string;
  label: string;
  detail?: string;
  file?: string;
  color?: string;
  x: number;
  y: number;
  radius: number;
  group?: string;
};

export type MindmapEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
};

export type MindmapGraph = {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
};

const COLOR_MAP: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  "1": { bg: "#f43f5e", border: "#fda4af", glow: "rgba(244, 63, 94, 0.4)", text: "#fff" }, // Rose/Red
  "2": { bg: "#f97316", border: "#fdba74", glow: "rgba(249, 115, 22, 0.4)", text: "#fff" }, // Orange
  "3": { bg: "#eab308", border: "#fde047", glow: "rgba(234, 179, 8, 0.4)", text: "#1e1e24" }, // Yellow
  "4": { bg: "#10b981", border: "#6ee7b7", glow: "rgba(16, 185, 129, 0.4)", text: "#fff" }, // Green
  "5": { bg: "#06b6d4", border: "#67e8f9", glow: "rgba(6, 182, 212, 0.4)", text: "#1e1e24" }, // Cyan
  "6": { bg: "#8b5cf6", border: "#c4b5fd", glow: "rgba(139, 92, 246, 0.4)", text: "#fff" }, // Purple
  default: { bg: "#6366f1", border: "#a5b4fc", glow: "rgba(99, 102, 241, 0.35)", text: "#fff" },
};

function parseWikilinks(text: string): string[] {
  const matches = text.matchAll(/\[\[(.*?)\]\]/g);
  const links: string[] = [];
  for (const m of matches) {
    if (m[1]) {
      const raw = m[1].split("|")[0]?.split("#")[0]?.trim();
      if (raw) links.push(raw);
    }
  }
  return links;
}

export function MindmapTab() {
  const { t } = useTranslation();
  const workspace = useAppStore((s) => s.workspace);
  const openFile = useAppStore((s) => s.openFileInWorkPanel);
  const root = workspace?.path ?? null;

  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState<MindmapGraph>({ nodes: [], edges: [] });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Load .knowledge/ data: canvas first, or scan .md files
  const loadKnowledgeData = useCallback(async () => {
    if (!root) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Try reading .knowledge/graph.canvas
      let canvasLoaded = false;
      try {
        const canvasRead = await api.fsRead(".knowledge/graph.canvas");
        if (canvasRead.kind === "text" && canvasRead.content) {
          const parsed = JSON.parse(canvasRead.content);
          if (Array.isArray(parsed.nodes)) {
            const rawNodes = parsed.nodes;
            const rawEdges = Array.isArray(parsed.edges) ? parsed.edges : [];

            // Compute center offset
            let minX = Infinity,
              maxX = -Infinity,
              minY = Infinity,
              maxY = -Infinity;
            for (const n of rawNodes) {
              const x = typeof n.x === "number" ? n.x : 0;
              const y = typeof n.y === "number" ? n.y : 0;
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }

            const centerX = minX === Infinity ? 0 : (minX + maxX) / 2;
            const centerY = minY === Infinity ? 0 : (minY + maxY) / 2;

            const nodes: MindmapNode[] = rawNodes.map((n: any, idx: number) => {
              const label =
                n.text?.split("\n")[0]?.replace(/^#+\s*/, "") ||
                n.file?.split("/").pop()?.replace(/\.md$/, "") ||
                n.id ||
                `Node ${idx + 1}`;
              const detail = n.text || (n.file ? `File: ${n.file}` : "");
              return {
                id: n.id || `node-${idx}`,
                label,
                detail,
                file: n.file,
                color: String(n.color || (idx % 6) + 1),
                x: (typeof n.x === "number" ? n.x : 0) - centerX,
                y: (typeof n.y === "number" ? n.y : 0) - centerY,
                radius: n.type === "group" ? 30 : 24,
                group: n.type === "group" ? "group" : undefined,
              };
            });

            const edges: MindmapEdge[] = rawEdges.map((e: any, idx: number) => ({
              id: e.id || `edge-${idx}`,
              from: e.fromNode,
              to: e.toNode,
              label: e.label,
            }));

            setGraph({ nodes, edges });
            canvasLoaded = true;
          }
        }
      } catch {
        // canvas file not found, fall back to directory scan
      }

      if (!canvasLoaded) {
        // 2. Scan .knowledge directory for markdown notes
        try {
          const res = await api.fsList(".knowledge");
          const mdFiles = res.entries.filter(
            (e) => e.kind !== "dir" && e.name.endsWith(".md"),
          );

          if (mdFiles.length > 0) {
            const nodes: MindmapNode[] = [];
            const edges: MindmapEdge[] = [];
            const nameToId = new Map<string, string>();

            const count = mdFiles.length;
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));

            for (let i = 0; i < count; i++) {
              const entry = mdFiles[i];
              const nameWithoutExt = entry.name.replace(/\.md$/, "");
              const id = `node-${i}`;
              nameToId.set(nameWithoutExt, id);
              nameToId.set(entry.name, id);

              // Organic radial layout with gentle variation
              const r = 90 + Math.sqrt(i) * 110;
              const theta = i * goldenAngle;
              const x = r * Math.cos(theta);
              const y = r * Math.sin(theta);

              nodes.push({
                id,
                label: nameWithoutExt,
                file: `.knowledge/${entry.name}`,
                color: String((i % 6) + 1),
                x,
                y,
                radius: 24,
              });
            }

            // Extract wikilinks to form edges
            for (let i = 0; i < count; i++) {
              const entry = mdFiles[i];
              try {
                const content = await api.fsRead(`.knowledge/${entry.name}`);
                if (content.kind === "text" && content.content) {
                  const links = parseWikilinks(content.content);
                  const fromId = `node-${i}`;
                  for (const target of links) {
                    const toId = nameToId.get(target);
                    if (toId && toId !== fromId) {
                      edges.push({
                        id: `edge-${fromId}-${toId}`,
                        from: fromId,
                        to: toId,
                      });
                    }
                  }
                }
              } catch {
                // Ignore read errors
              }
            }

            setGraph({ nodes, edges });
          } else {
            setGraph({ nodes: [], edges: [] });
          }
        } catch {
          setGraph({ nodes: [], edges: [] });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [root]);

  useEffect(() => {
    void loadKnowledgeData();
  }, [loadKnowledgeData]);

  // Pan handling
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (
      e.target !== containerRef.current &&
      !(e.target as HTMLElement).classList.contains("mindmap-canvas") &&
      !(e.target as HTMLElement).classList.contains("mindmap-bg-underlay")
    ) {
      return;
    }
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) {
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release
      }
    }
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.5, Math.max(0.2, prev * zoomFactor)));
  };

  // Node position map
  const nodeMap = useMemo(() => {
    const map = new Map<string, MindmapNode>();
    for (const node of graph.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [graph.nodes]);

  // Compute connected nodes for hovered/selected state
  const activeFocusId = selectedNode?.id ?? hoveredNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const set = new Set<string>([activeFocusId]);
    for (const edge of graph.edges) {
      if (edge.from === activeFocusId) set.add(edge.to);
      if (edge.to === activeFocusId) set.add(edge.from);
    }
    return set;
  }, [activeFocusId, graph.edges]);

  // Search filter matching
  const searchMatchingIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const matches = new Set<string>();
    for (const node of graph.nodes) {
      if (node.label.toLowerCase().includes(q) || node.detail?.toLowerCase().includes(q)) {
        matches.add(node.id);
      }
    }
    return matches;
  }, [searchQuery, graph.nodes]);

  // Minimap bounds
  const bounds = useMemo(() => {
    if (graph.nodes.length === 0) return { minX: -200, maxX: 200, minY: -200, maxY: 200 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of graph.nodes) {
      minX = Math.min(minX, n.x - 50);
      maxX = Math.max(maxX, n.x + 50);
      minY = Math.min(minY, n.y - 50);
      maxY = Math.max(maxY, n.y + 50);
    }
    return { minX, maxX, minY, maxY };
  }, [graph.nodes]);

  const minimapScale = useMemo(() => {
    const w = bounds.maxX - bounds.minX || 400;
    const h = bounds.maxY - bounds.minY || 400;
    return Math.min(130 / w, 90 / h);
  }, [bounds]);

  // Center fit helper
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleCenterOnNode = useCallback((node: MindmapNode) => {
    setSelectedNode(node);
    setPan({ x: -node.x * zoom, y: -node.y * zoom });
  }, [zoom]);

  if (!root) {
    return (
      <WorkTabEmpty
        icon={IconWorkflow}
        title={t("panel.files.noWorkspace")}
        body={t("panel.files.noWorkspaceHint")}
      />
    );
  }

  if (loading) {
    return (
      <div className="mindmap-loading">
        <IconWorkflow size={28} className="mindmap-spin-icon text-muted" />
        <span className="mindmap-loading-text">{t("panel.mindmap.loading")}</span>
      </div>
    );
  }

  if (graph.nodes.length === 0) {
    return (
      <WorkTabEmpty
        icon={IconWorkflow}
        title={t("panel.mindmap.emptyTitle")}
        body={t("panel.mindmap.emptyBody")}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="mindmap-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Background canvas & SVG graph */}
      <svg
        className="mindmap-canvas"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <defs>
          <radialGradient id="mindmapCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--ds-accent)" stopOpacity="0.1" />
            <stop offset="60%" stopColor="var(--ds-accent)" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="nodeGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>
        </defs>

        {/* Ambient harmonic rings */}
        <circle cx={0} cy={0} r={360} fill="url(#mindmapCenterGlow)" />
        <circle cx={0} cy={0} r={180} fill="none" stroke="var(--ds-border-subtle)" strokeDasharray="3 5" opacity={0.25} />
        <circle cx={0} cy={0} r={340} fill="none" stroke="var(--ds-border-subtle)" strokeDasharray="5 7" opacity={0.15} />

        {/* Edges */}
        <g className="mindmap-edges-layer">
          {graph.edges.map((edge) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;

            const isEdgeHighlighted =
              activeFocusId && (edge.from === activeFocusId || edge.to === activeFocusId);
            const isEdgeDimmed = activeFocusId && !isEdgeHighlighted;

            return (
              <g
                key={edge.id}
                className={`mindmap-edge-group ${isEdgeHighlighted ? "highlighted" : ""} ${isEdgeDimmed ? "dimmed" : ""}`}
              >
                {/* Invisible thicker hit-line for hover precision */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="transparent"
                  strokeWidth={12}
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="mindmap-edge-line"
                />
                {edge.label && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 5}
                    className="mindmap-edge-label"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="mindmap-nodes-layer">
          {graph.nodes.map((node) => {
            const colorMeta = COLOR_MAP[node.color ?? "default"] ?? COLOR_MAP.default;
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds.has(node.id);
            const isDimmed = activeFocusId && !isConnected;
            const isSearchMatch = searchMatchingIds ? searchMatchingIds.has(node.id) : null;
            const isSearchDimmed = searchMatchingIds !== null && !isSearchMatch;

            return (
              <g
                key={node.id}
                className={`mindmap-node-group ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""} ${isDimmed || isSearchDimmed ? "dimmed" : ""} ${isSearchMatch ? "search-match" : ""}`}
                transform={`translate(${node.x}, ${node.y})`}
                onPointerEnter={() => setHoveredNodeId(node.id)}
                onPointerLeave={() => setHoveredNodeId((curr) => (curr === node.id ? null : curr))}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  if (node.file) {
                    openFile(node.file);
                  }
                }}
              >
                {/* Search Match Halo */}
                {isSearchMatch && (
                  <circle
                    r={node.radius + 12}
                    fill="none"
                    stroke="var(--ds-accent)"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    className="mindmap-search-halo"
                  />
                )}

                {/* Outer Glow Halo on hover, active, or connection */}
                <circle
                  r={node.radius + 8}
                  fill={colorMeta.glow}
                  filter="url(#nodeGlowFilter)"
                  className="mindmap-node-glow"
                  opacity={isSelected ? 0.9 : isHovered ? 0.75 : isConnected && activeFocusId ? 0.5 : 0}
                />

                {/* Node Outer Ring */}
                <circle
                  r={node.radius + 3}
                  fill="none"
                  stroke={isSelected || isHovered ? colorMeta.border : "transparent"}
                  strokeWidth={1.5}
                  className="mindmap-node-ring"
                />

                {/* Node Main Disk */}
                <circle
                  r={node.radius}
                  fill={colorMeta.bg}
                  stroke={colorMeta.border}
                  strokeWidth={2}
                  className="mindmap-node-circle"
                />

                {/* Inner Ambient Accent Pulse */}
                <circle
                  r={node.radius * 0.45}
                  fill="#ffffff"
                  opacity={isSelected || isHovered ? 0.95 : 0.8}
                  className="mindmap-node-core"
                />

                {/* Node Label Pill Background */}
                <text
                  y={node.radius + 18}
                  className="mindmap-node-label"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Toolbar with Search, Zoom, and Recenter */}
      <div className="mindmap-controls no-drag">
        {/* Search input for large mindmaps */}
        <div className="mindmap-search-box">
          <IconSearch size={14} className="mindmap-search-icon" />
          <input
            type="text"
            className="mindmap-search-input"
            placeholder="Cari konsep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="mindmap-search-clear"
              onClick={() => setSearchQuery("")}
            >
              <IconClose size={11} />
            </button>
          )}
        </div>

        <div className="mindmap-stats">
          <span>{t("panel.mindmap.nodesCount", { count: graph.nodes.length })}</span>
          <span className="mindmap-stats-divider">·</span>
          <span>{t("panel.mindmap.edgesCount", { count: graph.edges.length })}</span>
        </div>

        <div className="mindmap-actions-group">
          <TooltipButton
            type="button"
            className="icon-btn icon-btn-square"
            tooltip={t("panel.mindmap.zoomIn")}
            ariaLabel={t("panel.mindmap.zoomIn")}
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          >
            <IconPlus size={14} />
          </TooltipButton>

          <button
            type="button"
            className="mindmap-zoom-label"
            title={t("panel.mindmap.resetZoom")}
            onClick={handleResetView}
          >
            {Math.round(zoom * 100)}%
          </button>

          <TooltipButton
            type="button"
            className="icon-btn icon-btn-square"
            tooltip={t("panel.mindmap.zoomOut")}
            ariaLabel={t("panel.mindmap.zoomOut")}
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.15))}
          >
            <IconMinus size={14} />
          </TooltipButton>

          <TooltipButton
            type="button"
            className="icon-btn icon-btn-square"
            tooltip="Center View"
            ariaLabel="Center View"
            onClick={handleResetView}
          >
            <IconTarget size={14} />
          </TooltipButton>

          <TooltipButton
            type="button"
            className="icon-btn icon-btn-square"
            tooltip="Refresh Mindmap"
            ariaLabel="Refresh Mindmap"
            onClick={() => void loadKnowledgeData()}
          >
            <IconRefresh size={14} />
          </TooltipButton>
        </div>
      </div>

      {/* Mini-map Interactive Overview */}
      <div className="mindmap-minimap no-drag" title="Interactive Minimap">
        <svg viewBox="0 0 140 100" className="mindmap-minimap-svg">
          {graph.edges.map((e) => {
            const from = nodeMap.get(e.from);
            const to = nodeMap.get(e.to);
            if (!from || !to) return null;
            const x1 = 70 + (from.x - (bounds.minX + bounds.maxX) / 2) * minimapScale;
            const y1 = 50 + (from.y - (bounds.minY + bounds.maxY) / 2) * minimapScale;
            const x2 = 70 + (to.x - (bounds.minX + bounds.maxX) / 2) * minimapScale;
            const y2 = 50 + (to.y - (bounds.minY + bounds.maxY) / 2) * minimapScale;
            return <line key={e.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" opacity={0.2} />;
          })}
          {graph.nodes.map((n) => {
            const cx = 70 + (n.x - (bounds.minX + bounds.maxX) / 2) * minimapScale;
            const cy = 50 + (n.y - (bounds.minY + bounds.maxY) / 2) * minimapScale;
            const colorMeta = COLOR_MAP[n.color ?? "default"] ?? COLOR_MAP.default;
            const isSelected = selectedNode?.id === n.id;
            return (
              <circle
                key={n.id}
                cx={cx}
                cy={cy}
                r={isSelected ? 4.5 : 2.5}
                fill={colorMeta.bg}
                opacity={isSelected ? 1 : 0.75}
                stroke={isSelected ? "#fff" : "transparent"}
                strokeWidth={1}
                className="mindmap-minimap-node"
                onClick={() => handleCenterOnNode(n)}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected Node Glass Drawer / Info Card */}
      {selectedNode && (
        <div className="mindmap-detail-card no-drag animate-in">
          <div className="mindmap-detail-header">
            <div className="mindmap-detail-title-row">
              <span
                className="mindmap-detail-badge"
                style={{
                  backgroundColor:
                    COLOR_MAP[selectedNode.color ?? "default"]?.bg ?? COLOR_MAP.default.bg,
                }}
              />
              <span className="mindmap-detail-title">{selectedNode.label}</span>
            </div>
            <button
              type="button"
              className="icon-btn icon-btn-square"
              onClick={() => setSelectedNode(null)}
              aria-label="Close"
            >
              <IconClose size={12} />
            </button>
          </div>
          {selectedNode.file && (
            <button
              type="button"
              className="mindmap-detail-file-btn"
              onClick={() => openFile(selectedNode.file!)}
            >
              <IconFileText size={13} />
              <span className="mindmap-detail-file-text">{selectedNode.file}</span>
              <IconExternal size={12} className="mindmap-detail-ext-icon" />
            </button>
          )}
          {selectedNode.detail && (
            <div className="mindmap-detail-body">
              {selectedNode.detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
