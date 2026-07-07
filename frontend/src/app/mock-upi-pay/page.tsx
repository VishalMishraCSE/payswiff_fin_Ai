"use client";

import React, { useState, useEffect, Suspense } from "react";
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

      // Play GPay ascending success chime
      playNote(523.25, 0.0, 0.2);     // C5
      playNote(659.25, 0.08, 0.2);    // E5
      playNote(783.99, 0.16, 0.2);    // G5
      playNote(1046.50, 0.24, 0.45);  // C6
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
      const backendHost = window.location.hostname;
      const res = await fetch(`http://${backendHost}:8000/transactions/mock-pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          amount: parseFloat(amount),
          payment_method: "UPI",
          merchant_id: parseInt(merchantId, 10),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const data = await res.json();
      setFraudScore(data.fraud_score);

      // Simulate a small delay for premium GPay experience
      setTimeout(() => {
        if (data.status === "Success") {
          playGPayChime();
          setStep("success");
          setStatusMessage(data.is_fraud
            ? `Demo transaction completed. Note: ML scored a security alert of ${(data.fraud_score * 100).toFixed(0)}%.`
            : `Completed successfully (Ref: ${data.reference_id}).`
          );
        } else {
          playWarningBuzz();
          setStep("failed");
          setStatusMessage(data.is_fraud
            ? `Transaction Blocked: High fraud probability evaluated by XGBoost ML engine (Score: ${(data.fraud_score * 100).toFixed(0)}%).`
            : "Simulated card network validation failed."
          );
        }
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStep("error");
      setStatusMessage(`Unable to connect to gateway server: ${err.message || err}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 font-sans select-none">
      <div className="max-w-[390px] w-full bg-[#0d111d]/90 border border-slate-800 rounded-[36px] overflow-hidden shadow-2xl relative flex flex-col h-[760px] justify-between backdrop-blur-xl">

        {/* Step 1: Details Entry */}
        {step === "details" && (
          <div className="flex flex-col h-full justify-between p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button className="p-2 hover:bg-slate-800/50 rounded-full transition-all text-slate-400">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1 text-slate-450 text-[10px] font-bold tracking-wide uppercase">
                <ShieldCheck size={12} className="text-teal-400" />
                <span>GPay Sandbox Mode</span>
              </div>
              <HelpCircle size={20} className="text-slate-500" />
            </div>

            {/* Profile & Business Name */}
            <div className="flex flex-col items-center text-center mt-4 space-y-2">
              <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                P
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Paying Payswiff Demo Store</h2>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">payswiff@axisbank • merchant_id: {merchantId}</p>
              </div>
            </div>

            {/* Input fields container */}
            <div className="space-y-4 my-auto">
              {/* Pay Amount input */}
              <div className="flex flex-col items-center">
                <div className="flex items-center text-5xl font-black text-white relative">
                  <span className="text-3xl font-medium text-slate-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center outline-none w-48 font-black focus:ring-0 text-white placeholder-slate-800"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
                <div className="w-32 h-[1px] bg-slate-800 mt-2"></div>
              </div>

              {/* Note input */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note"
                  className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full focus:ring-0 p-0"
                />
              </div>

              {/* Personalization Inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-550 uppercase tracking-wider pl-1">Simulator Info</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bank details row & Pay button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-450 flex items-center justify-center font-black text-xs">
                    HB
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">HDFC Bank **** 4321</p>
                    <p className="text-[9px] text-slate-500">Available demo balance: ₹50,000</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </div>

              <button
                onClick={() => setStep("pin")}
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer uppercase tracking-wider"
              >
                Proceed to Pay ₹{parseFloat(amount || "0").toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: UPI PIN Pad Overlay */}
        {step === "pin" && (
          <div className="flex flex-col h-full bg-[#090b11] justify-between p-6">

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800/85 pb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400">PAYING</h3>
                <h2 className="text-sm font-black text-white leading-tight">Payswiff Demo Store</h2>
              </div>
              <div className="text-right">
                <h3 className="text-xs font-bold text-slate-400">AMOUNT</h3>
                <h2 className="text-sm font-black text-white leading-tight">₹{parseFloat(amount).toLocaleString()}</h2>
              </div>
            </div>

            {/* PIN Entry Area */}
            <div className="my-auto text-center space-y-5">
              <div>
                <h1 className="text-sm font-bold text-slate-350 uppercase tracking-widest">Enter 4-Digit UPI PIN</h1>
                <p className="text-[10px] text-slate-500 mt-1">This is a simulated secure sandbox</p>
              </div>

              {/* Pin indicator dots */}
              <div className="flex justify-center gap-5 mt-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-4.5 w-4.5 rounded-full border transition-all duration-100 ${
                      pinDigits.length > idx
                        ? "bg-indigo-500 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20"
                        : "border-slate-700 bg-slate-900"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Safe label */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-2">
              <Lock size={12} className="text-indigo-400" />
              <span>Simulated gateway secured by FinAI Shield</span>
            </div>

            {/* Numerical Keypad */}
            <div className="grid grid-cols-3 gap-y-4 gap-x-2 border-t border-slate-800/40 pt-4">
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
                <Delete size={20} />
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
                <Check size={24} className="font-black bg-indigo-500/10 p-1 rounded-full border border-indigo-500/20" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing Animation */}
        {step === "processing" && (
          <div className="flex flex-col h-full justify-center items-center p-6 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
              <div className="absolute h-16 w-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                <Smartphone size={24} className="animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">Sending response to bank...</h2>
              <p className="text-xs text-slate-500">Evaluating transaction risk in real-time</p>
            </div>
          </div>
        )}

        {/* Step 4: Success View */}
        {step === "success" && (
          <div className="flex flex-col h-full justify-between items-center p-6 bg-[#04080f]/90 relative">
            <div className="absolute top-0 right-0 h-44 w-44 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 h-44 w-44 bg-teal-500/5 rounded-full blur-3xl animate-pulse"></div>

            <div className="my-auto flex flex-col items-center text-center space-y-6">
              {/* Animated check circle */}
              <div className="h-28 w-28 bg-emerald-500/10 rounded-full border border-emerald-500/25 flex items-center justify-center text-emerald-450 animate-bounce shadow-xl shadow-emerald-500/5">
                <Check size={52} className="stroke-[3.5]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black text-emerald-450">₹{parseFloat(amount).toLocaleString()}</h1>
                <p className="text-sm font-bold text-white">Payment Completed</p>
                <p className="text-xs text-slate-400 font-semibold px-4">{statusMessage}</p>
              </div>

              {/* SHAP explanation notice if present */}
              {fraudScore > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 max-w-[280px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Security Metric</p>
                  <p className="text-xs text-slate-200 mt-1">XGBoost computed safety index: **{((1 - fraudScore) * 100).toFixed(0)}%**.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { setStep("details"); setPinDigits([]); setAmount("500"); }}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        )}

        {/* Step 5: Failed View */}
        {step === "failed" && (
          <div className="flex flex-col h-full justify-between items-center p-6 bg-[#0c050a]/90">
            <div className="my-auto flex flex-col items-center text-center space-y-6">
              <div className="h-28 w-28 bg-rose-500/10 rounded-full border border-rose-500/20 flex items-center justify-center text-rose-450">
                <AlertTriangle size={52} className="stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black text-rose-450">₹{parseFloat(amount).toLocaleString()}</h1>
                <h2 className="text-base font-bold text-white">Transaction Declined</h2>
                <p className="text-xs text-slate-400 font-semibold px-4">{statusMessage}</p>
              </div>
            </div>

            <button
              onClick={() => { setStep("details"); setPinDigits([]); }}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Back to Merchant
            </button>
          </div>
        )}

        {/* Step 6: Server Connection Error View */}
        {step === "error" && (
          <div className="flex flex-col h-full justify-between items-center p-6 bg-slate-950">
            <div className="my-auto flex flex-col items-center text-center space-y-6">
              <div className="h-28 w-28 bg-yellow-500/10 rounded-full border border-yellow-500/20 flex items-center justify-center text-yellow-450">
                <XCircle size={52} />
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-bold text-white">Network Failure</h2>
                <p className="text-xs text-slate-400 font-semibold px-4 leading-relaxed">{statusMessage}</p>
              </div>
            </div>

            <button
              onClick={() => setStep("details")}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
            >
              Retry
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function MockUpiPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">Loading UPI Sandbox...</div>}>
      <MockUpiPayContent />
    </Suspense>
  );
}
