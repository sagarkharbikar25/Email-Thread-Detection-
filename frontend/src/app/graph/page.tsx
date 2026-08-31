"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ReactFlow, Controls, Background, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MOCK_GRAPH_DATA } from "../../constants/mockData";

export default function ThreatGraphPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Custom node styling to match Group-IB / ThreatConnect dark theme
  const nodeTypes = {
    custom: (props: any) => {
      const type = props.data.type;
      let icon = "help";
      let colorClass = "bg-slate-800 border-slate-600";
      let iconColor = "text-slate-400";
      
      switch (type) {
        case "actor": icon = "person"; colorClass = "bg-purple-900/90 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"; iconColor = "text-purple-300"; break;
        case "campaign": icon = "flag"; colorClass = "bg-pink-900/90 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]"; iconColor = "text-pink-300"; break;
        case "tactic": icon = "category"; colorClass = "bg-indigo-900/90 border-indigo-400"; iconColor = "text-indigo-300"; break;
        case "malware": icon = "bug_report"; colorClass = "bg-red-900/90 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]"; iconColor = "text-red-300"; break;
        case "domain": icon = "language"; colorClass = "bg-emerald-900/90 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"; iconColor = "text-emerald-300"; break;
        case "ip": icon = "router"; colorClass = "bg-blue-900/90 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"; iconColor = "text-blue-300"; break;
        case "email": icon = "mail"; colorClass = "bg-amber-900/90 border-amber-400"; iconColor = "text-amber-300"; break;
        case "hash": icon = "tag"; colorClass = "bg-slate-700/90 border-slate-400"; iconColor = "text-slate-200"; break;
      }

      return (
        <div className="flex flex-col items-center group cursor-pointer hover:z-50 relative">
          <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorClass}`}>
            <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
          </div>
          <div className="mt-3 bg-[#070b14]/95 px-3 py-1.5 rounded border border-slate-700 text-center backdrop-blur-md shadow-2xl min-w-max pointer-events-none transition-all duration-300 group-hover:-translate-y-1">
            <div className="font-mono text-[11px] font-bold text-slate-100">{props.data.label}</div>
            <div className="font-mono text-[9px] text-slate-400 uppercase mt-0.5">{props.data.sublabel}</div>
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    // Fetch cases on load
    const fetchCases = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/cases");
        if (response.data && response.data.length > 0) {
          setCases(response.data);
          setSelectedCase(response.data[0].id);
        } else {
          setCases([{ id: "TRC-1024", case_number: "TRC-1024", title: "Urgent: Verify Your Account Information" }]);
          setSelectedCase("TRC-1024");
        }
      } catch (err) {
        console.error("Failed to fetch cases, using mock fallback", err);
        setCases([{ id: "TRC-1024", case_number: "TRC-1024", title: "Urgent: Verify Your Account Information" }]);
        setSelectedCase("TRC-1024");
      }
    };
    fetchCases();
  }, []);

  const loadMockGraph = () => {
    // Enterprise Mock Layout: Concentric Rings based on Threat Intelligence layers
    const typeGroups: Record<string, any[]> = {};
    MOCK_GRAPH_DATA.nodes.forEach(n => {
      if (!typeGroups[n.type]) typeGroups[n.type] = [];
      typeGroups[n.type].push(n);
    });

    // Radii for different layers
    const radii: Record<string, number> = {
      actor: 0,
      campaign: 150,
      tactic: 150,
      malware: 300,
      domain: 450,
      ip: 450,
      email: 600,
      hash: 600
    };

    const center = { x: 800, y: 600 };

    const mockNodes = MOCK_GRAPH_DATA.nodes.map((n: any) => {
      const radius = radii[n.type] || 300;
      let pos = center;
      if (radius > 0) {
        // Find index in its group
        const group = typeGroups[n.type];
        const idx = group.findIndex(g => g.id === n.id);
        // Spread evenly around the ring
        const angle = (idx / group.length) * 2 * Math.PI;
        // Add some jitter for an organic "web" feel
        const jitterX = (Math.random() - 0.5) * 80;
        const jitterY = (Math.random() - 0.5) * 80;
        pos = { 
          x: center.x + radius * Math.cos(angle) + jitterX, 
          y: center.y + radius * Math.sin(angle) + jitterY 
        };
      } else {
        // Actors at center
        const group = typeGroups[n.type];
        const idx = group.findIndex(g => g.id === n.id);
        pos = { x: center.x + (idx * 100 - 50), y: center.y + (Math.random() * 40 - 20) };
      }
      
      return {
        id: n.id,
        type: "custom",
        position: pos,
        data: { label: n.label, sublabel: n.sublabel, severity: n.severity, type: n.type, details: n.details }
      };
    });
    
    const mockEdges = MOCK_GRAPH_DATA.edges.map((e: any) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      className: "animated-flow-line",
      style: { stroke: "#06b6d4", strokeWidth: 2 },
      labelStyle: { fill: "#94a3b8", fontSize: 10, fontWeight: 700 },
      labelBgStyle: { fill: "#0D1726", fillOpacity: 0.8 },
      labelBgBorderRadius: 4,
      labelBgPadding: [4, 2] as [number, number]
    }));
    
    setNodes(mockNodes);
    setEdges(mockEdges);
  };

  useEffect(() => {
    if (!selectedCase) return;
    const fetchGraph = async () => {
      setIsLoading(true);
      setSelectedNode(null); // Reset side panel
      try {
        const response = await axios.get(`http://localhost:8000/api/v1/cases/${selectedCase}/graph`);
        
        if (!response.data.nodes || response.data.nodes.length === 0) {
          console.warn("Empty graph data from backend, falling back to mock graph");
          loadMockGraph();
          return;
        }
        
        // Map the backend nodes to ReactFlow nodes
        const mappedNodes = response.data.nodes.map((n: any, idx: number) => ({
          id: n.id,
          type: "custom",
          position: { x: Math.random() * 800, y: Math.random() * 800 },
          data: { label: n.label || n.id, sublabel: n.sublabel || n.type, severity: n.severity || "neutral", type: n.type || "hash" }
        }));
        
        const mappedEdges = response.data.edges.map((e: any) => ({
          id: `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.label || "communicates",
          animated: true,
          className: "animated-flow-line",
          style: { stroke: "#06b6d4", strokeWidth: 2 }
        }));
        
        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (err) {
        console.warn("Failed to fetch case graph, falling back to mock graph");
        loadMockGraph();
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, [selectedCase]);

  const onNodeClick = (event: any, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-full bg-[#070C16] p-6 text-[#d7e3fb]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow-animation {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animated-flow-line path.react-flow__edge-path {
          animation: flow-animation 0.5s linear infinite !important;
          stroke: #06b6d4 !important;
          stroke-width: 3px !important;
          stroke-dasharray: 6 6 !important;
          stroke-opacity: 0.8 !important;
        }
      `}} />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Global Correlation</p>
          <h1 className="mt-2 text-3xl font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-indigo-500">hub</span>
            Campaign Threat Graph
          </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-[#0D1726] border border-[#1D293B] rounded-lg p-2">
          <span className="text-sm font-medium pl-2">Select Campaign:</span>
          <select 
            value={selectedCase} 
            onChange={(e) => setSelectedCase(e.target.value)}
            className="bg-[#1a2333] border border-[#2d3a50] rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
          >
            {cases.length === 0 && <option value="">Loading cases...</option>}
            {cases.map(c => (
              <option key={c.id} value={c.id}>{c.case_number} - {c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-[#1D293B] bg-[#0D1726] flex-1 flex overflow-hidden relative">
        {/* Main Graph Area */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 z-10 bg-[#0D1726]/80 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                <p className="font-mono text-sm text-indigo-300">Correlating Campaign Infrastructure...</p>
              </div>
            </div>
          ) : null}
          
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.2}
            className="bg-[#040810]"
          >
            <Background color="#1D293B" gap={20} size={1.5} />
            <Controls className="bg-[#1a2333] border-none fill-indigo-400" />
          </ReactFlow>
          
          {nodes.length === 0 && !isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-[#908fa0] pointer-events-none">
               <span className="material-symbols-outlined text-6xl mb-4 opacity-50">account_tree</span>
               <p className="text-lg font-medium text-[#c7c4d7]">No graph data found</p>
               <p className="text-sm">Link more emails to this campaign to generate a graph.</p>
             </div>
          )}
        </div>

        {/* Side Panel Inspector */}
        {selectedNode && (
          <div className="w-80 bg-[#0B1221] border-l border-[#1D293B] flex flex-col shadow-2xl transition-all duration-300 z-20">
            <div className="p-4 border-b border-[#1D293B] flex justify-between items-center bg-[#0D1726]">
              <h2 className="font-bold text-slate-200">Node Details</h2>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Entity ID</span>
                <div className="font-mono text-lg text-white break-all bg-[#1a2333] p-2 rounded border border-slate-700 shadow-inner">
                  {selectedNode.data.label}
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Type</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold uppercase font-mono">
                    {selectedNode.data.type}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Threat Level</span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-mono ${
                    selectedNode.data.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    selectedNode.data.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                    selectedNode.data.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}>
                    {selectedNode.data.severity}
                  </span>
                </div>
              </div>

              {selectedNode.data.details && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-3 border-b border-[#1D293B] pb-2">Forensic Metadata</span>
                  <div className="space-y-4">
                    {Object.entries(selectedNode.data.details).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">{key.replace('_', ' ')}</div>
                        <div className="text-sm text-slate-200 font-mono">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-[#0D1726] border-t border-[#1D293B]">
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                <span className="material-symbols-outlined text-sm">search</span>
                Pivot Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
