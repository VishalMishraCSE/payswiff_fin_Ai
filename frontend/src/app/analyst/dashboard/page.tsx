"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Search,
  RefreshCw,
  Clock,
  UserCheck,
  Eye,
  FileText
} from "lucide-react";
import axios from "axios";

interface KYCDocument {
  id: number;
  merchant_id: number;
  business_name: string;
  document_type: string;
  blur_score: number;
  extracted_text: string;
  status: string;
  created_at: string;
}

export default function AnalystDashboard() {
  const [kycQueue, setKycQueue] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchKYCQueue = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/kyc/list");
      setKycQueue(res.data);
    } catch (err) {
      console.error("Failed to load KYC queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCQueue();
  }, []);

  const handleVerify = async (docId: number, approve: boolean) => {
    setActionLoading(true);
    const status = approve ? "verified" : "rejected";
    const formData = new FormData();
    formData.append("status", status);

    try {
      await axios.post(`http://localhost:8000/kyc/verify/${docId}`, formData);
      setSelectedDoc(null);
      fetchKYCQueue();
    } catch (err) {
      console.error("Error verifying document:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = kycQueue.filter(doc => doc.status === "pending").length;
  const verifiedCount = kycQueue.filter(doc => doc.status === "verified").length;
  const rejectedCount = kycQueue.filter(doc => doc.status === "rejected").length;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-[#07090e] transition-colors duration-300">

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450 font-bold text-xs uppercase tracking-widest mb-1">
            <ShieldAlert size={12} />
            <span>Compliance & Operations</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Analyst Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review security-flagged entities, verify uploaded business credentials, and override automated machine learning classifications.
          </p>
        </div>
        <button
          onClick={fetchKYCQueue}
          className="flex items-center gap-2 bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-250 cursor-pointer"
        >
          <RefreshCw size={12} className={`${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101a] p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending Reviews</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-black text-amber-500">{pendingCount}</span>
            <Clock className="text-amber-500" size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101a] p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Approved Credentials</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-black text-emerald-500">{verifiedCount}</span>
            <CheckCircle2 className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101a] p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Rejected Requests</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-black text-rose-500">{rejectedCount}</span>
            <XCircle className="text-rose-500" size={24} />
          </div>
        </div>

      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch max-w-7xl mx-auto w-full">

        {/* Left Side: Pending List */}
        <div className="flex-1 bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Credentials Review Queue</h3>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-indigo-500" size={20} />
              <span>Fetching compliance items...</span>
            </div>
          ) : kycQueue.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-450 flex flex-col items-center justify-center gap-2">
              <FileCheck size={28} className="text-slate-500" />
              <span>No document submissions pending review</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Merchant Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">OpenCV Quality</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                  {kycQueue.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all">
                      <td className="py-4 pl-2 font-semibold text-slate-800 dark:text-slate-200">
                        {doc.business_name}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 font-bold">{doc.document_type}</td>
                      <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">
                        {doc.blur_score} (Quality: {doc.blur_score >= 100 ? "Pass" : "Warn"})
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.status === "verified"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : doc.status === "rejected"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-right">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-500 hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Document Details Panel */}
        <div className="w-full lg:w-96 space-y-6">
          {selectedDoc ? (
            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Credentials Review</h3>
                <span className="text-[10px] text-slate-400 font-mono">Doc ID: #{selectedDoc.id}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Merchant Profile</label>
                <p className="text-sm font-black text-slate-800 dark:text-white">{selectedDoc.business_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Merchant Account ID: {selectedDoc.merchant_id}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Type</label>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{selectedDoc.document_type} Identification</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Raw OCR Parse Output</label>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                  {selectedDoc.extracted_text}
                </div>
              </div>

              {/* Action buttons */}
              {selectedDoc.status === "pending" && (
                <div className="flex items-center gap-3 pt-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(selectedDoc.id, true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Merchant</span>
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(selectedDoc.id, false)}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                  >
                    <XCircle size={14} />
                    <span>Reject Merchant</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800/65 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center text-slate-450 h-72">
              <Eye size={28} className="mb-3 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Inspector Panel</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">Select a merchant record from the queue to view raw text extractions and override kyc state values.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
