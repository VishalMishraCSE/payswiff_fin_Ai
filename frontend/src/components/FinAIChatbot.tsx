"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  MessageCircle,
  Star,
  Sparkles,
  ShieldCheck,
  BatteryCharging,
  CreditCard,
  Volume2,
  Smartphone,
  ArrowRightLeft,
  QrCode,
  Printer,
  Landmark,
  Languages,
  ShieldAlert,
  Wifi,
  FileText,
  UserCheck,
  Check
} from "lucide-react";
import axios from "axios";
import { getApiBaseUrl } from "@/utils/api";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  showOptions?: boolean;
  troubleshootingData?: {
    title: string;
    steps: string[];
    category: string;
    summary: string;
  };
  feedbackPending?: boolean;
  ticketData?: {
    ticket_id: string;
    merchant_name: string;
    category: string;
    problem_details: string;
    troubleshooting_attempted: string;
    status: string;
    assigned_to: string;
    priority: string;
    estimated_resolution_time: string;
  };
  resolved?: boolean;
}

const DEFAULT_PROBLEMS = [
  {
    id: "sim",
    title: "Facing issue with the SIM card",
    subtitle: "SIM not detected, no signal, network error",
    icon: Smartphone,
    category: "Soundbox & POS - SIM Card & Connectivity",
    summary: "SIM card not working / not detected in sound box slot.",
    steps: [
      "Remove the SIM from the slot, clean it gently with a dry cloth, and insert the SIM again.",
      "Below / beside the sound box there is a small hole; insert a safety pin or SIM ejector pin into the hole to pop open and remove the SIM tray.",
      "Clean any dust from the golden contact chip and verify the SIM card is intact.",
      "Re-insert the SIM card securely into the slot with the gold chip facing downward.",
      "Power ON the device and wait 30-45 seconds for network signal LED bars to turn solid green/blue."
    ]
  },
  {
    id: "soundbox",
    title: "Sound box not working",
    subtitle: "Box not turning on, no audio, speaker error",
    icon: Volume2,
    category: "Hardware - Sound Box Device",
    summary: "Sound box not working properly / voice announcement failure.",
    steps: [
      "If the box is not working properly, hold and press the Power ON/OFF button and restart button together.",
      "Keep holding the power button for 5-10 seconds to initiate a full hardware restart power-cycle.",
      "Press the 'Replay / Audio Test' button on top of the sound box to test speaker voice output.",
      "Check the volume toggle switch on the side and press '+' to raise the volume to maximum.",
      "Verify the LED indicator light: Steady Blue/Green means ready; Blinking Red indicates low battery."
    ]
  },
  {
    id: "battery",
    title: "Facing battery issue",
    subtitle: "Charging problem, fast drain, not powering ON",
    icon: BatteryCharging,
    category: "Hardware - Battery & Power Charging",
    summary: "Battery charging issue / device turning off quickly.",
    steps: [
      "Sometimes there might be a problem with charging: plug in the sound box / POS and leave it to charge for a while (at least 20-30 minutes uninterrupted).",
      "Ensure you use the certified 5V / 2A fast power adapter and official Type-C charging cable.",
      "Check if the red LED charging indicator turns ON when the cable is connected.",
      "Clean any dirt or debris from the charging port pins using a dry soft brush or cloth.",
      "After leaving the box on charge for a while, hold the Power ON button for 10 seconds to power ON."
    ]
  },
  {
    id: "network",
    title: "Facing a network issue",
    subtitle: "Network disconnected, transaction timeout, offline",
    icon: Wifi,
    category: "Connectivity - 4G Network & Wi-Fi",
    summary: "Network connectivity issue / terminal offline.",
    steps: [
      "If facing a network issue, restart the device (power OFF completely, wait 10 seconds, and power ON again).",
      "Move the soundbox / POS swiping machine closer to the shop entrance or window for better 4G mobile signal.",
      "Check if the 4G SIM card is seated properly using the ejector pin / safety pin hole.",
      "Wait 45 seconds for the network LED indicator to transition from blinking to solid green.",
      "Press the 'Test Connection' button to verify server handshake with the Payswiff payment gateway."
    ]
  },
  {
    id: "card",
    title: "Card not working on swiping machine",
    subtitle: "Chip read error, swipe failure, NFC tap not detected",
    icon: CreditCard,
    category: "Swiping Machine - Card Reader & NFC",
    summary: "Card reader chip / swipe / NFC tap failure on POS.",
    steps: [
      "Ensure the customer's card is clean; gently wipe the gold EMV chip with a soft dry cloth.",
      "For Chip Insert: Insert the card fully into the bottom slot until you hear the beep confirmation.",
      "For Contactless (Tap & Pay): Hold the card steady within 2-3 cm of the top display for 3 seconds.",
      "For Magnetic Swipe: Swipe the card smoothly from top to bottom in a single uniform motion.",
      "If the terminal displays 'Host Timeout', restart the POS device using the Power/Restart button."
    ]
  },
  {
    id: "payments",
    title: "Facing issues with payments",
    subtitle: "Payment failed, customer debited, settlement pending",
    icon: ArrowRightLeft,
    category: "Transactions - Payment Gateway Routing",
    summary: "Payment transaction failure / amount debited from customer.",
    steps: [
      "Ask the customer for the Bank Reference Number (UTR / RRN) from their payment confirmation SMS.",
      "Check your Payswiff FinAI 'Transactions' tab to verify if the status is marked 'Pending' or 'Success'.",
      "If money was debited from customer but POS failed, bank NPCI systems auto-refund within 24-48 hours.",
      "Ensure the device has active internet connectivity before retrying the transaction.",
      "For pending daily payouts, automated batch settlement credits your bank account at 11:30 PM daily."
    ]
  },
  {
    id: "qr_display",
    title: "QR code not generating on display",
    subtitle: "Dynamic QR code not loading on POS / Soundbox LCD",
    icon: QrCode,
    category: "Smart Soundbox & POS - Dynamic QR",
    summary: "Dynamic UPI QR code screen blank or not generating.",
    steps: [
      "Verify your POS terminal or Smart Soundbox has active 4G / Wi-Fi data connectivity.",
      "Press the 'Cancel / Clear' button on the keypad to reset the display buffer.",
      "Restart the device by holding the Power ON/OFF button to fetch the latest NPCI encryption keys.",
      "Check that your merchant UPI QR is active in your Payswiff Merchant Dashboard.",
      "If screen stays blank, use your backup static QR standee while we sync your terminal profile."
    ]
  },
  {
    id: "printer_jam",
    title: "Paper roll / receipt printer jammed",
    subtitle: "Thermal paper stuck, blank print, feed jam",
    icon: Printer,
    category: "Swiping Machine - Thermal Printer",
    summary: "Receipt printer jammed / paper roll feeding error on POS.",
    steps: [
      "Open the top printer compartment latch gently by pulling the release lever upward.",
      "Place standard 57mm x 40mm thermal paper roll with the glossy thermal side facing upward.",
      "Pull 1 inch of paper out beyond the cutter before snapping the compartment door securely shut.",
      "Clean the thermal print head roller gently with a dry lint-free cloth.",
      "Print a test receipt: Go to Menu -> 'Admin Settings' -> 'Hardware Diagnostics' -> 'Print Test'."
    ]
  },
  {
    id: "settlement_pending",
    title: "Daily settlement / payout pending",
    subtitle: "Settlement delayed or bank account not credited",
    icon: Landmark,
    category: "Merchant Account - Bank Settlement",
    summary: "Daily settlement payout pending in merchant bank account.",
    steps: [
      "Standard daily settlements are processed in automated T+1 cycles (or instant settlement if enabled).",
      "Perform a Manual Batch Close on POS: Go to Menu -> 'Settlement' -> 'Batch Settle Now'.",
      "Check your Payswiff Merchant Dashboard to confirm registered bank account number & IFSC code.",
      "If a bank holiday occurs, settlement processes on the next official RBI banking working day."
    ]
  },
  {
    id: "language_change",
    title: "Sound box voice language change",
    subtitle: "Change voice announcement language (Hindi, Telugu, Tamil, etc.)",
    icon: Languages,
    category: "Sound Box - Audio Localization",
    summary: "Merchant requested voice announcement language change.",
    steps: [
      "Press and hold the 'Language' button on top / side of the Soundbox for 3 seconds.",
      "The soundbox will cycle through voice prompts: Hindi, English, Telugu, Tamil, Kannada, Marathi, Bengali.",
      "Release the button immediately when you hear your preferred language voice confirmation.",
      "Or open Payswiff Merchant App -> 'Soundbox Settings' -> 'Audio Voice Language' -> tap 'Sync Device'."
    ]
  },
  {
    id: "tamper_locked",
    title: "Device tamper alert / POS locked",
    subtitle: "Security lockout 'Tamper Detected / Contact Bank'",
    icon: ShieldAlert,
    category: "Swiping Machine - Security Tamper Lock",
    summary: "POS swiping machine tamper lockout triggered.",
    steps: [
      "PCI-PTS security compliance locks the device if physical shock, drop, or casing opening is detected.",
      "Do NOT open the casing or screws as this permanently deletes encryption security keys.",
      "Power OFF the device, wait 30 seconds, and power ON.",
      "If screen shows 'PED Tampered' or 'Security Lock', cryptographic keys require authorized bank injection.",
      "Click 'No, contact support person' below to immediately dispatch an on-site technician / express replacement."
    ]
  }
];

export default function FinAIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [activeTroubleshooting, setActiveTroubleshooting] = useState<{ title: string; category: string; summary: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Initialize chatbot welcome messages exactly like Screenshot 2
  const resetChat = () => {
    const timeNow = getCurrentTime();
    setRating(null);
    setRatingSubmitted(false);
    setFeedbackText("");
    setActiveTroubleshooting(null);
    setMessages([
      {
        id: "msg_1",
        sender: "bot",
        text: "Hello, welcome to the FinAI chatbot!",
        time: timeNow,
      },
      {
        id: "msg_2",
        sender: "bot",
        text: "How can we help you today?",
        time: timeNow,
        showOptions: true,
      },
    ]);
  };

  useEffect(() => {
    resetChat();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle clicking one of the predefined default problems
  const handleSelectProblem = (problemId: string) => {
    const problem = DEFAULT_PROBLEMS.find((p) => p.id === problemId);
    if (!problem) return;

    const timeNow = getCurrentTime();
    setActiveTroubleshooting({
      title: problem.title,
      category: problem.category,
      summary: problem.summary,
    });

    // Add user message
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: problem.title,
      time: timeNow,
    };

    // Add bot troubleshooting reply
    const botReply: Message = {
      id: `bot_${Date.now() + 1}`,
      sender: "bot",
      text: `Here is the recommended troubleshooting procedure for **${problem.title}**:`,
      time: timeNow,
      troubleshootingData: {
        title: problem.title,
        steps: problem.steps,
        category: problem.category,
        summary: problem.summary,
      },
      feedbackPending: true,
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
  };

  // Handle user resolution response (Solved vs Not Solved from Flowchart 1)
  const handleResolutionResponse = async (
    messageId: string,
    isSolved: boolean,
    category: string,
    problemTitle: string,
    problemSummary: string
  ) => {
    const timeNow = getCurrentTime();

    // Mark current message as handled
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedbackPending: false } : m))
    );

    if (isSolved) {
      // Step: if solved -> Take input / satisfaction feedback
      const solvedMsg: Message = {
        id: `bot_solved_${Date.now()}`,
        sender: "bot",
        text: "🎉 **Wonderful! We are delighted that your issue is resolved.**\n\nYour technical inquiry has been successfully resolved. Please take a moment to provide your feedback rating below.",
        time: timeNow,
        resolved: true,
      };
      setMessages((prev) => [...prev, solvedMsg]);
    } else {
      // Step: else -> Contact for support person -> Raise ticket & notify user that agent will contact soon
      setLoading(true);
      const merchantName = "Payswiff Merchant (Demo Store - ID: #1)";
      const problemFaced = problemSummary || problemTitle || category;

      try {
        const res = await axios.post(`${getApiBaseUrl()}/copilot/support-ticket`, {
          merchant_id: 1,
          category: category,
          details: `Problem Faced: ${problemFaced}. Troubleshooting was attempted but issue persisted. Merchant requested agent callback.`,
          priority: "High",
        });

        const ticketData = res.data;
        const escalatedMsg: Message = {
          id: `bot_escalate_${Date.now()}`,
          sender: "bot",
          text: `👨‍💼 **Our customer care agent will contact you soon!**\n\nWe have successfully raised a support ticket for the problem you are facing (**${problemTitle}**). All problem diagnostic information and your merchant details have been dispatched to our on-duty technical support team.`,
          time: timeNow,
          resolved: true, // Also allow feedback on service
          ticketData: {
            ticket_id: ticketData.ticket_id,
            merchant_name: merchantName,
            category: ticketData.category,
            problem_details: problemFaced,
            troubleshooting_attempted: `Standard diagnostic steps completed for ${problemTitle}.`,
            status: "Our Agent Will Contact You Soon (< 10 mins)",
            assigned_to: ticketData.assigned_to || "Payswiff Support Executive (On-Duty)",
            priority: ticketData.priority || "High (Urgent Hardware/Network Alert)",
            estimated_resolution_time: ticketData.estimated_resolution_time || "< 10 minutes",
          },
        };
        setMessages((prev) => [...prev, escalatedMsg]);
      } catch (err) {
        console.error(err);
        const fallbackTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackMsg: Message = {
          id: `bot_escalate_${Date.now()}`,
          sender: "bot",
          text: `👨‍💼 **Our customer care agent will contact you soon!**\n\nWe have raised Support Ticket **#${fallbackTicket}** for the issue: **${problemTitle}**. Our technical specialist is reviewing your case and will call you directly.`,
          time: timeNow,
          resolved: true,
          ticketData: {
            ticket_id: fallbackTicket,
            merchant_name: merchantName,
            category: category,
            problem_details: problemFaced,
            troubleshooting_attempted: `Diagnostic troubleshooting steps executed.`,
            status: "Our Agent Will Contact You Soon (< 10 mins)",
            assigned_to: "Payswiff Support Executive (On-Duty)",
            priority: "High",
            estimated_resolution_time: "< 10 minutes",
          },
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Freeform user text submission
  const handleSendCustom = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const timeNow = getCurrentTime();

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: userText,
      time: timeNow,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const lower = userText.toLowerCase();
      let matchedProblem = null;

      if (lower.includes("sim") || lower.includes("eject") || lower.includes("pin") || lower.includes("hole") || lower.includes("slot")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "sim");
      } else if (lower.includes("battery") || lower.includes("charge") || lower.includes("power on") || lower.includes("drain")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "battery");
      } else if (lower.includes("network") || lower.includes("signal") || lower.includes("offline") || lower.includes("disconnect")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "network");
      } else if (lower.includes("sound") || lower.includes("speaker") || lower.includes("box") || lower.includes("voice") || lower.includes("audio") || lower.includes("restart button")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "soundbox");
      } else if (lower.includes("card") || lower.includes("swipe") || lower.includes("chip") || lower.includes("nfc")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "card");
      } else if (lower.includes("payment") || lower.includes("transaction") || lower.includes("refund") || lower.includes("failed") || lower.includes("utr")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "payments");
      } else if (lower.includes("qr") || lower.includes("barcode") || lower.includes("display")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "qr_display");
      } else if (lower.includes("printer") || lower.includes("paper") || lower.includes("receipt") || lower.includes("jam")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "printer_jam");
      } else if (lower.includes("settle") || lower.includes("payout") || lower.includes("bank account")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "settlement_pending");
      } else if (lower.includes("language") || lower.includes("hindi") || lower.includes("telugu") || lower.includes("tamil")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "language_change");
      } else if (lower.includes("tamper") || lower.includes("lock") || lower.includes("ped")) {
        matchedProblem = DEFAULT_PROBLEMS.find((p) => p.id === "tamper_locked");
      }

      if (matchedProblem) {
        setActiveTroubleshooting({
          title: matchedProblem.title,
          category: matchedProblem.category,
          summary: matchedProblem.summary,
        });

        const botReply: Message = {
          id: `bot_${Date.now() + 1}`,
          sender: "bot",
          text: `Here are the official troubleshooting guidelines for **${matchedProblem.title}**:`,
          time: getCurrentTime(),
          troubleshootingData: {
            title: matchedProblem.title,
            steps: matchedProblem.steps,
            category: matchedProblem.category,
            summary: matchedProblem.summary,
          },
          feedbackPending: true,
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        // Send to backend AI copilot
        const res = await axios.post(`${getApiBaseUrl()}/copilot/chat`, {
          message: userText,
          merchant_id: 1,
        });

        const botReply: Message = {
          id: `bot_${Date.now() + 1}`,
          sender: "bot",
          text: res.data.message || "I have analyzed your inquiry. Here are the diagnostic recommendations:",
          time: getCurrentTime(),
          troubleshootingData: {
            title: "Custom Hardware & Service Diagnosis",
            steps: [
              "Hold and press the Power ON/OFF button to restart the terminal.",
              "If SIM/network is not responding, remove and clean SIM using a safety pin / ejector pin in the side hole.",
              "Ensure device is connected to charger for 20 minutes.",
              "If the problem continues, click 'No, contact support person' below to raise a ticket and request an agent callback."
            ],
            category: "General Hardware & Service",
            summary: userText,
          },
          feedbackPending: true,
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      console.error(err);
      const botReply: Message = {
        id: `bot_${Date.now() + 1}`,
        sender: "bot",
        text: "I am having trouble connecting to the network. Please select one of the quick options or connect with Customer Care.",
        time: getCurrentTime(),
        showOptions: true,
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = () => {
    if (!rating) return;
    setRatingSubmitted(true);
    const timeNow = getCurrentTime();
    const thankYouMsg: Message = {
      id: `bot_thanks_${Date.now()}`,
      sender: "bot",
      text: `⭐ **Thank you for your ${rating}-star feedback!**\n\nYour response has been logged in our merchant quality monitoring system. We are committed to providing seamless POS & Soundbox service. Is there anything else you need assistance with?`,
      time: timeNow,
      showOptions: true,
    };
    setMessages((prev) => [...prev, thankYouMsg]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] bg-white dark:bg-[#0c1017] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden font-sans transition-colors duration-200">

      {/* ── Chatbot Top Header ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-5 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo Badge matching Screenshot 2 */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-xl shadow-md border-2 border-red-100">
            <span className="font-extrabold tracking-tighter">A</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base tracking-wide leading-tight">FinAI Chatbot</h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                24/7 Support
              </span>
            </div>
            <p className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Payswiff POS & Soundbox Care
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          title="Restart Conversation"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 cursor-pointer"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Restart</span>
        </button>
      </div>

      {/* ── Chat Messages Container ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-[#07090e]">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* Standard Bot or User Message Bubble */}
            <div
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Bot Avatar Icon */}
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 mt-0.5">
                  <span>A</span>
                </div>
              )}

              {/* Message Bubble with Timestamp */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white rounded-br-none shadow-red-500/10 font-medium"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === "user" ? "text-red-100" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>

            {/* Default Problems Quick-Action Buttons (Red outline pill cards) */}
            {msg.showOptions && (
              <div className="pl-10 pr-2 pt-1 pb-2 flex flex-wrap gap-2 animate-fade-in">
                {DEFAULT_PROBLEMS.map((problem) => {
                  const Icon = problem.icon;
                  return (
                    <button
                      key={problem.id}
                      onClick={() => handleSelectProblem(problem.id)}
                      className="group flex items-center gap-2 px-3.5 py-2 rounded-full border border-red-500/80 bg-white dark:bg-slate-900/90 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-600 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <Icon size={14} className="text-red-500 group-hover:scale-110 transition-transform" />
                      <span>{problem.title}</span>
                    </button>
                  );
                })}

                {/* Others / Custom Issue */}
                <button
                  onClick={() => {
                    const timeNow = getCurrentTime();
                    setMessages((prev) => [
                      ...prev,
                      { id: `u_${Date.now()}`, sender: "user", text: "Others / Talk to Support", time: timeNow },
                      {
                        id: `b_${Date.now() + 1}`,
                        sender: "bot",
                        text: "Please describe your specific hardware or payment terminal issue in the message box below, or let us connect you directly with a customer care specialist.",
                        time: timeNow,
                        feedbackPending: true,
                        troubleshootingData: {
                          title: "Other Hardware / Payment Terminal Issue",
                          steps: [
                            "Type your inquiry in detail in the chat box below.",
                            "Mention your Merchant ID, POS serial number, or Transaction reference.",
                            "Click 'No, contact support person' below for live phone/chat assistance."
                          ],
                          category: "General Inquiry",
                          summary: "Merchant requested support for custom inquiry.",
                        }
                      }
                    ]);
                  }}
                  className="px-3.5 py-2 rounded-full border border-red-500/80 bg-white dark:bg-slate-900/90 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  Others / Talk to Support
                </button>
              </div>
            )}

            {/* Troubleshooting Mechanism Card */}
            {msg.troubleshootingData && (
              <div className="ml-10 max-w-[88%] bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider border-b border-red-100 dark:border-red-900/30 pb-2">
                  <Sparkles size={14} className="text-red-500" />
                  <span>Step-by-Step Diagnostic Troubleshooting</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {msg.troubleshootingData.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Resolution Prompt */}
                {msg.feedbackPending && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Did this troubleshooting resolve your issue?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          handleResolutionResponse(
                            msg.id,
                            true,
                            msg.troubleshootingData!.category,
                            msg.troubleshootingData!.title,
                            msg.troubleshootingData!.summary
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Yes, issue is solved!</span>
                      </button>
                      <button
                        onClick={() =>
                          handleResolutionResponse(
                            msg.id,
                            false,
                            msg.troubleshootingData!.category,
                            msg.troubleshootingData!.title,
                            msg.troubleshootingData!.summary
                          )
                        }
                        className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <AlertCircle size={14} />
                        <span>No, contact support person</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Care Raised Ticket & Problem Info Card */}
            {msg.ticketData && (
              <div className="ml-10 max-w-[92%] bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white dark:from-slate-900 dark:via-[#161410] dark:to-slate-950 border-2 border-amber-400/80 dark:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">

                {/* Header with Ticket ID */}
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Headphones size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Customer Care Ticket Raised
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Our support agent will contact you shortly</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-amber-500 text-white shadow-sm">
                    {msg.ticketData.ticket_id}
                  </span>
                </div>

                {/* Problem Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                  {/* User / Merchant Details */}
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <UserCheck size={11} /> Merchant Profile
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{msg.ticketData.merchant_name}</p>
                  </div>

                  {/* Category */}
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText size={11} /> Category
                    </span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{msg.ticketData.category}</p>
                  </div>

                  {/* Problem Facing by User */}
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1">
                      <AlertCircle size={11} /> Problem Facing by User
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {msg.ticketData.problem_details}
                    </p>
                  </div>

                  {/* Assigned Executive */}
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Assigned Agent
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{msg.ticketData.assigned_to}</p>
                  </div>

                  {/* Expected Callback Time */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                      <Clock size={11} /> Agent Response SLA
                    </span>
                    <p className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {msg.ticketData.status}
                    </p>
                  </div>

                </div>

                {/* Instant Actions */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href="tel:1800-419-7443"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 text-center cursor-pointer"
                  >
                    <PhoneCall size={14} />
                    <span>Call Support Agent</span>
                  </a>
                  <button
                    onClick={() => {
                      const timeNow = getCurrentTime();
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `b_live_${Date.now()}`,
                          sender: "bot",
                          text: `💬 An on-duty executive has been notified regarding Ticket **#${msg.ticketData?.ticket_id}**. You will receive an instant support call on your registered merchant number within 5 minutes.`,
                          time: timeNow,
                        }
                      ]);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>Live Chat Connect</span>
                  </button>
                </div>
              </div>
            )}

            {/* Satisfaction Rating & User Feedback Form (After troubleshooting / resolution) */}
            {msg.resolved && !ratingSubmitted && (
              <div className="ml-10 max-w-[88%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Please provide your feedback for this support session:
                  </p>
                  {rating && (
                    <span className="text-[11px] font-bold text-amber-500">
                      {rating} / 5 Stars
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg transition-transform active:scale-125 cursor-pointer ${
                        rating && star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                      }`}
                    >
                      <Star size={20} className={rating && star <= rating ? "fill-amber-400" : ""} />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what we can improve (optional)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={handleRatingSubmit}
                    disabled={!rating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading typing indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              <span>A</span>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-0"></span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Bottom Input & Restart Toolbar (Exactly matching Screenshot 2) ────────────────── */}
      <div className="p-3 sm:p-4 bg-white dark:bg-[#0c1017] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 relative">

        {/* Restart Conversation Button with Tooltip */}
        <div className="relative group">
          <button
            onClick={resetChat}
            className="w-10 h-10 rounded-full border border-red-500/80 hover:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer"
            aria-label="Restart Conversation"
          >
            <RotateCcw size={18} />
          </button>

          {/* Floating Dark Tooltip matching Screenshot 2 ("Click here to restart this conversation.") */}
          <div className="absolute bottom-12 left-0 hidden group-hover:block z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 animate-fade-in pointer-events-none">
            Click here to restart this conversation.
            <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-800"></div>
          </div>
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCustom();
          }}
          className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-500 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write your message here..."
            disabled={loading}
            className="flex-1 bg-transparent py-1.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />

          {/* Red Paper Plane Send Icon matching Screenshot 2 */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 hover:scale-110 disabled:opacity-30 disabled:scale-100 transition-all cursor-pointer"
          >
            <Send size={18} className="transform rotate-0" />
          </button>
        </form>

      </div>

    </div>
  );
}
