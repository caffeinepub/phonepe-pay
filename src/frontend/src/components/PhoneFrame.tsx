import { Battery, Signal, Wifi } from "lucide-react";
import type { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div
      className="phone-frame bg-white flex flex-col"
      style={{ width: 390, height: 844 }}
    >
      {/* Status Bar */}
      <div
        className="flex items-center justify-between px-6 py-2 shrink-0 bg-pp-purple"
        style={{ paddingTop: "14px", paddingBottom: "8px" }}
      >
        <span className="text-white text-xs font-semibold font-display tracking-wide">
          {timeString}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-white text-[10px] font-bold tracking-wider">
            5G
          </span>
          <Signal className="text-white" size={12} strokeWidth={2.5} />
          <Wifi className="text-white" size={12} strokeWidth={2.5} />
          <div className="flex items-center gap-0.5">
            <div className="w-5 h-2.5 rounded-sm border border-white/80 flex items-center p-[2px]">
              <div className="h-full w-[70%] rounded-[1px] bg-white" />
            </div>
            <div className="w-0.5 h-1.5 rounded-r-sm bg-white/60" />
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 overflow-hidden relative">{children}</div>
    </div>
  );
}
