"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

interface Settings {
  cookieConsent: boolean;
  preferences: CookiePreferences;
  volume: number;
  playbackSpeed: number;
}

interface SettingsContextType {
  settings: Settings;
  setCookieConsent: (consent: boolean) => void;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  updateVolume: (volume: number) => void;
  updatePlaybackSpeed: (speed: number) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: false,
};

const defaultSettings: Settings = {
  cookieConsent: false,
  preferences: defaultPreferences,
  volume: 1,
  playbackSpeed: 1,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("streameflix-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("streameflix-settings", JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const setCookieConsent = (consent: boolean) => {
    setSettings((prev) => ({ ...prev, cookieConsent: consent }));
  };

  const updatePreferences = (prefs: Partial<CookiePreferences>) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...prefs, essential: true },
    }));
  };

  const updateVolume = (volume: number) => {
    if (settings.preferences.functional) {
      setSettings((prev) => ({ ...prev, volume }));
    }
  };

  const updatePlaybackSpeed = (speed: number) => {
    if (settings.preferences.functional) {
      setSettings((prev) => ({ ...prev, playbackSpeed: speed }));
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setCookieConsent,
        updatePreferences,
        updateVolume,
        updatePlaybackSpeed,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
