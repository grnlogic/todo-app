"use client";

import React, { useMemo, useState } from "react";
import { Task, Priority } from "@/types";
import { motion } from "framer-motion";
import { Clock, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface TaskListViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [query, setQuery] = useState("");

  // Sort: Incomplete first, then Priority, then Time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const pWeight = {
      [Priority.HIGH]: 3,
      [Priority.MEDIUM]: 2,
      [Priority.LOW]: 1,
    };
    if (pWeight[a.priority] !== pWeight[b.priority])
      return pWeight[b.priority] - pWeight[a.priority];
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const visibleTasks = useMemo(() => {
    return sortedTasks.filter((task) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !task.completed) ||
        (filter === "completed" && task.completed);

      const matchesQuery = task.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [sortedTasks, filter, query]);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH:
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case Priority.MEDIUM:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case Priority.LOW:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-700/50 text-slate-400";
    }
  };

  const getCheckboxColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH:
        return "border-red-400 text-red-400";
      case Priority.MEDIUM:
        return "border-amber-400 text-amber-400";
      case Priority.LOW:
        return "border-emerald-400 text-emerald-400";
      default:
        return "border-slate-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Tasks</h2>
          <p className="text-xs text-slate-500">
            Stay on track with a clean overview
          </p>
        </div>
        <span className="bg-slate-900 px-3 py-1 rounded-full text-xs font-bold text-slate-400 border border-white/5 w-fit">
          {tasks.filter((t) => !t.completed).length} pending
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          {["all", "active", "completed"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key as "all" | "active" | "completed")}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                filter === key
                  ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                  : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              {key === "all" ? "All" : key === "active" ? "Active" : "Done"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pb-24">
        {visibleTasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative group rounded-2xl p-4 border transition-all duration-300 ${
              task.completed
                ? "bg-slate-900/50 border-transparent opacity-60"
                : "bg-slate-900 border-white/5 shadow-sm hover:shadow-md hover:border-white/10"
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Checkbox */}
              <button
                onClick={() => onToggleTask(task.id)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  task.completed
                    ? "bg-slate-700 border-slate-700"
                    : getCheckboxColor(task.priority)
                }`}
              >
                {task.completed && (
                  <Check size={14} className="text-white" strokeWidth={3} />
                )}
              </button>

              {/* Content */}
              <div className="flex-1">
                <h3
                  className={`font-medium text-base transition-all ${
                    task.completed
                      ? "text-slate-500 line-through decoration-slate-600"
                      : "text-slate-100"
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center space-x-3 mt-1">
                  {!task.completed && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {task.time || "No time"}
                  </span>
                  <span className="text-xs text-slate-600">
                    {format(new Date(task.date), "MMM d")}
                  </span>
                </div>
              </div>

              {/* Delete Action (visible on hover or swipe concept) */}
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-600 hover:text-red-400 p-2 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>No tasks yet. Tap + to add one!</p>
          </div>
        )}

        {tasks.length > 0 && visibleTasks.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <p>No tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListView;
