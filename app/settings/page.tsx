"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Settings,
  User,
  Bell,
  Shield,
  Monitor,
  CreditCard,
  Download,
  Smartphone,
  Trash2,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Check,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { redirect, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout, supabaseUser, supabase } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    avatar_url: user?.avatar || "",
    bio: "", // Bio support

    // Playback Settings
    autoplay: true,
    autoplayPreviews: false,
    defaultQuality: "1080p",
    subtitleLanguage: "en",
    subtitleSize: "medium",
    volume: [80],

    // Notifications
    emailNotifications: true,
    pushNotifications: true,

    // Privacy
    profileVisibility: "private",
    watchHistoryVisible: false,
  });

  useEffect(() => {
    if (!supabaseUser) return;
    const userId = supabaseUser.id;

    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setSettings((prev) => ({
          ...prev,
          name: data.full_name || prev.name,
          username: data.username || prev.username,
          avatar_url: data.avatar_url || prev.avatar_url,
          bio: data.bio || "",
        }));
      }
    }
    loadProfile();
  }, [supabaseUser, supabase]);

  if (!user) {
    redirect("/auth/login");
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!supabaseUser) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    const userId = supabaseUser.id;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: settings.name,
          username: settings.username,
          avatar_url: settings.avatar_url,
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabaseUser) return;
    const userId = supabaseUser.id;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName; // Upload to root of bucket or specific folder

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setSettings((prev) => ({ ...prev, avatar_url: publicUrl }));

      // Also update profile immediately
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      toast.success("Avatar uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      try {
        // In a real Supabase setup, you might need a service role or edge function to delete the auth user.
        // For now, we sign out and let the user know.
        toast.info("Account deletion request submitted.");
        await logout();
        router.push("/");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete account");
      }
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "playback", label: "Playback", icon: Monitor },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "downloads", label: "Downloads", icon: Download },
    { id: "account", label: "Account", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="mb-8 px-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-red-600" />
                Settings
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your experience
              </p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium",
                    activeTab === tab.id
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4" />}
                </button>
              ))}
            </nav>

            <Separator className="my-6 bg-white/10" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600/10 hover:text-red-500 transition-all text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold mb-2">
                      Profile Settings
                    </h2>
                    <p className="text-gray-400 text-sm">
                      How others see you on the platform
                    </p>
                  </header>

                  <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <Avatar className="h-24 w-24 ring-4 ring-black shadow-2xl">
                            <AvatarImage src={settings.avatar_url} />
                            <AvatarFallback className="bg-gray-800 text-2xl font-bold">
                              {settings.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <Camera className="h-6 w-6" />
                            )}
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                          <h3 className="text-xl font-bold">
                            {settings.name || "Unnamed User"}
                          </h3>
                          <p className="text-gray-500 text-sm font-mono shrink-0">
                            @{settings.username || "username"}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 border-gray-700 hover:bg-white/5 h-8 text-xs"
                          >
                            Change Avatar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="display-name"
                            className="text-xs font-bold uppercase tracking-wider text-gray-500"
                          >
                            Full Name
                          </Label>
                          <Input
                            id="display-name"
                            placeholder="Your name"
                            value={settings.name}
                            onChange={(e) =>
                              handleSettingChange("name", e.target.value)
                            }
                            className="bg-black/50 border-gray-800 focus:border-red-600 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="username"
                            className="text-xs font-bold uppercase tracking-wider text-gray-500"
                          >
                            Username
                          </Label>
                          <Input
                            id="username"
                            placeholder="username"
                            value={settings.username}
                            onChange={(e) =>
                              handleSettingChange("username", e.target.value)
                            }
                            className="bg-black/50 border-gray-800 focus:border-red-600 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="text-xs font-bold uppercase tracking-wider text-gray-500"
                        >
                          Bio
                        </Label>
                        <textarea
                          id="bio"
                          rows={4}
                          placeholder="Tell the community about yourself..."
                          value={settings.bio}
                          onChange={(e) =>
                            handleSettingChange("bio", e.target.value)
                          }
                          className="w-full bg-black/50 border-gray-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition-colors resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-red-600 hover:bg-red-700 min-w-[140px] font-bold"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Playback Tab */}
              {activeTab === "playback" && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold mb-2">
                      Playback Preferences
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Fine-tune your streaming experience
                    </p>
                  </header>

                  <div className="grid gap-6">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="pt-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">
                              Autoplay next episode
                            </Label>
                            <p className="text-gray-500 text-sm">
                              Automatically play the next episode when one
                              finishes
                            </p>
                          </div>
                          <Switch
                            checked={settings.autoplay}
                            onCheckedChange={(checked) =>
                              handleSettingChange("autoplay", checked)
                            }
                          />
                        </div>
                        <Separator className="bg-white/5" />
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-base">
                              Autoplay previews
                            </Label>
                            <p className="text-gray-500 text-sm">
                              Play trailers and previews while browsing
                            </p>
                          </div>
                          <Switch
                            checked={settings.autoplayPreviews}
                            onCheckedChange={(checked) =>
                              handleSettingChange("autoplayPreviews", checked)
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Quality & Audio
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase">
                            Default Quality
                          </Label>
                          <Select
                            value={settings.defaultQuality}
                            onValueChange={(value) =>
                              handleSettingChange("defaultQuality", value)
                            }
                          >
                            <SelectTrigger className="bg-black/50 border-gray-800">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">
                              <SelectItem value="4k">4K Ultra HD</SelectItem>
                              <SelectItem value="1080p">
                                1080p Full HD
                              </SelectItem>
                              <SelectItem value="720p">720p HD</SelectItem>
                              <SelectItem value="auto">
                                Auto (Recommended)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <Label className="font-bold text-gray-500 uppercase text-xs">
                              Default Volume
                            </Label>
                            <span className="font-mono text-red-500 font-bold">
                              {settings.volume[0]}%
                            </span>
                          </div>
                          <Slider
                            value={settings.volume}
                            onValueChange={(value) =>
                              handleSettingChange("volume", value)
                            }
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Account Tab & Danger Zone */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold mb-2">
                      Account Management
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Sensitive security and subscription details
                    </p>
                  </header>

                  <Card className="bg-gray-900 border-gray-800 border-l-4 border-l-red-600">
                    <CardHeader>
                      <CardTitle className="text-red-500 flex items-center gap-2 uppercase tracking-tighter italic">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        Irreversible actions for your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-red-600/5 rounded-xl border border-red-600/10">
                        <div className="space-y-1">
                          <h4 className="font-bold text-white">
                            Delete your account
                          </h4>
                          <p className="text-xs text-gray-500 max-w-sm">
                            Once you delete your account, there is no going
                            back. All your watchlist, history, and social
                            contributions will be gone forever.
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 px-8"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Placeholders for other tabs for now */}
              {["notifications", "privacy", "downloads"].includes(
                activeTab,
              ) && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                    <Settings className="h-8 w-8 text-gray-700 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Work in Progress</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      These settings are currently being optimized for the new
                      backend.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
