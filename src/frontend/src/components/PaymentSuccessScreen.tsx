import { Button } from "@/components/ui/button";
import { Check, Home, Share2 } from "lucide-react";
import type { PaymentResult } from "../App";
import {
  formatRupees,
  formatTimestamp,
  formatTimestampTime,
} from "../utils/formatters";

interface PaymentSuccessScreenProps {
  result: PaymentResult;
  onGoHome: () => void;
}

export default function PaymentSuccessScreen({
  result,
  onGoHome,
}: PaymentSuccessScreenProps) {
  const handleViewDetails = () => {
    // In a full app, this would navigate to a transaction detail page
    // For now, show expanded details inline - already shown
  };

  return (
    <div className="h-full flex flex-col bg-white screen-enter overflow-y-auto">
      {/* Top purple wave section */}
      <div
        className="bg-pp-purple pt-8 pb-16 px-6 text-center shrink-0"
        style={{
          borderBottomLeftRadius: "50% 30%",
          borderBottomRightRadius: "50% 30%",
        }}
      >
        <p className="text-white/60 text-xs font-sans mb-2">
          Transaction Complete
        </p>
      </div>

      {/* Success icon - overlapping */}
      <div className="flex justify-center -mt-14 shrink-0 z-10 relative">
        <div className="success-ring-animate">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{
              background: "oklch(0.60 0.19 145)",
              boxShadow:
                "0 8px 32px oklch(0.60 0.19 145 / 0.4), 0 0 0 8px oklch(0.88 0.10 145 / 0.3)",
            }}
          >
            <div className="checkmark-animate">
              <Check className="text-white" size={52} strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-5 pb-6 flex flex-col gap-5">
        {/* Heading */}
        <div
          className="text-center slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-sans">
            Your payment has been processed
          </p>
        </div>

        {/* Amount */}
        <div
          className="text-center slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <p
            className="text-4xl font-bold font-display rupee"
            style={{ color: "oklch(0.38 0.22 307)" }}
          >
            {formatRupees(result.amount)}
          </p>
          <p className="text-gray-500 text-sm mt-1 font-sans">
            Paid to{" "}
            <span className="font-semibold text-gray-700">
              {result.recipient}
            </span>
          </p>
        </div>

        {/* Transaction Details Card */}
        <div
          className="bg-gray-50 rounded-2xl p-4 space-y-3 slide-up border border-gray-100"
          style={{ animationDelay: "0.5s" }}
        >
          <DetailRow label="Transaction ID" value={result.transactionId} mono />
          <div className="border-t border-gray-100" />
          <DetailRow label="Date" value={formatTimestamp(result.timestamp)} />
          <DetailRow
            label="Time"
            value={formatTimestampTime(result.timestamp)}
          />
          <div className="border-t border-gray-100" />
          <DetailRow label="Description" value={result.description} />
          <DetailRow label="Payment Method" value="UPI · Wallet" />
          <DetailRow
            label="Status"
            value="Success"
            valueClassName="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-xs"
          />
        </div>

        {/* Action buttons */}
        <div
          className="space-y-3 slide-up mt-auto"
          style={{ animationDelay: "0.6s" }}
        >
          <Button
            onClick={handleViewDetails}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 font-display font-bold text-sm gap-2"
            style={{
              borderColor: "oklch(0.38 0.22 307)",
              color: "oklch(0.38 0.22 307)",
            }}
          >
            <Share2 size={16} />
            Share Receipt
          </Button>

          <Button
            onClick={onGoHome}
            className="w-full h-12 rounded-xl font-display font-bold text-sm gap-2"
            style={{ backgroundColor: "oklch(0.38 0.22 307)" }}
          >
            <Home size={16} />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}

function DetailRow({ label, value, mono, valueClassName }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-400 font-sans shrink-0">{label}</span>
      <span
        className={`text-xs font-semibold text-gray-700 text-right ${
          mono ? "font-mono text-gray-500" : "font-sans"
        } ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}
