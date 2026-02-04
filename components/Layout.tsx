"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  CheckSquare,
  Calendar,
  Settings,
  Plus,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Tab } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  onAddClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // Outer Container: Handles full screen background for desktop
    <div className="flex w-full bg-slate-950 md:items-center md:justify-center md:p-6 overflow-hidden app-shell">
      {/* App "Window" Wrapper for Desktop */}
      <div className="flex flex-col md:flex-row h-full w-full md:max-w-6xl md:h-[90vh] bg-slate-950 relative overflow-hidden md:rounded-3xl md:shadow-2xl md:border md:border-white/5 transition-all duration-300">
        {/* Background Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 md:w-96 md:h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* SIDEBAR (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-slate-900/30 backdrop-blur-xl p-6 z-20">
          <div className="flex items-center space-x-3 mb-10 pl-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="font-bold text-lg text-white tracking-tight">
              Mood Booster
            </h1>
          </div>

          <nav className="space-y-2 flex-1">
            <DesktopNavItem
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={20} />}
              label="Home"
            />
            <DesktopNavItem
              active={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              icon={<CheckSquare size={20} />}
              label="Tasks"
            />
            <DesktopNavItem
              active={activeTab === "schedule"}
              onClick={() => setActiveTab("schedule")}
              icon={<BookOpen size={20} />}
              label="Jadwal"
            />
            <DesktopNavItem
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              icon={<Calendar size={20} />}
              label="Calendar"
            />
            <DesktopNavItem
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={<Settings size={20} />}
              label="Settings"
            />
          </nav>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={onAddClick}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transform transition-all active:scale-95 flex items-center justify-center space-x-2 group"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
              <span>New Task</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 px-6 pt-6 md:p-10 z-10 scroll-smooth relative mobile-content-safe">
          <div className="md:hidden mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Mood Booster</h2>
                <p className="text-xs text-slate-500">
                  {mounted
                    ? new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })
                    : "Loading..."}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-400 font-semibold flex items-center justify-center">
                FJ
              </div>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-5xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-2xl shadow-black/30 mobile-nav-safe">
          <div className="grid grid-cols-6 items-center h-[70px] px-2">
            <NavButton
              active={activeTab === "home"}
              onClick={() => setActiveTab("home")}
              icon={<Home size={22} />}
              label="Home"
            />

            <NavButton
              active={activeTab === "tasks"}
              onClick={() => setActiveTab("tasks")}
              icon={<CheckSquare size={22} />}
              label="Tasks"
            />

            <NavButton
              active={activeTab === "schedule"}
              onClick={() => setActiveTab("schedule")}
              icon={<BookOpen size={22} />}
              label="Jadwal"
            />

            <NavButton
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              icon={<Calendar size={22} />}
              label="Calendar"
            />

            <NavButton
              active={false}
              onClick={onAddClick}
              icon={<Plus size={22} />}
              label="Add"
              isSpecial={true}
            />

            <NavButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={<Settings size={22} />}
              label="Settings"
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isSpecial?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  isSpecial = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-0.5 py-2 transition-all duration-300 ${
        isSpecial
          ? "text-violet-400 hover:text-violet-300"
          : active
            ? "text-violet-400"
            : "text-slate-400 hover:text-slate-200"
      }`}
    >
      <div
        className={`relative p-1 rounded-lg transition-all ${isSpecial ? "bg-violet-500/15" : ""}`}
      >
        {icon}
        {active && !isSpecial && (
          <motion.div
            layoutId="active-indicator-mobile"
            className="absolute -bottom-1 left-1/2 w-5 h-0.5 bg-violet-400 rounded-full transform -translate-x-1/2"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
      <span
        className={`text-[10px] font-medium ${isSpecial ? "text-violet-400" : ""}`}
      >
        {label}
      </span>
    </button>
  );
};

const DesktopNavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
        active
          ? "text-white"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}
    >
      {active && (
        <motion.div
          layoutId="active-bg-desktop"
          className="absolute inset-0 bg-violet-500/10 rounded-xl border border-violet-500/20"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div
        className={`relative z-10 ${active ? "text-violet-400" : "group-hover:text-slate-200"}`}
      >
        {icon}
      </div>
      <span className="relative z-10 font-medium">{label}</span>
    </button>
  );
};

export default Layout;
