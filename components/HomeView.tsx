"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Task, Priority, Course } from "@/types";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Flame,
  ArrowUpRight,
  MapPin,
  User,
} from "lucide-react";
import { format, subDays, isSameDay, addDays } from "date-fns";

interface HomeViewProps {
  tasks: Task[];
  courses: Course[];
  userName: string;
}

const HomeView: React.FC<HomeViewProps> = ({
  tasks,
  courses = [],
  userName,
}) => {
  // Daily Boost State
  const [dailyBoost, setDailyBoost] = useState<{
    mood: { mood: string; energy: number; note?: string } | null;
    quote: { text: string; author?: string } | null;
  }>({ mood: null, quote: null });

  // Fetch daily boost data
  useEffect(() => {
    const fetchDailyBoost = async () => {
      try {
        const res = await fetch("/api/daily-boost");
        if (res.ok) {
          const data = await res.json();
          setDailyBoost(data);
        }
      } catch (error) {
        console.error("Failed to fetch daily boost:", error);
      }
    };
    fetchDailyBoost();
  }, []);

  // Greeting Logic
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 11) return "Good Morning";
    if (hours < 15) return "Selamat Siang";
    if (hours < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Stats Logic - Calculate from ALL tasks, not just today
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Today's tasks for other sections
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysTasks = tasks.filter((t) => {
    const taskDate = new Date(t.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });

  const toMinutes = (time?: string) => {
    if (!time) return 24 * 60 + 1;
    const [h, m] = time.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Upcoming tasks: Show all incomplete tasks, sorted by date and time
  const upcomingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return toMinutes(a.time) - toMinutes(b.time);
    })
    .slice(0, 5);

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    subDays(new Date(), 6 - i),
  );
  const weeklyStats = weekDays.map((day) => {
    const dayTasks = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return isSameDay(taskDate, day);
    });
    const completed = dayTasks.filter((t) => t.completed).length;
    return {
      label: format(day, "EEE"),
      total: dayTasks.length,
      completed,
    };
  });
  const maxWeekly = Math.max(1, ...weeklyStats.map((s) => s.total));

  // Focus Task (First uncompleted high priority task for today)
  const focusTask = todaysTasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      // Sort High > Medium > Low
      const priorityWeight = {
        [Priority.HIGH]: 3,
        [Priority.MEDIUM]: 2,
        [Priority.LOW]: 1,
      };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    })[0];

  // Tomorrow's schedule logic
  const tomorrow = addDays(new Date(), 1);
  const tomorrowDayName = format(tomorrow, "EEEE") as any;
  const tomorrowCourses = courses
    .filter((c) => c.day === tomorrowDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const isTomorrowSunday = tomorrowDayName === "Sunday";

  return (
    <div className="space-y-10 pt-4 pb-32 md:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
          >
            {greeting},<br />
            <span className="text-violet-400">{userName} 👋</span>
          </motion.h1>
          <p className="text-slate-400 text-sm font-medium">
            Let&apos;s make today productive.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-2xl font-bold text-slate-200">
            {format(new Date(), "EEEE")}
          </p>
          <p className="text-slate-500">{format(new Date(), "dd MMMM yyyy")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Stats */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-md flex flex-col justify-between h-32 md:h-40"
          >
            <div className="p-2 bg-indigo-500/20 w-fit rounded-xl text-indigo-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-white">
                {remainingTasks}
              </span>
              <p className="text-xs text-slate-400">Tasks Remaining</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden h-32 md:h-40"
          >
            {/* Circular Progress SVG */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-700"
              />
              <motion.circle
                key={`progress-${progress}`}
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 - (226 * progress) / 100 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="226"
                strokeLinecap="round"
                className="text-fuchsia-400"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-lg font-bold text-white">{progress}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Done
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Focus Task */}
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Today's Schedule */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Class Schedule
                </h2>
                <span className="text-xs text-slate-500">Today</span>
              </div>
              <div className="space-y-3">
                {courses
                  .filter((c) => c.day === (format(new Date(), "EEEE") as any))
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-2xl border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-xs flex-shrink-0">
                        {course.startTime.split(":")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 truncate">
                          {course.name}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-2">
                          <span className="flex items-center">
                            <MapPin size={10} className="mr-1" /> {course.room}
                          </span>
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1" />{" "}
                            {course.startTime} - {course.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {courses.filter(
                  (c) => c.day === (format(new Date(), "EEEE") as any),
                ).length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No classes today. Enjoy! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Tomorrow's Schedule */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Tomorrow&apos;s Schedule
                </h2>
                <span className="text-xs text-slate-500">
                  {format(tomorrow, "EEE, MMM dd")}
                </span>
              </div>
              <div className="space-y-3">
                {tomorrowCourses.length > 0 ? (
                  tomorrowCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-3 bg-slate-800/40 p-3 rounded-2xl border border-white/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 font-bold text-xs flex-shrink-0">
                        {course.startTime.split(":")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 truncate">
                          {course.name}
                        </h4>
                        <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-2">
                          <span className="flex items-center">
                            <MapPin size={10} className="mr-1" /> {course.room}
                          </span>
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1" />{" "}
                            {course.startTime} - {course.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    {isTomorrowSunday ? (
                      <span>Libur! Time to rest 😴</span>
                    ) : (
                      <span>Free day! No classes scheduled 🎉</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Flame
                className="text-orange-400"
                size={20}
                fill="currentColor"
                fillOpacity={0.2}
              />
              <h2 className="text-lg font-semibold text-white">Focus Task</h2>
            </div>

            {focusTask ? (
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/20 p-6 md:p-8 rounded-3xl shadow-lg relative group">
                <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      focusTask.priority === Priority.HIGH
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : focusTask.priority === Priority.MEDIUM
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {focusTask.priority} Priority
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-medium text-white mb-4 leading-tight">
                  {focusTask.title}
                </h3>
                <div className="flex items-center space-x-4 text-slate-400">
                  <div className="flex items-center bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                    <Clock size={16} className="mr-2 text-violet-400" />
                    <span className="font-medium">
                      {focusTask.time || "Today"}
                    </span>
                  </div>
                  <div className="flex-1 border-b border-dashed border-slate-700/50"></div>
                  <ArrowUpRight size={20} className="text-slate-600" />
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/30 border border-dashed border-slate-700 p-6 rounded-3xl text-center text-slate-400 flex flex-col items-center justify-center">
                <p>No high priority tasks left. You&apos;re on fire! 🔥</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Today At A Glance */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
            <span className="text-xs text-slate-500">All incomplete</span>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const taskDate = new Date(task.date);
                const isToday = isSameDay(taskDate, new Date());
                const dateLabel = isToday
                  ? "Today"
                  : format(taskDate, "MMM dd");

                return (
                  <div
                    key={task.id}
                    className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-violet-400/20 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          task.priority === Priority.HIGH
                            ? "bg-red-400"
                            : task.priority === Priority.MEDIUM
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-100 break-words">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dateLabel} {task.time ? `• ${task.time}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full border whitespace-nowrap ml-2 ${
                        task.priority === Priority.HIGH
                          ? "text-red-400 border-red-500/30 bg-red-500/10"
                          : task.priority === Priority.MEDIUM
                            ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                            : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl p-6 text-center text-slate-400">
                <p>You&apos;re all caught up. Time for a short break ✨</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Momentum
              </span>
              <span className="text-xs text-slate-500">Overall</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">
                  {completedTasks}
                </p>
                <p className="text-xs text-slate-500">Tasks completed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-fuchsia-400">
                  {progress}%
                </p>
                <p className="text-xs text-slate-500">Productivity</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Weekly Stats</h4>
              <span className="text-xs text-slate-500">Last 7 days</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2 items-end h-28">
              {weeklyStats.map((stat, idx) => (
                <div
                  key={`${stat.label}-${idx}`}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="w-full h-20 flex items-end">
                    <div
                      className="w-full rounded-full bg-slate-800 overflow-hidden transition-all duration-300"
                      style={{
                        height: `${Math.max(12, (stat.total / maxWeekly) * 80)}%`,
                      }}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-violet-500 to-fuchsia-500 transition-all duration-500"
                        style={{
                          height: `${stat.total === 0 ? 0 : (stat.completed / stat.total) * 100}%`,
                        }}
                        title={`${stat.completed}/${stat.total} completed`}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>Total tasks</span>
              <span>Completed</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Daily Boost</h4>
              {dailyBoost.mood && (
                <span className="text-xs text-slate-500">
                  {dailyBoost.mood.mood}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-3">
              {dailyBoost.quote?.text ||
                "Start with the smallest task to build momentum. Progress beats perfection."}
            </p>
            {dailyBoost.quote?.author && (
              <p className="text-xs text-slate-500 mt-2 italic">
                — {dailyBoost.quote.author}
              </p>
            )}
            <div className="mt-4 inline-flex items-center px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold">
              {dailyBoost.mood ? (
                <span>Energy: {dailyBoost.mood.energy}/10 ⚡</span>
              ) : (
                <span>Keep going ✨</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
