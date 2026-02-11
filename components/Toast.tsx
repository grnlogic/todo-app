"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss, duration = 3000 }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [toast, duration, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg max-w-[90vw]"
          style={{
            backgroundColor:
              toast.type === "success"
                ? "rgba(34, 197, 94, 0.15)"
                : toast.type === "info"
                ? "rgba(100, 116, 139, 0.2)"
                : "rgba(239, 68, 68, 0.15)",
            borderColor:
              toast.type === "success"
                ? "rgba(34, 197, 94, 0.4)"
                : toast.type === "info"
                ? "rgba(100, 116, 139, 0.4)"
                : "rgba(239, 68, 68, 0.4)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          ) : toast.type === "info" ? (
            <Loader2 size={20} className="text-slate-300 shrink-0 animate-spin" />
          ) : (
            <XCircle size={20} className="text-red-400 shrink-0" />
          )}
          <span
            className={
              toast.type === "success"
                ? "text-emerald-200 text-sm font-medium"
                : toast.type === "info"
                ? "text-slate-200 text-sm font-medium"
                : "text-red-200 text-sm font-medium"
            }
          >
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
