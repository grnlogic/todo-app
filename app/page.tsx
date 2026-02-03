"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import HomeView from "@/components/HomeView";
import TaskListView from "@/components/TaskListView";
import CalendarView from "@/components/CalendarView";
import SettingsView from "@/components/SettingsView";
import ScheduleView from "@/components/ScheduleView";
import AddTaskModal from "@/components/AddTaskModal";
import { Task, Priority, Tab, Course } from "@/types";
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

// Use Next.js API routes
const API_BASE = "";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { requestPermission } = useNotifications();

  const normalizeTask = (task: Task & { date: string | Date }): Task => ({
    ...task,
    date: new Date(task.date),
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

  const handleAddTask = async (newTask: {
    title: string;
    date: Date;
    priority: Priority;
    time: string;
    reminder?: {
      amount: number;
      unit: "minutes" | "hours" | "days";
    };
  }) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          date: newTask.date.toISOString(),
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
      if (newTask.reminder) {
        const token = await requestPermission();
        if (!token) {
          setError(
            "Notification permission not granted. Reminder not scheduled.",
          );
          setIsAddModalOpen(false);
          return;
        }
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
          await fetch(`${API_BASE}/api/notifications/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              taskId: created.id,
              title: created.title,
              scheduleTime: reminderTime.toISOString(),
              userId: "default-user",
              token: token || undefined,
              data: {
                taskId: created.id,
                url: "/",
              },
            }),
          });
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
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !target.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? normalizeTask(updated) : t)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
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
        nextClass.getTime() - 2 * 60 * 60 * 1000,
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
        `Scheduled notification for ${course.name} at ${notificationTime.toLocaleString()}`,
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
            onClose={() => setIsAddModalOpen(false)}
            onSave={handleAddTask}
          />
        )}
      </AnimatePresence>
    </>
  );
}
