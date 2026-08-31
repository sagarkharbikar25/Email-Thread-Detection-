import React, { useState } from 'react';
import { ThreatGraphData, ThreatGraphNode } from '../types';
import { Network, ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Globe, Server, Link2, FileText, Mail } from 'lucide-react';

interface InteractiveThreatGraphProps {
  graphData?: ThreatGraphData;
}

export const InteractiveThreatGraph: React.FC<InteractiveThreatGraphProps> = ({ graphData }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<ThreatGraphNode | null>(null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-xl text-center text-slate-400">
        <Network className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p>No threat relationship nodes generated for this email.</p>
      </div>
    );
  }

  const { nodes, edges } = graphData;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'emailNode':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'domainNode':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'ipNode':
        return <Server className="w-4 h-4 text-red-400" />;
      case 'urlNode':
        return <Link2 className="w-4 h-4 text-yellow-400" />;
      case 'attachmentNode':
        return <FileText className="w-4 h-4 text-orange-400" />;
      default:
        return <Network className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeBorder = (threat: string) => {
    const t = (threat || 'LOW').toUpperCase();
    if (t === 'CRITICAL') return 'border-red-500 bg-red-950/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    if (t === 'HIGH') return 'border-orange-500 bg-orange-950/40 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]';
    if (t === 'MEDIUM') return 'border-yellow-500 bg-yellow-950/40 text-yellow-300';
    if (t === 'LEGITIMATE') return 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    return 'border-cyan-500 bg-slate-900/80 text-cyan-300';
  };

  return (
    <div className="space-y-4">
      {/* Graph Control Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold uppercase tracking-wider">
          <Network className="w-4 h-4 text-cyan-400" />
          <span>Interactive Threat Graph ({nodes.length} Nodes, {edges.length} Edges)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.8))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.6))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setSelectedNode(null); }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative glass-panel rounded-xl overflow-hidden border border-slate-800 min-h-[460px] bg-[#070a13] flex flex-col justify-between">
        {/* Background Grid Lines */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Scaled Graph Canvas */}
        <div
          className="relative w-full h-[460px] p-6 transition-transform duration-200 ease-out origin-top-left"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* SVG Connector Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((edge) => {
              const srcNode = nodes.find(n => n.id === edge.source);
              const tgtNode = nodes.find(n => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;

              const x1 = srcNode.position.x + 90;
              const y1 = srcNode.position.y + 30;
              const x2 = tgtNode.position.x + 90;
              const y2 = tgtNode.position.y + 30;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(56, 189, 248, 0.35)"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={(x1 + x2) / 2 - 40}
                    y={(y1 + y2) / 2 - 9}
                    width="80"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="rgba(56, 189, 248, 0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Render Graph Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute cursor-pointer select-none rounded-xl p-3 border-2 transition-all duration-200 z-10 w-[200px] ${getNodeBorder(
                  node.data.threat_level
                )} ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'hover:scale-105'}`}
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {getNodeIcon(node.type)}
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono opacity-80">
                    {node.data.category || node.type.replace('Node', '')}
                  </span>
                </div>
                <p className="text-xs font-semibold font-mono truncate text-slate-100">
                  {node.data.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="glass-panel-elevated p-4 border-t border-slate-700 flex items-center justify-between z-20">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                {getNodeIcon(selectedNode.type)}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Selected Node: {selectedNode.type}</p>
                <p className="text-sm font-bold text-slate-100 font-mono">{selectedNode.data.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
                selectedNode.data.threat_level === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                Threat: {selectedNode.data.threat_level || 'UNKNOWN'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
