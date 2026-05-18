import React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, width = "max-w-lg" }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={cn("bg-white rounded-xl shadow-xl w-full flex flex-col max-h-[90vh]", width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
