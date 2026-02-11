"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import Toast, { ToastState } from "@/components/Toast";
import { Task, Priority, Tab, Course, DueType } from "@/types";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const HomeView = dynamic(() => import("@/components/HomeView"), {
  loading: () => <div className="text-slate-400">Loading home...</div>,
});

const TaskListView = dynamic(() => import("@/components/TaskListView"), {
  loading: () => <div className="text-slate-400">Loading tasks...</div>,
});

const CalendarView = dynamic(() => import("@/components/CalendarView"), {
  loading: () => <div className="text-slate-400">Loading calendar...</div>,
});

const SettingsView = dynamic(() => import("@/components/SettingsView"), {
  loading: () => <div className="text-slate-400">Loading settings...</div>,
});

const ScheduleView = dynamic(() => import("@/components/ScheduleView"), {
  loading: () => <div className="text-slate-400">Loading schedule...</div>,
});

const AddTaskModal = dynamic(() => import("@/components/AddTaskModal"), {
  loading: () => <div className="text-slate-400">Opening form...</div>,
  ssr: false,
});

// Use Next.js API routes
const API_BASE = "";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const { requestPermission, lastError, clearError } = useNotifications();

  const normalizeTask = (task: Task & { date?: string | Date | null }): Task => ({
    ...task,
    date: task.date ? new Date(task.date) : undefined,
    dueType: task.dueType || DueType.SPECIFIC_DATE,
  });

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/tasks`);
        if (!res.ok) throw new Error("Failed to load tasks");
        const data = await res.json();
        setTasks(data.map(normalizeTask));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // In dev, poll dispatch every minute so scheduled reminders get sent (production uses Vercel Cron)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const t = setInterval(() => {
      fetch(`${API_BASE}/api/notifications/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => {});
    }, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const handleAddTask = async (
    newTask: {
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
  ) => {
    if (existingId) {
      await handleUpdateTask(existingId, newTask);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          date: newTask.date ? newTask.date.toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      const created = await res.json();
      console.log("Task created:", created);
      const normalizedTask = normalizeTask(created);
      console.log("Normalized task:", normalizedTask);
      setTasks((prev) => {
        const updated = [...prev, normalizedTask];
        console.log("Updated tasks:", updated);
        return updated;
      });
      if (newTask.reminder && newTask.date) {
        const token = await requestPermission();

        if (!token) {
          // Izin ditolak atau FCM gagal – task tetap tersimpan,
          // tapi kita beritahu user lewat toast & (kalau ada) pesan di modal.
          setToast({
            message:
              "Reminder tidak bisa diaktifkan (cek pengaturan notifikasi / FCM). Task tetap tersimpan.",
            type: "error",
          });
        } else {
          const scheduledAt = new Date(newTask.date);
          const [h, m] = newTask.time.split(":").map(Number);
          scheduledAt.setHours(h || 0, m || 0, 0, 0);

          const offsetMs =
            newTask.reminder.unit === "minutes"
              ? newTask.reminder.amount * 60 * 1000
              : newTask.reminder.unit === "hours"
              ? newTask.reminder.amount * 60 * 60 * 1000
              : newTask.reminder.amount * 24 * 60 * 60 * 1000;

          const reminderTime = new Date(scheduledAt.getTime() - offsetMs);
          if (reminderTime.getTime() <= Date.now()) {
            setError("Reminder time must be in the future.");
          } else {
            const validToken =
              token && token !== "permission-granted" && token.length > 50
                ? token
                : undefined;
            const scheduleRes = await fetch(
              `${API_BASE}/api/notifications/schedule`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  taskId: created.id,
                  title: created.title,
                  body: `Don't forget: ${created.title}`,
                  scheduleTime: reminderTime.toISOString(),
                  userId: "default-user",
                  token: validToken,
                  data: {
                    taskId: created.id,
                    url: "/",
                  },
                }),
              }
            );
            if (!scheduleRes.ok) {
              const err = await scheduleRes.json().catch(() => ({}));
              setToast({
                message: err?.error || "Reminder could not be scheduled",
                type: "error",
              });
            } else {
              setToast({
                message: `Reminder set for ${newTask.reminder.amount} ${newTask.reminder.unit} before`,
                type: "success",
              });
            }
          }
        }
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding task:", err);
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
  };

  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    setTogglingTaskId(id);
    if (!target.completed) setToast({ message: "Tunggu sebentar...", type: "info" });
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !target.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? normalizeTask(updated) : t))
      );
      setToast({
        message: target.completed ? "Task unchecked" : "Tugas selesai",
        type: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      setToast({ message: "Failed to update task", type: "error" });
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setDeletingTaskId(id);
    setToast({ message: "Tunggu sebentar...", type: "info" });
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setToast({ message: "Tugas dihapus", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      setToast({ message: "Gagal menghapus tugas", type: "error" });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleUpdateTask = async (
    existingId: string,
    data: {
      title: string;
      date?: Date;
      dueType: DueType;
      priority: Priority;
      time: string;
    }
  ) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${existingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          date: data.date ? data.date.toISOString() : null,
          dueType: data.dueType,
          time: data.time,
          priority: data.priority,
        }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === existingId ? normalizeTask(updated) : t))
      );
      setEditingTask(null);
      setIsAddModalOpen(false);
      setToast({ message: "Task updated", type: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      setToast({ message: "Failed to update task", type: "error" });
    }
  };

  const [courses, setCourses] = useState<Course[]>([]);

  // Load courses from API
  useEffect(() => {
    const loadCourses = async () => {
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/courses`);
        if (!res.ok) throw new Error("Failed to load courses");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load courses");
      }
    };

    loadCourses();
  }, []);

  // Calculate next occurrence of a class
  const getNextClassDate = (dayName: string, timeStr: string): Date => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDayIndex = days.indexOf(dayName);
    if (targetDayIndex === -1) return new Date(); // Fallback

    const now = new Date();
    const currentDayIndex = now.getDay();

    let daysUntil = targetDayIndex - currentDayIndex;
    const [hours, minutes] = timeStr.split(":").map(Number);

    // Create candidate date for today
    const candidate = new Date();
    candidate.setHours(hours, minutes, 0, 0);

    // If today is the day, check if time has passed
    if (daysUntil === 0) {
      if (candidate.getTime() < now.getTime()) {
        daysUntil = 7; // Next week
      }
    } else if (daysUntil < 0) {
      daysUntil += 7;
    }

    const nextDate = new Date();
    nextDate.setDate(now.getDate() + daysUntil);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
  };

  // Schedule notification for a course
  const scheduleCourseNotification = async (course: Course) => {
    try {
      const nextClass = getNextClassDate(course.day, course.startTime);

      // 2 hours before
      const notificationTime = new Date(
        nextClass.getTime() - 2 * 60 * 60 * 1000
      );

      // If notification time is in the past (e.g. class is in 1 hour), don't schedule or schedule for next week?
      // For simplicity, we only schedule if it's in the future.
      if (notificationTime.getTime() <= Date.now()) {
        // If less than 2 hours to class, maybe skip or notify immediately?
        // User requirement: "2 jam sebelum". If < 2 hrs, logic implies we missed the window for this specific instance.
        return;
      }

      const token = await requestPermission();
      if (!token) return;

      await fetch(`${API_BASE}/api/notifications/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: course.id, // Reuse taskId field for courseId
          title: `Upcoming Class: ${course.name}`,
          body: `Class starts at ${course.startTime} in ${course.room}. Don't be late!`,
          scheduleTime: notificationTime.toISOString(),
          userId: "default-user",
          token: token,
          data: {
            taskId: course.id,
            url: "/",
            type: "course",
          },
        }),
      });
      console.log(
        `Scheduled notification for ${
          course.name
        } at ${notificationTime.toLocaleString()}`
      );
    } catch (error) {
      console.error("Failed to schedule course notification", error);
    }
  };

  const handleAddCourse = async (newCourse: Course) => {
    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) throw new Error("Failed to add course");
      const created = await res.json();
      setCourses((prev) => [...prev, created]);
      scheduleCourseNotification(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeView tasks={tasks} courses={courses} userName="Fajar" />;
      case "tasks":
        return (
          <TaskListView
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsAddModalOpen(true);
            }}
            togglingTaskId={togglingTaskId}
            deletingTaskId={deletingTaskId}
          />
        );
      case "schedule":
        return (
          <ScheduleView
            courses={courses}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        );
      case "calendar":
        return <CalendarView tasks={tasks} />;
      case "settings":
        return <SettingsView tasks={tasks} />;
      default:
        return <HomeView tasks={tasks} courses={courses} userName="Fajar" />;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => setIsAddModalOpen(true)}
      >
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="text-slate-400">Loading tasks...</div>
        ) : (
          renderContent()
        )}
      </Layout>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddTaskModal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingTask(null);
            }}
            initialTask={editingTask}
            onSave={handleAddTask}
            notificationError={lastError}
            clearNotificationError={clearError}
          />
        )}
      </AnimatePresence>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
