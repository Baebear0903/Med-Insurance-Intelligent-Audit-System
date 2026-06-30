export * from './mock/task';
export * from './mock/review';
export * from './mock/template';

import { TASK_STATUS, DEPARTMENTS } from './constants';
import { Task, INITIAL_TASKS } from './mock/task';
import { ReviewRecord, INITIAL_REPORTS, ALL_MOCK_DETAILS } from './mock/review';
import { ReviewTemplate, INITIAL_TEMPLATES } from './mock/template';

export const mockApi = {
  startAIFill: (taskId: string) => {},
  completeAIFill: (taskId: string) => {},
  resetData: () => {},

  getTasks: (page = 1, pageSize = 10, filters: any = {}): { data: Task[], total: number } => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v8") || "null");
    
    if (!tasks || tasks.length !== INITIAL_TASKS.length) {
      tasks = INITIAL_TASKS;
      localStorage.setItem("tasks_v8", JSON.stringify(tasks));
      localStorage.setItem("records_v8", JSON.stringify(INITIAL_REPORTS));
      localStorage.setItem("templates_v8", JSON.stringify(INITIAL_TEMPLATES));
      Object.keys(ALL_MOCK_DETAILS).forEach(key => {
         localStorage.setItem(key, JSON.stringify(ALL_MOCK_DETAILS[key]));
      });
    }
    
    let filtered = [...tasks].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    if (filters.name) {
      filtered = filtered.filter((t:any) => t.name.includes(filters.name));
    }
    if (filters.creator) {
      filtered = filtered.filter((t:any) => t.creator.includes(filters.creator));
    }
    if (filters.status) {
      filtered = filtered.filter((t:any) => t.status === filters.status);
    }
    if (filters.templateId) {
      filtered = filtered.filter((t:any) => t.templateId === filters.templateId);
    }

    const start = (page - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length
    };
  },

  getTaskById: (id: string): Task | null => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v8") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    return tasks.find((t: Task) => t.id === id) || null;
  },

  getReviewRecords: (taskId?: string): ReviewRecord[] => {
    let records = JSON.parse(localStorage.getItem("records_v8") || "null");
    if (!records) records = INITIAL_REPORTS;
    if (taskId) {
      return records.filter((r: ReviewRecord) => r.taskId === taskId);
    }
    return records;
  },

  getTemplates: (search = "", status?: string, typeFilter?: string): ReviewTemplate[] => {
    let templates = JSON.parse(localStorage.getItem("templates_v8") || "null");
    if (!templates) templates = INITIAL_TEMPLATES;
    let filtered = templates;
    if (search) filtered = filtered.filter((t: ReviewTemplate) => t.name.includes(search));
    if (status) filtered = filtered.filter((t: ReviewTemplate) => t.status === status);
    if (typeFilter) filtered = filtered.filter((t: ReviewTemplate) => t.templateType === typeFilter);
    return filtered;
  },

  saveTemplate: (template: ReviewTemplate) => {},
  deleteTemplates: (ids: string[]) => {},

  updateTaskStatus: (taskId: string, status: keyof typeof TASK_STATUS) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v8") || "null");
    if (!tasks) return;
    const index = tasks.findIndex((t: Task) => t.id === taskId);
    if (index > -1) {
      tasks[index].status = status;
      tasks[index].updateTime = new Date().toLocaleString();
      localStorage.setItem("tasks_v8", JSON.stringify(tasks));
      // For deductions, update parent if all children are END
      if (tasks[index].parentId && status === "END") {
          const parentId = tasks[index].parentId;
          const siblings = tasks.filter((t:Task) => t.parentId === parentId);
          if (siblings.every((t:Task) => t.status === "END")) {
              const parentIdx = tasks.findIndex((t:Task) => t.id === parentId);
              if (parentIdx > -1) {
                  tasks[parentIdx].status = "END";
                  tasks[parentIdx].updateTime = new Date().toLocaleString();
                  localStorage.setItem("tasks_v8", JSON.stringify(tasks));
              }
          }
      }
    }
  },

  getTaskDetailRecords: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v8") || "null");
    let isSubtask = false;
    let parentId = null;
    let currentDeptName = null;
    if (tasks) {
      const t = tasks.find((t: Task) => t.id === taskId);
      if (t && t.parentId) {
        isSubtask = true;
        parentId = t.parentId;
        currentDeptName = DEPARTMENTS[t.departmentId] || t.name.split(" - ")[1];
      }
    }

    const realTaskId = isSubtask ? parentId : taskId;
    const key = `task_details_${realTaskId}`;
    let data = JSON.parse(localStorage.getItem(key) || "null");

    if (!data && ALL_MOCK_DETAILS[key]) {
      data = ALL_MOCK_DETAILS[key];
      localStorage.setItem(key, JSON.stringify(data));
    }
    
    if (!data) data = [];

    if (isSubtask && currentDeptName) {
      return data.filter((d: any) => d.data.DEPARTMENT_NAME === currentDeptName || d.data.DEPARTMENT_NAME === currentDeptName?.replace("专管员", ""));
    }
    return data;
  },

  dispatchTask: (taskId: string) => {
      // Just mock returning true for deduction tasks if they are dispatched
      let tasks = JSON.parse(localStorage.getItem("tasks_v8") || "null");
      if (!tasks) return false;
      const index = tasks.findIndex((t: Task) => t.id === taskId);
      if (index > -1 && tasks[index].status === "CREATE") {
          tasks[index].status = "PUBLISH";
          localStorage.setItem("tasks_v8", JSON.stringify(tasks));
          return true;
      }
      return false;
  },

  saveTaskDetailRecord: (taskId: string, record: any) => {},
  deleteTaskDetailRecords: (taskId: string, ids: string[]) => {}
};
