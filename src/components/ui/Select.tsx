import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export interface SelectOption {
  label: string | React.ReactNode;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  onChange?: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  multiple?: boolean;
  className?: string;
  popupClassName?: string;
  size?: "sm" | "md" | "lg";
  showCheckIcon?: boolean;
}

export function Select({
  options = [],
  value,
  onChange,
  placeholder = "请选择",
  disabled = false,
  allowClear = false,
  multiple = false,
  className,
  popupClassName,
  size = "md",
  showCheckIcon = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; isUpward: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    isUpward: false,
  });

  const calculateCoords = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = 240; // estimated max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    return {
      top: isUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      isUpward,
    };
  };

  const updateCoords = () => {
    const nextCoords = calculateCoords();
    if (nextCoords) {
      setCoords(nextCoords);
    }
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      const nextCoords = calculateCoords();
      if (nextCoords) {
        setCoords(nextCoords);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-3.5 text-base",
  };

  const handleSelect = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const existsIndex = currentValues.indexOf(optionValue);
      let newValues: (string | number)[];
      if (existsIndex > -1) {
        newValues = currentValues.filter((v) => v !== optionValue);
      } else {
        newValues = [...currentValues, optionValue];
      }
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.("");
    }
  };

  const isSelected = (optVal: string | number) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optVal);
    }
    return value === optVal;
  };

  const renderDisplay = () => {
    if (multiple) {
      const selectedArray = Array.isArray(value) ? value : [];
      if (selectedArray.length === 0) {
        return <span className="text-slate-400 select-none">{placeholder}</span>;
      }
      const selectedLabels = options
        .filter((o) => selectedArray.includes(o.value))
        .map((o) => (typeof o.label === "string" ? o.label : String(o.value)));

      return (
        <div className="flex items-center gap-1 overflow-hidden truncate">
          <span className="text-slate-800 truncate text-sm font-normal">
            {selectedLabels.join(", ")}
          </span>
        </div>
      );
    }

    if (value === undefined || value === "" || value === null) {
      return <span className="text-slate-400 select-none">{placeholder}</span>;
    }

    const matched = options.find((o) => o.value === value);
    if (matched) {
      return (
        <span className="text-slate-800 truncate select-none font-normal">
          {matched.label}
        </span>
      );
    }

    return <span className="text-slate-800 truncate font-normal">{String(value)}</span>;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== undefined && value !== "" && value !== null;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block text-left w-full", className)}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown();
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        className={cn(
          "w-full flex items-center justify-between rounded bg-white text-left transition-all border outline-none cursor-pointer select-none",
          sizeClasses[size],
          isOpen
            ? "border-[#1677ff] ring-2 ring-blue-500/15"
            : "border-slate-300 hover:border-blue-400",
          disabled && "bg-slate-100 cursor-not-allowed opacity-60 hover:border-slate-300"
        )}
      >
        <div className="flex-1 truncate mr-2">{renderDisplay()}</div>

        <div className="flex items-center space-x-1 shrink-0">
          {allowClear && hasValue && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180 text-blue-500"
            )}
          />
        </div>
      </div>

      {isOpen && coords.width > 0 &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: coords.isUpward ? undefined : coords.top,
              bottom: coords.isUpward ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className={cn(
              "bg-white rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)] border border-slate-200/80 py-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-64 overflow-y-auto outline-none",
              popupClassName
            )}
          >
            {options.length === 0 ? (
              <div className="px-3 py-3 text-xs text-slate-400 text-center select-none">
                暂无数据
              </div>
            ) : (
              options.map((opt) => {
                const selected = isSelected(opt.value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    className={cn(
                      "px-3.5 py-2 text-sm transition-colors flex items-center justify-between cursor-pointer select-none",
                      opt.disabled && "text-slate-300 cursor-not-allowed",
                      !opt.disabled && selected && "bg-blue-50 text-[#1677ff] font-medium",
                      !opt.disabled && !selected && "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {showCheckIcon && selected && (
                      <Check className="w-4 h-4 text-[#1677ff] shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
