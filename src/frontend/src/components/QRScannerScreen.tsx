import { ArrowLeft, Flashlight, Image, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QRScannerScreenProps {
  onBack: () => void;
}

export default function QRScannerScreen({ onBack }: QRScannerScreenProps) {
  const [flashOn, setFlashOn] = useState(false);

  const handleFlashToggle = () => {
    setFlashOn((prev) => !prev);
    toast.info(flashOn ? "Flashlight off" : "Flashlight on");
  };

  const handleUploadGallery = () => {
    toast.info("Gallery upload coming soon!");
  };

  return (
    <div className="h-full flex flex-col bg-black screen-enter">
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
          Position the QR code inside the frame to scan
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
          {/* Dark camera viewfinder background */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Corner brackets */}
          {/* Top-left */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg z-10" />
          {/* Top-right */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg z-10" />
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg z-10" />
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg z-10" />

          {/* Animated scan line */}
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

          {/* QR code placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              opacity={0.15}
              role="img"
              aria-label="QR code placeholder"
            >
              <rect
                x="10"
                y="10"
                width="30"
                height="30"
                rx="3"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <rect x="18" y="18" width="14" height="14" fill="white" rx="1" />
              <rect
                x="60"
                y="10"
                width="30"
                height="30"
                rx="3"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <rect x="68" y="18" width="14" height="14" fill="white" rx="1" />
              <rect
                x="10"
                y="60"
                width="30"
                height="30"
                rx="3"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <rect x="18" y="68" width="14" height="14" fill="white" rx="1" />
              <rect x="60" y="60" width="8" height="8" fill="white" rx="1" />
              <rect x="72" y="60" width="8" height="8" fill="white" rx="1" />
              <rect x="60" y="72" width="8" height="8" fill="white" rx="1" />
              <rect x="72" y="72" width="18" height="18" fill="white" rx="1" />
              <rect x="46" y="10" width="8" height="8" fill="white" rx="1" />
              <rect x="46" y="24" width="8" height="8" fill="white" rx="1" />
              <rect x="10" y="46" width="8" height="8" fill="white" rx="1" />
              <rect x="24" y="46" width="8" height="8" fill="white" rx="1" />
              <rect x="46" y="46" width="8" height="8" fill="white" rx="1" />
            </svg>
          </div>
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
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                flashOn
                  ? "bg-yellow-100 shadow-md"
                  : "bg-gray-100 group-hover:bg-gray-200"
              }`}
            >
              <Flashlight
                className={flashOn ? "text-yellow-600" : "text-gray-500"}
                size={22}
                strokeWidth={2}
              />
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
