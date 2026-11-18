import React, { useState } from 'react';
import { ArrowRight, Network } from 'lucide-react';
import type { ArchitectureDiagramData } from '../types/portfolio';

interface ArchitectureDiagramProps {
  architecture: ArchitectureDiagramData;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ architecture }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(architecture.nodes[0]?.id ?? '');
  const activeNode =
    architecture.nodes.find((n) => n.id === selectedNodeId) ?? architecture.nodes[0];

  const relatedLinks = architecture.links.filter(
    (link) => link.from === activeNode?.id || link.to === activeNode?.id
  );

  // Arrange up to 6 nodes in a 3x2 connected schematic SVG diagram
  const cols = 3;
  const boxW = 200;
  const boxH = 74;
  const gapX = 56;
  const gapY = 48;
  const padX = 24;
  const padY = 24;

  const positions = new Map<string, { x: number; y: number; cx: number; cy: number }>();
  architecture.nodes.forEach((node, idx) => {
    const row = Math.floor(idx / cols);
    const colInRow = idx % cols;
    // Snake flow on second row for clean pipeline arrows
    const col = row % 2 === 1 ? cols - 1 - colInRow : colInRow;
    const x = padX + col * (boxW + gapX);
    const y = padY + row * (boxH + gapY);
    positions.set(node.id, { x, y, cx: x + boxW / 2, cy: y + boxH / 2 });
  });

  const rows = Math.max(1, Math.ceil(architecture.nodes.length / cols));
  const svgWidth = padX * 2 + cols * boxW + (cols - 1) * gapX;
  const svgHeight = padY * 2 + rows * boxH + (rows - 1) * gapY;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        background: 'rgba(7, 9, 14, 0.78)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--cyan)' }}>
          <Network size={14} /> INTERACTIVE ARCHITECTURE TOPOLOGY (CLICK BLOCK TO INSPECT BUS)
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{architecture.summary}</div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          style={{ minWidth: 620, height: 'auto', display: 'block' }}
          role="img"
          aria-label="System Architecture Diagram"
        >
          <defs>
            <marker
              id="busArrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,1 L7,4 L0,7 Z" fill="#00F0FF" />
            </marker>
            <marker
              id="busArrowDim"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,1 L7,4 L0,7 Z" fill="#475569" />
            </marker>
          </defs>

          {/* Render bus links first */}
          {architecture.links.map((link) => {
            const pFrom = positions.get(link.from);
            const pTo = positions.get(link.to);
            if (!pFrom || !pTo) return null;

            const isHighlighted = link.from === activeNode?.id || link.to === activeNode?.id;
            const dx = pTo.cx - pFrom.cx;
            const dy = pTo.cy - pFrom.cy;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const ux = dx / dist;
            const uy = dy / dist;

            // Clip endpoints near box borders
            const x1 = pFrom.cx + ux * (Math.abs(ux) > Math.abs(uy) ? boxW / 2 + 2 : 0);
            const y1 = pFrom.cy + uy * (Math.abs(uy) >= Math.abs(ux) ? boxH / 2 + 2 : 0);
            const x2 = pTo.cx - ux * (Math.abs(ux) > Math.abs(uy) ? boxW / 2 + 6 : 0);
            const y2 = pTo.cy - uy * (Math.abs(uy) >= Math.abs(ux) ? boxH / 2 + 6 : 0);

            return (
              <g key={`${link.from}-${link.to}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isHighlighted ? '#00F0FF' : '#475569'}
                  strokeWidth={isHighlighted ? 2.1 : 1.3}
                  markerEnd={isHighlighted ? 'url(#busArrow)' : 'url(#busArrowDim)'}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 5}
                  textAnchor="middle"
                  fill={isHighlighted ? '#FFB800' : '#64748B'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {link.bus}
                </text>
              </g>
            );
          })}

          {/* Render subsystem nodes */}
          {architecture.nodes.map((node, index) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const isSelected = node.id === activeNode?.id;

            return (
              <g
                key={node.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={boxW}
                  height={boxH}
                  rx={8}
                  fill={isSelected ? '#102032' : '#0D131F'}
                  stroke={isSelected ? '#00F0FF' : '#334155'}
                  strokeWidth={isSelected ? 2 : 1.2}
                />
                <text
                  x={pos.x + 12}
                  y={pos.y + 20}
                  fill={isSelected ? '#FFB800' : '#64748B'}
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                >
                  0{index + 1} // {node.layer.toUpperCase()}
                </text>
                <text
                  x={pos.x + 12}
                  y={pos.y + 42}
                  fill="#E6EDF7"
                  fontSize="12"
                  fontFamily="Space Grotesk, sans-serif"
                  fontWeight="700"
                >
                  {node.label.length > 26 ? `${node.label.slice(0, 24)}…` : node.label}
                </text>
                <text
                  x={pos.x + 12}
                  y={pos.y + 59}
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {isSelected ? 'ACTIVE NODE' : 'Click to inspect'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {activeNode && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 7,
            background: 'rgba(12, 17, 27, 0.92)',
            border: '1px solid rgba(0, 240, 255, 0.28)',
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: 16,
          }}
        >
          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--amber)', marginBottom: 4 }}>
              SELECTED MODULE // {activeNode.layer.toUpperCase()}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', marginBottom: 4 }}>{activeNode.label}</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{activeNode.detail}</div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--cyan)', marginBottom: 6 }}>
              CONNECTED INTERFACES / BUSES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {relatedLinks.map((lnk) => (
                <div
                  key={`${lnk.from}-${lnk.to}`}
                  className="mono"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{lnk.from}</span>
                  <ArrowRight size={12} color="#00F0FF" />
                  <span>{lnk.to}</span>
                  <span style={{ color: 'var(--amber)' }}>[{lnk.bus}]</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
