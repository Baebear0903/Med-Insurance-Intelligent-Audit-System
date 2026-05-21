import React from "react";
import { cn } from "@/src/lib/utils";

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  render?: (record: T, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  fixedOffset?: string;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (record: T) => string;
  className?: string;
  headerClassName?: string;
  emptyText?: string;
  selectable?: boolean;
  selectedRowKeys?: string[];
  onSelectChange?: (keys: string[]) => void;
}

export function Table<T>({ 
  columns, 
  data, 
  rowKey, 
  className, 
  headerClassName,
  emptyText = "暂无数据",
  selectable,
  selectedRowKeys = [],
  onSelectChange
}: TableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange(data.map(rowKey));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectChange) return;
    if (checked) {
      onSelectChange([...selectedRowKeys, key]);
    } else {
      onSelectChange(selectedRowKeys.filter(k => k !== key));
    }
  };

  // Find background-related class in headerClassName to apply to sticky cells so they match the header background perfectly
  const getHeaderBgClass = () => {
    if (!headerClassName) return "bg-slate-50";
    const bgClass = headerClassName.split(' ').find(c => c.startsWith('bg-'));
    return bgClass || "bg-slate-50";
  };
  const headerBgClass = getHeaderBgClass();

  return (
    <div className={cn("overflow-x-auto rounded-md border border-slate-200", className)}>
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className={cn("bg-slate-50 text-slate-600 font-medium border-b border-slate-200", headerClassName)}>
          <tr>
            {selectable && (
              <th className={cn("px-4 py-3 w-10 sticky left-0 z-20 shadow-[1px_0_0_#e2e8f0]", headerBgClass)}>
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={data.length > 0 && selectedRowKeys.length === data.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-3",
                  (c.fixed === "right" || c.fixed === "left") ? headerBgClass : "bg-inherit",
                  c.align === "center" && "text-center",
                  c.align === "right" && "text-right",
                  c.fixed === "right" && "sticky right-0 z-10 shadow-[-1px_0_0_#e2e8f0]",
                  c.fixed === "left" && "sticky left-0 z-10 shadow-[1px_0_0_#e2e8f0]"
                )}
                style={{ 
                  width: c.width,
                  minWidth: c.width,
                  right: c.fixed === "right" ? c.fixedOffset || 0 : undefined,
                  left: c.fixed === "left" ? c.fixedOffset || (selectable ? "2.5rem" : 0) : undefined // Check if we need to offset for selectable
                }}
              >
                <div className={cn("inline-flex items-center", c.align === "center" ? "justify-center" : c.align === "right" ? "justify-end" : "")}>
                  {c.title}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = rowKey(row);
              const isSelected = selectedRowKeys.includes(key);
              const cellBgClass = isSelected 
                ? "bg-blue-50" 
                : "bg-white group-hover:bg-slate-50 transition-colors";

              return (
                <tr 
                  key={key} 
                  className={cn(
                    "group bg-white hover:bg-slate-50 transition-colors",
                    isSelected && "bg-blue-50 hover:bg-blue-50"
                  )}
                >
                  {selectable && (
                    <td className={cn("px-4 py-3 sticky left-0 z-10 shadow-[1px_0_0_#e2e8f0]", cellBgClass)}>
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-4 py-3 text-slate-700",
                        (c.fixed === "right" || c.fixed === "left") ? cellBgClass : "bg-inherit",
                        c.align === "center" && "text-center",
                        c.align === "right" && "text-right",
                        c.fixed === "right" && "sticky right-0 z-10 shadow-[-1px_0_0_#e2e8f0]",
                        c.fixed === "left" && "sticky left-0 z-10 shadow-[1px_0_0_#e2e8f0]",
                        c.className
                      )}
                      style={{ 
                        width: c.width,
                        minWidth: c.width,
                        right: c.fixed === "right" ? c.fixedOffset || 0 : undefined,
                        left: c.fixed === "left" ? c.fixedOffset || (selectable ? "2.5rem" : 0) : undefined
                      }}
                    >
                      <div className={cn("flex flex-col justify-center", c.align === "center" ? "items-center" : c.align === "right" ? "items-end" : "items-start")}>
                        {c.render ? c.render(row, rowIndex) : (row as any)[c.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
