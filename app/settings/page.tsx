"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

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
    newReleases: true,
    recommendations: false,

    // Privacy
    profileVisibility: "private",
    watchHistoryVisible: false,
    dataCollection: true,

    // Parental Controls
    parentalControls: false,
    maturityRating: "R",

    // Download Settings
    downloadQuality: "720p",
    wifiOnlyDownloads: true,
    autoDeleteWatched: false,
  })

  if (!user) {
    redirect("/auth/login")
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = () => {
    // Here you would typically save to your backend
    console.log("Saving profile settings:", settings)
    alert("Profile settings saved!")
  }

  const handleChangePassword = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    // Here you would typically change password via API
    console.log("Changing password")
    alert("Password changed successfully!")
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Here you would typically delete account via API
      console.log("Deleting account")
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-400">Manage your account and streaming preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-red-600">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="playback" className="text-white data-[state=active]:bg-red-600">
              <Monitor className="h-4 w-4 mr-2" />
              Playback
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-red-600">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-white data-[state=active]:bg-red-600">
              <Shield className="h-4 w-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="downloads" className="text-white data-[state=active]:bg-red-600">
              <Download className="h-4 w-4 mr-2" />
              Downloads
            </TabsTrigger>
            <TabsTrigger value="account" className="text-white data-[state=active]:bg-red-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleSettingChange("name", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange("email", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700">
                    Save Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-white">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) => handleSettingChange("currentPassword", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword" className="text-white">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={settings.newPassword}
                        onChange={(e) => handleSettingChange("newPassword", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={settings.confirmPassword}
                        onChange={(e) => handleSettingChange("confirmPassword", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} className="bg-red-600 hover:bg-red-700">
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Playback Settings */}
          <TabsContent value="playback" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Video Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Default Video Quality</Label>
                    <Select
                      value={settings.defaultQuality}
                      onValueChange={(value) => handleSettingChange("defaultQuality", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="480p">480p SD</SelectItem>
                        <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Subtitles & Audio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Subtitle Language</Label>
                      <Select
                        value={settings.subtitleLanguage}
                        onValueChange={(value) => handleSettingChange("subtitleLanguage", value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white">Subtitle Size</Label>
                      <Select
                        value={settings.subtitleSize}
                        onValueChange={(value) => handleSettingChange("subtitleSize", value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Default Volume: {settings.volume[0]}%</Label>
                    <Slider
                      value={settings.volume}
                      onValueChange={(value) => handleSettingChange("volume", value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Autoplay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Autoplay next episode</Label>
                      <p className="text-gray-400 text-sm">Automatically play the next episode in a series</p>
                    </div>
                    <Switch
                      checked={settings.autoplay}
                      onCheckedChange={(checked) => handleSettingChange("autoplay", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Autoplay previews</Label>
                      <p className="text-gray-400 text-sm">Play previews while browsing</p>
                    </div>
                    <Switch
                      checked={settings.autoplayPreviews}
                      onCheckedChange={(checked) => handleSettingChange("autoplayPreviews", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Email notifications</Label>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Push notifications</Label>
                    <p className="text-gray-400 text-sm">Receive push notifications on your devices</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">New releases</Label>
                    <p className="text-gray-400 text-sm">Get notified about new movies and shows</p>
                  </div>
                  <Switch
                    checked={settings.newReleases}
                    onCheckedChange={(checked) => handleSettingChange("newReleases", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Recommendations</Label>
                    <p className="text-gray-400 text-sm">Personalized content suggestions</p>
                  </div>
                  <Switch
                    checked={settings.recommendations}
                    onCheckedChange={(checked) => handleSettingChange("recommendations", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) => handleSettingChange("profileVisibility", value)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Show watch history</Label>
                      <p className="text-gray-400 text-sm">Allow others to see what you've watched</p>
                    </div>
                    <Switch
                      checked={settings.watchHistoryVisible}
                      onCheckedChange={(checked) => handleSettingChange("watchHistoryVisible", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Data & Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Data collection</Label>
                      <p className="text-gray-400 text-sm">Help improve our service with usage data</p>
                    </div>
                    <Switch
                      checked={settings.dataCollection}
                      onCheckedChange={(checked) => handleSettingChange("dataCollection", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Parental Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable parental controls</Label>
                      <p className="text-gray-400 text-sm">Restrict content based on maturity ratings</p>
                    </div>
                    <Switch
                      checked={settings.parentalControls}
                      onCheckedChange={(checked) => handleSettingChange("parentalControls", checked)}
                    />
                  </div>
                  {settings.parentalControls && (
                    <div>
                      <Label className="text-white">Maximum maturity rating</Label>
                      <Select
                        value={settings.maturityRating}
                        onValueChange={(value) => handleSettingChange("maturityRating", value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="G">G - General Audiences</SelectItem>
                          <SelectItem value="PG">PG - Parental Guidance</SelectItem>
                          <SelectItem value="PG-13">PG-13 - Parents Strongly Cautioned</SelectItem>
                          <SelectItem value="R">R - Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Downloads */}
          <TabsContent value="downloads" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Download Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Download Quality</Label>
                  <Select
                    value={settings.downloadQuality}
                    onValueChange={(value) => handleSettingChange("downloadQuality", value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1080p">1080p (High Quality)</SelectItem>
                      <SelectItem value="720p">720p (Standard)</SelectItem>
                      <SelectItem value="480p">480p (Basic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Wi-Fi only downloads</Label>
                    <p className="text-gray-400 text-sm">Only download when connected to Wi-Fi</p>
                  </div>
                  <Switch
                    checked={settings.wifiOnlyDownloads}
                    onCheckedChange={(checked) => handleSettingChange("wifiOnlyDownloads", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Auto-delete watched downloads</Label>
                    <p className="text-gray-400 text-sm">Automatically remove downloads after watching</p>
                  </div>
                  <Switch
                    checked={settings.autoDeleteWatched}
                    onCheckedChange={(checked) => handleSettingChange("autoDeleteWatched", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account */}
          <TabsContent value="account" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <h3 className="text-white font-semibold">Premium Plan</h3>
                      <p className="text-gray-400 text-sm">4K streaming, unlimited downloads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">$14.99/month</p>
                      <p className="text-gray-400 text-sm">Next billing: Jan 25, 2024</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                      Change Plan
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800 bg-transparent">
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-red-500">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                    <h3 className="text-white font-semibold mb-2">Delete Account</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
