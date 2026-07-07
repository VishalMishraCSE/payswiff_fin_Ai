"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Smartphone,
  ArrowLeft,
  Check,
  ChevronRight,
  Delete,
  Lock,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

function MockUpiPayContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchant_id") || "1";

  const [customerName, setCustomerName] = useState("Aditya Roy");
  const [customerEmail, setCustomerEmail] = useState("aditya.roy@live.com");
  const [amount, setAmount] = useState("500");
  const [note, setNote] = useState("Lunch with friends");

  const [step, setStep] = useState<"details" | "pin" | "processing" | "success" | "failed" | "error">("details");
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [fraudScore, setFraudScore] = useState(0);
  const [txnRef, setTxnRef] = useState("");

  const playGPayChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, start: number, duration: number, vol: number = 0.08) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime + start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration + 0.05);
      };
      playNote(523.25, 0.0, 0.2);
      playNote(659.25, 0.08, 0.2);
      playNote(783.99, 0.16, 0.2);
      playNote(1046.50, 0.24, 0.45);
    } catch (e) {
      console.error("GPay sound synthesis failed", e);
    }
  };

  const playWarningBuzz = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, start: number, duration: number, vol: number = 0.08) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime + start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration + 0.05);
      };
      playNote(160.0, 0.0, 0.25);
      playNote(160.0, 0.3, 0.25);
    } catch (e) {
      console.error("Warning buzz failed", e);
    }
  };

  const handleKeyPress = (val: string) => {
    if (val === "backspace") {
      setPinDigits((prev) => prev.slice(0, -1));
    } else if (val === "confirm") {
      if (pinDigits.length === 4) {
        processPayment();
      }
    } else {
      if (pinDigits.length < 4) {
        setPinDigits((prev) => [...prev, val]);
      }
    }
  };

  const processPayment = async () => {
    setStep("processing");
    try {
      const apiBase = `${window.location.origin}/api/backend`;
      const res = await fetch(`${apiBase}/transactions/mock-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          amount: parseFloat(amount),
          payment_method: "UPI",
          merchant_id: parseInt(merchantId, 10),
        }),
      });

      if (!res.ok) throw new Error(`Server returned code ${res.status}`);

      const data = await res.json();
      setFraudScore(data.fraud_score);
      setTxnRef(data.reference_id || "");

      setTimeout(() => {
        if (data.status === "Success") {
          playGPayChime();
          setStep("success");
          setStatusMessage(data.is_fraud
            ? `Demo completed. ML flagged security alert: ${(data.fraud_score * 100).toFixed(0)}%`
            : `Paid to Payswiff Demo Store`
          );
        } else {
          playWarningBuzz();
          setStep("failed");
          setStatusMessage(data.is_fraud
            ? `Blocked: High fraud probability (${(data.fraud_score * 100).toFixed(0)}%)`
            : "Simulated card network validation failed."
          );
        }
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setStep("error");
      setStatusMessage(`Unable to connect to gateway: ${err.message || err}`);
    }
  };

  const resetForm = () => {
    setStep("details");
    setPinDigits([]);
    setTxnRef("");
    setFraudScore(0);
    setStatusMessage("");
  };

  return (
    <div className="min-h-dvh bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-3 font-sans select-none">
      <div className="w-full max-w-[400px] bg-[#0d111d]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col min-h-[85dvh] max-h-[95dvh] justify-between backdrop-blur-xl">

        {/* Step 1: Payment Details */}
        {step === "details" && (
          <div className="flex flex-col h-full justify-between p-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <button className="p-2 hover:bg-slate-800/50 rounded-full transition-all text-slate-400">
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase text-slate-400">
                <ShieldCheck size={11} className="text-teal-400" />
                <span>Sandbox Mode</span>
              </div>
              <HelpCircle size={18} className="text-slate-500" />
            </div>

            {/* Merchant Profile */}
            <div className="flex flex-col items-center text-center mt-3 space-y-1.5 flex-shrink-0">
              <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                P
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Payswiff Demo Store</h2>
                <p className="text-[10px] text-slate-500 font-medium">payswiff@axisbank • UPI</p>
              </div>
            </div>

            {/* Amount + Note */}
            <div className="space-y-3 my-auto py-4 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-4xl font-black text-white">
                  <span className="text-2xl font-medium text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center outline-none w-40 font-black focus:ring-0 text-white placeholder-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="1"
                  />
                </div>
                <div className="w-28 h-[1px] bg-slate-800 mt-1.5"></div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note"
                  className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full focus:ring-0 p-0"
                />
              </div>

              {/* Simulator info */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-1">Simulator Info</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Bank & Pay Button */}
            <div className="space-y-2.5 flex-shrink-0">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-[10px]">
                    HB
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">HDFC Bank **** 4321</p>
                    <p className="text-[9px] text-slate-500">Demo balance: ₹50,000</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-500" />
              </div>

              <button
                onClick={() => setStep("pin")}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/10 transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer uppercase tracking-wider"
              >
                Pay ₹{parseFloat(amount || "0").toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: UPI PIN */}
        {step === "pin" && (
          <div className="flex flex-col h-full bg-[#090b11] justify-between p-5">
            <div className="flex items-center justify-between border-b border-slate-800/85 pb-3">
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase">Paying</h3>
                <h2 className="text-sm font-black text-white">Payswiff Demo Store</h2>
              </div>
              <div className="text-right">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase">Amount</h3>
                <h2 className="text-sm font-black text-white">₹{parseFloat(amount || "0").toLocaleString()}</h2>
              </div>
            </div>

            <div className="my-auto text-center space-y-4">
              <div>
                <h1 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter 4-Digit UPI PIN</h1>
                <p className="text-[10px] text-slate-500 mt-0.5">Simulated secure sandbox</p>
              </div>
              <div className="flex justify-center gap-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full border-2 transition-all duration-150 ${
                      pinDigits.length > idx
                        ? "bg-indigo-500 border-indigo-500 scale-125 shadow-lg shadow-indigo-500/30"
                        : "border-slate-700 bg-slate-900"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-2">
              <Lock size={11} className="text-indigo-400" />
              <span>Secured by FinAI Shield</span>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-1 border-t border-slate-800/40 pt-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="py-3 text-lg font-bold text-white hover:bg-slate-800/30 rounded-xl transition-all active:scale-90"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress("backspace")}
                className="py-3 text-slate-400 flex items-center justify-center hover:bg-slate-800/30 rounded-xl transition-all"
              >
                <Delete size={18} />
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="py-3 text-lg font-bold text-white hover:bg-slate-800/30 rounded-xl transition-all active:scale-90"
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress("confirm")}
                disabled={pinDigits.length < 4}
                className="py-3 text-indigo-400 flex items-center justify-center hover:bg-slate-800/30 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
              >
                <Check size={22} className="bg-indigo-500/10 p-0.5 rounded-full border border-indigo-500/20" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="flex flex-col h-full justify-center items-center p-6 space-y-5">
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
              <div className="absolute h-14 w-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                <Smartphone size={22} className="animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-sm font-bold text-white">Processing payment...</h2>
              <p className="text-[11px] text-slate-500">Evaluating transaction risk in real-time</p>
            </div>
          </div>
        )}

        {/* Step 4: Success — Large Green Tick Animation */}
        {step === "success" && (
          <div className="flex flex-col h-full justify-between items-center p-5 bg-[#04080f]/90 relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-72 w-72 bg-emerald-500/8 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="my-auto flex flex-col items-center text-center space-y-5 relative z-10">
              {/* Large animated green tick */}
              <div className="relative">
                {/* Outer ring pulse */}
                <div className="absolute inset-0 h-32 w-32 rounded-full bg-emerald-500/10 animate-ping"></div>
                {/* Main tick circle */}
                <div
                  className="h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative"
                  style={{ animation: "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
                >
                  <Check size={64} className="text-white stroke-[3]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-3xl font-black text-emerald-400">₹{parseFloat(amount).toLocaleString()}</h1>
                <p className="text-sm font-bold text-white">{statusMessage}</p>
                {txnRef && (
                  <p className="text-[10px] text-slate-500 font-mono">Ref: {txnRef}</p>
                )}
              </div>

              {fraudScore > 0 && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 max-w-[260px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Safety Index</p>
                  <p className="text-xs text-slate-200 mt-0.5">{((1 - fraudScore) * 100).toFixed(0)}% secure</p>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider relative z-10"
            >
              Done — Make Another Payment
            </button>
          </div>
        )}

        {/* Step 5: Failed */}
        {step === "failed" && (
          <div className="flex flex-col h-full justify-between items-center p-5 bg-[#0c050a]/90">
            <div className="my-auto flex flex-col items-center text-center space-y-5">
              <div
                className="h-28 w-28 bg-rose-500/15 rounded-full border-2 border-rose-500/30 flex items-center justify-center text-rose-400"
                style={{ animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
              >
                <AlertTriangle size={48} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-black text-rose-400">₹{parseFloat(amount).toLocaleString()}</h1>
                <h2 className="text-sm font-bold text-white">Transaction Declined</h2>
                <p className="text-xs text-slate-400 px-4">{statusMessage}</p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Step 6: Connection Error */}
        {step === "error" && (
          <div className="flex flex-col h-full justify-between items-center p-5 bg-slate-950">
            <div className="my-auto flex flex-col items-center text-center space-y-5">
              <div className="h-24 w-24 bg-yellow-500/10 rounded-full border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                <XCircle size={44} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-sm font-bold text-white">Network Failure</h2>
                <p className="text-xs text-slate-400 px-4 leading-relaxed">{statusMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setStep("details")}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        )}

      </div>

      {/* CSS Keyframe for success tick scale-in animation */}
      <style jsx>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function MockUpiPayPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#07090e] text-white flex items-center justify-center text-sm">Loading Payment...</div>}>
      <MockUpiPayContent />
    </Suspense>
  );
}
