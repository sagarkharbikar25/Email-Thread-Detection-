import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACE Email Forensics Platform",
  description: "Enterprise cyber-security email forensics, header tracing, authentication analysis, and threat graph detection.",
};

import { Sidebar } from "../components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="flex h-screen overflow-hidden bg-[#070C16] text-[#d7e3fb] antialiased selection:bg-[#6366F1] selection:text-white" suppressHydrationWarning>
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070C16]">
          {children}
        </div>
      </body>
    </html>
  );
}
