import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock,
  Droplets,
  Flame,
  History,
  Home,
  PlusCircle,
  QrCode,
  RefreshCw,
  Send,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Tv,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PaymentResult } from "../App";
import type { Transaction } from "../backend.d";
import {
  useAddMoney,
  useGetBalance,
  useGetTransactions,
  useMakePayment,
} from "../hooks/useQueries";
import {
  formatRupees,
  formatTimestamp,
  formatTimestampTime,
  formatTransactionId,
} from "../utils/formatters";
import AccountScreen from "./AccountScreen";
import MobileRechargeDialog from "./MobileRechargeDialog";

interface DashboardScreenProps {
  activeTab: "home" | "history" | "account";
  onTabChange: (tab: "home" | "history" | "account") => void;
  onScanQR: () => void;
  onPaymentSuccess: (result: PaymentResult) => void;
  onLockAccount: () => void;
}

const quickActions = [
  {
    id: "send",
    icon: Send,
    label: "Send Money",
    color: "bg-purple-100",
    iconColor: "text-pp-purple",
  },
  {
    id: "account",
    icon: Building2,
    label: "To Account",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    id: "add",
    icon: PlusCircle,
    label: "Add Money",
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
];

const billServices = [
  {
    id: "mobile",
    icon: Smartphone,
    label: "Mobile",
    color: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "dth",
    icon: Tv,
    label: "DTH",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "electricity",
    icon: Zap,
    label: "Electricity",
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    id: "water",
    icon: Droplets,
    label: "Water",
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    id: "gas",
    icon: Flame,
    label: "Gas",
    color: "bg-red-100",
    iconColor: "text-red-600",
  },
];

function isAddMoneyTx(tx: Transaction): boolean {
  return tx.recipient === "Self";
}

function getDateGroup(nanos: bigint): string {
  const ms = Number(nanos / BigInt(1_000_000));
  const txDate = new Date(ms);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (txDate.toDateString() === today.toDateString()) return "Today";
  if (txDate.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "Earlier";
}

function groupTransactionsByDate(
  transactions: Transaction[],
): { group: string; items: Transaction[] }[] {
  const groupMap = new Map<string, Transaction[]>();
  const order = ["Today", "Yesterday", "Earlier"];

  for (const tx of transactions) {
    const group = getDateGroup(tx.timestamp);
    const existing = groupMap.get(group) ?? [];
    groupMap.set(group, [...existing, tx]);
  }

  return order
    .filter((g) => groupMap.has(g))
    .map((g) => ({ group: g, items: groupMap.get(g)! }));
}

function HistoryView({
  transactions,
  isLoading,
}: {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <Clock className="mx-auto text-gray-300 mb-2" size={32} />
        <p className="text-gray-400 text-sm">No transactions yet</p>
      </div>
    );
  }

  // Compute summary
  const totalSpent = transactions
    .filter((tx) => !isAddMoneyTx(tx))
    .reduce((sum, tx) => sum + tx.amount, BigInt(0));

  const totalAdded = transactions
    .filter((tx) => isAddMoneyTx(tx))
    .reduce((sum, tx) => sum + tx.amount, BigInt(0));

  const grouped = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <p className="text-[10px] text-gray-400 font-sans uppercase tracking-wider mb-3">
          All Time Summary
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 bg-green-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <TrendingUp
                className="text-green-600"
                size={15}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-sans">Total Added</p>
              <p className="text-sm font-bold text-green-600 rupee leading-tight">
                +{formatRupees(totalAdded)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-red-50 rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <TrendingDown
                className="text-red-500"
                size={15}
                strokeWidth={2.5}
              />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-sans">Total Spent</p>
              <p className="text-sm font-bold text-red-500 rupee leading-tight">
                -{formatRupees(totalSpent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped transactions */}
      {grouped.map(({ group, items }) => (
        <div key={group}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans mb-2 px-1">
            {group}
          </p>
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
            {items.map((tx) => {
              const isAdd = isAddMoneyTx(tx);
              return (
                <div
                  key={String(tx.id)}
                  className="flex items-center gap-3 p-3"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isAdd ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {isAdd ? (
                      <ArrowUpRight
                        className="text-green-600"
                        size={18}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowDownLeft
                        className="text-red-500"
                        size={18}
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate font-display">
                      {isAdd ? "Added to Wallet" : tx.recipient}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate font-sans">
                      {tx.description || formatTransactionId(tx.id)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    <p
                      className={`text-sm font-bold rupee ${
                        isAdd ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isAdd ? "+" : "-"}
                      {formatRupees(tx.amount)}
                    </p>
                    <p className="text-[9px] text-gray-400 font-sans">
                      {formatTimestampTime(tx.timestamp)}
                    </p>
                    <Badge
                      className={`text-[8px] px-1.5 py-0 h-4 rounded-full font-semibold ${
                        tx.status === "success" || tx.status === "completed"
                          ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-50"
                          : "bg-red-50 text-red-500 border-red-100 hover:bg-red-50"
                      }`}
                      variant="outline"
                    >
                      {tx.status === "success" || tx.status === "completed"
                        ? "Completed"
                        : tx.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardScreen({
  activeTab,
  onTabChange,
  onScanQR,
  onPaymentSuccess,
  onLockAccount,
}: DashboardScreenProps) {
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { data: transactions, isLoading: txLoading } = useGetTransactions();
  const makePayment = useMakePayment();
  const addMoney = useAddMoney();

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [addMoneyDialogOpen, setAddMoneyDialogOpen] = useState(false);
  const [mobileRechargeOpen, setMobileRechargeOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const handleSendMoney = async () => {
    if (!recipient.trim() || !amount.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    const amountNum = Number.parseInt(amount, 10);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await makePayment.mutateAsync({
        amount: BigInt(amountNum),
        description: description || "Payment",
        recipient: recipient.trim(),
      });

      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const txId = `TXN${Date.now().toString().slice(-9)}`;

      setSendDialogOpen(false);
      setRecipient("");
      setAmount("");
      setDescription("");

      onPaymentSuccess({
        amount: BigInt(amountNum),
        recipient: recipient.trim(),
        description: description || "Payment",
        transactionId: txId,
        timestamp: now,
      });
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount.trim()) {
      toast.error("Please enter an amount");
      return;
    }
    const amountNum = Number.parseInt(addAmount, 10);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await addMoney.mutateAsync({ amount: BigInt(amountNum) });
      toast.success("Money added successfully!");
      setAddMoneyDialogOpen(false);
      setAddAmount("");
    } catch {
      toast.error("Failed to add money. Please try again.");
    }
  };

  const handleQuickAction = (id: string) => {
    if (id === "send") {
      setSendDialogOpen(true);
    } else if (id === "add") {
      setAddMoneyDialogOpen(true);
    } else {
      toast.info("Coming soon!");
    }
  };

  const handleBillService = (id: string) => {
    if (id === "mobile") {
      setMobileRechargeOpen(true);
    } else {
      toast.info("Coming soon!");
    }
  };

  // If account tab is active, render account screen with bottom nav overlay
  if (activeTab === "account") {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <AccountScreen onLockAccount={onLockAccount} />
        </div>
        <BottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onScanQR={onScanQR}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Mobile Recharge Dialog */}
      <MobileRechargeDialog
        open={mobileRechargeOpen}
        onOpenChange={setMobileRechargeOpen}
        onSuccess={onPaymentSuccess}
      />

      {/* Header */}
      <div
        className="bg-pp-purple text-white px-5 pb-6 pt-3 shrink-0"
        style={{
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs font-sans">Good Morning,</p>
            <h1 className="text-white text-xl font-bold font-display tracking-tight">
              Rahul
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-display"
              style={{ background: "oklch(0.52 0.20 307)" }}
            >
              R
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "oklch(0.32 0.20 307)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs mb-1">Wallet Balance</p>
              {balanceLoading ? (
                <Skeleton className="h-7 w-32 bg-white/20" />
              ) : (
                <p className="text-white text-2xl font-bold font-display rupee">
                  {balance !== undefined ? formatRupees(balance) : "₹0"}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-white/60 text-[10px]">Account</span>
              <span className="text-white text-xs font-semibold">
                •••• 4521
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/70 text-[10px]">
              Active · Savings Account
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {activeTab === "home" && (
          <>
            {/* Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 font-display">
                  Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-card group-hover:shadow-card-hover group-active:scale-95 transition-all duration-150`}
                    >
                      <action.icon
                        className={`${action.iconColor}`}
                        size={22}
                        strokeWidth={2}
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 text-center leading-tight font-sans">
                      {action.label}
                    </span>
                  </button>
                ))}

                {/* Scan QR */}
                <button
                  type="button"
                  onClick={onScanQR}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-pp-purple flex items-center justify-center shadow-card group-hover:shadow-card-hover group-active:scale-95 transition-all duration-150">
                    <QrCode className="text-white" size={22} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] text-gray-600 text-center leading-tight font-sans">
                    Scan QR
                  </span>
                </button>
              </div>
            </div>

            {/* Recharge & Pay Bills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 font-display">
                  Recharge & Pay Bills
                </h2>
                <button
                  type="button"
                  className="text-pp-purple text-xs font-semibold flex items-center gap-0.5"
                >
                  See all <ChevronRight size={12} />
                </button>
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-card">
                <div className="grid grid-cols-5 gap-1">
                  {billServices.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => handleBillService(service.id)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-150 group"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl ${service.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                      >
                        <service.icon
                          className={`${service.iconColor}`}
                          size={18}
                          strokeWidth={2}
                        />
                      </div>
                      <span className="text-[9px] text-gray-500 text-center leading-tight font-sans">
                        {service.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 font-display">
                  Recent Transactions
                </h2>
                <button
                  type="button"
                  onClick={() => onTabChange("history")}
                  className="text-pp-purple text-xs font-semibold flex items-center gap-0.5"
                >
                  See all <ChevronRight size={12} />
                </button>
              </div>

              {txLoading ? (
                <div className="bg-white rounded-2xl shadow-card p-3 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-8 text-center">
                  <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
                  {transactions.slice(0, 5).map((tx) => {
                    const isAdd = isAddMoneyTx(tx);
                    return (
                      <div
                        key={String(tx.id)}
                        className="flex items-center gap-3 p-3"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isAdd ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          {isAdd ? (
                            <ArrowUpRight
                              className="text-green-600"
                              size={18}
                              strokeWidth={2.5}
                            />
                          ) : (
                            <ArrowDownLeft
                              className="text-red-500"
                              size={18}
                              strokeWidth={2.5}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate font-display">
                            {isAdd ? "Added to Wallet" : tx.recipient}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate font-sans">
                            {formatTransactionId(tx.id)} ·{" "}
                            {formatTimestamp(tx.timestamp)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`text-sm font-bold rupee ${isAdd ? "text-green-600" : "text-red-500"}`}
                          >
                            {isAdd ? "+" : "-"}
                            {formatRupees(tx.amount)}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                              tx.status === "success" ||
                              tx.status === "completed"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* History Tab Content */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 font-display">
                Transaction History
              </h2>
              <div className="flex items-center gap-1">
                <Wallet size={12} className="text-pp-purple" />
                {!balanceLoading && balance !== undefined && (
                  <span className="text-[10px] text-pp-purple font-semibold rupee">
                    {formatRupees(balance)}
                  </span>
                )}
              </div>
            </div>
            <HistoryView transactions={transactions} isLoading={txLoading} />
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onScanQR={onScanQR}
      />

      {/* Send Money Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="w-[340px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Send Money
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Recipient Name / UPI ID
              </Label>
              <Input
                placeholder="e.g. Priya Singh"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Amount (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold rupee">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl border-gray-200 pl-7 focus:border-primary font-semibold text-lg"
                  min="1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Description (optional)
              </Label>
              <Input
                placeholder="e.g. Dinner split"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-gray-200 focus:border-primary"
              />
            </div>

            <Button
              onClick={handleSendMoney}
              disabled={makePayment.isPending}
              className="w-full rounded-xl h-12 bg-pp-purple text-white text-sm font-bold font-display hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "oklch(0.38 0.22 307)" }}
            >
              {makePayment.isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin" size={16} />
                  Processing...
                </span>
              ) : (
                "Pay Now"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyDialogOpen} onOpenChange={setAddMoneyDialogOpen}>
        <DialogContent className="w-[340px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <PlusCircle
                  className="text-green-600"
                  size={17}
                  strokeWidth={2.5}
                />
              </div>
              Add Money
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Amount (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold rupee">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddMoney();
                  }}
                  className="rounded-xl border-gray-200 pl-7 focus:border-primary font-semibold text-lg"
                  min="1"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="flex gap-2 flex-wrap">
              {[100, 500, 1000, 2000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAddAmount(String(preset))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    addAmount === String(preset)
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
                  }`}
                >
                  +₹{preset}
                </button>
              ))}
            </div>

            <Button
              onClick={handleAddMoney}
              disabled={addMoney.isPending}
              className="w-full rounded-xl h-12 text-white text-sm font-bold font-display hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "oklch(0.45 0.17 155)" }}
            >
              {addMoney.isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin" size={16} />
                  Adding...
                </span>
              ) : (
                "Add Money"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BottomNavProps {
  activeTab: "home" | "history" | "account";
  onTabChange: (tab: "home" | "history" | "account") => void;
  onScanQR: () => void;
}

function BottomNav({ activeTab, onTabChange, onScanQR }: BottomNavProps) {
  return (
    <div className="shrink-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-3">
      <button
        type="button"
        onClick={() => onTabChange("home")}
        className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-pp-purple" : "text-gray-400"}`}
      >
        <Home size={20} strokeWidth={activeTab === "home" ? 2.5 : 2} />
        <span className="text-[10px] font-semibold">Home</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("history")}
        className={`flex flex-col items-center gap-1 ${activeTab === "history" ? "text-pp-purple" : "text-gray-400"}`}
      >
        <History size={20} strokeWidth={activeTab === "history" ? 2.5 : 2} />
        <span className="text-[10px] font-semibold">History</span>
      </button>

      {/* Central Scan Button */}
      <button
        type="button"
        onClick={onScanQR}
        className="-mt-6 w-14 h-14 rounded-full bg-pp-purple shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ boxShadow: "0 4px 16px oklch(0.38 0.22 307 / 0.4)" }}
      >
        <QrCode className="text-white" size={22} strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={() => onTabChange("account")}
        className={`flex flex-col items-center gap-1 ${activeTab === "account" ? "text-pp-purple" : "text-gray-400"}`}
      >
        <User size={20} strokeWidth={activeTab === "account" ? 2.5 : 2} />
        <span className="text-[10px] font-semibold">Account</span>
      </button>
    </div>
  );
}
