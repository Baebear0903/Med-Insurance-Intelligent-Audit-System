import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  placement?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-[400px]",
  placement = "left",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const isLeft = placement === "left";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex" ref={overlayRef} onClick={handleOverlayClick}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: isLeft ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLeft ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 bottom-0 bg-white shadow-2xl flex flex-col z-10 w-full max-w-full",
              isLeft ? "left-0" : "right-0",
              width && (width.startsWith('max-w-') || width.startsWith('w-')) ? width : ""
            )}
            style={{ width: width && !width.startsWith('max-w-') && !width.startsWith('w-') ? width : undefined }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto w-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
