import { AUDIT_STATUS, FILL_STATUS } from '../constants';
import { INITIAL_TASKS } from './task';

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

export const INITIAL_REPORTS: ReviewRecord[] = INITIAL_TASKS.filter(t => t.parentId).map(t => ({
    id: "R_" + t.id,
    taskId: t.id,
    auditStatus: t.status === "END" ? 1 : (t.status === "SUBMITTED" ? 8 : 7) as any,
    fillStatus: t.status === "END" ? "APPROVED" : (t.status === "SUBMITTED" ? "SUBMITTED" : "UNFILLED") as any,
    submitter: t.status === "END" || t.status === "SUBMITTED" ? "专管员" : "-",
    submitTime: t.status === "END" || t.status === "SUBMITTED" ? t.updateTime : "-",
    auditor: t.status === "END" ? "管理员" : "-",
    auditTime: t.status === "END" ? t.updateTime : "-"
}));

export function generate12Records(month: string) {
    const records = [];
    const depts = ["内科", "外科"];
    const patientNames = ["李伟", "王芳", "张强", "刘洋", "陈静", "杨烁", "黄勇", "周杰", "吴凡", "赵丽", "徐宁", "孙亮"];
    
    for (let i = 0; i < 12; i++) {
        const isAppeal = i % 3 === 0;
        const isOnline = i % 2 === 0; 
        
        const dateMonth = month.padStart(2, '0');
        
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
                
                _PERSON_CATEGORY: "职工医保",
                _IS_ONLINE: isOnline ? "线上" : "线下",
                _DEDUCTION_TARGET: depts[i % 2], 
                _DEDUCTION_AMOUNT: (i + 1) * 110.5, 
                _DEDUCTION_MED_COM: i % 2 === 0 ? 0 : 50, 
                _DEDUCTION_OTHER: i % 2 === 0 ? (i + 1) * 110.5 : (i + 1) * 110.5 - 50, 
                _PROJECT_CLASS: i % 2 === 0 ? "诊疗项目" : "耗材",
                _DATA_SOURCE: `2024年${dateMonth}月广州医保线下反馈核查`
            }, 
            evidence: isAppeal ? [`${patientNames[i]}_小结.pdf`] : [], 
            fillStatus: "APPROVED", 
            auditStatus: 1, 
            submitter: "系统", 
            updateTime: `2024-${dateMonth}-15 14:00`, 
            dispatchStatus: "已下发" 
        });
    }
    return records;
}

export const ALL_MOCK_DETAILS: Record<string, any[]> = {
    "task_details_T_2024_01_GZ": generate12Records("1"),
    "task_details_T_2024_02_GZ": generate12Records("2"),
    "task_details_T_2024_03_GZ": generate12Records("3"),
};
