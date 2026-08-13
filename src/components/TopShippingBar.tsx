import React, { useState, useEffect } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { getThemeConfig } from "../utils";

interface TopShippingBarProps {
  setRoute?: (route: string) => void;
}

export const TopShippingBar: React.FC<TopShippingBarProps> = ({ setRoute }) => {
  const [themeConfig, setThemeConfig] = useState(() => getThemeConfig(false));
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setThemeConfig(getThemeConfig(false));
    };
    window.addEventListener("clinza_theme_updated", handleUpdate);
    window.addEventListener("clinza_homepage_updated", handleUpdate);
    return () => {
      window.removeEventListener("clinza_theme_updated", handleUpdate);
      window.removeEventListener("clinza_homepage_updated", handleUpdate);
    };
  }, []);

  const announcement = themeConfig?.announcement;

  if (!announcement || announcement.enabled === false || isDismissed) {
    return null;
  }

  const handleCtaClick = () => {
    if (announcement.link && setRoute) {
      setRoute(announcement.link);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      id="store-announcement-bar"
      style={{
        backgroundColor: announcement.bgColor || "#F27D26",
        color: announcement.textColor || "#FFFFFF"
      }}
      className="w-full relative z-[10000] px-4 py-2 text-center text-xs font-sans font-bold flex items-center justify-between shadow-xs transition-all duration-300 min-h-[36px]"
    >
      <div className="flex-1 flex items-center justify-center gap-2 truncate px-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-90 animate-pulse" />
        <span className="truncate tracking-wide text-[11px] sm:text-xs">
          {announcement.text || "🔥 EXCLUSIVE DISCOUNTS: Flat 10% OFF + Free Cash On Delivery (COD) India-Wide Above ₹999!"}
        </span>
        {announcement.link && (
          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-85 cursor-pointer ml-1 text-[11px] font-extrabold uppercase shrink-0 font-mono"
          >
            Shop Now <ArrowRight className="h-3 w-3 inline" />
          </button>
        )}
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer shrink-0 ml-2"
        aria-label="Dismiss Announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default TopShippingBar;


