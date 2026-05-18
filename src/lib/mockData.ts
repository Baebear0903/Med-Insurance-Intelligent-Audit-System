import { TASK_STATUS, AUDIT_STATUS, FILL_STATUS, DEPARTMENTS } from "./constants";

export interface Task {
  id: string;
  name: string;
  year: string;
  departmentId: keyof typeof DEPARTMENTS;
  templateId: string;
  templateName: string;
  status: keyof typeof TASK_STATUS;
  creator: string;
  createTime: string;
  updateTime: string;
  dueDate: string;
  parentId?: string; // Add parentId for sub-tasks
  isAIFilling?: boolean;
  aiFillProgress?: number;
  aiFillTotal?: number;
}

export interface ReviewRecord {
  id: string;
  taskId: string;
  auditStatus: keyof typeof AUDIT_STATUS;
  fillStatus: keyof typeof FILL_STATUS;
  submitter: string;
  submitTime: string;
  auditor: string;
  auditTime: string;
}

export interface TemplateField {
  id: string;
  name: string;
  comment: string;
  type: string;
  length: number;
  decimal: number;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isRequired: boolean;
  isQueryable: boolean;
  isFeedback: boolean;
  noUpdate: boolean;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
  desc: string;
  creator: string;
  taskCount: number;
  createTime: string;
  fields: TemplateField[];
}

// Initial mock data
try {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
  if (tasks && Array.isArray(tasks)) {
    tasks = tasks.map((t: any) => {
      delete t.isAIFilling;
      delete t.aiFillProgress;
      delete t.aiFillTotal;
      return t;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("task_details_")) {
      let details = JSON.parse(localStorage.getItem(key) || "null");
      let changed = false;
      if (details && Array.isArray(details)) {
        details = details.map((d: any) => {
          if (d.fillStatus === "AI_FILLING" || (d.data && d.data.APPEAL_REASON === "系统自动填报诊断：数据符合预期规范，建议申诉复核。")) {
            d.fillStatus = "UNFILLED";
            if (d.data) {
                delete d.data.IS_APPEAL;
                delete d.data.APPEAL_REASON;
                delete d.data.APPEAL_ATTACHMENT;
            }
            changed = true;
          }
          return d;
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(details));
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to reset AI filling states", e);
}

const INITIAL_TASKS: Task[] = [
  { id: "T1001", name: "2024年第三季度广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "CREATE", creator: "管理员", createTime: "2024-05-10 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-30" },
  { id: "T1002", name: "2024年第二季度广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-05 10:00", updateTime: "2024-05-12 10:00", dueDate: "2024-06-05" },
  { id: "T1002_0", parentId: "T1002", name: "2024年第二季度广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-05 10:00", updateTime: "2024-05-12 10:00", dueDate: "2024-06-05" },
  { id: "T1002_1", parentId: "T1002", name: "2024年第二季度广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-05 10:00", updateTime: "2024-05-12 10:00", dueDate: "2024-06-05" },
  { id: "T1003", name: "2024年第一季度广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "SUBMITTED", creator: "管理员", createTime: "2024-05-01 11:00", updateTime: "2024-05-10 16:30", dueDate: "2024-05-31" },
  { id: "T1003_0", parentId: "T1003", name: "2024年第一季度广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "SUBMITTED", creator: "管理员", createTime: "2024-05-01 11:00", updateTime: "2024-05-10 16:30", dueDate: "2024-05-31" },
  { id: "T1003_1", parentId: "T1003", name: "2024年第一季度广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "SUBMITTED", creator: "管理员", createTime: "2024-05-01 11:00", updateTime: "2024-05-10 16:30", dueDate: "2024-05-31" },
];

const INITIAL_REPORTS: ReviewRecord[] = [
  { id: "R2001", taskId: "T1001", auditStatus: 7, fillStatus: "UNFILLED", submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" },
  { id: "R2002", taskId: "T1002", auditStatus: 2, fillStatus: "REJECTED", submitter: "张平", submitTime: "2024-05-10 10:00", auditor: "王主任", auditTime: "2024-05-12 10:00" },
  { id: "R2003", taskId: "T1002_0", auditStatus: 0, fillStatus: "UNFILLED", submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" },
  { id: "R2004", taskId: "T1002_1", auditStatus: 0, fillStatus: "UNFILLED", submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" },
  { id: "R2005", taskId: "T1003_0", auditStatus: 8, fillStatus: "SUBMITTED", submitter: "李四", submitTime: "2024-05-08 10:00", auditor: "-", auditTime: "-" },
  { id: "R2006", taskId: "T1003_1", auditStatus: 8, fillStatus: "SUBMITTED", submitter: "王五", submitTime: "2024-05-09 10:00", auditor: "-", auditTime: "-" },
];

const INITIAL_TEMPLATES: ReviewTemplate[] = [
  {
    id: "TPL_GZ_YB",
    name: "广州医保（线下）反馈",
    status: "ENABLED",
    desc: "针对广州医保线下反馈的疑点数据进行核查与反馈。",
    creator: "管理员",
    taskCount: 3,
    createTime: "2024-05-01 10:00:00",
    fields: [
      { id: "F1", name: "HOSPITAL_NO", comment: "住院号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: true, isNotNull: true, isRequired: true, isQueryable: true, isFeedback: false, noUpdate: true },
      { id: "F2", name: "PATIENT_NAME", comment: "参保人", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F3", name: "ID_CARD", comment: "身份证号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F4", name: "ADMIT_DATE", comment: "入院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F5", name: "DISCHARGE_DATE", comment: "出院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F6", name: "MEDICAL_CATEGORY", comment: "医疗类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F7", name: "PROJECT_NAME", comment: "项目名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F8", name: "VIOLATION_AMOUNT", comment: "违规金额", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F9", name: "VIOLATION_DESC", comment: "违规描述", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F16", name: "ORDER_DEPT", comment: "开单科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true },
      { id: "F17", name: "EXECUTE_DEPT", comment: "执行科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true },
      { id: "F10", name: "DEPARTMENT_NAME", comment: "科室名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true },
      { id: "F11", name: "DOCTOR_NAME", comment: "医生名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true },
      { id: "F15", name: "REMARK", comment: "备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true },
      { id: "F12", name: "IS_APPEAL", comment: "是/否申诉", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false },
      { id: "F13", name: "APPEAL_REASON", comment: "申诉原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false },
      { id: "F14", name: "APPEAL_ATTACHMENT", comment: "申诉附件", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false },
    ]
  }
];

export const mockApi = {
  startAIFill: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex > -1) {
      const details = mockApi.getTaskDetailRecords(taskId);
      tasks[taskIndex].isAIFilling = true;
      tasks[taskIndex].aiFillProgress = 0;
      tasks[taskIndex].aiFillTotal = details.length;
      localStorage.setItem("tasks", JSON.stringify(tasks));

      const isSubtask = !!tasks[taskIndex].parentId;
      const realTaskId = isSubtask ? tasks[taskIndex].parentId : taskId;
      const currentDeptName = isSubtask ? DEPARTMENTS[tasks[taskIndex].departmentId] : null;

      const key = `task_details_${realTaskId}`;
      let allData = JSON.parse(localStorage.getItem(key) || "null") as any[];
      
      // Filter out those belonging to current task (if subtask filtering needed)
      let targetRowIndices: number[] = [];
      if (allData) {
        allData.forEach((d: any, index: number) => {
          if (!isSubtask || d.data.DEPARTMENT_NAME === currentDeptName || d.data.DEPARTMENT_NAME === currentDeptName?.replace("专管员", "")) {
            d.fillStatus = "AI_FILLING";
            targetRowIndices.push(index);
          }
        });
        localStorage.setItem(key, JSON.stringify(allData));
      }
      
      let progress = 0;
      const total = targetRowIndices.length;
      if (total === 0) {
        let currentTasks = JSON.parse(localStorage.getItem("tasks") || "null");
        if (currentTasks) {
            const idx = currentTasks.findIndex((t: Task) => t.id === taskId);
            if (idx > -1) {
              currentTasks[idx].aiFillProgress = 0;
              localStorage.setItem("tasks", JSON.stringify(currentTasks));
            }
            mockApi.completeAIFill(taskId);
            window.dispatchEvent(new Event("task_updated"));
        }
        return;
      }

      const interval = setInterval(() => {
        let currentTasks = JSON.parse(localStorage.getItem("tasks") || "null");
        if (!currentTasks) {
          clearInterval(interval);
          return;
        }
        const idx = currentTasks.findIndex((t: Task) => t.id === taskId);
        if (idx === -1) {
          clearInterval(interval);
          return;
        }
        
        // Update one row at a time
        if (progress < total) {
          const rowDataIndex = targetRowIndices[progress];
          // Refresh allData from local storage
          let currentAllData = JSON.parse(localStorage.getItem(key) || "null") as any[];
          if (currentAllData && currentAllData[rowDataIndex]) {
             const isAppeal = Math.random() > 0.5; // Randomly decide if appeal
             currentAllData[rowDataIndex].data.IS_APPEAL = isAppeal ? "是" : "否";
             if (isAppeal) {
                currentAllData[rowDataIndex].data.APPEAL_REASON = "系统自动填报诊断：数据符合预期规范，建议申诉复核。";
                currentAllData[rowDataIndex].data.APPEAL_ATTACHMENT = "智能分析辅助证明.pdf";
             } else {
                currentAllData[rowDataIndex].data.APPEAL_REASON = "";
                currentAllData[rowDataIndex].data.APPEAL_ATTACHMENT = "";
             }
             currentAllData[rowDataIndex].fillStatus = "FILLED";
             localStorage.setItem(key, JSON.stringify(currentAllData));
          }
        }

        progress += 1;
        if (progress >= total) {
          progress = total;
          currentTasks[idx].aiFillProgress = progress;
          currentTasks[idx].isAIFilling = false; // Mark finished
          localStorage.setItem("tasks", JSON.stringify(currentTasks));
          mockApi.completeAIFill(taskId);
          clearInterval(interval);
        } else {
          currentTasks[idx].aiFillProgress = progress;
          localStorage.setItem("tasks", JSON.stringify(currentTasks));
        }
        // Fire custom event so components can update if they want to
        window.dispatchEvent(new Event("task_updated"));
      }, 500); // Process one row every 500ms
    }
  },
  completeAIFill: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex > -1) {
      if (tasks[taskIndex].aiFillTotal !== undefined) {
         tasks[taskIndex].aiFillProgress = tasks[taskIndex].aiFillTotal;
      }
      localStorage.setItem("tasks", JSON.stringify(tasks));
      
      const isSubtask = !!tasks[taskIndex].parentId;
      const realTaskId = isSubtask ? tasks[taskIndex].parentId : taskId;
      const currentDeptName = isSubtask ? DEPARTMENTS[tasks[taskIndex].departmentId] : null;

      const key = `task_details_${realTaskId}`;
      let allData = JSON.parse(localStorage.getItem(key) || "null");
      if (allData) {
        allData = allData.map((d: any) => {
          if (!isSubtask || d.data.DEPARTMENT_NAME === currentDeptName || d.data.DEPARTMENT_NAME === currentDeptName?.replace("专管员", "")) {
            return { ...d, fillStatus: "FILLED" };
          }
          return d;
        });
        localStorage.setItem(key, JSON.stringify(allData));
      }
    }
  },
  resetData: () => {
    localStorage.removeItem("tasks");
    localStorage.removeItem("records");
    localStorage.removeItem("templates");
    // Also clear detail records if possible, but they are keyed by task id
    // We'll just let them be or they will be regenerated if not found
  },

  getTasks: (page = 1, pageSize = 10, filters: any = {}): { data: Task[], total: number } => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    
    // 检查是否需要强制重置（当 INITIAL_TASKS 里的名称或数量发生变化时）
    const needsReset = !tasks || 
                       !localStorage.getItem("v5_reset") ||
                       tasks.length !== INITIAL_TASKS.length || 
                       INITIAL_TASKS.some((it, idx) => {
                         const cached = tasks.find((t: any) => t.id === it.id);
                         return cached && cached.name !== it.name;
                       });

    if (needsReset) {
      tasks = INITIAL_TASKS;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("records", JSON.stringify(INITIAL_REPORTS));
      localStorage.setItem("templates", JSON.stringify(INITIAL_TEMPLATES));
      localStorage.setItem("v5_reset", "true");
      // 清除明细记录，让它们重新生成
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("task_details_")) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // 按创建时间倒序排列
    let filtered = [...tasks].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    if (filters.name) {
      filtered = filtered.filter(t => t.name.includes(filters.name));
    }
    if (filters.creator) {
      filtered = filtered.filter(t => t.creator.includes(filters.creator));
    }
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.createTime) {
      filtered = filtered.filter(t => t.createTime.startsWith(filters.createTime));
    }
    if (filters.templateId) {
      filtered = filtered.filter(t => t.templateId === filters.templateId);
    }

    const start = (page - 1) * pageSize;
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length
    };
  },

  getTaskById: (id: string): Task | null => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    return tasks.find((t: Task) => t.id === id) || null;
  },

  getReviewRecords: (taskId?: string): ReviewRecord[] => {
    let records = JSON.parse(localStorage.getItem("records") || "null");
    if (!records) {
      records = INITIAL_REPORTS;
      localStorage.setItem("records", JSON.stringify(records));
    }

    if (taskId) {
      return records.filter((r: ReviewRecord) => r.taskId === taskId);
    }
    return records;
  },

  getTemplates: (search = "", status?: string): ReviewTemplate[] => {
    let templates = JSON.parse(localStorage.getItem("templates") || "null");
    if (!templates) {
      templates = INITIAL_TEMPLATES;
      localStorage.setItem("templates", JSON.stringify(templates));
    }
    // Force reset if stale
    if (templates.length > 0 && templates[0].id !== "TPL_GZ_YB") {
      templates = INITIAL_TEMPLATES;
      localStorage.setItem("templates", JSON.stringify(templates));
    }
    let filtered = templates;
    if (search) {
      filtered = filtered.filter((t: ReviewTemplate) => t.name.includes(search));
    }
    if (status) {
      filtered = filtered.filter((t: ReviewTemplate) => t.status === status);
    }
    return filtered;
  },

  saveTemplate: (template: ReviewTemplate) => {
    const templates = mockApi.getTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index > -1) {
      templates[index] = template;
    } else {
      templates.push({ ...template, id: "TPL" + Date.now(), createTime: new Date().toLocaleString() });
    }
    localStorage.setItem("templates", JSON.stringify(templates));
  },

  deleteTemplates: (ids: string[]) => {
    const templates = mockApi.getTemplates().filter(t => !ids.includes(t.id));
    localStorage.setItem("templates", JSON.stringify(templates));
  },

  updateTaskStatus: (taskId: string, status: keyof typeof TASK_STATUS) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    
    const index = tasks.findIndex((t: Task) => t.id === taskId);
    if (index > -1) {
      tasks[index].status = status;
      tasks[index].updateTime = new Date().toLocaleString();
      localStorage.setItem("tasks", JSON.stringify(tasks));
      
      // If submitted, also update review record
      if (status === "SUBMITTED") {
        let records = JSON.parse(localStorage.getItem("records") || "null");
        if (!records) records = INITIAL_REPORTS;
        const rIndex = records.findIndex((r: ReviewRecord) => r.taskId === taskId);
        if (rIndex > -1) {
          records[rIndex].fillStatus = "SUBMITTED";
          records[rIndex].auditStatus = 8;
          records[rIndex].submitTime = new Date().toLocaleString();
          localStorage.setItem("records", JSON.stringify(records));
        }
      }
      
      // If withdrawn (to fill), update record back to filling
      if (status === "PUBLISH") {
        let records = JSON.parse(localStorage.getItem("records") || "null");
        if (!records) records = INITIAL_REPORTS;
        const rIndex = records.findIndex((r: ReviewRecord) => r.taskId === taskId);
        if (rIndex > -1) {
          records[rIndex].fillStatus = "UNFILLED";
          records[rIndex].auditStatus = 7;
          localStorage.setItem("records", JSON.stringify(records));
        }
      }
    }
  },

  getTaskDetailRecords: (taskId: string) => {
    // Check if this is a subtask
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
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

    if (!data) {
      // Generate some mock data if not exists
      data = [
        { id: "D1", taskId: realTaskId, data: { HOSPITAL_NO: "ZY1001", PATIENT_NAME: "张三", ID_CARD: "440106199001011234", ADMIT_DATE: "2024-03-01", DISCHARGE_DATE: "2024-03-10", MEDICAL_CATEGORY: "住院", PROJECT_NAME: "血常规", VIOLATION_AMOUNT: 120, VIOLATION_DESC: "高频检查", ORDER_DEPT: "内科", EXECUTE_DEPT: "检验科", DEPARTMENT_NAME: "内科", DOCTOR_NAME: "赵医生", IS_APPEAL: "", APPEAL_REASON: "", APPEAL_ATTACHMENT: "", REMARK: "" }, evidence: [], fillStatus: "UNFILLED", auditStatus: 7, submitter: "-", updateTime: "2024-05-12 09:00", dispatchStatus: "未下发" },
        { id: "D2", taskId: realTaskId, data: { HOSPITAL_NO: "ZY1002", PATIENT_NAME: "李四", ID_CARD: "440106198002022345", ADMIT_DATE: "2024-03-05", DISCHARGE_DATE: "2024-03-15", MEDICAL_CATEGORY: "住院", PROJECT_NAME: "MRI", VIOLATION_AMOUNT: 1200, VIOLATION_DESC: "重复检查", ORDER_DEPT: "外科", EXECUTE_DEPT: "放射科", DEPARTMENT_NAME: "外科", DOCTOR_NAME: "钱医生", IS_APPEAL: "", APPEAL_REASON: "", APPEAL_ATTACHMENT: "", REMARK: "" }, evidence: [], fillStatus: "UNFILLED", auditStatus: 7, submitter: "-", updateTime: "2024-05-12 10:30", dispatchStatus: "未下发" },
        { id: "D3", taskId: realTaskId, data: { HOSPITAL_NO: "ZY1003", PATIENT_NAME: "王五", ID_CARD: "440106197003033456", ADMIT_DATE: "2024-03-10", DISCHARGE_DATE: "", MEDICAL_CATEGORY: "门诊", PROJECT_NAME: "阿司匹林", VIOLATION_AMOUNT: 45, VIOLATION_DESC: "超量开药", ORDER_DEPT: "内科", EXECUTE_DEPT: "药剂科", DEPARTMENT_NAME: "内科", DOCTOR_NAME: "孙医生", IS_APPEAL: "", APPEAL_REASON: "", APPEAL_ATTACHMENT: "", REMARK: "" }, evidence: [], fillStatus: "UNFILLED", auditStatus: 7, submitter: "-", updateTime: "2024-05-12 11:00", dispatchStatus: "未下发" },
        { id: "D4", taskId: realTaskId, data: { HOSPITAL_NO: "ZY1004", PATIENT_NAME: "孙六", ID_CARD: "440106196004044567", ADMIT_DATE: "2024-03-12", DISCHARGE_DATE: "2024-03-20", MEDICAL_CATEGORY: "住院", PROJECT_NAME: "CT", VIOLATION_AMOUNT: 800, VIOLATION_DESC: "限频次审批", ORDER_DEPT: "外科", EXECUTE_DEPT: "放射科", DEPARTMENT_NAME: "外科", DOCTOR_NAME: "周医生", IS_APPEAL: "", APPEAL_REASON: "", APPEAL_ATTACHMENT: "", REMARK: "" }, evidence: [], fillStatus: "UNFILLED", auditStatus: 7, submitter: "-", updateTime: "2024-05-12 11:30", dispatchStatus: "未下发" },
      ];
      localStorage.setItem(key, JSON.stringify(data));
    }

    if (isSubtask && currentDeptName) {
      // If it's a subtask, we want to return only the filtered records, and present them as belonging to this subtask?
      // Wait, if we change the taskId inside the records, saving might be tricky.
      // But we can just use the parent ID everywhere.
      return data.filter((d: any) => d.data.DEPARTMENT_NAME === currentDeptName || d.data.DEPARTMENT_NAME === currentDeptName?.replace("专管员", ""));
    }

    return data;
  },

  dispatchTask: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);
    if (taskIndex === -1) return false;

    const parentTask = tasks[taskIndex];
    if (parentTask.status !== "CREATE") return false; // Only dispatch if CREATE

    // Read details
    const details = mockApi.getTaskDetailRecords(taskId);
    
    // Group by department
    const depts = new Set<string>();
    details.forEach((d: any) => depts.add(d.data.DEPARTMENT_NAME));

    // Create sub-tasks
    const subTasks: Task[] = [];
    Array.from(depts).forEach((deptName, idx) => {
      // Find department ID (3 for 外科, 4 for 内科)
      let deptId = deptName === "外科" ? 3 : (deptName === "内科" ? 4 : 1);
      
      const subTaskId = `T${Date.now()}_${idx}`;
      subTasks.push({
        ...parentTask,
        id: subTaskId,
        name: parentTask.name + ` - ${deptName}`,
        departmentId: deptId as any,
        status: "PUBLISH",
        parentId: parentTask.id,
        updateTime: new Date().toLocaleString()
      });
    });

    // Update parent task details to reflect dispatch
    const updatedParentDetails = details.map((d: any) => ({
      ...d,
      dispatchStatus: "已下发"
    }));
    localStorage.setItem(`task_details_${taskId}`, JSON.stringify(updatedParentDetails));

    // Update parent task
    tasks[taskIndex].status = "PUBLISH";
    tasks[taskIndex].updateTime = new Date().toLocaleString();

    // Remove details from parent task, or mark them as dispatched
    const updatedDetails = details.map((d: any) => ({ ...d, dispatchStatus: "已下发" }));
    localStorage.setItem(`task_details_${taskId}`, JSON.stringify(updatedDetails));

    // Save all tasks
    tasks = [...tasks, ...subTasks];
    localStorage.setItem("tasks", JSON.stringify(tasks));
    return true;
  },

  saveTaskDetailRecord: (taskId: string, record: any) => {
    let tasks = JSON.parse(localStorage.getItem("tasks") || "null");
    let isSubtask = false;
    let parentId = null;
    if (tasks) {
      const t = tasks.find((t: Task) => t.id === taskId);
      if (t && t.parentId) {
        isSubtask = true;
        parentId = t.parentId;
      }
    }
    const realTaskId = isSubtask ? parentId : taskId;

    const key = `task_details_${realTaskId}`;
    // getTaskDetailRecords will filter if taskId is subtask, so we must read raw from localStorage to update correctly
    let data = JSON.parse(localStorage.getItem(key) || "null");
    if (!data) data = [];

    const index = data.findIndex((r: any) => r.id === record.id);
    if (index > -1) {
      data[index] = { ...data[index], ...record, updateTime: new Date().toLocaleString() };
    } else {
      data.push({ ...record, id: "D" + Date.now(), updateTime: new Date().toLocaleString() });
    }
    localStorage.setItem(key, JSON.stringify(data));
  },

  deleteTaskDetailRecords: (taskId: string, ids: string[]) => {
    const key = `task_details_${taskId}`;
    let data = mockApi.getTaskDetailRecords(taskId);
    data = data.filter((r: any) => !ids.includes(r.id));
    localStorage.setItem(key, JSON.stringify(data));
  }
};
