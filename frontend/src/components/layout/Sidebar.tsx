"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onOpenIngest?: () => void;
}

export function Sidebar({
  onOpenIngest,
}: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems = [
    { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "ingest", href: "/upload", label: "Ingest Email", icon: "upload_file" },
    { id: "analysis", href: "/analysis", label: "Analysis", icon: "analytics" },
    { id: "authentication", href: "/authentication", label: "Authentication", icon: "verified_user" },
    { id: "relay", href: "/relay", label: "Relay Trace", icon: "route" },
    { id: "graph", href: "/graph", label: "Threat Graph", icon: "hub" },
    { id: "risk", href: "/risk", label: "Risk Assessment", icon: "warning" },
    { id: "cases", href: "/cases", label: "Cases", icon: "folder_open" },
    { id: "evidence", href: "/evidence", label: "Evidence", icon: "fingerprint" },
    { id: "reports", href: "/reports", label: "Reports", icon: "description" },
    { id: "alerts", href: "/alerts", label: "Alerts", icon: "notifications", badge: "3" },
  ];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-[#101c2d] border-r border-[#1D293B] flex flex-col h-full z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#1D293B]/50">
        <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/40 text-[#c0c1ff] shadow-[0_0_12px_rgba(99,102,241,0.25)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 16V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3.34315 17L7.58579 14.8787" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16.4142 9.12132L20.6569 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3.34315 7L7.58579 9.12132" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16.4142 14.8787L20.6569 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
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
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          
          return (
            <Link
              key={item.id}
              href={item.href}
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
            </Link>
          );
        })}

        {/* Separator */}
        <div className="pt-3 mt-3 border-t border-[#1D293B]">
          <Link
            href="/settings"
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              pathname === "/settings"
                ? "nav-item-active"
                : "text-[#c7c4d7] hover:text-[#d7e3fb] hover:bg-[#1e2a3d]/80"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
            <span>Settings</span>
          </Link>
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
