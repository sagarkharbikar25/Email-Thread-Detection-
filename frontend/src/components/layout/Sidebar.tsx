"use client";

import React from "react";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onOpenIngest?: () => void;
}

export function Sidebar({
  activeTab = "dashboard",
  onTabChange,
  onOpenIngest,
}: SidebarProps) {
  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "ingest", label: "Ingest Email", icon: "upload_file", onClick: onOpenIngest },
    { id: "analysis", label: "Analysis", icon: "analytics" },
    { id: "authentication", label: "Authentication", icon: "verified_user" },
    { id: "relay", label: "Relay Trace", icon: "route" },
    { id: "graph", label: "Threat Graph", icon: "hub" },
    { id: "risk", label: "Risk Assessment", icon: "warning" },
    { id: "cases", label: "Cases", icon: "folder_open" },
    { id: "evidence", label: "Evidence", icon: "fingerprint" },
    { id: "reports", label: "Reports", icon: "description" },
    { id: "alerts", label: "Alerts", icon: "notifications", badge: "3" },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[#101c2d] border-r border-[#1D293B] flex flex-col h-full z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#1D293B]/50">
        <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/40 text-[#c0c1ff] shadow-[0_0_12px_rgba(99,102,241,0.25)]">
          <span className="material-symbols-outlined text-xl">security</span>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-[#d7e3fb] leading-none">
            TRACE
          </h1>
          <p className="text-[11px] text-[#908fa0] mt-1 font-medium leading-none">
            Email Forensics Platform
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (onTabChange) {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? "nav-item-active shadow-sm"
                  : "text-[#c7c4d7] hover:text-[#d7e3fb] hover:bg-[#1e2a3d]/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-3 mt-3 border-t border-[#1D293B]">
          <button
            onClick={() => onTabChange?.("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === "settings"
                ? "nav-item-active"
                : "text-[#c7c4d7] hover:text-[#d7e3fb] hover:bg-[#1e2a3d]/80"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#1D293B] text-[11px] text-[#908fa0] space-y-2 bg-[#09111F]/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[#d7e3fb] font-medium">All Systems Operational</span>
        </div>
        <div className="flex items-center gap-2 text-[#908fa0]">
          <span className="material-symbols-outlined text-[14px]">show_chart</span>
          <span>Uptime: 99.98%</span>
        </div>
      </div>
    </aside>
  );
}
