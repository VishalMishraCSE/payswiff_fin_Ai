"use client";

import React, { useState } from "react";
import {
  FileCheck,
  UploadCloud,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Info,
  Clock,
  ShieldCheck
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";

export default function KYCPage() {
  const [docType, setDocType] = useState("PAN");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("document_type", docType);
    formData.append("merchant_id", "1");

    try {
      const res = await axios.post(`${getApiBaseUrl()}/kyc/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      console.error("KYC upload error:", err);
      alert("Failed to connect to the KYC microservice. Check if the backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-[#07090e] transition-colors duration-300">

      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Sparkles size={12} className="animate-pulse" />
          <span>Intelligent Document Parsing</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          KYC verification
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload commercial certificates or identity cards. OpenCV checks resolution and skew, and EasyOCR extracts merchant data autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto w-full">

        {/* Left Side: Upload Panel */}
        <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Document</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-850 dark:text-slate-250 cursor-pointer"
              >
                <option value="PAN">Permanent Account Number (PAN Card)</option>
                <option value="Aadhaar">Aadhaar Card (UIDAI Identity)</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-all relative ${
                dragActive
                  ? "border-indigo-500 bg-indigo-550/5"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 hover:border-slate-350 dark:hover:border-slate-700"
              }`}
            >
              <UploadCloud size={32} className="text-slate-400" />
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : "Drag & drop file here"}
                </span>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, or PDF (Max 5MB)</p>
              </div>

              {!selectedFile && (
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer mt-2">
                  Browse File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Processing EasyOCR Pipeline...</span>
                </>
              ) : (
                <span>Verify Document</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Verification Logs */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Analysis Results</h3>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock size={10} />
                  <span>{result.kyc_status}</span>
                </span>
              </div>

              {/* Quality metric */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">OpenCV Blur Rating</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white mt-1 block">{result.blur_score}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">{result.quality_status}</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID Extracted</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-2 block break-all">{result.extracted_id_number}</span>
                </div>
              </div>

              {/* OCR Text Preview */}
              <div className="space-y-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Raw Extracted OCR Text:</span>
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed max-h-24 overflow-y-auto">
                  {result.ocr_preview}
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="bg-[#eff6ff] dark:bg-indigo-950/10 border border-blue-200 dark:border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="text-blue-600 dark:text-indigo-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-xs text-blue-900 dark:text-indigo-300">`[AgenticAI]` Parser Recommendation</h4>
                  <p className="text-[11px] text-blue-800 dark:text-slate-350 leading-relaxed mt-1 font-medium">{result.recommendation}</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center text-slate-400 h-64">
              <FileText size={32} className="text-slate-450 mb-3" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">No Document Analyzed</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Upload commercial ID documents to activate the EasyOCR security compliance parser.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
