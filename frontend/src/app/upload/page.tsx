"use client";

import React, { useState } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const response = await fetch("http://localhost:8000/api/v1/emails/upload?sync_mode=true", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      alert(`Successfully analyzed ${selectedFile.name}. Risk Score: ${data.risk_score}`);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      alert("Failed to ingest email.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C16] p-6 text-[#d7e3fb]">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#1D293B] bg-[#0D1726] p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#908fa0]">Ingest</p>
            <h1 className="mt-2 text-3xl font-bold">Upload Email Artifact</h1>
          </div>
          <span className="material-symbols-outlined text-3xl text-indigo-400">upload_file</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#464554] bg-[#09111F] p-10 text-center transition hover:border-indigo-500">
            <span className="material-symbols-outlined text-4xl text-[#908fa0]">upload</span>
            <span className="mt-3 text-sm text-[#d7e3fb]">
              {selectedFile ? selectedFile.name : "Drop .eml or .msg here, or click to browse"}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".eml,.msg,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isSubmitting ? "Analyzing..." : "Analyze Email"}
            </button>
            <a href="/dashboard" className="text-sm text-[#8083ff] hover:text-[#c0c1ff]">
              Back to Dashboard
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
