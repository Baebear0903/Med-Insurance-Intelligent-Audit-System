import React, { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let addToastHandler: (toast: Omit<ToastMessage, "id">) => void = () => {};

export function toast(message: string, type: ToastType = "info") {
  addToastHandler({ message, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastHandler = (t) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-in fade-in slide-in-from-top-5 min-w-[280px] bg-white",
            t.type === "success" && "border-green-100 text-green-800",
            t.type === "error" && "border-red-100 text-red-800",
            t.type === "info" && "border-blue-100 text-blue-800"
          )}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          {t.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
          {t.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
          <span className="flex-1 text-slate-700">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
