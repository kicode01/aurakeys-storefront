"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ConsentContextType {
  hasUserConsent: boolean;
  grantConsent: () => void;
  revokeConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType>({
  hasUserConsent: false,
  grantConsent: () => {},
  revokeConsent: () => {},
});

const CONSENT_COOKIE_KEY = "aura_user_consent";

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [hasUserConsent, setHasUserConsent] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  useEffect(() => {
    // Read consent from cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const consentCookie = cookies.find((c) => c.startsWith(`${CONSENT_COOKIE_KEY}=`));

    if (consentCookie) {
      const val = consentCookie.split("=")[1];
      setHasUserConsent(val === "true");
    } else {
      // Show subtle consent prompt if not yet decided
      const timer = setTimeout(() => setIsPromptVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const grantConsent = () => {
    document.cookie = `${CONSENT_COOKIE_KEY}=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;
    setHasUserConsent(true);
    setIsPromptVisible(false);

    // Notify Shopify Customer Privacy API if injected
    if (typeof window !== "undefined" && (window as unknown as { Shopify?: { customerPrivacy?: { setTrackingConsent: (val: boolean, cb: () => void) => void } } }).Shopify?.customerPrivacy) {
      (window as unknown as { Shopify: { customerPrivacy: { setTrackingConsent: (val: boolean, cb: () => void) => void } } }).Shopify.customerPrivacy.setTrackingConsent(true, () => {
        console.log("Shopify tracking consent acknowledged.");
      });
    }
  };

  const revokeConsent = () => {
    document.cookie = `${CONSENT_COOKIE_KEY}=false; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax; Secure`;
    setHasUserConsent(false);
    setIsPromptVisible(false);

    if (typeof window !== "undefined" && (window as unknown as { Shopify?: { customerPrivacy?: { setTrackingConsent: (val: boolean, cb: () => void) => void } } }).Shopify?.customerPrivacy) {
      (window as unknown as { Shopify: { customerPrivacy: { setTrackingConsent: (val: boolean, cb: () => void) => void } } }).Shopify.customerPrivacy.setTrackingConsent(false, () => {
        console.log("Shopify tracking consent revoked.");
      });
    }
  };

  return (
    <ConsentContext.Provider value={{ hasUserConsent, grantConsent, revokeConsent }}>
      {children}
      {isPromptVisible && (
        <aside
          aria-label="Privacy notice"
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50 p-4 rounded-xl bg-aura-panel/95 backdrop-blur-xl border border-aura-border text-foreground shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-aura-gold">Privacy & Analytics</p>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                AuraKeys uses minimal telemetry to optimize sound profile previews and cart speed according to Shopify headless guidelines.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={revokeConsent}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={grantConsent}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-aura-gold hover:bg-yellow-500 text-black transition-colors"
            >
              Accept All
            </button>
          </div>
        </aside>
      )}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => useContext(ConsentContext);
