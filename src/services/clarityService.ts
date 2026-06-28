/**
 * Clinza Premium E-Commerce Microsoft Clarity Integration
 * Drives heatmaps, scroll depth tracking, and user sessions.
 */

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

const CLARITY_ID = ((import.meta as any).env?.VITE_CLARITY_ID || "CLARITY_ID_PLACEHOLDER") as string;

export function initClarity() {
  if (typeof window === "undefined") return;

  if (CLARITY_ID && CLARITY_ID !== "CLARITY_ID_PLACEHOLDER") {
    // Standard Microsoft Clarity inline installation code snippet
    (function (c: any, l: any, a: any, r: any, i: any, t?: any, y?: any) {
      c[a] = c[a] || function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);

    console.log(`[Microsoft Clarity] Active with Tracking ID: ${CLARITY_ID}`);
  } else {
    console.warn("[Microsoft Clarity] ID is missing or set to placeholder. Clarity logs bypassed.");
  }
}

/**
 * Tracks custom user interactions inside session logs (Clarity Custom Events)
 */
export function trackClarityEvent(key: string, value: string) {
  if (typeof window === "undefined" || !window.clarity) return;
  window.clarity("event", key, value);
}
