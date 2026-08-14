import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  size?: DrawerSize;
  placement?: 'left' | 'right';
  className?: string;
  allowMaximize?: boolean;
  extra?: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width,
  size,
  placement = 'right',
  className,
  allowMaximize = true,
  extra
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset maximized state when closed
  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLeft = placement === 'left';

  const sizeClassMap: Record<DrawerSize, string> = {
    sm: 'w-[420px] max-w-[90vw]',
    md: 'w-[580px] max-w-[90vw]',
    lg: 'w-[740px] max-w-[92vw]',
    xl: 'w-[880px] max-w-[94vw]',
    '2xl': 'w-[1060px] max-w-[96vw]',
    full: 'w-full max-w-full',
  };

  const getWidthClasses = () => {
    if (isMaximized) {
      return 'w-full max-w-full';
    }
    if (size) {
      return sizeClassMap[size];
    }
    if (width) {
      if (width.startsWith('w-') || width.startsWith('max-w-')) {
        return width;
      }
      return '';
    }
    // Default comfortable and dynamic width
    return 'w-full sm:w-[620px] md:w-[760px] lg:w-[860px] max-w-[94vw]';
  };

  const inlineStyle: React.CSSProperties = {};
  if (!isMaximized && width && !width.startsWith('w-') && !width.startsWith('max-w-')) {
    inlineStyle.width = width;
  }

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div 
        style={inlineStyle}
        className={cn(
          "absolute top-0 bottom-0 bg-white shadow-2xl flex flex-col transition-all duration-300 z-10",
          getWidthClasses(),
          isLeft ? "left-0 animate-in slide-in-from-left duration-250" : "right-0 animate-in slide-in-from-right duration-250",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-3 min-w-0">
              <h3 className="text-base font-bold text-slate-800 truncate m-0">{title}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {extra}
              {allowMaximize && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? "还原窗口大小" : "最大化窗口"}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button 
                onClick={onClose}
                title="关闭 (Esc)"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

