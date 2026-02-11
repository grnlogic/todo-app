"use client";

import React, { useState } from "react";
import { Course } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, MapPin, Plus, User, Trash2 } from "lucide-react";

interface ScheduleViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  onAddCourse,
  onDeleteCourse,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    day: "Monday",
  });

  const formatTimeInput = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ] as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newCourse.name ||
      !newCourse.lecturer ||
      !newCourse.room ||
      !newCourse.startTime ||
      !newCourse.endTime
    )
      return;

    onAddCourse({
      id: crypto.randomUUID(),
      name: newCourse.name,
      lecturer: newCourse.lecturer,
      room: newCourse.room,
      day: newCourse.day as Course["day"],
      startTime: newCourse.startTime,
      endTime: newCourse.endTime,
    });
    setIsAdding(false);
    setNewCourse({ day: "Monday" });
  };

  return (
    <div className="space-y-6 pt-2 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Class Schedule</h2>
          <p className="text-slate-400 text-sm">Manage your academic routine</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          <span>Add Class</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const dayCourses = courses
            .filter((c) => c.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          if (dayCourses.length === 0) return null;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 border border-white/5 rounded-3xl p-5 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-2">
                {day}
              </h3>
              <div className="space-y-3">
                {dayCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 hover:border-violet-500/20 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-200 text-sm break-words pr-6">
                        {course.name}
                      </h4>
                      <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center text-xs text-slate-400">
                        <Clock size={12} className="mr-2 text-violet-400" />
                        {course.startTime} - {course.endTime}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <User size={12} className="mr-2 text-fuchsia-400" />
                        {course.lecturer}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <MapPin size={12} className="mr-2 text-emerald-400" />
                        {course.room}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
        {courses.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No classes scheduled yet.</p>
            </div>
        )}
      </div>

      {/* Add Course Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Add New Class</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Course Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newCourse.name || ""}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                    placeholder="e.g. Data Structures"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Day
                        </label>
                        <select
                            value={newCourse.day}
                            onChange={(e) => setNewCourse({...newCourse, day: e.target.value as any})}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                        >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Room
                        </label>
                        <input
                            required
                            type="text"
                            value={newCourse.room || ""}
                            onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                            placeholder="e.g. A-101"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                        Lecturer
                    </label>
                    <input
                        required
                        type="text"
                        value={newCourse.lecturer || ""}
                        onChange={(e) => setNewCourse({ ...newCourse, lecturer: e.target.value })}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                        placeholder="e.g. Dr. Smith"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            Start Time (24-hour)
                        </label>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-2][0-9]:[0-5][0-9]"
                            placeholder="HH:MM"
                            value={newCourse.startTime || ""}
                            onChange={(e) =>
                              setNewCourse({
                                ...newCourse,
                                startTime: formatTimeInput(e.target.value),
                              })
                            }
                            maxLength={5}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                            End Time (24-hour)
                        </label>
                        <input
                            required
                            type="text"
                            inputMode="numeric"
                            pattern="[0-2][0-9]:[0-5][0-9]"
                            placeholder="HH:MM"
                            value={newCourse.endTime || ""}
                            onChange={(e) =>
                              setNewCourse({
                                ...newCourse,
                                endTime: formatTimeInput(e.target.value),
                              })
                            }
                            maxLength={5}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/5 text-slate-400 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/20"
                  >
                    Save Class
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleView;
