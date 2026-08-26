"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  Database,
  Sliders,
  Play,
  Headphones,
  Cpu
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";
import FinAIChatbot from "@/components/FinAIChatbot";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  actionPending?: boolean;
  actionCard?: {
    action_id: string;
    title: string;
    description: string;
    confirm_label: string;
    cancel_label: string;
  };
}

export default function CopilotPage() {
  const [activeMode, setActiveMode] = useState<"customer_care" | "financial_copilot">("financial_copilot");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your **FinAI Copilot**.\n\nI have access to ShieldAI security tools and GenAI reasoning. You can ask me to inspect transactions, summarize reports, or modify safety rate limits."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${getApiBaseUrl()}/copilot/chat`, {
        message: textToSend,
        merchant_id: 1
      });

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: res.data.message,
        actionPending: res.data.action_pending || false,
        actionCard: res.data.action_card || undefined
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "I encountered an error connecting to the Copilot Gateway. Please make sure the backend server is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionId: string, approved: boolean) => {
    setLoading(true);
    try {
      const res = await axios.post(`${getApiBaseUrl()}/copilot/approve`, {
        action_id: actionId,
        approved: approved
      });

      // Append confirmation message
      setMessages((prev) => [
        ...prev.map(m => m.actionCard?.action_id === actionId ? { ...m, actionPending: false } : m),
        {
          id: `auth_${Date.now()}`,
          sender: "ai",
          text: approved
            ? `### ShieldAI Action Executed\n${res.data.message}`
            : `### ShieldAI Action Cancelled\n${res.data.message}`
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    { text: "Show failed UPI transactions", icon: Database },
    { text: "Inspect transaction #105", icon: ShieldAlert },
    { text: "Set rate limit to 300 req/min", icon: Sliders },
    { text: "Generate performance summary", icon: Sparkles }
  ];

  const renderLineElement = (line: string, index: number) => {
    let content = line;

    // Parse markdown-style titles
    if (content.startsWith("### ")) {
      return <h3 key={index} className="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">{content.replace("### ", "")}</h3>;
    }
    if (content.startsWith("#### ")) {
      return <h4 key={index} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">{content.replace("#### ", "")}</h4>;
    }

    // Parse list items
    const isListItem = content.startsWith("* ") || content.startsWith("- ");
    if (isListItem) {
      content = content.substring(2);
    }

    // Replace markdown-style bold **text**
    const parts = content.split(/\*\*(.*?)\*\*/g);
    const renderedLine = parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-indigo-600 dark:text-indigo-400">{part}</strong>;
      }
      // Check for inline codes like `code`
      const codeParts = part.split(/`(.*?)`/g);
      return codeParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return <code key={subIdx} className="bg-slate-100 dark:bg-slate-800 text-rose-500 px-1.5 py-0.5 rounded font-mono text-xs">{subPart}</code>;
        }
        return subPart;
      });
    });

    if (isListItem) {
      return <li key={index} className="ml-4 list-disc text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{renderedLine}</li>;
    }

    if (!content.trim()) return null;

    return <p key={index} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-1.5 min-h-[1rem]">{renderedLine}</p>;
  };

  const renderMessageBody = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = (key: string | number) => {
      if (tableRows.length === 0) return;

      const headers = tableRows[0].split("|").slice(1, -1).map(s => s.trim());

      let startIndex = 1;
      if (tableRows.length > 1) {
        const secondRowClean = tableRows[1].replace(/\s/g, "");
        if (/^[|:-]+$/.test(secondRowClean)) {
          startIndex = 2;
        }
      }

      const dataRows = tableRows.slice(startIndex).map(row => {
        return row.split("|").slice(1, -1).map(s => s.trim());
      });

      elements.push(
        <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/20">
              {dataRows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-[#0c111e] transition-colors">
                  {row.map((cell, cellIdx) => {
                    const headerName = headers[cellIdx]?.toLowerCase() || "";

                    if (headerName === "status") {
                      const isSuccess = cell.toLowerCase() === "success";
                      const isFailed = cell.toLowerCase() === "failed";
                      const isPending = cell.toLowerCase() === "pending";
                      let badgeClass = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                      if (isSuccess) badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400";
                      if (isFailed) badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400";
                      if (isPending) badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400";

                      return (
                        <td key={cellIdx} className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}`}>
                            {cell}
                          </span>
                        </td>
                      );
                    }

                    if (headerName.includes("fraud")) {
                      const score = parseFloat(cell);
                      if (!isNaN(score)) {
                        const isHigh = score > 0.5;
                        const isMid = score > 0.2 && score <= 0.5;
                        let badgeClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400";
                        if (isHigh) badgeClass = "bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400";
                        if (isMid) badgeClass = "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400";
                        return (
                          <td key={cellIdx} className="px-4 py-3 whitespace-nowrap font-mono font-bold">
                            <span className={`px-1.5 py-0.5 rounded ${badgeClass}`}>
                              {(score * 100).toFixed(0)}%
                            </span>
                          </td>
                        );
                      }
                    }

                    if (headerName.includes("amount")) {
                      return (
                        <td key={cellIdx} className="px-4 py-3 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                          {cell.startsWith("₹") || cell.startsWith("$") ? cell : `₹${cell}`}
                        </td>
                      );
                    }

                    return (
                      <td key={cellIdx} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableLine = line.trim().startsWith("|") && line.trim().endsWith("|");

      if (isTableLine) {
        if (!inTable) {
          inTable = true;
        }
        tableRows.push(line.trim());
      } else {
        if (inTable) {
          flushTable(i);
          inTable = false;
        }
        const rendered = renderLineElement(line, i);
        if (rendered) {
          elements.push(rendered);
        }
      }
    }

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-[#07090e] transition-colors duration-300">

      {/* Header & Mode Switcher */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles size={12} className="animate-pulse" />
            <span>Interactive AI Operations</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {activeMode === "customer_care" ? "FinAI Chatbot" : "FinAI Security Copilot"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeMode === "customer_care"
              ? "Automated hardware diagnostics, troubleshooting, and 24/7 customer care dispatch."
              : "Autonomous multi-agent chatbot capable of direct database execution and security override configurations."}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold shrink-0 shadow-inner">
          <button
            onClick={() => setActiveMode("customer_care")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer ${
              activeMode === "customer_care"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Headphones size={13} />
            <span>Customer Care Bot</span>
          </button>
          <button
            onClick={() => setActiveMode("financial_copilot")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer ${
              activeMode === "financial_copilot"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Cpu size={13} />
            <span>Security Copilot</span>
          </button>
        </div>
      </div>

      {/* Mode 1: FinAI Customer Care Chatbot (Reference to Screenshot 2 & Flowchart 1) */}
      {activeMode === "customer_care" ? (
        <div className="flex justify-center w-full max-w-4xl mx-auto pb-6">
          <FinAIChatbot />
        </div>
      ) : (
        /* Mode 2: Financial Analyst & SQL Copilot */
        <div className="flex-1 flex flex-col md:flex-row gap-6 items-stretch max-w-7xl mx-auto w-full">

        {/* Left column: Chatbox */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden h-[580px]">

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 items-start ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`p-2.5 rounded-xl border shrink-0 ${
                  msg.sender === "user"
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Bubble */}
                <div className="space-y-3 max-w-[80%]">
                  <div className={`p-4 rounded-2xl text-left border ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10"
                      : "bg-slate-50 dark:bg-slate-900/30 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800/50"
                  }`}>
                    {renderMessageBody(msg.text)}
                  </div>

                  {/* Human-in-the-loop Action Card */}
                  {msg.actionPending && msg.actionCard && (
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-500/30 rounded-2xl p-5 space-y-4 animate-pulse">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Sliders size={14} />
                        <span>Action Pending Authorization</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{msg.actionCard.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{msg.actionCard.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleAction(msg.actionCard!.action_id, true)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          {msg.actionCard.confirm_label}
                        </button>
                        <button
                          onClick={() => handleAction(msg.actionCard!.action_id, false)}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          {msg.actionCard.cancel_label}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 items-start">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 animate-spin">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-0" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat input form */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/10 flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about transactions, config overrides..."
              disabled={loading}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

        {/* Right column: Quick Suggests & System Capabilities */}
        <div className="w-full md:w-80 space-y-6">

          {/* Quick suggestions */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quick Queries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click a chip below to quickly check simulated queries and tool executions.</p>

            <div className="flex flex-col gap-2.5">
              {suggestionChips.map((chip, idx) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    disabled={loading}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/20 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <Icon size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span>{chip.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Framework indicators */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Agent capabilities</h3>

            <div className="space-y-3.5">
              <div className="flex gap-3 items-start text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0 font-mono">SQL</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">query_database_tool</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Reads transactional schemas and builds safe aggregates on request.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start text-xs">
                <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold shrink-0 font-mono">ML</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">fraud_investigation_tool</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Scans XGBoost weights and outputs local SHAP parameters.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold shrink-0 font-mono">HITL</span>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">update_settings_tool</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Modifies limits and overrides, requiring manual UI permission tokens.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
      )}
    </div>
  );
}
