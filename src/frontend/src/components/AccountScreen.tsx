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
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Phone,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useChangePin,
  useGetBalance,
  useGetProfile,
  useUpdateProfile,
} from "../hooks/useQueries";
import { formatRupees } from "../utils/formatters";

interface AccountScreenProps {
  onLockAccount: () => void;
}

export default function AccountScreen({ onLockAccount }: AccountScreenProps) {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const updateProfile = useUpdateProfile();
  const changePin = useChangePin();

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);

  // Edit profile form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Change PIN form
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

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
    if (editPhone && !/^\d{10}$/.test(editPhone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePin = async () => {
    if (!oldPin || oldPin.length !== 4) {
      toast.error("Enter your current 4-digit PIN");
      return;
    }
    if (!newPin || newPin.length !== 4) {
      toast.error("New PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmNewPin) {
      toast.error("New PINs don't match");
      return;
    }
    if (oldPin === newPin) {
      toast.error("New PIN must be different from current PIN");
      return;
    }
    try {
      const ok = await changePin.mutateAsync({ oldPin, newPin });
      if (ok) {
        toast.success("PIN changed successfully!");
        setChangePinOpen(false);
        setOldPin("");
        setNewPin("");
        setConfirmNewPin("");
      } else {
        toast.error("Current PIN is incorrect");
      }
    } catch {
      toast.error("Failed to change PIN");
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

        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold font-display shadow-lg shrink-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.22 307), oklch(0.38 0.20 280))",
              boxShadow: "0 4px 16px oklch(0.20 0.20 307 / 0.5)",
            }}
          >
            {profileLoading ? (
              <Skeleton className="w-8 h-6 bg-white/20" />
            ) : (
              initials
            )}
          </div>
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
          <button
            type="button"
            onClick={() => {
              setOldPin("");
              setNewPin("");
              setConfirmNewPin("");
              setChangePinOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <KeyRound size={16} className="text-orange-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800 font-display">
                Change PIN
              </p>
              <p className="text-[10px] text-gray-400 font-sans">
                Update your 4-digit security PIN
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <div className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <Shield size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 font-display">
                PIN Protection
              </p>
              <p className="text-[10px] text-gray-400 font-sans">
                Your account is protected
              </p>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <button
            type="button"
            onClick={onLockAccount}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-50 hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Lock size={16} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-red-500 font-display">
                Lock Account
              </p>
              <p className="text-[10px] text-gray-400 font-sans">
                Go back to PIN screen
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>

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
                  placeholder="10-digit number"
                  value={editPhone}
                  onChange={(e) =>
                    setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="rounded-xl border-gray-200 pl-10"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
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

      {/* Change PIN Dialog */}
      <Dialog open={changePinOpen} onOpenChange={setChangePinOpen}>
        <DialogContent className="w-[340px] rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <KeyRound size={14} className="text-orange-500" />
              </div>
              Change PIN
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Current PIN
              </Label>
              <div className="relative">
                <Input
                  type={showOldPin ? "text" : "password"}
                  placeholder="Enter current PIN"
                  value={oldPin}
                  onChange={(e) =>
                    setOldPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="rounded-xl border-gray-200 pr-10 tracking-widest text-lg"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowOldPin(!showOldPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">New PIN</Label>
              <div className="relative">
                <Input
                  type={showNewPin ? "text" : "password"}
                  placeholder="Enter new PIN"
                  value={newPin}
                  onChange={(e) =>
                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  className="rounded-xl border-gray-200 pr-10 tracking-widest text-lg"
                  inputMode="numeric"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-sans">
                Confirm New PIN
              </Label>
              <Input
                type="password"
                placeholder="Re-enter new PIN"
                value={confirmNewPin}
                onChange={(e) =>
                  setConfirmNewPin(
                    e.target.value.replace(/\D/g, "").slice(0, 4),
                  )
                }
                className="rounded-xl border-gray-200 tracking-widest text-lg"
                inputMode="numeric"
                maxLength={4}
              />
            </div>

            {newPin.length === 4 && confirmNewPin.length === 4 && (
              <div
                className={`text-xs font-sans px-3 py-2 rounded-xl ${
                  newPin === confirmNewPin
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {newPin === confirmNewPin
                  ? "✓ PINs match"
                  : "✗ PINs don't match"}
              </div>
            )}

            <Button
              onClick={handleChangePin}
              disabled={changePin.isPending}
              className="w-full rounded-xl h-11 text-white text-sm font-bold font-display"
              style={{ backgroundColor: "oklch(0.60 0.17 40)" }}
            >
              {changePin.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  Updating...
                </span>
              ) : (
                "Update PIN"
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
