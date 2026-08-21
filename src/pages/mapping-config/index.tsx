import React, { useState, useEffect, useRef } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { toast } from "@/src/components/ui/Toast";
import { Plus, Search, ChevronDown, Check, Trash2, Edit3, HelpCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

// --- Types ---
export interface RegularMappingRule {
  id: string;
  sourceName: string;
  targetUserId: string;
  targetUserName: string;
  targetName: string;
  targetCode: string;
  createTime: string;
}

export interface SpecialMappingRule {
  id: string;
  deptName: string;
  deptCode: string;
  isSpecial: boolean;
  createTime: string;
}

export interface MasterDepartment {
  id: string;
  name: string;
}

// --- All Hospital Master Departments ---
export const ALL_HOSPITAL_DEPARTMENTS: MasterDepartment[] = [
  { id: "TH_001", name: "心血管内科" },
  { id: "TH_002", name: "神经外科" },
  { id: "TH_003", name: "普通外科" },
  { id: "TD_001", name: "呼吸内科" },
  { id: "TD_002", name: "骨科" },
  { id: "TD_003", name: "内分泌科" },
  { id: "TD_004", name: "急诊科" },
  { id: "ICU_001", name: "重症医学科" },
  { id: "OBGYN_001", name: "妇产科" },
  { id: "PED_001", name: "儿科" },
  { id: "EMERG_001", name: "急诊医学科" },
  { id: "RAD_001", name: "放射介入科" },
  { id: "GI_001", name: "消化内科" },
  { id: "NEPH_001", name: "肾内科" },
  { id: "NEUR_001", name: "神经内科" },
  { id: "URO_001", name: "泌尿外科" },
  { id: "THOR_001", name: "胸外科" },
  { id: "ONC_001", name: "肿瘤科" },
  { id: "INF_001", name: "感染科" },
  { id: "OPH_001", name: "眼科" },
  { id: "ENT_001", name: "耳鼻喉科" },
  { id: "STOM_001", name: "口腔科" },
  { id: "DERM_001", name: "皮肤科" },
  { id: "ANES_001", name: "麻醉科" },
  { id: "PATH_001", name: "病理科" },
  { id: "LAB_001", name: "检验科" },
  { id: "IMG_001", name: "放射影像科" },
  { id: "US_001", name: "超声医学科" },
  { id: "REH_001", name: "康复医学科" },
  { id: "TCM_001", name: "中医科" },
];

// --- Mock Data ---
const MOCK_REGULAR_USERS = [
  {
    id: "U001",
    name: "张三",
    identity: "医保秘书",
    departments: [
      { id: "TH_001", name: "心血管内科" }
    ]
  },
  {
    id: "U002",
    name: "李四",
    identity: "医保秘书",
    departments: [
      { id: "TH_002", name: "神经外科" },
      { id: "TH_003", name: "普通外科" }
    ]
  },
  {
    id: "U003",
    name: "王五",
    identity: "医保秘书",
    departments: [
      { id: "TD_001", name: "呼吸内科" }
    ]
  },
  {
    id: "U004",
    name: "赵六",
    identity: "医保秘书",
    departments: [
      { id: "TD_002", name: "骨科" },
      { id: "TD_004", name: "急诊科" }
    ]
  },
  {
    id: "U005",
    name: "孙七",
    identity: "医保秘书",
    departments: [
      { id: "TD_003", name: "内分泌科" }
    ]
  }
];

const INITIAL_REGULAR_RULES: RegularMappingRule[] = [
  { id: "1", sourceName: "心内", targetUserId: "U001", targetUserName: "张三", targetName: "心血管内科", targetCode: "TH_001", createTime: "2024-05-15 10:00:00" },
  { id: "2", sourceName: "神外", targetUserId: "U002", targetUserName: "李四", targetName: "神经外科", targetCode: "TH_002", createTime: "2024-05-15 10:05:00" },
  { id: "3", sourceName: "普外", targetUserId: "U002", targetUserName: "李四", targetName: "普通外科", targetCode: "TH_003", createTime: "2024-05-15 10:10:00" },
  { id: "4", sourceName: "呼吸", targetUserId: "U003", targetUserName: "王五", targetName: "呼吸内科", targetCode: "TD_001", createTime: "2024-05-15 10:15:00" },
];

const INITIAL_SPECIAL_RULES: SpecialMappingRule[] = [
  { id: "S1", deptName: "重症医学科", deptCode: "ICU_001", isSpecial: true, createTime: "2024-05-15 11:00:00" },
  { id: "S2", deptName: "妇产科", deptCode: "OBGYN_001", isSpecial: true, createTime: "2024-05-15 11:05:00" },
  { id: "S3", deptName: "儿科", deptCode: "PED_001", isSpecial: true, createTime: "2024-05-15 11:10:00" },
  { id: "S4", deptName: "急诊医学科", deptCode: "EMERG_001", isSpecial: true, createTime: "2024-05-15 11:15:00" },
  { id: "S5", deptName: "放射介入科", deptCode: "RAD_001", isSpecial: false, createTime: "2024-05-15 11:20:00" },
];

export function MappingConfig() {
  const [activeTab, setActiveTab] = useState<"regular" | "special">("regular");
  
  // Regular mapping states
  const [regularRules, setRegularRules] = useState<RegularMappingRule[]>([]);
  const [regularSearch, setRegularSearch] = useState("");
  const [regularModalOpen, setRegularModalOpen] = useState(false);
  const [regularForm, setRegularForm] = useState<Partial<RegularMappingRule>>({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRegularDeptDropdown, setShowRegularDeptDropdown] = useState(false);

  // Special mapping states
  const [specialRules, setSpecialRules] = useState<SpecialMappingRule[]>([]);
  const [specialSearch, setSpecialSearch] = useState("");
  const [specialModalOpen, setSpecialModalOpen] = useState(false);
  const [specialForm, setSpecialForm] = useState<Partial<SpecialMappingRule>>({ isSpecial: true });
  const [showSpecialDeptDropdown, setShowSpecialDeptDropdown] = useState(false);
  const [specialDeptSearchKeyword, setSpecialDeptSearchKeyword] = useState("");

  // Delete confirm modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: "regular" | "special";
    id: string;
    name: string;
  }>({
    open: false,
    type: "regular",
    id: "",
    name: ""
  });

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const regularDeptDropdownRef = useRef<HTMLDivElement>(null);
  const specialDeptDropdownRef = useRef<HTMLDivElement>(null);

  // Initial Load from LocalStorage
  useEffect(() => {
    try {
      const storedRegular = localStorage.getItem("regular_mapping_rules_v5");
      if (storedRegular) {
        setRegularRules(JSON.parse(storedRegular));
      } else {
        setRegularRules(INITIAL_REGULAR_RULES);
        localStorage.setItem("regular_mapping_rules_v5", JSON.stringify(INITIAL_REGULAR_RULES));
      }

      const storedSpecial = localStorage.getItem("special_mapping_rules_v3");
      if (storedSpecial) {
        setSpecialRules(JSON.parse(storedSpecial));
      } else {
        setSpecialRules(INITIAL_SPECIAL_RULES);
        localStorage.setItem("special_mapping_rules_v3", JSON.stringify(INITIAL_SPECIAL_RULES));
      }
    } catch (e) {
      console.error(e);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (regularDeptDropdownRef.current && !regularDeptDropdownRef.current.contains(event.target as Node)) {
        setShowRegularDeptDropdown(false);
      }
      if (specialDeptDropdownRef.current && !specialDeptDropdownRef.current.contains(event.target as Node)) {
        setShowSpecialDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Regular Mapping Handlers ---
  const saveRegularRules = (newRules: RegularMappingRule[]) => {
    setRegularRules(newRules);
    localStorage.setItem("regular_mapping_rules_v5", JSON.stringify(newRules));
  };

  const handleAddRegular = () => {
    setRegularForm({});
    setRegularModalOpen(true);
    setShowUserDropdown(false);
    setShowRegularDeptDropdown(false);
  };

  const handleEditRegular = (rule: RegularMappingRule) => {
    setRegularForm({ ...rule });
    setRegularModalOpen(true);
    setShowUserDropdown(false);
    setShowRegularDeptDropdown(false);
  };

  const handleSaveRegular = () => {
    if (!regularForm.sourceName?.trim()) {
      toast("请填写医保审核数据科室名称", "error");
      return;
    }
    if (!regularForm.targetUserId) {
      toast("请选择医保秘书", "error");
      return;
    }
    if (!regularForm.targetCode) {
      toast("请选择下发映射科室", "error");
      return;
    }

    const nowStr = new Date().toLocaleString();
    if (regularForm.id) {
      const updated = regularRules.map(r => r.id === regularForm.id ? { ...r, ...regularForm } as RegularMappingRule : r);
      saveRegularRules(updated);
      toast("常规映射修改成功", "success");
    } else {
      const newRule: RegularMappingRule = {
        id: Date.now().toString(),
        sourceName: regularForm.sourceName.trim(),
        targetUserId: regularForm.targetUserId,
        targetUserName: regularForm.targetUserName || "",
        targetName: regularForm.targetName || "",
        targetCode: regularForm.targetCode || "",
        createTime: nowStr
      };
      saveRegularRules([newRule, ...regularRules]);
      toast("常规映射新建成功", "success");
    }
    setRegularModalOpen(false);
  };

  // --- Special Mapping Handlers ---
  const saveSpecialRules = (newRules: SpecialMappingRule[]) => {
    setSpecialRules(newRules);
    localStorage.setItem("special_mapping_rules_v3", JSON.stringify(newRules));
  };

  const handleAddSpecial = () => {
    setSpecialForm({
      deptName: "",
      deptCode: "",
      isSpecial: true
    });
    setSpecialDeptSearchKeyword("");
    setShowSpecialDeptDropdown(false);
    setSpecialModalOpen(true);
  };

  const handleEditSpecial = (rule: SpecialMappingRule) => {
    setSpecialForm({ ...rule });
    setSpecialDeptSearchKeyword("");
    setShowSpecialDeptDropdown(false);
    setSpecialModalOpen(true);
  };

  const handleToggleSpecialStatus = (id: string, currentVal: boolean) => {
    const updated = specialRules.map(r => 
      r.id === id ? { ...r, isSpecial: !currentVal } : r
    );
    saveSpecialRules(updated);
    toast(`已${!currentVal ? "开启" : "关闭"}该科室特殊逻辑`, "success");
  };

  const handleSaveSpecial = () => {
    if (!specialForm.deptName?.trim() || !specialForm.deptCode?.trim()) {
      toast("请选择科室", "error");
      return;
    }

    // Check duplicate dept
    const isDup = specialRules.some(
      r => (r.deptCode === specialForm.deptCode || r.deptName.trim() === specialForm.deptName?.trim()) && r.id !== specialForm.id
    );
    if (isDup) {
      toast("已存在该科室的特殊映射配置", "error");
      return;
    }

    const nowStr = new Date().toLocaleString();
    const isSpecialValue = specialForm.isSpecial ?? true;

    if (specialForm.id) {
      const updated = specialRules.map(r => 
        r.id === specialForm.id 
          ? { 
              ...r, 
              deptName: specialForm.deptName!.trim(),
              deptCode: specialForm.deptCode!.trim(),
              isSpecial: isSpecialValue
            } 
          : r
      );
      saveSpecialRules(updated);
      toast("特殊科室修改成功", "success");
    } else {
      const newRule: SpecialMappingRule = {
        id: "S_" + Date.now(),
        deptName: specialForm.deptName.trim(),
        deptCode: specialForm.deptCode.trim(),
        isSpecial: isSpecialValue,
        createTime: nowStr
      };
      saveSpecialRules([newRule, ...specialRules]);
      toast("特殊科室新增成功", "success");
    }
    setSpecialModalOpen(false);
  };

  // --- Delete Handler ---
  const confirmDelete = () => {
    if (deleteConfirm.type === "regular") {
      saveRegularRules(regularRules.filter(r => r.id !== deleteConfirm.id));
      toast("常规映射已删除", "info");
    } else {
      saveSpecialRules(specialRules.filter(r => r.id !== deleteConfirm.id));
      toast("特殊科室配置已删除", "info");
    }
    setDeleteConfirm({ open: false, type: "regular", id: "", name: "" });
  };

  // --- Filtered Lists ---
  const filteredRegularRules = regularRules.filter(r =>
    r.sourceName.toLowerCase().includes(regularSearch.toLowerCase()) ||
    r.targetName.toLowerCase().includes(regularSearch.toLowerCase()) ||
    r.targetCode.toLowerCase().includes(regularSearch.toLowerCase()) ||
    r.targetUserName.toLowerCase().includes(regularSearch.toLowerCase())
  );

  const filteredSpecialRules = specialRules.filter(r =>
    r.deptName.toLowerCase().includes(specialSearch.toLowerCase()) ||
    (r.deptCode && r.deptCode.toLowerCase().includes(specialSearch.toLowerCase()))
  );

  // Selected User Object for Regular Form
  const selectedUserObj = MOCK_REGULAR_USERS.find(u => u.id === regularForm.targetUserId);
  const availableDepts = selectedUserObj ? selectedUserObj.departments : [];

  // Filtered Master Departments for Special Form Dropdown Search (Only display department name in options)
  const filteredMasterDepts = ALL_HOSPITAL_DEPARTMENTS.filter(d => 
    d.name.toLowerCase().includes(specialDeptSearchKeyword.toLowerCase()) ||
    d.id.toLowerCase().includes(specialDeptSearchKeyword.toLowerCase())
  );

  // --- Regular Columns ---
  const regularColumns = [
    { 
      key: "index", 
      title: "序号", 
      width: "80px", 
      render: (_: any, idx: number) => (
        <span className="text-slate-500 font-mono text-xs">{idx + 1}</span>
      )
    },
    { 
      key: "sourceName", 
      title: "医保审核数据科室名称", 
      minWidth: "200px",
      render: (r: RegularMappingRule) => (
        <span className="font-medium text-slate-800">{r.sourceName}</span>
      )
    },
    { 
      key: "targetUserName", 
      title: "医保秘书", 
      minWidth: "140px",
      render: (r: RegularMappingRule) => (
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
            {r.targetUserName.slice(0, 1)}
          </span>
          <span className="text-slate-700 text-sm">{r.targetUserName}</span>
        </div>
      )
    },
    { 
      key: "targetName", 
      title: "下发映射科室", 
      minWidth: "180px", 
      render: (r: RegularMappingRule) => (
        <span className="text-slate-700 font-medium">{r.targetName || "-"}</span>
      ) 
    },
    { 
      key: "targetCode", 
      title: "科室编码", 
      minWidth: "130px", 
      render: (r: RegularMappingRule) => (
        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">
          {r.targetCode || "-"}
        </span>
      ) 
    },
    { 
      key: "createTime", 
      title: "创建时间", 
      minWidth: "180px",
      render: (r: RegularMappingRule) => (
        <span className="text-slate-500 text-xs">{r.createTime}</span>
      )
    },
    { 
      key: "action", 
      title: "操作", 
      width: "150px",
      fixed: "right" as const,
      render: (r: RegularMappingRule) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditRegular(r)} 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2.5"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDeleteConfirm({ open: true, type: "regular", id: r.id, name: r.sourceName })} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      )
    }
  ];

  // --- Special Columns (Without 特殊分发 badge, without 最后更新时间, with 科室编码) ---
  const specialColumns = [
    { 
      key: "index", 
      title: "序号", 
      width: "80px", 
      render: (_: any, idx: number) => (
        <span className="text-slate-500 font-mono text-xs">{idx + 1}</span>
      )
    },
    { 
      key: "deptName", 
      title: "科室名称", 
      minWidth: "220px",
      render: (r: SpecialMappingRule) => (
        <span className="font-medium text-slate-800">{r.deptName}</span>
      )
    },
    { 
      key: "deptCode", 
      title: "科室编码", 
      minWidth: "140px",
      render: (r: SpecialMappingRule) => (
        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">
          {r.deptCode || "-"}
        </span>
      )
    },
    { 
      key: "isSpecial", 
      title: "是否特殊科室", 
      minWidth: "160px",
      render: (r: SpecialMappingRule) => (
        <div className="flex items-center gap-2.5">
          {/* Interactive Switch in table */}
          <button
            type="button"
            role="switch"
            aria-checked={r.isSpecial}
            onClick={() => handleToggleSpecialStatus(r.id, r.isSpecial)}
            className={cn(
              "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
              r.isSpecial ? "bg-blue-600" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                r.isSpecial ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span className={cn(
            "text-xs font-medium",
            r.isSpecial ? "text-blue-700" : "text-slate-500"
          )}>
            {r.isSpecial ? "是 (开启)" : "否 (关闭)"}
          </span>
        </div>
      )
    },
    { 
      key: "createTime", 
      title: "创建时间", 
      minWidth: "180px",
      render: (r: SpecialMappingRule) => (
        <span className="text-slate-500 text-xs">{r.createTime}</span>
      )
    },
    { 
      key: "action", 
      title: "操作", 
      width: "150px",
      fixed: "right" as const,
      render: (r: SpecialMappingRule) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditSpecial(r)} 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2.5"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDeleteConfirm({ open: true, type: "special", id: r.id, name: r.deptName })} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      )
    }
  ];

  return (
    <div id="mapping-config-page" className="p-5 w-full h-full flex flex-col overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full min-h-full flex flex-col flex-1">
        
        {/* Global Tabs - styled consistently with 操作指引 */}
        <div className="flex border-b border-slate-200 px-6 pt-2">
          <button
            id="tab-regular-mapping"
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "regular"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px] font-semibold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("regular")}
          >
            常规映射
          </button>
          <button
            id="tab-special-mapping"
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "special"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px] font-semibold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("special")}
          >
            特殊映射
          </button>
        </div>

        {/* Tab 1 Content: 常规映射 */}
        {activeTab === "regular" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Toolbar */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="regular-search-input"
                  className="pl-9 pr-3 w-64 h-9 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all placeholder:text-slate-400"
                  placeholder="搜索科室、编码或医保秘书..."
                  value={regularSearch}
                  onChange={e => setRegularSearch(e.target.value)}
                />
              </div>

              <Button 
                id="btn-add-regular-mapping"
                onClick={handleAddRegular} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all h-9 px-4 rounded-lg font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                新建映射
              </Button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden relative px-6 pb-6">
              <Table 
                columns={regularColumns} 
                data={filteredRegularRules} 
                rowKey={(r: RegularMappingRule) => r.id} 
                emptyText="暂无常规映射配置" 
              />
            </div>
          </div>
        )}

        {/* Tab 2 Content: 特殊映射 */}
        {activeTab === "special" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Optimized Hint Banner */}
            <div className="mx-6 mt-5 px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                开启特殊逻辑后，系统将根据明细医生所在科室分配医保秘书
              </span>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="special-search-input"
                  className="pl-9 pr-3 w-64 h-9 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm transition-all placeholder:text-slate-400"
                  placeholder="搜索科室名称或编码..."
                  value={specialSearch}
                  onChange={e => setSpecialSearch(e.target.value)}
                />
              </div>

              <Button 
                id="btn-add-special-mapping"
                onClick={handleAddSpecial} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all h-9 px-4 rounded-lg font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                新增特殊科室
              </Button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-hidden relative px-6 pb-6">
              <Table 
                columns={specialColumns} 
                data={filteredSpecialRules} 
                rowKey={(r: SpecialMappingRule) => r.id} 
                emptyText="暂无特殊科室配置" 
              />
            </div>
          </div>
        )}
      </div>

      {/* --- Regular Mapping Edit/Add Modal --- */}
      <Modal 
        isOpen={regularModalOpen} 
        onClose={() => setRegularModalOpen(false)} 
        title={regularForm.id ? "编辑常规映射" : "新增常规映射"}
        width="max-w-[500px]"
      >
        <div className="py-3 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              医保审核数据科室名称 <span className="text-red-500">*</span>
            </label>
            <input 
              id="regular-source-name-input"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-sm"
              placeholder="请输入上传的科室名称，例如：心内" 
              value={regularForm.sourceName || ""}
              onChange={e => setRegularForm({ ...regularForm, sourceName: e.target.value })}
            />
          </div>
          
          {/* Secretary Selection (Only secretary name in options, no "管辖科室" subtitle) */}
          <div className="space-y-1.5 relative" ref={userDropdownRef}>
            <label className="text-sm font-medium text-slate-700">
              选择医保秘书 <span className="text-red-500">*</span>
            </label>
            <div 
              id="regular-secretary-select"
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors bg-white",
                showUserDropdown ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
              )}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span className={regularForm.targetUserName ? "text-slate-900 font-medium" : "text-slate-400"}>
                {regularForm.targetUserName ? regularForm.targetUserName : "请选择对应医保秘书"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showUserDropdown && "rotate-180")} />
            </div>
            
            {showUserDropdown && (
              <div className="absolute top-[68px] left-0 right-0 max-h-52 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[200] p-1 divide-y divide-slate-50">
                {MOCK_REGULAR_USERS.map(user => (
                  <div
                    key={user.id}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-blue-50/70 transition-colors flex items-center justify-between",
                      regularForm.targetUserId === user.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                    )}
                    onClick={() => {
                      const newDept = user.departments.length === 1 ? user.departments[0] : null;
                      setRegularForm({ 
                        ...regularForm, 
                        targetUserId: user.id,
                        targetUserName: user.name,
                        targetName: newDept ? newDept.name : "",
                        targetCode: newDept ? newDept.id : ""
                      });
                      setShowUserDropdown(false);
                    }}
                  >
                    <span className="font-medium">{user.name}</span>
                    {regularForm.targetUserId === user.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Selection (Clean single select box without weird borders) */}
          <div className="space-y-1.5 relative" ref={regularDeptDropdownRef}>
            <label className="text-sm font-medium text-slate-700">
              下发映射科室 <span className="text-red-500">*</span>
            </label>
            <div 
              id="regular-target-dept-select"
              className={cn(
                "w-full border rounded-lg px-3 py-2 text-sm flex justify-between items-center transition-colors",
                !regularForm.targetUserId 
                  ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70" 
                  : (availableDepts.length > 1 
                      ? "cursor-pointer bg-white border-slate-200 hover:border-blue-400" 
                      : "bg-slate-50 border-slate-200 text-slate-700 cursor-default"),
                showRegularDeptDropdown && availableDepts.length > 1 ? "border-blue-500 ring-2 ring-blue-100" : ""
              )}
              onClick={() => {
                if (regularForm.targetUserId && availableDepts.length > 1) {
                  setShowRegularDeptDropdown(!showRegularDeptDropdown);
                }
              }}
            >
              <span className={regularForm.targetName ? "text-slate-900 font-medium" : "text-slate-400"}>
                {regularForm.targetName ? regularForm.targetName : (regularForm.targetUserId ? "请选择下发映射科室" : "请先选择医保秘书")}
              </span>
              {availableDepts.length > 1 && (
                 <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showRegularDeptDropdown && "rotate-180")} />
              )}
            </div>
            
            {showRegularDeptDropdown && availableDepts.length > 1 && (
              <div className="absolute top-[68px] left-0 right-0 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[200] p-1 divide-y divide-slate-50">
                {availableDepts.map(dept => (
                  <div
                    key={dept.id}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-blue-50/70 transition-colors flex items-center justify-between",
                      regularForm.targetCode === dept.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                    )}
                    onClick={() => {
                      setRegularForm({ 
                        ...regularForm, 
                        targetName: dept.name,
                        targetCode: dept.id
                      });
                      setShowRegularDeptDropdown(false);
                    }}
                  >
                    <span className="font-medium">{dept.name}</span>
                    {regularForm.targetCode === dept.id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Department Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">科室编码</label>
            <input 
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 text-slate-600 text-sm font-mono cursor-not-allowed"
              placeholder="选择科室后自动带出"
              value={regularForm.targetCode || ""}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setRegularModalOpen(false)}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveRegular}>
            确定
          </Button>
        </div>
      </Modal>

      {/* --- Special Mapping Edit/Add Modal (Dropdown Single Select with Search & Auto-filled Dept Code) --- */}
      <Modal
        isOpen={specialModalOpen}
        onClose={() => setSpecialModalOpen(false)}
        title={specialForm.id ? "编辑特殊科室" : "新增特殊科室"}
        width="max-w-[480px]"
      >
        <div className="py-3 space-y-5">
          {/* Department Selection (Single Select Dropdown with Search, Options without Code) */}
          <div className="space-y-1.5 relative" ref={specialDeptDropdownRef}>
            <label className="text-sm font-medium text-slate-700">
              选择科室 <span className="text-red-500">*</span>
            </label>
            <div 
              id="special-dept-select-trigger"
              className={cn(
                "w-full border rounded-lg px-3 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors bg-white",
                showSpecialDeptDropdown ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
              )}
              onClick={() => setShowSpecialDeptDropdown(!showSpecialDeptDropdown)}
            >
              <span className={specialForm.deptName ? "text-slate-900 font-medium" : "text-slate-400"}>
                {specialForm.deptName ? specialForm.deptName : "请选择科室"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showSpecialDeptDropdown && "rotate-180")} />
            </div>

            {/* Dropdown Menu with Search */}
            {showSpecialDeptDropdown && (
              <div className="absolute top-[72px] left-0 right-0 max-h-64 overflow-hidden flex flex-col bg-white border border-slate-200 shadow-xl rounded-lg z-[200]">
                {/* Search Input */}
                <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="special-dept-dropdown-search"
                      type="text"
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500"
                      placeholder="输入科室名称或编码快速搜索..."
                      value={specialDeptSearchKeyword}
                      onChange={e => setSpecialDeptSearchKeyword(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Options List (Only department name, no code displayed) */}
                <div className="overflow-y-auto max-h-48 p-1 divide-y divide-slate-50">
                  {filteredMasterDepts.length > 0 ? (
                    filteredMasterDepts.map(dept => (
                      <div
                        key={dept.id}
                        className={cn(
                          "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-blue-50/80 transition-colors flex items-center justify-between",
                          specialForm.deptCode === dept.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                        )}
                        onClick={() => {
                          setSpecialForm({
                            ...specialForm,
                            deptName: dept.name,
                            deptCode: dept.id
                          });
                          setShowSpecialDeptDropdown(false);
                        }}
                      >
                        <span className="font-medium">{dept.name}</span>
                        {specialForm.deptCode === dept.id && (
                          <Check className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      未找到相关科室
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 科室编码 (自动带出) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">科室编码</label>
            <input
              id="special-dept-code-display"
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 text-slate-600 text-sm font-mono cursor-not-allowed"
              placeholder="选择科室后自动带出"
              value={specialForm.deptCode || ""}
            />
          </div>

          {/* 是否特殊科室 开关项 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              是否特殊科室 <span className="text-red-500">*</span>
            </label>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-800">
                  {specialForm.isSpecial ? "特殊科室逻辑已开启" : "特殊科室逻辑已关闭"}
                </div>
                <div className="text-xs text-slate-500">
                  {specialForm.isSpecial 
                    ? "将根据明细医生所在科室分配医保秘书" 
                    : "关闭后将按普通科室流程处理"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="special-switch-toggle"
                  role="switch"
                  aria-checked={specialForm.isSpecial ?? true}
                  onClick={() => setSpecialForm({ ...specialForm, isSpecial: !specialForm.isSpecial })}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                    specialForm.isSpecial ? "bg-blue-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      specialForm.isSpecial ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <span className={cn(
                  "text-xs font-semibold w-6",
                  specialForm.isSpecial ? "text-blue-600" : "text-slate-500"
                )}>
                  {specialForm.isSpecial ? "是" : "否"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setSpecialModalOpen(false)}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveSpecial}>
            确定
          </Button>
        </div>
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}
        title="确认删除"
        width="max-w-[400px]"
      >
        <div className="py-3 space-y-3">
          <p className="text-sm text-slate-600">
            确定要删除 <span className="font-semibold text-slate-800">「{deleteConfirm.name}」</span> 对应的
            {deleteConfirm.type === "regular" ? "常规映射配置" : "特殊科室配置"} 吗？
          </p>
          <p className="text-xs text-red-500">
            删除后不可恢复，请谨慎操作。
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
            取消
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
