import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PaymentResult } from "../App";
import { useGetProfile, useRechargeMobile } from "../hooks/useQueries";

interface MobileRechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: PaymentResult) => void;
}

const operators = [
  {
    id: "airtel",
    name: "Airtel",
    color: "#E40000",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    activeBg: "bg-red-600",
  },
  {
    id: "jio",
    name: "Jio",
    color: "#00B9F1",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    activeBg: "bg-blue-600",
  },
  {
    id: "vi",
    name: "Vi",
    color: "#EE2B7B",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-600",
    activeBg: "bg-pink-600",
  },
  {
    id: "bsnl",
    name: "BSNL",
    color: "#0066CC",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-600",
    activeBg: "bg-indigo-600",
  },
];

interface Plan {
  amount: number;
  validity: string;
  data: string;
  calls: string;
  tag?: string;
}

const rechargePlans: Plan[] = [
  {
    amount: 19,
    validity: "1 day",
    data: "200MB",
    calls: "Local calls",
    tag: "Trial",
  },
  {
    amount: 99,
    validity: "28 days",
    data: "1GB/day",
    calls: "Unlimited",
    tag: "Popular",
  },
  {
    amount: 149,
    validity: "28 days",
    data: "1.5GB/day",
    calls: "Unlimited",
  },
  {
    amount: 199,
    validity: "28 days",
    data: "2GB/day",
    calls: "Unlimited",
    tag: "Best Value",
  },
  { amount: 299, validity: "56 days", data: "1.5GB/day", calls: "Unlimited" },
  {
    amount: 399,
    validity: "84 days",
    data: "1.5GB/day",
    calls: "Unlimited",
    tag: "Long Validity",
  },
  {
    amount: 599,
    validity: "84 days",
    data: "2.5GB/day",
    calls: "Unlimited + ISD",
    tag: "Premium",
  },
];

type Step = "details" | "plans" | "confirm";

export default function MobileRechargeDialog({
  open,
  onOpenChange,
  onSuccess,
}: MobileRechargeDialogProps) {
  const { data: profile } = useGetProfile();
  const rechargeMobile = useRechargeMobile();

  const [step, setStep] = useState<Step>("details");
  const [mobileNumber, setMobileNumber] = useState("");
  const [operator, setOperator] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Pre-fill phone from profile
      setMobileNumber(profile?.phone ?? "");
      setOperator("");
      setSelectedPlan(null);
      setCustomAmount("");
      setStep("details");
    }
    onOpenChange(isOpen);
  };

  const handleProceedToPlans = () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!operator) {
      toast.error("Please select an operator");
      return;
    }
    setStep("plans");
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setCustomAmount("");
    setStep("confirm");
  };

  const handleCustomAmount = () => {
    const amt = Number.parseInt(customAmount, 10);
    if (!customAmount || Number.isNaN(amt) || amt < 10) {
      toast.error("Enter a valid amount (min ₹10)");
      return;
    }
    setSelectedPlan({
      amount: amt,
      validity: "28 days",
      data: "As per operator",
      calls: "As per operator",
    });
    setCustomAmount("");
    setStep("confirm");
  };

  const handleRecharge = async () => {
    if (!selectedPlan) return;
    const operatorName =
      operators.find((o) => o.id === operator)?.name ?? operator;
    const planLabel = `₹${selectedPlan.amount} - ${selectedPlan.validity}`;

    try {
      await rechargeMobile.mutateAsync({
        amount: BigInt(selectedPlan.amount),
        phone: mobileNumber,
        operator: operatorName,
        plan: planLabel,
      });

      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const txId = `RCH${Date.now().toString().slice(-9)}`;

      onOpenChange(false);
      onSuccess({
        amount: BigInt(selectedPlan.amount),
        recipient: `${operatorName} Recharge`,
        description: `Mobile recharge for ${mobileNumber}`,
        transactionId: txId,
        timestamp: now,
      });
    } catch {
      toast.error("Recharge failed. Please try again.");
    }
  };

  const selectedOperator = operators.find((o) => o.id === operator);

  const stepTitle =
    step === "details"
      ? "Mobile Recharge"
      : step === "plans"
        ? "Select Plan"
        : "Confirm Recharge";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="w-[360px] rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className="px-6 pt-5 pb-4 shrink-0"
          style={{ background: "oklch(0.38 0.22 307)" }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              {step !== "details" && (
                <button
                  type="button"
                  onClick={() =>
                    setStep(step === "confirm" ? "plans" : "details")
                  }
                  className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
              )}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.52 0.20 307)" }}
              >
                <Smartphone size={16} className="text-white" />
              </div>
              <DialogTitle className="text-white font-display font-bold text-base">
                {stepTitle}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {(["details", "plans", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === s
                      ? "bg-white text-pp-purple"
                      : ["plans", "confirm"].indexOf(s) <=
                          ["plans", "confirm"].indexOf(step)
                        ? "bg-white/40 text-white"
                        : "bg-white/15 text-white/50"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 w-8 rounded-full ${
                      ["plans", "confirm"].indexOf(s) <
                      ["plans", "confirm"].indexOf(step)
                        ? "bg-white/60"
                        : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
            <div className="ml-1 flex gap-4">
              <span className="text-white/60 text-[10px] font-sans">
                Number
              </span>
              <span className="text-white/60 text-[10px] font-sans">Plans</span>
              <span className="text-white/60 text-[10px] font-sans">
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Details */}
          {step === "details" && (
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 font-sans">
                  Mobile Number
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-sans">
                    +91
                  </span>
                  <Input
                    placeholder="10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="rounded-xl border-gray-200 pl-10 text-sm"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-500 font-sans">
                  Select Operator
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {operators.map((op) => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setOperator(op.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                        operator === op.id
                          ? `${op.activeBg} border-transparent`
                          : `bg-white ${op.border} hover:${op.bg}`
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          operator === op.id
                            ? "bg-white/20"
                            : "bg-white shadow-sm"
                        }`}
                        style={operator === op.id ? {} : { color: op.color }}
                      >
                        <span
                          style={
                            operator === op.id
                              ? { color: "white" }
                              : { color: op.color }
                          }
                          className="font-bold text-xs"
                        >
                          {op.name.slice(0, 2)}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-semibold font-display ${
                          operator === op.id ? "text-white" : op.text
                        }`}
                      >
                        {op.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleProceedToPlans}
                className="w-full h-11 rounded-xl text-white text-sm font-bold font-display"
                style={{ backgroundColor: "oklch(0.38 0.22 307)" }}
              >
                View Plans
              </Button>
            </div>
          )}

          {/* Step 2: Plans */}
          {step === "plans" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 px-1 mb-2">
                <div
                  className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      selectedOperator?.color ?? "oklch(0.38 0.22 307)",
                  }}
                >
                  {selectedOperator?.name}
                </div>
                <span className="text-xs text-gray-500 font-sans">
                  +91 {mobileNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {rechargePlans.map((plan) => (
                  <button
                    key={plan.amount}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className="flex items-center gap-4 p-3.5 bg-white rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-sm active:scale-[0.98] transition-all text-left group"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                      style={{
                        background:
                          selectedOperator?.color ?? "oklch(0.38 0.22 307)",
                      }}
                    >
                      <span className="text-white text-[10px] font-sans">
                        ₹
                      </span>
                      <span className="text-white text-lg font-bold font-display leading-tight">
                        {plan.amount}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold font-display text-gray-800">
                          ₹{plan.amount}
                        </span>
                        {plan.tag && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{
                              backgroundColor:
                                selectedOperator?.color ??
                                "oklch(0.38 0.22 307)",
                            }}
                          >
                            {plan.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                        {plan.data} · {plan.validity}
                      </p>
                      <p className="text-[10px] text-gray-400 font-sans">
                        {plan.calls}
                      </p>
                    </div>
                    <ChevronLeft
                      size={16}
                      className="text-gray-300 group-hover:text-purple-400 rotate-180 transition-colors shrink-0"
                    />
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-600 font-display">
                  Custom Amount
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold rupee">
                      ₹
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="rounded-xl border-gray-200 pl-7 text-sm"
                      min="10"
                    />
                  </div>
                  <Button
                    onClick={handleCustomAmount}
                    className="rounded-xl px-4 text-white text-sm font-bold"
                    style={{ backgroundColor: "oklch(0.38 0.22 307)" }}
                  >
                    Go
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && selectedPlan && (
            <div className="p-6 space-y-5">
              {/* Confirmation card */}
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <div
                  className="px-4 py-3 text-white"
                  style={{
                    backgroundColor:
                      selectedOperator?.color ?? "oklch(0.38 0.22 307)",
                  }}
                >
                  <p className="text-[10px] font-sans text-white/70">
                    Recharge Summary
                  </p>
                  <p className="text-2xl font-bold font-display mt-0.5 rupee">
                    ₹{selectedPlan.amount}
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  <ConfirmRow
                    label="Mobile Number"
                    value={`+91 ${mobileNumber}`}
                  />
                  <ConfirmRow
                    label="Operator"
                    value={selectedOperator?.name ?? operator}
                  />
                  <ConfirmRow label="Validity" value={selectedPlan.validity} />
                  <ConfirmRow label="Data" value={selectedPlan.data} />
                  <ConfirmRow label="Calls" value={selectedPlan.calls} />
                  <ConfirmRow
                    label="Amount"
                    value={`₹${selectedPlan.amount}`}
                    bold
                    rupee
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  onClick={handleRecharge}
                  disabled={rechargeMobile.isPending}
                  className="w-full h-12 rounded-xl text-white text-sm font-bold font-display"
                  style={{
                    backgroundColor:
                      selectedOperator?.color ?? "oklch(0.38 0.22 307)",
                  }}
                >
                  {rechargeMobile.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Processing...
                    </span>
                  ) : (
                    `Recharge ₹${selectedPlan.amount}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("plans")}
                  className="w-full h-10 rounded-xl text-xs font-semibold text-gray-500 border-gray-200"
                >
                  Change Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmRow({
  label,
  value,
  bold,
  rupee,
}: {
  label: string;
  value: string;
  bold?: boolean;
  rupee?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-gray-400 font-sans">{label}</span>
      <span
        className={`text-xs text-gray-700 text-right ${bold ? "font-bold" : "font-semibold"} ${rupee ? "rupee" : "font-sans"}`}
      >
        {value}
      </span>
    </div>
  );
}
