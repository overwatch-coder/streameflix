"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/settings-context";
import { Button } from "@/components/ui/button";
import { X, Cookie, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const { settings, setCookieConsent, updatePreferences } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner only if consent hasn't been given
    if (!settings.cookieConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [settings.cookieConsent]);

  const handleAcceptAll = () => {
    updatePreferences({ functional: true, analytics: true });
    setCookieConsent(true);
    setIsVisible(false);
  };

  const handleNecessaryOnly = () => {
    updatePreferences({ functional: false, analytics: false });
    setCookieConsent(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />

        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4 mb-4">
          <div className="h-10 w-10 bg-red-600/10 rounded-xl flex items-center justify-center shrink-0">
            <Cookie className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">
              We value your privacy
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic,
              and deliver social features.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Accept All
            </Button>
            <Button
              onClick={handleNecessaryOnly}
              variant="outline"
              className="flex-1 border-gray-700 hover:bg-gray-800 text-white font-medium"
            >
              Necessary Only
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-1">
            <Link
              href="/cookies"
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              onClick={() => setIsVisible(false)}
            >
              <Settings className="h-3 w-3" /> Customize Settings
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
