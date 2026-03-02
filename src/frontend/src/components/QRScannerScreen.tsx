import { ArrowLeft, CameraOff, Image, X, Zap, ZapOff } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface QRScannerScreenProps {
  onBack: () => void;
}

export default function QRScannerScreen({ onBack }: QRScannerScreenProps) {
  const [flashOn, setFlashOn] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStatus("granted");
    } catch (err) {
      console.error("Camera error:", err);
      setCameraStatus("denied");
      toast.error(
        "Camera access denied. Please allow camera in browser settings.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  };

  const handleFlashToggle = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      // @ts-ignore - torch is not in standard TS types yet
      await track.applyConstraints({ advanced: [{ torch: !flashOn }] });
      setFlashOn((prev) => !prev);
      toast.info(!flashOn ? "Flashlight on" : "Flashlight off");
    } catch {
      toast.info("Torch not supported on this device");
    }
  };

  const handleUploadGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info(`Selected: ${file.name} — QR decode coming soon`);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="h-full flex flex-col bg-black screen-enter">
      {/* Hidden file input for gallery access */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
      />
      {/* Header */}
      <div className="bg-pp-purple flex items-center gap-4 px-4 py-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="text-white" size={18} strokeWidth={2.5} />
        </button>
        <h1 className="text-white font-bold font-display text-base">
          Scan QR Code
        </h1>
      </div>

      {/* Hint text */}
      <div className="bg-black py-4 text-center shrink-0">
        <p className="text-white/60 text-xs font-sans">
          {cameraStatus === "denied"
            ? "Camera access denied. Please enable in browser settings."
            : "Position the QR code inside the frame to scan"}
        </p>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-center justify-center px-6 bg-black">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: "100%",
            maxWidth: "300px",
            aspectRatio: "1 / 1",
            background: "rgba(20, 20, 25, 0.95)",
          }}
        >
          {/* Live camera feed */}
          {cameraStatus === "granted" && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Denied / idle state */}
          {cameraStatus === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <CameraOff className="text-white/40" size={48} />
              <p className="text-white/50 text-xs text-center px-4 font-sans">
                Camera access required
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 rounded-lg bg-pp-purple text-white text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* Requesting */}
          {cameraStatus === "requesting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/50 text-xs font-sans">
                Requesting camera...
              </p>
            </div>
          )}

          {/* Dark overlay grid -- shown only when no camera */}
          {cameraStatus !== "granted" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
          )}

          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg z-10" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg z-10" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg z-10" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg z-10" />

          {/* Animated scan line (only when camera active) */}
          {cameraStatus === "granted" && (
            <div className="scan-line z-20" style={{ left: 0, right: 0 }}>
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.65 0.20 250), oklch(0.75 0.22 220), oklch(0.65 0.20 250), transparent)",
                  boxShadow:
                    "0 0 8px oklch(0.65 0.20 250 / 0.8), 0 0 20px oklch(0.65 0.20 250 / 0.4)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="bg-white shrink-0 px-6 py-6 space-y-4"
        style={{ borderTopLeftRadius: "28px", borderTopRightRadius: "28px" }}
      >
        <div className="flex items-center justify-center gap-8">
          {/* Flashlight button */}
          <button
            type="button"
            onClick={handleFlashToggle}
            disabled={cameraStatus !== "granted"}
            className="flex flex-col items-center gap-2 group disabled:opacity-40"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                flashOn
                  ? "bg-yellow-100 shadow-md"
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}
            >
              {flashOn ? (
                <Zap className="text-yellow-600" size={22} strokeWidth={2} />
              ) : (
                <ZapOff className="text-gray-500" size={22} strokeWidth={2} />
              )}
            </div>
            <span className="text-xs text-gray-500 font-sans">
              {flashOn ? "Flash On" : "Flashlight"}
            </span>
          </button>

          {/* Divider */}
          <div className="h-12 w-px bg-gray-100" />

          {/* Upload from Gallery */}
          <button
            type="button"
            onClick={handleUploadGallery}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Image className="text-gray-500" size={22} strokeWidth={2} />
            </div>
            <span className="text-xs text-gray-500 font-sans">Gallery</span>
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 mx-auto text-xs text-pp-purple font-semibold font-sans"
          >
            <X size={14} />
            Cancel Scan
          </button>
        </div>
      </div>
    </div>
  );
}
