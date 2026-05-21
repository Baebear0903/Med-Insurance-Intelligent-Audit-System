import * as fs from 'fs';
import * as path from 'path';

const mockDataContent = `import { TASK_STATUS, AUDIT_STATUS, FILL_STATUS, DEPARTMENTS } from "./constants";

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
  parentId?: string;
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
  isShow?: boolean;
  displayName?: string;
  isQueryable: boolean;
  isFeedback: boolean;
  noUpdate: boolean;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  templateType: "医保审核反馈" | "医保明细下发" | "医保院内扣减";
  status: "ENABLED" | "DISABLED";
  desc: string;
  creator: string;
  taskCount: number;
  createTime: string;
  fields: TemplateField[];
}

const INITIAL_TASKS: Task[] = [
  { id: "T_2024_01_GZ", name: "2024年01月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-01-01 09:00", updateTime: "2024-01-10 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED", name: "2024年01月医保院内扣减", year: "2024", departmentId: 1, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-20 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED_0", parentId: "T_2024_01_DED", name: "2024年01月医保院内扣减 - 外科", year: "2024", departmentId: 3, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-22 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED_1", parentId: "T_2024_01_DED", name: "2024年01月医保院内扣减 - 内科", year: "2024", departmentId: 4, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-22 09:00", dueDate: "2024-01-30" },

  { id: "T_2024_02_GZ", name: "2024年02月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-02-01 09:00", updateTime: "2024-02-10 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED", name: "2024年02月医保院内扣减", year: "2024", departmentId: 1, templateId: "TPL_DED", templateName: "医保院内扣减", status: "PUBLISH", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-20 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED_0", parentId: "T_2024_02_DED", name: "2024年02月医保院内扣减 - 外科", year: "2024", departmentId: 3, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-22 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED_1", parentId: "T_2024_02_DED", name: "2024年02月医保院内扣减 - 内科", year: "2024", departmentId: 4, templateId: "TPL_DED", templateName: "医保院内扣减", status: "PUBLISH", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-20 09:00", dueDate: "2024-02-28" },

  { id: "T_2024_03_GZ", name: "2024年03月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-03-01 09:00", updateTime: "2024-03-10 09:00", dueDate: "2024-03-31" },
  
  { id: "T_2024_04_GZ", name: "2024年04月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "SUBMITTED", creator: "管理员", createTime: "2024-04-01 09:00", updateTime: "2024-04-10 09:00", dueDate: "2024-04-30" },
  
  { id: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  { id: "T_2024_05_GZ_0", parentId: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  { id: "T_2024_05_GZ_1", parentId: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  
  { id: "T_2024_06_GZ", name: "2024年06月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "CREATE", creator: "管理员", createTime: "2024-06-01 09:00", updateTime: "2024-06-10 09:00", dueDate: "2024-06-30" },
];

const INITIAL_REPORTS: ReviewRecord[] = INITIAL_TASKS.filter(t => t.parentId).map(t => ({
    id: "R_" + t.id,
    taskId: t.id,
    auditStatus: t.status === "END" ? 1 : (t.status === "SUBMITTED" ? 8 : 7) as any,
    fillStatus: t.status === "END" ? "APPROVED" : (t.status === "SUBMITTED" ? "SUBMITTED" : "UNFILLED"),
    submitter: t.status === "END" || t.status === "SUBMITTED" ? "专管员" : "-",
    submitTime: t.status === "END" || t.status === "SUBMITTED" ? t.updateTime : "-",
    auditor: t.status === "END" ? "管理员" : "-",
    auditTime: t.status === "END" ? t.updateTime : "-"
}));

const INITIAL_TEMPLATES: ReviewTemplate[] = [
  {
    id: "TPL_GZ_YB",
    name: "广州医保（线下）反馈",
    templateType: "医保审核反馈",
    status: "ENABLED",
    desc: "针对广州医保线下反馈的疑点数据进行核查与反馈。",
    creator: "管理员",
    taskCount: 8,
    createTime: "2024-01-01 10:00:00",
    fields: [
      { id: "F1", name: "HOSPITAL_NO", comment: "住院号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: true, isNotNull: true, isRequired: true, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F2", name: "PATIENT_NAME", comment: "参保人", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F3", name: "ID_CARD", comment: "身份证号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F4", name: "ADMIT_DATE", comment: "入院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F5", name: "DISCHARGE_DATE", comment: "出院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F6", name: "MEDICAL_CATEGORY", comment: "医疗类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F7", name: "PROJECT_NAME", comment: "项目名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F8", name: "VIOLATION_AMOUNT", comment: "违规金额", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F9", name: "VIOLATION_DESC", comment: "违规描述", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F16", name: "ORDER_DEPT", comment: "开单科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F17", name: "EXECUTE_DEPT", comment: "执行科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F10", name: "DEPARTMENT_NAME", comment: "科室名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "责任科室" },
      { id: "F11", name: "DOCTOR_NAME", comment: "医生名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F15", name: "REMARK", comment: "备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F12", name: "IS_APPEAL", comment: "是/否申诉", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "" },
      { id: "F13", name: "APPEAL_REASON", comment: "申诉原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "" },
      { id: "F14", name: "APPEAL_ATTACHMENT", comment: "申诉附件", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "" },
    ]
  },
  {
    id: "TPL_DED",
    name: "医保院内扣减",
    templateType: "医保院内扣减",
    status: "ENABLED",
    desc: "医保院内扣减台账。",
    creator: "管理员",
    taskCount: 2,
    createTime: "2024-01-20 10:00:00",
    fields: []
  }
];

function generate12Records(month: string) {
    const records = [];
    const depts = ["内科", "外科"];
    const patientNames = ["李伟", "王芳", "张强", "刘洋", "陈静", "杨烁", "黄勇", "周杰", "吴凡", "赵丽", "徐宁", "孙亮"];
    
    for (let i = 0; i < 12; i++) {
        const isAppeal = i % 3 === 0; // 一些申诉，一些不申诉
        const isOnline = i % 2 === 0; 
        
        const dateMonth = month.padStart(2, '0');
        
        records.push({
            id: \`D_\${month}_\${i}\`,
            data: { 
                HOSPITAL_NO: \`ZY2024\${dateMonth}\${i.toString().padStart(3, '0')}\`, 
                PATIENT_NAME: patientNames[i], 
                ID_CARD: \`4401061970\${dateMonth}01\${1000 + i}\`, 
                ADMIT_DATE: \`2024-\${dateMonth}-01\`, 
                DISCHARGE_DATE: \`2024-\${dateMonth}-10\`, 
                MEDICAL_CATEGORY: "住院", 
                PROJECT_NAME: i % 2 === 0 ? "血常规" : "CT", 
                VIOLATION_AMOUNT: (i + 1) * 110.5, 
                VIOLATION_DESC: "高频检查", 
                ORDER_DEPT: depts[i % 2], 
                EXECUTE_DEPT: "检验科", 
                DEPARTMENT_NAME: depts[i % 2], 
                DOCTOR_NAME: i % 2 === 0 ? "赵医生" : "钱医生", 
                IS_APPEAL: isAppeal ? "是" : "否", 
                APPEAL_REASON: isAppeal ? "符合规范，建议申诉。" : "", 
                APPEAL_ATTACHMENT: isAppeal ? \`\${patientNames[i]}_小结.pdf\` : "", 
                REMARK: "",
                
                // --- 后台数据治理补充的业务字段 ---
                _PERSON_CATEGORY: "职工医保",
                _IS_ONLINE: isOnline ? "线上" : "线下",
                _DEDUCTION_TARGET: depts[i % 2], // 扣减科室或个人
                _DEDUCTION_AMOUNT: (i + 1) * 110.5, // 扣减科室金额
                _DEDUCTION_MED_COM: i % 2 === 0 ? 0 : 50, // 扣减金额(药耗)
                _DEDUCTION_OTHER: i % 2 === 0 ? (i + 1) * 110.5 : (i + 1) * 110.5 - 50, // 扣减金额(其他)
                _PROJECT_CLASS: i % 2 === 0 ? "诊疗项目" : "耗材",
                _DATA_SOURCE: \`2024年\${dateMonth}月广州医保线下反馈核查\`
            }, 
            evidence: isAppeal ? [\`\${patientNames[i]}_小结.pdf\`] : [], 
            fillStatus: "APPROVED", 
            auditStatus: 1, 
            submitter: "系统", 
            updateTime: \`2024-\${dateMonth}-15 14:00\`, 
            dispatchStatus: "已下发" 
        });
    }
    return records;
}

const ALL_MOCK_DETAILS: Record<string, any[]> = {
    "task_details_T_2024_01_GZ": generate12Records("1"),
    "task_details_T_2024_02_GZ": generate12Records("2"),
    "task_details_T_2024_03_GZ": generate12Records("3"),
};

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
    const key = \`task_details_\${realTaskId}\`;
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
`
fs.writeFileSync(path.join(process.cwd(), 'src/lib/mockData.ts'), mockDataContent, 'utf-8');
console.log('mockData.ts rewritten successfully');
