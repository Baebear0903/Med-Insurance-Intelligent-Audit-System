import { getInsuranceCategories } from "./insuranceCategoryStore";

export interface MedicalInsuranceScenario {
  personnelCategory: string; // 人员类别
  onlineOffline: "线上" | "线下"; // 线上/线下
  medicalCategory: string; // 医疗类别
}

// 丰富的真实医保场景库（预置不属于初始业务分类配置中已启用组合的医保业务场景）
export const CANDIDATE_SCENARIOS: MedicalInsuranceScenario[] = [
  { personnelCategory: "城乡居民医保", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "城乡居民医保", onlineOffline: "线上", medicalCategory: "普通门诊" },
  { personnelCategory: "城镇职工医保", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "城镇职工医保", onlineOffline: "线上", medicalCategory: "门诊慢特病" },
  { personnelCategory: "医疗救助对象", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "医疗救助对象", onlineOffline: "线上", medicalCategory: "普通门诊" },
  { personnelCategory: "生育保险", onlineOffline: "线上", medicalCategory: "生育门诊" },
  { personnelCategory: "生育保险", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "离休优抚", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "门诊慢特病", onlineOffline: "线上", medicalCategory: "门诊慢特病" },
  { personnelCategory: "门诊慢特病", onlineOffline: "线下", medicalCategory: "门诊慢特病" },
  { personnelCategory: "灵活就业参保", onlineOffline: "线下", medicalCategory: "普通门诊" },
  { personnelCategory: "灵活就业参保", onlineOffline: "线上", medicalCategory: "普通门诊" },
  { personnelCategory: "企业补充医保", onlineOffline: "线下", medicalCategory: "住院" },
  { personnelCategory: "工伤保险", onlineOffline: "线下", medicalCategory: "工伤门诊" },
  { personnelCategory: "省直医保", onlineOffline: "线下", medicalCategory: "住院" }, // 业务分类配置中省直医保默认仅启用了线上
  { personnelCategory: "市直医保", onlineOffline: "线上", medicalCategory: "普通门诊" }, // 业务分类配置中市直医保默认仅启用了线下
];

/**
 * 获取与当前已启用的医保业务分类配置不重复的医保场景
 */
export function getAvailableManualScenarios(): MedicalInsuranceScenario[] {
  const enabledConfigs = getInsuranceCategories().filter(c => c.enabled);
  
  // 过滤掉与当前已启用分类配置重复的人员类别+线上线下组合，或者与已启用业务分类名称重复的项目
  const available = CANDIDATE_SCENARIOS.filter(candidate => {
    // 1. 人员类别 与 线上/线下 组合排重
    const isPairDuplicate = enabledConfigs.some(
      c => c.personnelCategory === candidate.personnelCategory && c.onlineOffline === candidate.onlineOffline
    );
    // 2. 医保业务分类名称排重
    const isNameDuplicate = enabledConfigs.some(
      c => c.categoryName === candidate.personnelCategory || 
           c.categoryName.includes(candidate.personnelCategory)
    );
    return !isPairDuplicate && !isNameDuplicate;
  });

  // 如果全都由于某种原因被排除了，提供保底医保场景（绝对不与内置配置重复）
  if (available.length === 0) {
    return [
      { personnelCategory: "城乡居民医保", onlineOffline: "线下", medicalCategory: "住院" },
      { personnelCategory: "城镇职工医保", onlineOffline: "线上", medicalCategory: "门诊慢特病" },
      { personnelCategory: "医疗救助对象", onlineOffline: "线下", medicalCategory: "住院" },
      { personnelCategory: "生育保险", onlineOffline: "线上", medicalCategory: "生育门诊" }
    ];
  }

  return available;
}

const PATIENTS = [
  { name: "张建国", idCard: "440106196503121518" },
  { name: "刘淑芬", idCard: "44010319720824262X" },
  { name: "陈志强", idCard: "440105198111053432" },
  { name: "王玉英", idCard: "440111195804194541" },
  { name: "黄晓峰", idCard: "440104199007165156" },
  { name: "林佩珊", idCard: "440106198812286762" },
  { name: "吴冠宇", idCard: "440112197506027879" },
  { name: "郑惠芳", idCard: "440102196309148983" }
];

const VIOLATION_ITEMS = [
  {
    project: "注射用头孢哌酮钠他唑巴坦钠",
    violationDesc: "超医保限定二级以上指征及重度感染用药范围",
    projectClass: "西药",
    amount: 586.40,
    dept: "呼吸内科",
    doctor: "王主任医师",
    deductionTarget: "呼吸内科"
  },
  {
    project: "多层螺旋CT平扫(胸部)",
    violationDesc: "短期内重复行胸部高分辨率CT检查且无病情变化指征",
    projectClass: "诊疗项目",
    amount: 450.00,
    dept: "心血管内科",
    doctor: "李副主任医师",
    deductionTarget: "心血管内科"
  },
  {
    project: "动态心电图(Holter24小时)",
    violationDesc: "门诊重复计费且监护时长不符合计费标准",
    projectClass: "诊疗项目",
    amount: 260.00,
    dept: "老年医学科",
    doctor: "张主治医师",
    deductionTarget: "老年医学科"
  },
  {
    project: "一次性使用精密过滤输液器",
    violationDesc: "普通静脉滴注过度使用高值耗材，不符合限定收费规范",
    projectClass: "医用耗材",
    amount: 185.00,
    dept: "普外科",
    doctor: "赵副主任医师",
    deductionTarget: "普外科"
  },
  {
    project: "重组人脑利钠肽注射液",
    violationDesc: "NYHA心功能分级未达急性失代偿期指征即使用",
    projectClass: "西药",
    amount: 1240.00,
    dept: "心血管内科",
    doctor: "刘主任医师",
    deductionTarget: "心血管内科"
  },
  {
    project: "全血细胞计数+五分类",
    violationDesc: "住院期间同日多次采血检验，无病情突变抢救记录",
    projectClass: "诊疗项目",
    amount: 72.00,
    dept: "消化内科",
    doctor: "孙主治医师",
    deductionTarget: "消化内科"
  }
];

/**
 * 生成手动新增扣减明细的演示数据（几条即可，默认6条）
 */
export function generateManualDeductionRecords(
  customCategory: string,
  belongingMonth: string = "2026-09",
  count: number = 6
) {
  const availableScenarios = getAvailableManualScenarios();
  const records = [];
  const monthClean = (belongingMonth || "2026-09").replace("-", "");

  for (let i = 0; i < count; i++) {
    // 轮询或随机选取不与业务分类配置启用的配置重复的医保场景
    const scenario = availableScenarios[i % availableScenarios.length];
    const patient = PATIENTS[i % PATIENTS.length];
    const item = VIOLATION_ITEMS[i % VIOLATION_ITEMS.length];

    const violationAmt = item.amount;
    const dMedCom = item.projectClass === "西药" || item.projectClass === "医用耗材" 
      ? Math.round(violationAmt * 0.7 * 100) / 100 
      : 0;
    const dOther = Math.round((violationAmt - dMedCom) * 100) / 100;
    const totalDeduction = Math.round((dMedCom + dOther) * 100) / 100;

    const dayStart = (i * 3 + 1).toString().padStart(2, "0");
    const dayEnd = (i * 3 + 6).toString().padStart(2, "0");
    const mStr = belongingMonth || "2026-09";

    records.push({
      id: `DED_MANUAL_${Date.now()}_${i}`,
      data: {
        SEQ_NO: (i + 1).toString(),
        _PERSON_CATEGORY: scenario.personnelCategory,
        _IS_ONLINE: scenario.onlineOffline,
        HOSPITAL_NO: scenario.onlineOffline === "线上" 
          ? `MZ${monthClean}${100 + i}` 
          : `ZY${monthClean}${200 + i}`,
        PATIENT_NAME: patient.name,
        ID_CARD: patient.idCard,
        ADMIT_DATE: `${mStr}-${dayStart}`,
        DISCHARGE_DATE: `${mStr}-${dayEnd}`,
        MEDICAL_CATEGORY: scenario.medicalCategory || (scenario.onlineOffline === "线上" ? "普通门诊" : "住院"),
        PROJECT_NAME: item.project,
        VIOLATION_AMOUNT: violationAmt.toFixed(2),
        VIOLATION_DESC: item.violationDesc,
        ORDER_DEPT: item.dept,
        EXECUTE_DEPT: item.dept,
        DISPATCH_DEPT: item.dept || "",
        DOCTOR_NAME: item.doctor,
        _DEDUCTION_TARGET: item.deductionTarget,
        VIOLATION_AMOUNT_2: violationAmt.toFixed(2),
        _DEDUCTION_AMOUNT: totalDeduction.toFixed(2),
        _DEDUCTION_MED_COM: dMedCom.toFixed(2),
        _DEDUCTION_OTHER: dOther.toFixed(2),
        _PROJECT_CLASS: item.projectClass,
        REMARK: "医保智能审核判定违规，科室无异议确认扣减",
        IS_APPEAL: "否",
        _DATA_SOURCE: `${customCategory} ${mStr} 手动新增明细`
      },
      evidence: [],
      fillStatus: 2,
      auditStatus: 1,
      submitter: "管理员",
      updateTime: `${mStr}-${dayEnd} 16:30`,
      dispatchStatus: "已下发"
    });
  }

  return records;
}
