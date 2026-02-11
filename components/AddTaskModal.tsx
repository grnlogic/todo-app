"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, Flag, Bell, Zap } from "lucide-react";
import { Priority, Task, DueType } from "@/types";
import { format } from "date-fns";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
  onSave: (
    task: {
      title: string;
      date?: Date;
      dueType: DueType;
      priority: Priority;
      time: string;
      reminder?: {
        amount: number;
        unit: "minutes" | "hours" | "days";
      };
    },
    existingId?: string
  ) => void;
  notificationError?: string | null;
  clearNotificationError?: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  initialTask,
  onSave,
  notificationError,
  clearNotificationError,
}) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [time, setTime] = useState(format(new Date(), "HH:mm"));
  const [date, setDate] = useState(new Date());
  const [dueType, setDueType] = useState<DueType>(DueType.SPECIFIC_DATE);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderAmount, setReminderAmount] = useState(60);
  const [reminderUnit, setReminderUnit] = useState<
    "minutes" | "hours" | "days"
  >("minutes");
  const [showCustomReminder, setShowCustomReminder] = useState(false);

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (isOpen && initialTask) {
      setTitle(initialTask.title);
      setPriority(initialTask.priority);
      setDueType(initialTask.dueType || DueType.SPECIFIC_DATE);
      if (initialTask.date) {
        setDate(new Date(initialTask.date));
      }
      setTime(initialTask.time || format(new Date(), "HH:mm"));
    } else if (isOpen && !initialTask) {
      setTitle("");
      setPriority(Priority.MEDIUM);
      setDueType(DueType.SPECIFIC_DATE);
      setDate(new Date());
      setTime(format(new Date(), "HH:mm"));
    }
  }, [isOpen, initialTask]);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const formatTimeInput = (value: string) => {
    // Ambil hanya digit
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    // Bersihkan pesan error notifikasi saat menyimpan lagi
    if (clearNotificationError) clearNotificationError();
    onSave(
      {
        title,
        date: dueType === DueType.ASAP ? undefined : date,
        dueType,
        priority,
        time,
        reminder: reminderEnabled && dueType === DueType.SPECIFIC_DATE
          ? {
              amount: Math.max(1, Number(reminderAmount) || 0),
              unit: reminderUnit,
            }
          : undefined,
      },
      initialTask?.id
    );
    setTitle("");
    setDueType(DueType.SPECIFIC_DATE);
    setReminderEnabled(false);
    setReminderAmount(60);
    setReminderUnit("minutes");
    setShowCustomReminder(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalVariants = isDesktop
    ? {
        hidden: { opacity: 0, scale: 0.9, y: "-50%", x: "-50%" },
        visible: { opacity: 1, scale: 1, y: "-50%", x: "-50%" },
        exit: { opacity: 0, scale: 0.9, y: "-50%", x: "-50%" },
      }
    : {
        hidden: { y: "100%" },
        visible: { y: 0 },
        exit: { y: "100%" },
      };

  const containerClasses = isDesktop
    ? "fixed top-1/2 left-1/2 w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 z-[70] shadow-2xl origin-center"
    : "fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 rounded-t-[2rem] p-6 z-[70] max-w-md mx-auto shadow-2xl";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60]"
      />

      {/* Modal / Sheet */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={containerClasses}
        style={
          isDesktop
            ? {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : {}
        }
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white">
            {initialTask ? "Edit Task" : "New Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              What needs to be done?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Laporan KP"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-lg"
              autoFocus
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Review notes",
                "Workout 20 min",
                "Deep work 1 hour",
                "Plan tomorrow",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTitle(suggestion)}
                  className="px-3 py-1.5 text-[11px] rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Due Type Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deadline Type
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setDueType(DueType.SPECIFIC_DATE)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  dueType === DueType.SPECIFIC_DATE
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                }`}
              >
                <Calendar size={16} />
                Set Deadline
              </button>
              <button
                onClick={() => setDueType(DueType.ASAP)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-2 ${
                  dueType === DueType.ASAP
                    ? "bg-red-500/20 text-red-400 border-red-500/50"
                    : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                }`}
              >
                <Zap size={16} />
                ASAP (No Deadline)
              </button>
            </div>
            {dueType === DueType.ASAP && (
              <p className="text-xs text-slate-400 bg-red-500/5 border border-red-500/20 px-3 py-2 rounded-xl">
                <span className="font-semibold text-red-400">⚡ Urgent:</span> Task ini akan muncul paling atas karena tidak ada deadline dan harus segera dikerjakan.
              </p>
            )}
          </div>

          {dueType === DueType.SPECIFIC_DATE && (
            <div className="flex space-x-4">
              {/* Time Input (24-hour format) */}
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
                  <Clock size={12} className="mr-1" /> Time (24-hour)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-2][0-9]:[0-5][0-9]"
                  placeholder="HH:MM"
                  value={time}
                  onChange={(e) => setTime(formatTimeInput(e.target.value))}
                  maxLength={5}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Gunakan format 24 jam, contoh: 09:30, 13:00, 21:45
                </p>
              </div>
              {/* Date Input */}
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
                  <Calendar size={12} className="mr-1" /> Date
                </label>
                <input
                  type="date"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
              <Flag size={12} className="mr-1" /> Priority
            </label>
            <div className="flex space-x-3">
              {[Priority.HIGH, Priority.MEDIUM, Priority.LOW].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    priority === p
                      ? p === Priority.HIGH
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : p === Priority.MEDIUM
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Selection - Only for tasks with specific dates */}
          {dueType === DueType.SPECIFIC_DATE && (
            <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
              <Bell size={12} className="mr-1" /> Reminder
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setReminderEnabled(false);
                  setShowCustomReminder(false);
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  !reminderEnabled
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                }`}
              >
                None
              </button>
              <button
                onClick={() => {
                  setReminderEnabled(true);
                  setReminderAmount(1);
                  setReminderUnit("hours");
                  setShowCustomReminder(false);
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  reminderEnabled &&
                  reminderAmount === 1 &&
                  reminderUnit === "hours" &&
                  !showCustomReminder
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                }`}
              >
                1 Hour Before
              </button>
              <button
                onClick={() => {
                  setReminderEnabled(true);
                  setReminderAmount(1);
                  setReminderUnit("days");
                  setShowCustomReminder(false);
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  reminderEnabled &&
                  reminderAmount === 1 &&
                  reminderUnit === "days" &&
                  !showCustomReminder
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    : "bg-slate-800 border-transparent text-slate-500 hover:bg-slate-700"
                }`}
              >
                1 Day Before
              </button>
            </div>

            <button
              onClick={() => {
                setReminderEnabled(true);
                setShowCustomReminder(true);
              }}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                reminderEnabled && showCustomReminder
                  ? "bg-slate-700 text-slate-200 border-slate-600"
                  : "bg-slate-800 text-slate-500 border-transparent hover:bg-slate-700"
              }`}
            >
              Custom Reminder
            </button>

            {reminderEnabled && showCustomReminder && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={reminderAmount}
                  onChange={(e) =>
                    setReminderAmount(Number(e.target.value) || 1)
                  }
                  className="w-24 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                />
                <select
                  value={reminderUnit}
                  onChange={(e) =>
                    setReminderUnit(
                      e.target.value as "minutes" | "hours" | "days"
                    )
                  }
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="minutes">Minutes before</option>
                  <option value="hours">Hours before</option>
                  <option value="days">Days before</option>
                </select>
              </div>
            )}

            {notificationError && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-xl">
                {notificationError}
              </p>
            )}
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transform transition-all active:scale-[0.98] hover:scale-[1.02]"
            >
              {initialTask ? "Update Task" : "Save Task"}
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              Tip: set a time to stay consistent.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AddTaskModal;
