"use client";

import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface UserSettings {
  theme: "dark" | "light" | "system";
  colorScheme: "blue" | "green" | "purple";
  animations: boolean;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  accessibility: {
    textSize: "small" | "medium" | "large";
  };
}

const defaultSettings: UserSettings = {
  theme: "dark",
  colorScheme: "blue",
  animations: true,
  language: "en",
  currency: "rwf",
  timezone: "cat",
  dateFormat: "dmy",
  accessibility: {
    textSize: "medium",
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing saved settings:", error);
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setIsLoading(true);
    try {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        return updated;
      });
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    setIsLoading(true);
    try {
      setSettings(defaultSettings);
      toast.success("Settings reset to defaults");
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-blue-200">Customize your banking experience</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription className="text-blue-200">
              Customize how the banking interface looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) =>
                  updateSettings({
                    theme: value as "dark" | "light" | "system",
                  })
                }
                className="flex gap-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-blue-900 shadow-sm">
                    <Moon className="h-6 w-6 text-blue-300" />
                  </div>
                  <RadioGroupItem value="dark" id="dark" className="sr-only" />
                  <Label
                    htmlFor="dark"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Dark
                  </Label>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-white shadow-sm">
                    <Sun className="h-6 w-6 text-blue-900" />
                  </div>
                  <RadioGroupItem
                    value="light"
                    id="light"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="light"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Light
                  </Label>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-blue-700 bg-gradient-to-b from-white to-blue-900 shadow-sm">
                    <Palette className="h-6 w-6 text-blue-700" />
                  </div>
                  <RadioGroupItem
                    value="system"
                    id="system"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="system"
                    className="cursor-pointer text-sm font-normal"
                  >
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <RadioGroup
                value={settings.colorScheme}
                onValueChange={(value) =>
                  updateSettings({
                    colorScheme: value as "blue" | "green" | "purple",
                  })
                }
                className="flex gap-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 shadow-sm" />
                  <RadioGroupItem value="blue" id="blue" className="sr-only" />
                  <Label
                    htmlFor="blue"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Blue
                  </Label>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-600 shadow-sm" />
                  <RadioGroupItem
                    value="green"
                    id="green"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="green"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Green
                  </Label>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-600 shadow-sm" />
                  <RadioGroupItem
                    value="purple"
                    id="purple"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="purple"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Purple
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Animations</Label>
                <Switch
                  id="animations"
                  checked={settings.animations}
                  onCheckedChange={(checked) =>
                    updateSettings({ animations: checked })
                  }
                />
              </div>
              <p className="text-sm text-blue-200">
                Enable or disable animations throughout the interface
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
            <CardDescription className="text-blue-200">
              Set your preferred language and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => updateSettings({ language: value })}
              >
                <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSettings({ currency: value })}
              >
                <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="rwf">Rwandan Franc (RWF)</SelectItem>
                  <SelectItem value="usd">US Dollar (USD)</SelectItem>
                  <SelectItem value="eur">Euro (EUR)</SelectItem>
                  <SelectItem value="gbp">British Pound (GBP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => updateSettings({ timezone: value })}
              >
                <SelectTrigger className="border-blue-700 bg-blue-900/50 text-white">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="bg-blue-900 text-white">
                  <SelectItem value="cat">Central Africa Time (CAT)</SelectItem>
                  <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                  <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                  <SelectItem value="est">
                    Eastern Standard Time (EST)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) =>
                    updateSettings({ dateFormat: value })
                  }
                >
                  <SelectTrigger className="w-[180px] border-blue-700 bg-blue-900/50 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-900 text-white">
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-800/50 text-white">
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription className="text-blue-200">
              Customize accessibility settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Text Size</Label>
              <RadioGroup
                value={settings.accessibility.textSize}
                onValueChange={(value) =>
                  updateSettings({
                    accessibility: {
                      textSize: value as "small" | "medium" | "large",
                    },
                  })
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label
                    htmlFor="small"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Small
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label
                    htmlFor="medium"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Medium
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label
                    htmlFor="large"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Large
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-yellow-500 text-blue-900 hover:bg-yellow-400"
              disabled={isLoading}
              onClick={resetSettings}
            >
              Reset to Default Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
