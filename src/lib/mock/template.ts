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

export const INITIAL_TEMPLATES: ReviewTemplate[] = [
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
