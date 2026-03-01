import { Delete } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHasPin, useSetPin, useVerifyPin } from "../hooks/useQueries";

interface PinLockScreenProps {
  onUnlocked: () => void;
}

const PIN_LENGTH = 4;

const numpadKeys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "backspace"],
];

export default function PinLockScreen({ onUnlocked }: PinLockScreenProps) {
  const { data: hasPinValue, isLoading: pinLoading } = useHasPin();
  const setPinMutation = useSetPin();
  const verifyPin = useVerifyPin();

  const [mode, setMode] = useState<"loading" | "create" | "confirm" | "enter">(
    "loading",
  );
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pinLoading) return;
    if (hasPinValue === false) {
      setMode("create");
    } else if (hasPinValue === true) {
      setMode("enter");
    }
  }, [hasPinValue, pinLoading]);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (digit === "backspace") {
        if (mode === "confirm") {
          setConfirmPin((p) => p.slice(0, -1));
        } else {
          setPin((p) => p.slice(0, -1));
        }
        setErrorMsg("");
        return;
      }

      if (mode === "create" || mode === "enter") {
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + digit;
        setPin(newPin);
        setErrorMsg("");

        if (newPin.length === PIN_LENGTH) {
          if (mode === "create") {
            // Move to confirm step
            setTimeout(() => {
              setMode("confirm");
              setPin(newPin); // keep createPin stored
            }, 200);
          } else if (mode === "enter") {
            // Verify
            setTimeout(async () => {
              try {
                const ok = await verifyPin.mutateAsync({ pin: newPin });
                if (ok) {
                  setIsSuccess(true);
                  setTimeout(() => onUnlocked(), 500);
                } else {
                  triggerShake();
                  setErrorMsg("Wrong PIN. Try again.");
                  setPin("");
                }
              } catch {
                triggerShake();
                setErrorMsg("Verification failed. Try again.");
                setPin("");
              }
            }, 150);
          }
        }
      } else if (mode === "confirm") {
        if (confirmPin.length >= PIN_LENGTH) return;
        const newConfirm = confirmPin + digit;
        setConfirmPin(newConfirm);
        setErrorMsg("");

        if (newConfirm.length === PIN_LENGTH) {
          setTimeout(async () => {
            if (newConfirm !== pin) {
              triggerShake();
              setErrorMsg("PINs don't match. Try again.");
              setConfirmPin("");
              return;
            }
            try {
              const ok = await setPinMutation.mutateAsync({ pin });
              if (ok) {
                setIsSuccess(true);
                setTimeout(() => onUnlocked(), 500);
              } else {
                setErrorMsg("Failed to set PIN. Try again.");
                setConfirmPin("");
              }
            } catch {
              setErrorMsg("Failed to set PIN. Try again.");
              setConfirmPin("");
            }
          }, 150);
        }
      }
    },
    [
      mode,
      pin,
      confirmPin,
      verifyPin,
      setPinMutation,
      onUnlocked,
      triggerShake,
    ],
  );

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      else if (e.key === "Backspace") handleDigit("backspace");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDigit]);

  const currentPin = mode === "confirm" ? confirmPin : pin;
  const isProcessing = verifyPin.isPending || setPinMutation.isPending;

  const title =
    mode === "loading"
      ? "Loading..."
      : mode === "create"
        ? "Create PIN"
        : mode === "confirm"
          ? "Confirm PIN"
          : "Enter PIN";

  const subtitle =
    mode === "create"
      ? "Set a 4-digit PIN to secure your account"
      : mode === "confirm"
        ? "Re-enter your PIN to confirm"
        : "Enter your PIN to continue";

  return (
    <div
      className="h-full flex flex-col items-center justify-between py-10 px-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.20 0.20 307) 0%, oklch(0.28 0.22 307) 50%, oklch(0.22 0.18 295) 100%)",
      }}
    >
      {/* Logo + Branding */}
      <div className="flex flex-col items-center gap-3 fade-in-up">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.22 307), oklch(0.38 0.20 280))",
            boxShadow: "0 8px 24px oklch(0.15 0.18 307 / 0.6)",
          }}
        >
          <span className="text-white text-3xl font-bold font-display">P</span>
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl font-bold font-display tracking-tight">
            PhonePe
          </h1>
          <p className="text-white/50 text-xs font-sans mt-0.5">
            Secure Payments
          </p>
        </div>
      </div>

      {/* PIN Entry Area */}
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <div
          className="text-center fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="text-white text-lg font-semibold font-display">
            {title}
          </h2>
          <p className="text-white/60 text-xs mt-1 font-sans">{subtitle}</p>
        </div>

        {/* PIN Dots */}
        <div
          ref={dotsRef}
          className={`flex items-center gap-4 ${isShaking ? "pin-shake" : ""}`}
        >
          {[0, 1, 2, 3].map((i) => {
            const filled = i < currentPin.length;
            return (
              <div
                key={`dot-${i}`}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  filled
                    ? "pin-dot-filled"
                    : isSuccess
                      ? "bg-green-400"
                      : "bg-white/20"
                }`}
                style={
                  filled && !isSuccess
                    ? { backgroundColor: "oklch(0.88 0.10 307)" }
                    : {}
                }
              />
            );
          })}
        </div>

        {/* Error message */}
        <div className="h-5 text-center">
          {errorMsg && (
            <p className="text-red-300 text-xs font-sans fade-in-up">
              {errorMsg}
            </p>
          )}
          {isSuccess && (
            <p className="text-green-300 text-xs font-sans fade-in-up">
              ✓ Success!
            </p>
          )}
        </div>

        {/* Numpad */}
        <div className="w-full fade-in-up" style={{ animationDelay: "0.2s" }}>
          {numpadKeys.map((row) => (
            <div key={row.join("|")} className="flex justify-center gap-4 mb-4">
              {row.map((key) => {
                if (key === "") {
                  return <div key="spacer" className="w-20 h-14" />;
                }
                if (key === "backspace") {
                  return (
                    <button
                      key="backspace"
                      type="button"
                      onClick={() => handleDigit("backspace")}
                      disabled={isProcessing || isSuccess}
                      className="w-20 h-14 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150 disabled:opacity-40"
                    >
                      <Delete size={20} strokeWidth={1.5} />
                    </button>
                  );
                }
                return (
                  <button
                    key={`digit-${key}`}
                    type="button"
                    onClick={() => handleDigit(key)}
                    disabled={isProcessing || isSuccess}
                    className="w-20 h-14 rounded-full flex flex-col items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all duration-150 disabled:opacity-40"
                    style={{
                      background: "oklch(0.32 0.16 307 / 0.5)",
                      border: "1px solid oklch(0.45 0.15 307 / 0.3)",
                    }}
                  >
                    <span className="text-xl font-semibold font-display leading-none">
                      {key}
                    </span>
                    <span className="text-[8px] text-white/40 tracking-widest uppercase leading-none mt-0.5">
                      {
                        [
                          "",
                          "ABC",
                          "DEF",
                          "GHI",
                          "JKL",
                          "MNO",
                          "PQRS",
                          "TUV",
                          "WXYZ",
                          "",
                        ][Number.parseInt(key)]
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className="text-center fade-in-up"
        style={{ animationDelay: "0.3s" }}
      >
        {mode === "enter" && (
          <button
            type="button"
            className="text-white/40 text-xs font-sans hover:text-white/60 transition-colors"
            onClick={() => {
              setMode("create");
              setPin("");
              setConfirmPin("");
              setErrorMsg("");
            }}
          >
            Forgot PIN? Reset
          </button>
        )}
        {(mode === "create" || mode === "confirm") && (
          <p className="text-white/30 text-xs font-sans">
            PhonePe · Secure & Encrypted
          </p>
        )}
      </div>
    </div>
  );
}
