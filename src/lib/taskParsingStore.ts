import { useState, useEffect } from "react";

const STORAGE_KEY = "task_parsing_ids_v1";

/**
 * 获取所有处于“数据解析更新中”的任务 ID 列表
 */
export function getParsingTaskIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * 判断指定任务是否正在进行数据解析更新
 */
export function isTaskParsing(taskId: string | null | undefined): boolean {
  if (!taskId) return false;
  const list = getParsingTaskIds();
  if (list.includes(taskId)) return true;
  // 兼容父子任务的 ID 关联，如 T_2024_04_GZ 与 T_2024_04_GZ_0
  return list.some(id => id === taskId || taskId.startsWith(id) || id.startsWith(taskId));
}

/**
 * 设置指定任务的数据解析更新状态
 */
export function setTaskParsing(taskId: string, isParsing: boolean): void {
  if (!taskId) return;
  try {
    const current = getParsingTaskIds();
    let updated: string[];
    if (isParsing) {
      if (!current.includes(taskId)) {
        updated = [...current, taskId];
      } else {
        updated = current;
      }
    } else {
      updated = current.filter(id => id !== taskId && !id.startsWith(taskId) && !taskId.startsWith(id));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    resetTaskRefreshClickCount(taskId);
    window.dispatchEvent(new CustomEvent("task_parsing_changed", { detail: { taskId, isParsing } }));
  } catch (e) {
    console.error("Error setting task parsing state:", e);
  }
}

/**
 * 获取任务“刷新页面”点击次数
 */
export function getTaskRefreshClickCount(taskId: string): number {
  if (typeof window === "undefined" || !taskId) return 0;
  try {
    return parseInt(sessionStorage.getItem(`task_refresh_clicks_${taskId}`) || "0", 10) || 0;
  } catch (e) {
    return 0;
  }
}

/**
 * 增加任务“刷新页面”点击次数
 */
export function incrementTaskRefreshClickCount(taskId: string): number {
  if (!taskId) return 0;
  const current = getTaskRefreshClickCount(taskId);
  const next = current + 1;
  try {
    sessionStorage.setItem(`task_refresh_clicks_${taskId}`, String(next));
  } catch (e) {}
  return next;
}

/**
 * 重置任务“刷新页面”点击次数
 */
export function resetTaskRefreshClickCount(taskId: string): void {
  if (!taskId) return;
  try {
    sessionStorage.removeItem(`task_refresh_clicks_${taskId}`);
  } catch (e) {}
}

/**
 * 监听解析状态变化的 React Hook
 */
export function useTaskParsing() {
  const [parsingIds, setParsingIds] = useState<string[]>(getParsingTaskIds);

  useEffect(() => {
    const handleUpdate = () => {
      setParsingIds(getParsingTaskIds());
    };
    window.addEventListener("task_parsing_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("task_parsing_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    parsingIds,
    isParsing: (id: string | null | undefined) => isTaskParsing(id),
    setParsing: setTaskParsing
  };
}
