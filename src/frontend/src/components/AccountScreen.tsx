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
import { useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Delete,
  KeyRound,
  Loader2,
  Pencil,
  Phone,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useGetBalance,
  useGetProfile,
  useSetPin,
  useUpdateProfile,
} from "../hooks/useQueries";
import { formatRupees } from "../utils/formatters";

const PIN_LENGTH = 4;
const numpadKeys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "backspace"],
];

function PinChangeDialog({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const setPinMutation = useSetPin();
  const [step, setStep] = useState<"new" | "confirm">("new");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  // Ref to hold the new PIN so confirm step always reads fresh value
  const newPinRef = useRef("");

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  }, []);

  const reset = useCallback(() => {
    setStep("new");
    setNewPin("");
    setConfirmPin("");
    setErrorMsg("");
    setIsShaking(false);
    setIsDone(false);
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const currentPin = step === "new" ? newPin : confirmPin;

  const handleDigit = useCallback(
    async (digit: string) => {
      if (digit === "backspace") {
        if (step === "new") setNewPin((p) => p.slice(0, -1));
        else setConfirmPin((p) => p.slice(0, -1));
        setErrorMsg("");
        return;
      }

      if (step === "new") {
        if (newPin.length >= PIN_LENGTH) return;
        const updated = newPin + digit;
        setNewPin(updated);
        if (updated.length === PIN_LENGTH) {
          // Store in ref so confirm step always reads fresh value
          newPinRef.current = updated;
          setTimeout(() => setStep("confirm"), 200);
        }
      } else {
        if (confirmPin.length >= PIN_LENGTH) return;
        const updated = confirmPin + digit;
        setConfirmPin(updated);
        if (updated.length === PIN_LENGTH) {
          setTimeout(async () => {
            if (updated !== newPinRef.current) {
              triggerShake();
              setErrorMsg("PINs don't match. Try again.");
              setConfirmPin("");
              return;
            }
            try {
              const ok = await setPinMutation.mutateAsync({
                pin: newPinRef.current,
              });
              if (ok) {
                setIsDone(true);
                toast.success("PIN set successfully!");
                setTimeout(() => onClose(), 800);
              } else {
                setErrorMsg("Failed to set PIN. Try again.");
                setConfirmPin("");
              }
            } catch {
              setErrorMsg("Error setting PIN. Try again.");
              setConfirmPin("");
            }
          }, 150);
        }
      }
    },
    [step, newPin, confirmPin, setPinMutation, onClose, triggerShake],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="w-[340px] rounded-3xl p-0 overflow-hidden">
        <div
          className="flex flex-col items-center py-8 px-6"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.22 0.18 220) 0%, oklch(0.30 0.20 220) 50%, oklch(0.24 0.16 210) 100%)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
            <KeyRound size={22} className="text-white" />
          </div>
          <h2 className="text-white text-lg font-bold mb-1">
            {step === "new" ? "New PIN" : "Confirm PIN"}
          </h2>
          <p className="text-white/50 text-xs mb-5">
            {step === "new"
              ? "Enter your new 4-digit PIN"
              : "Re-enter PIN to confirm"}
          </p>

          {/* Dots */}
          <div
            className={`flex items-center gap-4 mb-4 ${isShaking ? "pin-shake" : ""}`}
          >
            {[0, 1, 2, 3].map((i) => {
              const filled = i < currentPin.length;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    filled ? "" : isDone ? "bg-green-400" : "bg-white/20"
                  }`}
                  style={
                    filled && !isDone
                      ? { backgroundColor: "oklch(0.88 0.10 220)" }
                      : {}
                  }
                />
              );
            })}
          </div>

          <div className="h-5 text-center mb-3">
            {errorMsg && <p className="text-red-300 text-xs">{errorMsg}</p>}
            {isDone && <p className="text-green-300 text-xs">PIN saved!</p>}
          </div>

          {/* Numpad */}
          <div className="w-full">
            {numpadKeys.map((row) => (
              <div
                key={row.join("|")}
                className="flex justify-center gap-4 mb-3"
              >
                {row.map((key) => {
                  if (key === "") return <div key="sp" className="w-16 h-12" />;
                  if (key === "backspace") {
                    return (
                      <button
                        key="bs"
                        type="button"
                        onClick={() => handleDigit("backspace")}
                        className="w-16 h-12 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 active:scale-95 transition-all"
                      >
                        <Delete size={18} strokeWidth={1.5} />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleDigit(key)}
                      className="w-16 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold active:scale-95 transition-all"
                      style={{
                        background: "oklch(0.32 0.16 220 / 0.5)",
                        border: "1px solid oklch(0.45 0.15 220 / 0.3)",
                      }}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AccountScreenProps {
  onLockAccount?: () => void;
}

export default function AccountScreen(_props: AccountScreenProps) {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const updateProfile = useUpdateProfile();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);

  // Profile picture
  const [profilePic, setProfilePic] = useState<string | null>(
    () => localStorage.getItem("profilePic") ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      localStorage.setItem("profilePic", dataUrl);
      setProfilePic(dataUrl);
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
    // Reset so same file can be picked again
    e.target.value = "";
  };

  // Edit profile form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const handleOpenEditProfile = () => {
    setEditName(profile?.name ?? "");
    setEditPhone(profile?.phone ?? "");
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: editName.trim(),
        phone: editPhone.trim(),
      });

      // Force immediate refetch so profile name updates everywhere instantly
      await queryClient.refetchQueries({ queryKey: ["profile"] });

      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const maskedAccount = profile?.accountNumber
    ? `•••• ${profile.accountNumber.slice(-4)}`
    : "•••• 4521";

  const displayName = profile?.name || "Rahul Kumar";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div
        className="bg-pp-purple text-white px-5 pb-8 pt-4 shrink-0"
        style={{
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        }}
      >
        <p className="text-white/60 text-xs font-sans mb-4">My Account</p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="relative w-16 h-16 rounded-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Change profile picture"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-display shadow-lg overflow-hidden"
              style={{
                background: profilePic
                  ? undefined
                  : "linear-gradient(135deg, oklch(0.55 0.22 307), oklch(0.38 0.20 280))",
                boxShadow: "0 4px 16px oklch(0.20 0.20 307 / 0.5)",
              }}
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : profileLoading ? (
                <Skeleton className="w-8 h-6 bg-white/20" />
              ) : (
                <span className="text-white">{initials}</span>
              )}
            </div>
            {/* Camera badge overlay */}
            <span
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.95 0.00 0)",
                boxShadow: "0 1px 4px oklch(0.10 0.10 307 / 0.4)",
              }}
            >
              <Camera size={10} style={{ color: "oklch(0.38 0.22 307)" }} />
            </span>
          </button>
          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <>
                <Skeleton className="h-5 w-28 bg-white/20 mb-2" />
                <Skeleton className="h-3 w-36 bg-white/20" />
              </>
            ) : (
              <>
                <h2 className="text-white text-lg font-bold font-display truncate">
                  {displayName}
                </h2>
                <p className="text-white/60 text-xs font-sans mt-0.5">
                  {profile?.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone size={10} />
                      {profile.phone}
                    </span>
                  ) : (
                    <span className="text-white/40">Add mobile number →</span>
                  )}
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
          >
            <Pencil size={14} className="text-white" />
          </button>
        </div>

        {/* Balance pill */}
        {!balanceLoading && balance !== undefined && (
          <div
            className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "oklch(0.30 0.18 307 / 0.5)" }}
          >
            <Wallet size={14} className="text-white/60" />
            <span className="text-white/70 text-xs font-sans">
              Wallet Balance
            </span>
            <span className="ml-auto text-white text-sm font-bold font-display rupee">
              {formatRupees(balance)}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
              Profile Details
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            <ProfileRow
              icon={<User size={15} className="text-pp-purple" />}
              label="Full Name"
              value={
                profileLoading ? <Skeleton className="h-4 w-24" /> : displayName
              }
            />
            <ProfileRow
              icon={<Phone size={15} className="text-blue-500" />}
              label="Mobile Number"
              value={
                profileLoading ? (
                  <Skeleton className="h-4 w-28" />
                ) : profile?.phone ? (
                  profile.phone
                ) : (
                  <span className="text-gray-400 italic">Not added</span>
                )
              }
            />
            <ProfileRow
              icon={<Wallet size={15} className="text-green-600" />}
              label="Account Number"
              value={
                profileLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  maskedAccount
                )
              }
              mono
            />
          </div>
          <div className="px-4 py-3">
            <Button
              onClick={handleOpenEditProfile}
              variant="outline"
              className="w-full h-9 rounded-xl border-pp-purple text-pp-purple text-xs font-semibold hover:bg-purple-50"
            >
              <Pencil size={13} className="mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">
              Security
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 font-display">
                Account Secured
              </p>
              <p className="text-[10px] text-gray-400 font-sans">
                Your transactions are protected
              </p>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Safe
            </span>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 space-y-2">
            <Button
              onClick={() => setChangePinOpen(true)}
              variant="outline"
              className="w-full h-9 rounded-xl border-blue-200 text-blue-600 text-xs font-semibold hover:bg-blue-50"
            >
              <KeyRound size={13} className="mr-1.5" />
              Change / Set PIN
            </Button>
          </div>
        </div>

        <PinChangeDialog
          open={changePinOpen}
          onClose={() => setChangePinOpen(false)}
        />

        {/* Spacer */}
        <div className="h-4" />
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="w-[340px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Pencil size={14} className="text-pp-purple" />
              </div>
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Avatar in dialog */}
            <div className="flex justify-center pb-1">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative w-20 h-20 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                aria-label="Change profile picture"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-display shadow-md overflow-hidden"
                  style={{
                    background: profilePic
                      ? undefined
                      : "linear-gradient(135deg, oklch(0.55 0.22 307), oklch(0.38 0.20 280))",
                  }}
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white">{initials}</span>
                  )}
                </div>
                <span
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.38 0.22 307)",
                    boxShadow: "0 1px 4px oklch(0.20 0.18 307 / 0.5)",
                  }}
                >
                  <Camera size={12} className="text-white" />
                </span>
              </button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Full Name
              </Label>
              <Input
                placeholder="Your name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded-xl border-gray-200"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Mobile Number
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-sans">
                  +91
                </span>
                <Input
                  placeholder="Mobile number"
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value.replace(/\D/g, ""))
                  }
                  className="rounded-xl border-gray-200 pl-10"
                  type="tel"
                  inputMode="numeric"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
              className="w-full rounded-xl h-11 text-white text-sm font-bold font-display"
              style={{ backgroundColor: "oklch(0.38 0.22 307)" }}
            >
              {updateProfile.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

function ProfileRow({ icon, label, value, mono }: ProfileRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 font-sans">{label}</p>
        <div
          className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : "font-display"}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
