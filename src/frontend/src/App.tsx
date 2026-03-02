import { Toaster } from "@/components/ui/sonner";
import { useCallback, useState } from "react";
import DashboardScreen from "./components/DashboardScreen";
import PaymentSuccessScreen from "./components/PaymentSuccessScreen";
import PhoneFrame from "./components/PhoneFrame";
import PinLockScreen from "./components/PinLockScreen";
import QRScannerScreen from "./components/QRScannerScreen";

export type Screen =
  | "pin-lock"
  | "dashboard"
  | "qr-scanner"
  | "payment-success";

export interface PaymentResult {
  amount: bigint;
  recipient: string;
  description: string;
  transactionId: string;
  timestamp: bigint;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"home" | "history" | "account">(
    "home",
  );

  const goTo = useCallback((s: Screen) => {
    setScreen(s);
  }, []);

  const handlePinUnlocked = useCallback(() => {
    setScreen("dashboard");
    setActiveTab("home");
  }, []);

  const handlePaymentSuccess = useCallback((result: PaymentResult) => {
    setPaymentResult(result);
    setScreen("payment-success");
  }, []);

  const handleGoHome = useCallback(() => {
    setScreen("dashboard");
    setActiveTab("home");
  }, []);

  const handleLockAccount = useCallback(() => {
    setScreen("pin-lock");
  }, []);

  const handleTabChange = useCallback((tab: "home" | "history" | "account") => {
    setActiveTab(tab);
    setScreen("dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <PhoneFrame>
        {screen === "pin-lock" && (
          <PinLockScreen key="pin-lock" onUnlocked={handlePinUnlocked} />
        )}
        {screen === "dashboard" && (
          <DashboardScreen
            key="dashboard"
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onScanQR={() => goTo("qr-scanner")}
            onPaymentSuccess={handlePaymentSuccess}
            onLockAccount={handleLockAccount}
          />
        )}
        {screen === "qr-scanner" && (
          <QRScannerScreen key="qr-scanner" onBack={() => goTo("dashboard")} />
        )}
        {screen === "payment-success" && paymentResult && (
          <PaymentSuccessScreen
            key="payment-success"
            result={paymentResult}
            onGoHome={handleGoHome}
          />
        )}
      </PhoneFrame>
      <div className="mt-6 text-center absolute bottom-4 left-0 right-0">
        <p className="text-xs text-slate-400 font-sans">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
