import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACE Email Forensics Platform",
  description: "Enterprise cyber-security email forensics, header tracing, authentication analysis, and threat graph detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#070C16] text-[#d7e3fb] antialiased selection:bg-[#6366F1] selection:text-white">
        {children}
      </body>
    </html>
  );
}
