"use client";

import React, { useState } from "react";
import { Moon, User, Bell, Palette, RefreshCw, Send } from "lucide-react";
import {
  requestNotificationPermission,
  showNotification,
} from "@/lib/firebase";

interface SettingsViewProps {
  tasks?: any[];
}

const SettingsView: React.FC<SettingsViewProps> = ({ tasks = [] }) => {
  const [isTestingNotif, setIsTestingNotif] = useState(false);
  const [notifStatus, setNotifStatus] = useState<string>("");

  const handleTestNotification = async () => {
    setIsTestingNotif(true);
    setNotifStatus("");

    try {
      // Request permission and get FCM token
      const token = await requestNotificationPermission();

      if (!token) {
        setNotifStatus("❌ Permission denied or not supported");
        setIsTestingNotif(false);
        return;
      }

      // Save FCM token to backend (if it's an actual token, not just "permission-granted")
      if (token !== "permission-granted") {
        try {
          await fetch("/api/notifications/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, userId: "default-user" }),
          });
          console.log("FCM token saved to backend");
        } catch (saveError) {
          console.warn("Could not save FCM token:", saveError);
        }
      }

      // Get a random incomplete task
      const incompleteTasks = tasks.filter((t) => !t.completed);
      const randomTask =
        incompleteTasks.length > 0
          ? incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)]
          : null;

      if (!randomTask) {
        setNotifStatus("⚠️ No tasks available for notification");
        setIsTestingNotif(false);
        return;
      }

      let fcmSent = false;

      if (token !== "permission-granted") {
        try {
          const res = await fetch("/api/notifications/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              title: "🎯 Task Reminder",
              body: `Don't forget: ${randomTask.title}`,
              data: {
                taskId: String(randomTask.id ?? ""),
                url: window.location.origin,
              },
            }),
          });

          fcmSent = res.ok;
        } catch (sendError) {
          console.warn("Could not send FCM notification:", sendError);
        }
      }

      if (fcmSent) {
        setNotifStatus(
          "✅ Test notification sent via FCM! Check system notifications."
        );
        return;
      }

      // Fallback: show via ServiceWorker (new Notification() illegal when SW controls page)
      if ("Notification" in window && Notification.permission === "granted") {
        await showNotification("🎯 Task Reminder", {
          body: `Don't forget: ${randomTask.title}`,
          tag: randomTask.id,
          requireInteraction: false,
          data: {
            taskId: randomTask.id,
            url: window.location.origin,
          },
        });

        setNotifStatus(
          token !== "permission-granted"
            ? "✅ Local notification sent (FCM send failed)."
            : "✅ Test notification sent! (Basic mode - scheduled reminders need FCM setup)"
        );
      } else {
        setNotifStatus("❌ Notification permission not granted");
      }
    } catch (error) {
      console.error("Test notification error:", error);
      const msg = error instanceof Error ? error.message : String(error);
      setNotifStatus(msg.startsWith("❌") ? msg : `❌ ${msg}`);
    } finally {
      setIsTestingNotif(false);
    }
  };
  return (
    <div className="space-y-8 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <span className="text-xs text-slate-500">Personalize your space</span>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
            FJ
          </div>
          <div>
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-lg font-semibold text-white">Fajar</p>
          </div>
        </div>
        <button className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
          Edit Profile
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          General
        </h3>
        <SettingItem
          icon={<User size={20} />}
          title="Profile"
          subtitle="Fajar"
        />
        <SettingItem
          icon={<Moon size={20} />}
          title="Theme"
          subtitle="Dark Mode (Active)"
          toggle
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          Preferences
        </h3>
        <SettingItem
          icon={<Palette size={20} />}
          title="Accent Color"
          subtitle="Violet"
        />
        <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
          <p className="text-xs text-slate-500 mb-3">Choose your accent</p>
          <div className="flex items-center space-x-3">
            {["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"].map(
              (c) => (
                <button
                  key={c}
                  className="w-8 h-8 rounded-full border border-white/10 shadow-inner"
                  style={{ backgroundColor: c }}
                  aria-label={`Select ${c}`}
                />
              )
            )}
          </div>
        </div>
        <SettingItem
          icon={<Bell size={20} />}
          title="Notifications"
          subtitle="On"
          toggle
          defaultChecked
        />

        {/* Test Notification Button */}
        <div className="bg-gradient-to-br from-violet-900/20 to-slate-900/50 border border-violet-500/20 p-4 rounded-2xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Send size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200">
                Test Push Notification
              </h4>
              <p className="text-xs text-slate-500">
                Send a test notification with a random task
              </p>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            disabled={isTestingNotif}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-violet-500 text-white hover:bg-violet-600 disabled:bg-violet-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isTestingNotif ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Test Notification</span>
              </>
            )}
          </button>

          {notifStatus && (
            <p className="text-xs text-center text-slate-300 bg-slate-800/50 px-3 py-2 rounded-lg">
              {notifStatus}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
          Data
        </h3>
        <SettingItem
          icon={<RefreshCw size={20} />}
          title="Backup & Sync"
          subtitle="Last sync: 2 min ago"
        />
      </div>

      <div className="pt-8 text-center">
        <p className="text-slate-600 text-xs">Mood Booster v1.0.0</p>
      </div>
    </div>
  );
};

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  toggle?: boolean;
  defaultChecked?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  toggle,
  defaultChecked,
}) => {
  return (
    <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-900 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-2 bg-slate-800 rounded-xl text-slate-300 group-hover:text-violet-400 group-hover:bg-violet-500/10 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {toggle ? (
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
          <input
            type="checkbox"
            name="toggle"
            id={title}
            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
            defaultChecked={defaultChecked}
            style={{
              right: defaultChecked ? 0 : "auto",
              left: defaultChecked ? "auto" : 0,
            }}
          />
          <label
            htmlFor={title}
            className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${
              defaultChecked ? "bg-violet-500" : "bg-slate-700"
            }`}
          ></label>
        </div>
      ) : null}
    </div>
  );
};

export default SettingsView;
