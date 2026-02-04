"use client";

import React, { useState } from "react";
import { Task, Priority } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Calculate padding days for the grid start (0 = Sunday, etc)
  const startDay = getDay(startOfMonth(currentMonth));
  const emptyDays = Array(startDay).fill(null);

  const selectedTasks = tasks.filter((t) =>
    isSameDay(new Date(t.date), selectedDate),
  );
  const monthlyTasks = tasks.filter((t) =>
    isSameMonth(new Date(t.date), currentMonth),
  );
  const monthlyCompleted = monthlyTasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pt-2 pb-32 md:pb-0 h-full flex flex-col">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-2 mb-2">
        <h2 className="text-2xl font-bold text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-700 transition-colors border border-white/5"
          >
            <ChevronLeft size={20} className="text-slate-300" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-700 transition-colors border border-white/5"
          >
            <ChevronRight size={20} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">
            {monthlyTasks.length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {monthlyCompleted}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-slate-500">Completion Rate</p>
          <p className="text-2xl font-bold text-fuchsia-400 mt-1">
            {monthlyTasks.length === 0
              ? 0
              : Math.round((monthlyCompleted / monthlyTasks.length) * 100)}
            %
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 h-full">
        {/* Left: Calendar Grid */}
        <div className="flex-1">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-white/5 h-fit">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs text-slate-500">Legend</div>
              <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />{" "}
                  <span>High</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />{" "}
                  <span>Med</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />{" "}
                  <span>Low</span>
                </span>
              </div>
            </div>
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-4 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold text-slate-500 uppercase tracking-widest"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-y-6 gap-x-2">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {daysInMonth.map((day) => {
                const dayTasks = tasks.filter((t) =>
                  isSameDay(new Date(t.date), day),
                );
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 relative
                            ${
                              isSelected
                                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-110"
                                : isToday
                                  ? "bg-white/10 text-white"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                      {format(day, "d")}
                      {/* Task Dots */}
                      {dayTasks.length > 0 && !isSelected && (
                        <div className="absolute bottom-1.5 flex space-x-0.5">
                          {dayTasks.slice(0, 3).map((task, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                task.priority === Priority.HIGH
                                  ? "bg-red-400"
                                  : "bg-fuchsia-400"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Day Details (Desktop Side Panel / Mobile Bottom Sheet) */}
        <div className="md:w-80 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-6 mb-32 md:mb-0"
            >
              <div className="mb-6 pb-4 border-b border-white/5">
                <h3 className="text-slate-200 font-bold text-lg">
                  {format(selectedDate, "EEEE")}
                </h3>
                <p className="text-slate-500">
                  {format(selectedDate, "MMMM do, yyyy")}
                </p>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {selectedTasks.length > 0 ? (
                  selectedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start space-x-3 text-sm p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-violet-400/30 transition-colors"
                    >
                      <div
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? "bg-slate-600" : "bg-violet-400"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block font-medium break-words ${task.completed ? "text-slate-500 line-through" : "text-slate-200"}`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center mt-2 space-x-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              task.priority === Priority.HIGH
                                ? "border-red-500/30 text-red-400"
                                : "border-slate-700 text-slate-500"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-slate-500">
                            {task.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-50">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar size={24} className="text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400">
                      No tasks for this day.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
