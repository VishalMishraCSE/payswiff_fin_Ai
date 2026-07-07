"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ShieldCheck, Smartphone, IndianRupee } from "lucide-react";

function MockUpiPayContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchant_id") || "1";

  const [customerName, setCustomerName] = useState("Aditya Roy");
  const [customerEmail, setCustomerEmail] = useState("aditya.roy@live.com");
  const [amount, setAmount] = useState("500");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Auto-set UPI if scanned via UPI QR
  useEffect(() => {
    const route = searchParams.get("route");
    if (route) {
      setPaymentMethod(route);
    }
  }, [searchParams]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentStatus("idle");
    setStatusMessage("");

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
          payment_method: paymentMethod,
          merchant_id: parseInt(merchantId, 10),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned code ${res.status}`);
      }

      const data = await res.json();
      if (data.status === "Success") {
        setPaymentStatus("success");
        setStatusMessage(data.is_fraud
          ? `Simulated transaction approved (Ref: ${data.reference_id}). Note: ML scored a warning rate of ${(data.fraud_score * 100).toFixed(0)}%.`
          : `Simulated transaction completed successfully (Ref: ${data.reference_id}).`
        );
      } else {
        setPaymentStatus("failed");
        setStatusMessage(data.is_fraud
          ? `⚠️ Transaction Blocked: High fraud score detected by local ML Scorer (Score: ${(data.fraud_score * 100).toFixed(0)}%).`
          : "Transaction processing failed."
        );
      }
    } catch (err: any) {
      console.error(err);
      setPaymentStatus("error");
      setStatusMessage(`Network connection failed: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 backdrop-blur-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">FinAI UPI Sandbox</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Secure Demo Gateway</p>
            </div>
          </div>
          <Smartphone size={16} className="text-slate-500 animate-bounce" />
        </div>

        {paymentStatus === "idle" ? (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-4 text-center space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Simulated Pay Amount</p>
              <div className="flex items-center justify-center text-3xl font-black text-indigo-400">
                <IndianRupee size={24} className="mt-1" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-center outline-none w-28 font-black focus:ring-0"
                  required
                  min="1"
                />
              </div>
              <p className="text-[9px] text-slate-500">Tap to edit amount</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Your Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Simulated Route</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="UPI">UPI Scan-and-Pay</option>
                  <option value="Card">Mock Card Route</option>
                  <option value="NetBanking">NetBanking Route</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {isSubmitting ? "Initiating Gateway..." : "Pay simulated money"}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            {paymentStatus === "success" ? (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-450 border border-emerald-500/20">
                  <CheckCircle2 size={44} className="animate-pulse" />
                </div>
                <h2 className="text-lg font-bold text-emerald-400">Payment Success</h2>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-rose-500/10 rounded-full text-rose-450 border border-rose-500/20">
                  <XCircle size={44} />
                </div>
                <h2 className="text-lg font-bold text-rose-400">Payment Flagged / Rejected</h2>
              </div>
            )}
            <p className="text-xs text-slate-350 px-4 leading-relaxed">{statusMessage}</p>
            <button
              onClick={() => { setPaymentStatus("idle"); setStatusMessage(""); }}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all"
            >
              Pay Again
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center border-t border-slate-800/60 pt-4">
          <p className="text-[9px] text-slate-500">
            This is a mock sandbox endpoint. No real credit card or bank funds are processed.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function MockUpiPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Sandbox Gateway...</div>}>
      <MockUpiPayContent />
    </Suspense>
  );
}
