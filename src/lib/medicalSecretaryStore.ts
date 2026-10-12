// 医保秘书与外部门户系统预置数据管理 Store

export interface PortalUser {
  id: string;
  name: string;
  employeeNo: string;
  phone?: string;
  departmentName?: string;
  sourceSystem?: string;
}

export interface PortalDepartment {
  id: string;
  code: string;
  name: string;
  category?: string;
}

export interface MedicalSecretaryDepartment {
  id: string;
  code: string;
  name: string;
}

export interface MedicalSecretary {
  id: string;
  userId: string;       // 门户用户ID
  userName: string;     // 医保秘书姓名
  employeeNo: string;   // 工号 (自动带出)
  departments: MedicalSecretaryDepartment[]; // 医保秘书分管科室 (下拉多选)
  sourceSystem?: string;// 外部门户系统来源
  createTime: string;   // 创建时间
  updateTime?: string;  // 最后更新时间
}

// 预置外部门户系统用户列表（演示数据）
export const PORTAL_USERS: PortalUser[] = [
  { id: "U001", name: "张三", employeeNo: "YB1001", phone: "13800138001", departmentName: "心血管内科", sourceSystem: "医院统一门户系统" },
  { id: "U002", name: "李四", employeeNo: "YB1002", phone: "13800138002", departmentName: "神经外科", sourceSystem: "医院统一门户系统" },
  { id: "U003", name: "王五", employeeNo: "YB1003", phone: "13800138003", departmentName: "呼吸内科", sourceSystem: "医院统一门户系统" },
  { id: "U004", name: "赵六", employeeNo: "YB1004", phone: "13800138004", departmentName: "骨科", sourceSystem: "医院统一门户系统" },
  { id: "U005", name: "孙七", employeeNo: "YB1005", phone: "13800138005", departmentName: "内分泌科", sourceSystem: "医院统一门户系统" },
  { id: "U006", name: "周八", employeeNo: "YB1006", phone: "13800138006", departmentName: "肾内科", sourceSystem: "医院统一门户系统" },
  { id: "U007", name: "吴九", employeeNo: "YB1007", phone: "13800138007", departmentName: "妇产科", sourceSystem: "医院统一门户系统" },
  { id: "U008", name: "郑十", employeeNo: "YB1008", phone: "13800138008", departmentName: "神经内科", sourceSystem: "医院统一门户系统" },
  { id: "U009", name: "陈晨", employeeNo: "YB1009", phone: "13800138009", departmentName: "消化内科", sourceSystem: "医院统一门户系统" },
  { id: "U010", name: "林枫", employeeNo: "YB1010", phone: "13800138010", departmentName: "肿瘤科", sourceSystem: "医院统一门户系统" },
  { id: "U011", name: "刘洋", employeeNo: "YB1011", phone: "13800138011", departmentName: "急诊科", sourceSystem: "医院统一门户系统" },
  { id: "U012", name: "黄博", employeeNo: "YB1012", phone: "13800138012", departmentName: "儿科", sourceSystem: "医院统一门户系统" },
  { id: "U013", name: "杨婷", employeeNo: "YB1013", phone: "13800138013", departmentName: "重症医学科", sourceSystem: "医院统一门户系统" },
  { id: "U014", name: "徐伟", employeeNo: "YB1014", phone: "13800138014", departmentName: "胸外科", sourceSystem: "医院统一门户系统" },
  { id: "U015", name: "何敏", employeeNo: "YB1015", phone: "13800138015", departmentName: "口腔科", sourceSystem: "医院统一门户系统" },
];

// 预置外部门户系统科室列表（演示数据，涵盖医院全院主要科室）
export const PORTAL_DEPARTMENTS: PortalDepartment[] = [
  { id: "TH_001", code: "TH_001", name: "心血管内科", category: "临床内科" },
  { id: "TH_002", code: "TH_002", name: "神经外科", category: "临床外科" },
  { id: "TH_003", code: "TH_003", name: "普通外科", category: "临床外科" },
  { id: "TD_001", code: "TD_001", name: "呼吸内科", category: "临床内科" },
  { id: "TD_002", code: "TD_002", name: "骨科", category: "临床外科" },
  { id: "TD_003", code: "TD_003", name: "内分泌科", category: "临床内科" },
  { id: "TD_004", code: "TD_004", name: "急诊科", category: "急症中心" },
  { id: "ICU_001", code: "ICU_001", name: "重症医学科", category: "危重医学" },
  { id: "OBGYN_001", code: "OBGYN_001", name: "妇产科", category: "专科临床" },
  { id: "PED_001", code: "PED_001", name: "儿科", category: "专科临床" },
  { id: "EMERG_001", code: "EMERG_001", name: "急诊医学科", category: "急症中心" },
  { id: "RAD_001", code: "RAD_001", name: "放射介入科", category: "医技科室" },
  { id: "GI_001", code: "GI_001", name: "消化内科", category: "临床内科" },
  { id: "NEPH_001", code: "NEPH_001", name: "肾内科", category: "临床内科" },
  { id: "NEUR_001", code: "NEUR_001", name: "神经内科", category: "临床内科" },
  { id: "URO_001", code: "URO_001", name: "泌尿外科", category: "临床外科" },
  { id: "THOR_001", code: "THOR_001", name: "胸外科", category: "临床外科" },
  { id: "ONC_001", code: "ONC_001", name: "肿瘤科", category: "专科临床" },
  { id: "INF_001", code: "INF_001", name: "感染科", category: "专科临床" },
  { id: "OPH_001", code: "OPH_001", name: "眼科", category: "五官科" },
  { id: "ENT_001", code: "ENT_001", name: "耳鼻喉科", category: "五官科" },
  { id: "STOM_001", code: "STOM_001", name: "口腔科", category: "五官科" },
  { id: "DERM_001", code: "DERM_001", name: "皮肤科", category: "专科临床" },
  { id: "ANES_001", code: "ANES_001", name: "麻醉科", category: "医技科室" },
  { id: "PATH_001", code: "PATH_001", name: "病理科", category: "医技科室" },
  { id: "LAB_001", code: "LAB_001", name: "检验科", category: "医技科室" },
  { id: "IMG_001", code: "IMG_001", name: "放射影像科", category: "医技科室" },
  { id: "US_001", code: "US_001", name: "超声医学科", category: "医技科室" },
  { id: "REH_001", code: "REH_001", name: "康复医学科", category: "专科临床" },
  { id: "TCM_001", code: "TCM_001", name: "中医科", category: "特色专科" },
];

// 预置医保秘书配置演示数据（按医保秘书维度，支持分管多个科室）
export const INITIAL_MEDICAL_SECRETARIES: MedicalSecretary[] = [
  {
    id: "SEC_1",
    userId: "U001",
    userName: "张三",
    employeeNo: "YB1001",
    departments: [
      { id: "TH_001", code: "TH_001", name: "心血管内科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-10 09:30:00"
  },
  {
    id: "SEC_2",
    userId: "U002",
    userName: "李四",
    employeeNo: "YB1002",
    departments: [
      { id: "TH_002", code: "TH_002", name: "神经外科" },
      { id: "TH_003", code: "TH_003", name: "普通外科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-10 09:35:00"
  },
  {
    id: "SEC_3",
    userId: "U003",
    userName: "王五",
    employeeNo: "YB1003",
    departments: [
      { id: "TD_001", code: "TD_001", name: "呼吸内科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-10 09:40:00"
  },
  {
    id: "SEC_4",
    userId: "U004",
    userName: "赵六",
    employeeNo: "YB1004",
    departments: [
      { id: "TD_002", code: "TD_002", name: "骨科" },
      { id: "TD_004", code: "TD_004", name: "急诊科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-10 09:45:00"
  },
  {
    id: "SEC_5",
    userId: "U005",
    userName: "孙七",
    employeeNo: "YB1005",
    departments: [
      { id: "TD_003", code: "TD_003", name: "内分泌科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-10 09:50:00"
  },
  {
    id: "SEC_6",
    userId: "U006",
    userName: "周八",
    employeeNo: "YB1006",
    departments: [
      { id: "NEPH_001", code: "NEPH_001", name: "肾内科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-12 14:10:00"
  },
  {
    id: "SEC_7",
    userId: "U009",
    userName: "陈晨",
    employeeNo: "YB1009",
    departments: [
      { id: "GI_001", code: "GI_001", name: "消化内科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-12 15:20:00"
  },
  {
    id: "SEC_8",
    userId: "U010",
    userName: "林枫",
    employeeNo: "YB1010",
    departments: [
      { id: "ONC_001", code: "ONC_001", name: "肿瘤科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-15 11:00:00"
  },
  {
    id: "SEC_9",
    userId: "U012",
    userName: "黄博",
    employeeNo: "YB1012",
    departments: [
      { id: "PED_001", code: "PED_001", name: "儿科" }
    ],
    sourceSystem: "医院统一门户系统",
    createTime: "2024-05-16 16:30:00"
  },
];

const STORAGE_KEY = "medical_secretaries_v4";
const SECRETARY_CHANGE_EVENT = "medical_secretaries_updated";

export const getMedicalSecretaries = (): MedicalSecretary[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].departments)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load medical secretaries", e);
  }

  // 默认写入预置演示数据
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEDICAL_SECRETARIES));
  return INITIAL_MEDICAL_SECRETARIES;
};

export const saveMedicalSecretaries = (data: MedicalSecretary[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(SECRETARY_CHANGE_EVENT, { detail: data }));
  } catch (e) {
    console.error("Failed to save medical secretaries", e);
  }
};

export const resetMedicalSecretaries = (): MedicalSecretary[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEDICAL_SECRETARIES));
  window.dispatchEvent(new CustomEvent(SECRETARY_CHANGE_EVENT, { detail: INITIAL_MEDICAL_SECRETARIES }));
  return INITIAL_MEDICAL_SECRETARIES;
};

// 获取去重的医保秘书聚合列表（供科室映射配置等业务下拉菜单选用）
export interface SecretaryAggregate {
  id: string; // userId
  userId: string;
  name: string;
  employeeNo: string;
  departments: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export const getDistinctSecretaries = (): SecretaryAggregate[] => {
  const secretaries = getMedicalSecretaries();
  return secretaries.map((sec) => ({
    id: sec.userId,
    userId: sec.userId,
    name: sec.userName,
    employeeNo: sec.employeeNo,
    departments: sec.departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
    })),
  }));
};

export { SECRETARY_CHANGE_EVENT };
