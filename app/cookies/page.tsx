"use client";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/settings-context";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Cookies() {
  const { settings, updatePreferences, resetToDefaults } = useSettings();
  const [localPrefs, setLocalPrefs] = useState(settings.preferences);

  // Sync local state when settings load initially
  useEffect(() => {
    setLocalPrefs(settings.preferences);
  }, [settings.preferences]);

  const handleSave = () => {
    updatePreferences(localPrefs);
    toast.success("Preferences saved successfully!", {
      description: "Your cookie settings have been updated.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    toast.info("Preferences reset to defaults.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Cookie Preferences
      </h1>
      <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-8">
        <div className="space-y-4">
          <p className="text-gray-400">
            We use cookies and similar technologies to help provide, protect,
            and improve StreameFlix. You can manage your preferences below.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Essential Cookies</h3>
              <p className="text-xs text-gray-500">
                Required for the site to function properly, such as
                authentication and security.
              </p>
            </div>
            <Switch checked disabled />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Functional Cookies</h3>
              <p className="text-xs text-gray-500">
                Used to remember your preferences like volume, playback speed,
                and theme.
              </p>
            </div>
            <Switch
              checked={localPrefs.functional}
              onCheckedChange={(checked) =>
                setLocalPrefs((prev) => ({ ...prev, functional: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Analytics Cookies</h3>
              <p className="text-xs text-gray-500">
                Help us understand how people use StreameFlix so we can make it
                better.
              </p>
            </div>
            <Switch
              checked={localPrefs.analytics}
              onCheckedChange={(checked) =>
                setLocalPrefs((prev) => ({ ...prev, analytics: checked }))
              }
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Button variant="ghost" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={handleSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
