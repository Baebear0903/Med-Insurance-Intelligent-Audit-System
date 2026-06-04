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
  adminVisible?: boolean;
  displayName?: string;
  isQueryable: boolean;
  isFeedback: boolean;
  noUpdate: boolean;
  mappedStandardField?: string;
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
  businessCategory?: string;
}

const INITIAL_TASKS: Task[] = [
  { id: "T_2024_01_GZ", name: "2024年01月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-01-01 09:00", updateTime: "2024-01-10 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_GZ_0", parentId: "T_2024_01_GZ", name: "2024年01月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-01-01 09:00", updateTime: "2024-01-10 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_GZ_1", parentId: "T_2024_01_GZ", name: "2024年01月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-01-01 09:00", updateTime: "2024-01-10 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED", name: "2024年01月医保院内扣减", year: "2024", departmentId: 1, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-20 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED_0", parentId: "T_2024_01_DED", name: "2024年01月医保院内扣减 - 外科", year: "2024", departmentId: 3, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-22 09:00", dueDate: "2024-01-30" },
  { id: "T_2024_01_DED_1", parentId: "T_2024_01_DED", name: "2024年01月医保院内扣减 - 内科", year: "2024", departmentId: 4, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-01-20 09:00", updateTime: "2024-01-22 09:00", dueDate: "2024-01-30" },

  { id: "T_2024_02_GZ", name: "2024年02月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-02-01 09:00", updateTime: "2024-02-10 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_GZ_0", parentId: "T_2024_02_GZ", name: "2024年02月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-02-01 09:00", updateTime: "2024-02-10 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_GZ_1", parentId: "T_2024_02_GZ", name: "2024年02月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-02-01 09:00", updateTime: "2024-02-10 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED", name: "2024年02月医保院内扣减", year: "2024", departmentId: 1, templateId: "TPL_DED", templateName: "医保院内扣减", status: "PUBLISH", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-20 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED_0", parentId: "T_2024_02_DED", name: "2024年02月医保院内扣减 - 外科", year: "2024", departmentId: 3, templateId: "TPL_DED", templateName: "医保院内扣减", status: "END", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-22 09:00", dueDate: "2024-02-28" },
  { id: "T_2024_02_DED_1", parentId: "T_2024_02_DED", name: "2024年02月医保院内扣减 - 内科", year: "2024", departmentId: 4, templateId: "TPL_DED", templateName: "医保院内扣减", status: "PUBLISH", creator: "管理员", createTime: "2024-02-20 09:00", updateTime: "2024-02-20 09:00", dueDate: "2024-02-28" },

  { id: "T_2024_03_GZ", name: "2024年03月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-03-01 09:00", updateTime: "2024-03-10 09:00", dueDate: "2024-03-31" },
  { id: "T_2024_03_GZ_0", parentId: "T_2024_03_GZ", name: "2024年03月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-03-01 09:00", updateTime: "2024-03-10 09:00", dueDate: "2024-03-31" },
  { id: "T_2024_03_GZ_1", parentId: "T_2024_03_GZ", name: "2024年03月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "END", creator: "管理员", createTime: "2024-03-01 09:00", updateTime: "2024-03-10 09:00", dueDate: "2024-03-31" },
  
  { id: "T_2024_04_GZ", name: "2024年04月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-04-01 09:00", updateTime: "2024-04-10 09:00", dueDate: "2024-04-30" },
  { id: "T_2024_04_GZ_0", parentId: "T_2024_04_GZ", name: "2024年04月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "SUBMITTED", creator: "管理员", createTime: "2024-04-01 09:00", updateTime: "2024-04-10 09:00", dueDate: "2024-04-30" },
  { id: "T_2024_04_GZ_1", parentId: "T_2024_04_GZ", name: "2024年04月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-04-01 09:00", updateTime: "2024-04-10 09:00", dueDate: "2024-04-30" },
  
  { id: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  { id: "T_2024_05_GZ_0", parentId: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查 - 外科", year: "2024", departmentId: 3, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  { id: "T_2024_05_GZ_1", parentId: "T_2024_05_GZ", name: "2024年05月广州医保线下反馈核查 - 内科", year: "2024", departmentId: 4, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "PUBLISH", creator: "管理员", createTime: "2024-05-01 09:00", updateTime: "2024-05-10 09:00", dueDate: "2024-05-31" },
  
  { id: "T_2024_06_GZ", name: "2024年06月广州医保线下反馈核查", year: "2024", departmentId: 1, templateId: "TPL_GZ_YB", templateName: "广州医保（线下）反馈", status: "CREATE", creator: "管理员", createTime: "2024-06-01 09:00", updateTime: "2024-06-10 09:00", dueDate: "2024-06-30" },
];

const INITIAL_REPORTS: ReviewRecord[] = INITIAL_TASKS.filter(t => t.parentId).map(t => ({
    id: "R_" + t.id,
    taskId: t.id,
    auditStatus: t.status === "END" ? 1 : (t.status === "SUBMITTED" ? 8 : 7) as any,
    fillStatus: t.status === "END" ? 2 : (t.status === "SUBMITTED" ? 1 : 0),
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
    businessCategory: "广州医保（线下）",
    status: "ENABLED",
    desc: "针对广州医保线下反馈的疑点数据进行核查与反馈。",
    creator: "管理员",
    taskCount: 8,
    createTime: "2024-01-01 10:00:00",
    fields: [
      { id: "F1_P", name: "_PERSON_CATEGORY", comment: "人员类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F1_O", name: "_IS_ONLINE", comment: "线上/线下", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F1", name: "HOSPITAL_NO", comment: "住院号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: true, isNotNull: true, isRequired: true, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F2", name: "PATIENT_NAME", comment: "参保人", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F3", name: "ID_CARD", comment: "身份证号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "", adminVisible: true },
      { id: "F4", name: "ADMIT_DATE", comment: "入院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F5", name: "DISCHARGE_DATE", comment: "出院日期", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F6", name: "MEDICAL_CATEGORY", comment: "医疗类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F7", name: "PROJECT_NAME", comment: "项目名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F8", name: "VIOLATION_AMOUNT", comment: "违规金额", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F9", name: "VIOLATION_DESC", comment: "违规描述", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F16", name: "ORDER_DEPT", comment: "开单科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "开单科室" },
      { id: "F17", name: "EXECUTE_DEPT", comment: "执行科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "执行科室" },
      { id: "F10", name: "DEPARTMENT_NAME", comment: "科室名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "科室名称" },
      { id: "F11", name: "DOCTOR_NAME", comment: "医生名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F15", name: "REMARK", comment: "备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F12", name: "IS_APPEAL", comment: "是/否申诉", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "是/否申诉" },
      { id: "F13", name: "APPEAL_REASON", comment: "申诉原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "申诉原因" },
      { id: "F14", name: "APPEAL_ATTACHMENT", comment: "申诉附件", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "申诉附件" },
      { id: "DF_APPEAL_REMARK", name: "APPEAL_REMARK", comment: "申诉备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "申诉备注", isQueryable: false, isFeedback: true, noUpdate: true },
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
    fields: [
      { id: "F1", name: "_PERSON_CATEGORY", comment: "人员类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F2", name: "_IS_ONLINE", comment: "线上/线下", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F3", name: "HOSPITAL_NO", comment: "住院号/门诊号", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: true, isNotNull: true, isRequired: true, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F4", name: "PATIENT_NAME", comment: "患者姓名", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F5", name: "ID_CARD", comment: "证件号码", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F6", name: "ADMIT_DATE", comment: "入院时间", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F7", name: "DISCHARGE_DATE", comment: "出院时间", type: "DATE", length: 0, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F8", name: "MEDICAL_CATEGORY", comment: "医疗类别", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F9", name: "PROJECT_NAME", comment: "扣款项目", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F10", name: "VIOLATION_AMOUNT", comment: "违规金额（单位：元）", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F11", name: "VIOLATION_DESC", comment: "扣减原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F12", name: "ORDER_DEPT", comment: "涉及科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F13", name: "DOCTOR_NAME", comment: "涉及医生", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: true, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F14", name: "_DEDUCTION_TARGET", comment: "扣减科室或个人", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F15", name: "VIOLATION_AMOUNT_2", comment: "违规金额", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F16", name: "_DEDUCTION_AMOUNT", comment: "扣减科室/个人金额", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F17", name: "_DEDUCTION_MED_COM", comment: "扣减金额（药费/耗材）", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F18", name: "_DEDUCTION_OTHER", comment: "扣减金额（其它）", type: "DECIMAL", length: 10, decimal: 2, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F19", name: "_PROJECT_CLASS", comment: "项目分类", type: "VARCHAR", length: 50, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F20", name: "REMARK", comment: "备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
      { id: "F21", name: "IS_APPEAL", comment: "是否申诉/同意扣减", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: true, noUpdate: false, isShow: true, displayName: "" },
      { id: "F22", name: "_DATA_SOURCE", comment: "数据来源", type: "VARCHAR", length: 200, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isQueryable: false, isFeedback: false, noUpdate: true, isShow: true, displayName: "" },
    ]
  }
];

function generate12Records(month: string) {
    const records = [];
    const depts = ["内科", "外科"];
    const patientNames = ["李伟", "王芳", "张强", "刘洋", "陈静", "杨烁", "黄勇", "周杰", "吴凡", "赵丽", "徐宁", "孙亮"];
    const personCategories = ["广州医保", "省内异地", "跨省异地", "省直医保", "市直医保", "荔湾公医", "白云公医", "海珠公医", "从化公医", "花都公医", "黄埔公医"];
    
    for (let i = 0; i < 12; i++) {
        const isAppeal = i % 3 === 0; // 一些申诉，一些不申诉
        const dateMonth = month.padStart(2, '0');

        const _PERSON_CATEGORY = "广州医保";
        const _IS_ONLINE = "线下";
        
        records.push({
            id: `D_${month}_${i}`,
            data: { 
                HOSPITAL_NO: `ZY2024${dateMonth}${i.toString().padStart(3, '0')}`, 
                PATIENT_NAME: patientNames[i], 
                ID_CARD: `4401061970${dateMonth}01${1000 + i}`, 
                ADMIT_DATE: `2024-${dateMonth}-01`, 
                DISCHARGE_DATE: `2024-${dateMonth}-10`, 
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
                APPEAL_ATTACHMENT: isAppeal ? `${patientNames[i]}_小结.pdf` : "", 
                REMARK: "",
                
                // --- 后台数据治理补充的业务字段 ---
                _PERSON_CATEGORY: _PERSON_CATEGORY,
                _IS_ONLINE: _IS_ONLINE,
                _DEDUCTION_TARGET: depts[i % 2], // 扣减科室或个人
                _DEDUCTION_AMOUNT: (i + 1) * 110.5, // 扣减科室金额
                _DEDUCTION_MED_COM: i % 2 === 0 ? 0 : 50, // 扣减金额(药耗)
                _DEDUCTION_OTHER: i % 2 === 0 ? (i + 1) * 110.5 : (i + 1) * 110.5 - 50, // 扣减金额(其他)
                _PROJECT_CLASS: i % 2 === 0 ? "诊疗项目" : "耗材",
                _DATA_SOURCE: `2024年${dateMonth}月广州医保线下反馈核查`
            }, 
            evidence: isAppeal ? [`${patientNames[i]}_小结.pdf`] : [], 
            fillStatus: 2, 
            auditStatus: 1, 
            submitter: "系统", 
            updateTime: `2024-${dateMonth}-15 14:00`, 
            dispatchStatus: "已下发" 
        });
    }
    return records;
}

const ALL_MOCK_DETAILS: Record<string, any[]> = {
    "task_records_T_2024_01_GZ": generate12Records("1").map((r, i) => i % 3 === 0 ? { ...r, fillStatus: 6, auditStatus: 9 } : r),
    "task_records_T_2024_02_GZ": generate12Records("2").map((r, i) => i % 3 === 0 ? { ...r, fillStatus: 6, auditStatus: 9 } : r),
    "task_records_T_2024_03_GZ": generate12Records("3").map((r, i) => i % 3 === 0 ? { ...r, fillStatus: 6, auditStatus: 9 } : r),
    "task_records_T_2024_04_GZ": generate12Records("4").map((r) => r.data.DEPARTMENT_NAME === "内科" ? { ...r, fillStatus: 0, auditStatus: 7, submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" } : { ...r, fillStatus: 8, auditStatus: 8, submitter: "专管员", submitTime: "2024-04-15 14:00" }),
    "task_records_T_2024_05_GZ": generate12Records("5").map((r) => r.data.DEPARTMENT_NAME === "内科" ? { ...r, fillStatus: 1, auditStatus: 8, submitter: "专管员", submitTime: "2024-05-15 14:00", auditor: "-", auditTime: "-" } : { ...r, fillStatus: 0, auditStatus: 7, submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" }),
    "task_records_T_2024_06_GZ": generate12Records("6").map((r) => ({ ...r, fillStatus: 0, auditStatus: 7, submitter: "-", submitTime: "-", auditor: "-", auditTime: "-" })),
};

// 复用反馈核查任务中所生成的扣减明细 (IS_APPEAL === "否")
ALL_MOCK_DETAILS["task_records_T_2024_01_DED"] = ALL_MOCK_DETAILS["task_records_T_2024_01_GZ"].filter(r => r.data.IS_APPEAL === "否").map(r => ({ ...r, id: r.id.replace('D_', 'DED_') }));
ALL_MOCK_DETAILS["task_records_T_2024_02_DED"] = ALL_MOCK_DETAILS["task_records_T_2024_02_GZ"].filter(r => r.data.IS_APPEAL === "否").map(r => ({ ...r, id: r.id.replace('D_', 'DED_') }));

let activeIntervals: Record<string, NodeJS.Timeout> = {};

export const mockApi = {
  startAIFill: (taskId: string, restart = true) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
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
    const key = `task_records_v21_${realTaskId}`;
    let data = JSON.parse(localStorage.getItem(key) || "null");
    if (data) {
      if (restart) {
        // First, set everything to AI_FILLING except those already AI_FILLED if restart is false but here we set all if restart
        data = data.map((d: any) => ({
          ...d,
          fillStatus: 51
        }));
      } else {
         // It's a continue
         data = data.map((d: any) => ({
          ...d,
          fillStatus: d.fillStatus === 5 ? 5 : 51
        }));
      }
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event("task_updated"));
      
      if (activeIntervals[key]) {
        clearInterval(activeIntervals[key]);
      }

      // Gradually complete them
      let index = 0;
      activeIntervals[key] = setInterval(() => {
        let currentData = JSON.parse(localStorage.getItem(key) || "null");
        if (!currentData) {
          clearInterval(activeIntervals[key]);
          delete activeIntervals[key];
          return;
        }
        
        let modified = false;
        // Find next item to fill (actually filling AI_FILLING ones)
        let found = false;
        for (let i = index; i < currentData.length; i++) {
          if (currentData[i].fillStatus === 51) {
            const d = currentData[i];
            const patient = d.data.PATIENT_NAME || "";
            const outDate = d.data.DISCHARGE_DATE || "";
            const proj = d.data.PROJECT_NAME || "";
            const attachment = `${patient}_${outDate}_${proj}_病历系统.pdf`;
    
            currentData[i] = {
              ...d,
              fillStatus: 5,
              data: {
                ...d.data,
                IS_APPEAL: "是",
                APPEAL_REASON: "AI识别符合申诉条件",
                APPEAL_REMARK: "建议去病历系统或HIS系统查找相关附件材料",
                APPEAL_ATTACHMENT: attachment
              },
              evidence: [attachment]
            };
            modified = true;
            found = true;
            // update index to next
            index = i + 1;
            break;
          }
        }
        
        if (modified) {
          localStorage.setItem(key, JSON.stringify(currentData));
          window.dispatchEvent(new Event("task_updated"));
        }
        
        if (!found || index >= currentData.length) {
          clearInterval(activeIntervals[key]);
          delete activeIntervals[key];
        }
      }, 500); // every 500ms fill one record
    }
  },
  abortAIFill: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
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
    const key = `task_records_v21_${realTaskId}`;
    
    if (activeIntervals[key]) {
      clearInterval(activeIntervals[key]);
      delete activeIntervals[key];
    }
    
    let data = JSON.parse(localStorage.getItem(key) || "null");
    if (data) {
      // Mark still in progress as AI_ABORTED to differentiate them, or leave as AI_FILLING 
      // but without interval they just stop. Better mark them as AI_PAUSED or just leave as UNFILLED/AI_FILLING
      data = data.map((d: any) => {
        if (d.fillStatus === 51) {
           return { ...d, fillStatus: 52 };
        }
        return d;
      });
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new Event("task_updated"));
    }
  },
  completeAIFill: (taskId: string) => {},
  resetData: () => {},

  getTasks: (page = 1, pageSize = 10, filters: any = {}): { data: Task[], total: number } => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
    
    if (!tasks || tasks.length !== INITIAL_TASKS.length) {
      tasks = INITIAL_TASKS;
      localStorage.setItem("tasks_v21", JSON.stringify(tasks));
      localStorage.setItem("records_v21", JSON.stringify(INITIAL_REPORTS));
      localStorage.setItem("templates_v21", JSON.stringify(INITIAL_TEMPLATES));
      Object.keys(ALL_MOCK_DETAILS).forEach(key => {
         localStorage.setItem(key, JSON.stringify(ALL_MOCK_DETAILS[key]));
      });
    }

    // Dynamically calculate parent status based on children before filtering
    tasks.forEach((task: Task) => {
        if (!task.parentId) {
            const children = tasks.filter((t: Task) => t.parentId === task.id);
            if (children.length > 0) {
                // If there are children, the parent status is determined by children
                const allEnd = children.every((c: Task) => c.status === "END");
                const allSubmittedOrEnd = children.every((c: Task) => c.status === "SUBMITTED" || c.status === "END");
                
                if (allEnd) {
                    task.status = "END";
                } else if (allSubmittedOrEnd) {
                    task.status = "SUBMITTED";
                } else {
                    // if not all submitted, and at least some children exist, task is PUBLISH
                    if (task.status !== "END" && task.status !== "SUBMITTED" && task.status !== "PUBLISH") {
                        task.status = "PUBLISH";
                    } else if (task.status === "SUBMITTED" || task.status === "END") {
                        task.status = "PUBLISH";
                    }
                }
            }
        }
    });

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
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
    if (!tasks) tasks = INITIAL_TASKS;
    const task = tasks.find((t: Task) => t.id === id);
    if (!task) return null;
    
    if (!task.parentId) {
        const children = tasks.filter((t: Task) => t.parentId === task.id);
        if (children.length > 0) {
            const allEnd = children.every((c: Task) => c.status === "END");
            const allSubmittedOrEnd = children.every((c: Task) => c.status === "SUBMITTED" || c.status === "END");
            
            if (allEnd) {
                task.status = "END";
            } else if (allSubmittedOrEnd) {
                task.status = "SUBMITTED";
            } else {
                task.status = "PUBLISH";
            }
        }
    }
    return task;
  },

  getReviewRecords: (taskId?: string): ReviewRecord[] => {
    let records = JSON.parse(localStorage.getItem("records_v21") || "null");
    if (!records) records = INITIAL_REPORTS;
    if (taskId) {
      return records.filter((r: ReviewRecord) => r.taskId === taskId);
    }
    return records;
  },

  getTemplates: (search = "", status?: string, typeFilter?: string): ReviewTemplate[] => {
    let templates = JSON.parse(localStorage.getItem("templates_v21") || "null");
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
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
    if (!tasks) return;
    const index = tasks.findIndex((t: Task) => t.id === taskId);
    if (index > -1) {
      tasks[index].status = status;
      tasks[index].updateTime = new Date().toLocaleString();
      
      // Propagate BACK and CANCELLATION to children
      if (status === "BACK" || status === "CANCELLATION") {
        tasks.forEach((t: Task) => {
           if (t.parentId === taskId) {
               t.status = status;
               t.updateTime = tasks[index].updateTime;
           }
        });
      }

      localStorage.setItem("tasks_v21", JSON.stringify(tasks));
      
      // For deductions, update parent if all children are END
      if (tasks[index].parentId && status === "END") {
          const parentId = tasks[index].parentId;
          const siblings = tasks.filter((t:Task) => t.parentId === parentId);
          if (siblings.every((t:Task) => t.status === "END")) {
              const parentIdx = tasks.findIndex((t:Task) => t.id === parentId);
              if (parentIdx > -1) {
                  tasks[parentIdx].status = "END";
                  tasks[parentIdx].updateTime = new Date().toLocaleString();
                  localStorage.setItem("tasks_v21", JSON.stringify(tasks));
              }
          }
      }
    }
  },

  getTaskDetailRecords: (taskId: string) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
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
    const key = `task_records_v21_${realTaskId}`;
    let data = JSON.parse(localStorage.getItem(key) || "null");

    if (!data && ALL_MOCK_DETAILS[`task_records_${realTaskId}`]) {
      data = ALL_MOCK_DETAILS[`task_records_${realTaskId}`];
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
      let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
      if (!tasks) return false;
      const index = tasks.findIndex((t: Task) => t.id === taskId);
      if (index > -1 && tasks[index].status === "CREATE") {
          tasks[index].status = "PUBLISH";
          localStorage.setItem("tasks_v21", JSON.stringify(tasks));
          return true;
      }
      return false;
  },

  saveTaskDetailRecord: (taskId: string, record: any) => {
    let tasks = JSON.parse(localStorage.getItem("tasks_v21") || "null");
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
    const key = `task_records_v21_${realTaskId}`;
    let data = JSON.parse(localStorage.getItem(key) || "null");
    if (!data) return;
    const idx = data.findIndex((d: any) => d.id === record.id);
    if (idx > -1) {
      data[idx] = record;
      localStorage.setItem(key, JSON.stringify(data));
    }
  },
  deleteTaskDetailRecords: (taskId: string, ids: string[]) => {}
};
