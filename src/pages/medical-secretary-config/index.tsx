import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Pagination } from "@/src/components/ui/Pagination";
import { toast } from "@/src/components/ui/Toast";
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  Trash2,
  Edit3,
  X,
  Info,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  MedicalSecretary,
  MedicalSecretaryDepartment,
  PortalDepartment,
  PORTAL_USERS,
  PORTAL_DEPARTMENTS,
  getMedicalSecretaries,
  saveMedicalSecretaries,
  SECRETARY_CHANGE_EVENT,
} from "@/src/lib/medicalSecretaryStore";

interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  value?: string;
  placeholder?: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  disabled?: boolean;
}

// 医保秘书单选组件（带 Portal 与智能方向检测）
function SearchableUserSelect({
  value,
  placeholder = "请选择...",
  options,
  onChange,
  searchPlaceholder = "搜索...",
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; isUpward: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    isUpward: false,
  });

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    setCoords({
      top: isUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      isUpward,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setKeyword("");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const timer = setTimeout(() => {
      searchInputRef.current?.focus({ preventScroll: true });
    }, 40);

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleResizeOrScroll = () => {
      updateCoords();
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={cn(
          "w-full border rounded-lg px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors bg-white select-none",
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400",
          disabled && "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
        )}
      >
        <span className={selectedOption ? "font-medium text-slate-900 truncate" : "text-slate-400 truncate"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen &&
        coords.width > 0 &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: coords.isUpward ? undefined : coords.top,
              bottom: coords.isUpward ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className="bg-white rounded-lg shadow-2xl border border-slate-200 py-1 flex flex-col max-h-56 outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded outline-none focus:border-blue-500 transition-colors"
                  placeholder={searchPlaceholder}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-44 p-1 divide-y divide-slate-50">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">无匹配用户</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <div
                      key={opt.value}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-blue-50/70 transition-colors flex items-center justify-between",
                        isSelected ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                      )}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                    >
                      <span className="font-medium text-slate-800">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

// 医保秘书分管科室多选下拉组件（带 Portal 与智能方向检测）
interface MultiDepartmentSelectProps {
  value: MedicalSecretaryDepartment[];
  options: PortalDepartment[];
  onChange: (value: MedicalSecretaryDepartment[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

function MultiDepartmentSelect({
  value = [],
  options = [],
  onChange,
  placeholder = "请选择医保秘书分管科室...",
  disabled = false,
}: MultiDepartmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; isUpward: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    isUpward: false,
  });

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const isUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    setCoords({
      top: isUpward ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      isUpward,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setKeyword("");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const timer = setTimeout(() => {
      searchInputRef.current?.focus({ preventScroll: true });
    }, 40);

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popupRef.current &&
        !popupRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleResizeOrScroll = () => {
      updateCoords();
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen]);

  const toggleDept = (dept: PortalDepartment) => {
    const exists = value.some((d) => d.code === dept.code || d.id === dept.id);
    if (exists) {
      onChange(value.filter((d) => d.code !== dept.code && d.id !== dept.id));
    } else {
      onChange([...value, { id: dept.id, code: dept.code, name: dept.name }]);
    }
  };

  const removeTag = (e: React.MouseEvent, deptCode: string) => {
    e.stopPropagation();
    onChange(value.filter((d) => d.code !== deptCode));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = options.filter(
    (d) =>
      d.name.toLowerCase().includes(keyword.toLowerCase()) ||
      d.code.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={cn(
          "w-full border rounded-lg px-2.5 py-1.5 min-h-[40px] text-sm cursor-pointer flex justify-between items-center transition-colors bg-white select-none gap-2",
          isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400",
          disabled && "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
        )}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1 overflow-hidden">
          {value.length === 0 ? (
            <span className="text-slate-400 px-1">{placeholder}</span>
          ) : (
            value.map((dept) => (
              <span
                key={dept.code}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                <span>{dept.name}</span>
                <span
                  onClick={(e) => removeTag(e, dept.code)}
                  className="hover:bg-blue-100 rounded-full p-0.5 cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3 text-blue-600" />
                </span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {value.length > 0 && (
            <span
              onClick={clearAll}
              title="清空已选项"
              className="hover:text-slate-600 hover:bg-slate-100 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
          />
        </div>
      </div>

      {isOpen &&
        coords.width > 0 &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: coords.isUpward ? undefined : coords.top,
              bottom: coords.isUpward ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className="bg-white rounded-lg shadow-2xl border border-slate-200 py-1.5 flex flex-col max-h-64 outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-white border border-slate-200 rounded outline-none focus:border-blue-500 transition-colors"
                  placeholder="搜索科室名称、编码..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                已选 <span className="font-semibold text-blue-600 font-mono">{value.length}</span> 个
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-48 p-1 divide-y divide-slate-50">
              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">无匹配科室</div>
              ) : (
                filteredOptions.map((dept) => {
                  const isChecked = value.some(
                    (d) => d.code === dept.code || d.id === dept.id
                  );
                  return (
                    <div
                      key={dept.code}
                      onClick={() => toggleDept(dept)}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-blue-50/70 transition-colors flex items-center justify-between select-none",
                        isChecked ? "bg-blue-50/80 text-blue-700 font-medium" : "text-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                        />
                        <span>{dept.name}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {dept.code}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer quick action bar */}
            <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
              <span className="text-slate-500">
                共 {options.length} 个可选科室
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange(options.map((d) => ({ id: d.id, code: d.code, name: d.name })))}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  全选
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-slate-500 hover:text-slate-700"
                >
                  清空
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export function MedicalSecretaryConfig() {
  const [data, setData] = useState<MedicalSecretary[]>([]);
  const [searchKw, setSearchKw] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicalSecretary>>({
    departments: [],
  });

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    item: MedicalSecretary | null;
  }>({
    open: false,
    item: null,
  });

  // Load initial data and listen for cross-tab or custom events
  useEffect(() => {
    setData(getMedicalSecretaries());

    const handleSecretaryUpdate = () => {
      setData(getMedicalSecretaries());
    };

    window.addEventListener(SECRETARY_CHANGE_EVENT, handleSecretaryUpdate);

    return () => {
      window.removeEventListener(SECRETARY_CHANGE_EVENT, handleSecretaryUpdate);
    };
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      id: "",
      userId: "",
      userName: "",
      employeeNo: "",
      departments: [],
      sourceSystem: "医院统一门户系统",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: MedicalSecretary) => {
    setFormData({
      id: item.id,
      userId: item.userId,
      userName: item.userName,
      employeeNo: item.employeeNo,
      departments: [...item.departments],
      sourceSystem: item.sourceSystem || "医院统一门户系统",
      createTime: item.createTime,
    });
    setModalOpen(true);
  };

  // 选中某医保秘书用户时的联动处理：若用户已在系统中配置过，自动带出历史维护内容，支持编辑
  const handleSelectSecretaryUser = (selectedUserId: string) => {
    const existingConfig = data.find((item) => item.userId === selectedUserId);
    if (existingConfig) {
      setFormData({
        id: existingConfig.id,
        userId: existingConfig.userId,
        userName: existingConfig.userName,
        employeeNo: existingConfig.employeeNo,
        departments: [...existingConfig.departments],
        sourceSystem: existingConfig.sourceSystem || "医院统一门户系统",
        createTime: existingConfig.createTime,
      });
      toast(`已自动带出【${existingConfig.userName}】的历史分管科室配置`, "info");
    } else {
      const user = PORTAL_USERS.find((u) => u.id === selectedUserId);
      if (user) {
        setFormData({
          id: "",
          userId: user.id,
          userName: user.name,
          employeeNo: user.employeeNo, // 自动带出工号
          departments: [],
          sourceSystem: "医院统一门户系统",
        });
      }
    }
  };

  const handleSave = () => {
    if (!formData.userId || !formData.userName) {
      toast("请选择医保秘书", "error");
      return;
    }
    if (!formData.departments || formData.departments.length === 0) {
      toast("请选择医保秘书分管科室", "error");
      return;
    }

    const nowStr = new Date().toLocaleString("zh-CN", { hour12: false });

    // 检查是否存在相同医保秘书记录 (按 userId 判断)
    const existingIndex = data.findIndex(
      (item) => item.id === formData.id || item.userId === formData.userId
    );

    if (existingIndex > -1) {
      // 更新已有记录
      const updated = data.map((item, idx) =>
        idx === existingIndex
          ? ({
              ...item,
              userId: formData.userId!,
              userName: formData.userName!,
              employeeNo: formData.employeeNo || "",
              departments: [...(formData.departments || [])],
              sourceSystem: formData.sourceSystem || "医院统一门户系统",
              updateTime: nowStr,
            } as MedicalSecretary)
          : item
      );
      setData(updated);
      saveMedicalSecretaries(updated);
      toast(`医保秘书【${formData.userName}】分管科室配置已保存`, "success");
    } else {
      // 新增记录
      const newSecretary: MedicalSecretary = {
        id: "SEC_" + Date.now(),
        userId: formData.userId!,
        userName: formData.userName!,
        employeeNo: formData.employeeNo || "",
        departments: [...(formData.departments || [])],
        sourceSystem: "医院统一门户系统",
        createTime: nowStr,
        updateTime: nowStr,
      };
      const updated = [newSecretary, ...data];
      setData(updated);
      saveMedicalSecretaries(updated);
      toast("医保秘书配置新增成功", "success");
    }

    setModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm.item) return;
    const targetId = deleteConfirm.item.id;
    const targetName = deleteConfirm.item.userName;
    const updated = data.filter((item) => item.id !== targetId);
    setData(updated);
    saveMedicalSecretaries(updated);
    toast(`已删除医保秘书【${targetName}】配置`, "info");
    setDeleteConfirm({ open: false, item: null });
  };

  // Table Data Filtering
  const filteredData = data.filter((item) => {
    const matchKw =
      item.userName.toLowerCase().includes(searchKw.toLowerCase()) ||
      item.employeeNo.toLowerCase().includes(searchKw.toLowerCase()) ||
      item.departments.some(
        (d) =>
          d.name.toLowerCase().includes(searchKw.toLowerCase()) ||
          d.code.toLowerCase().includes(searchKw.toLowerCase())
      );

    const matchDept =
      deptFilter === "all" ||
      item.departments.some((d) => d.name === deptFilter || d.code === deptFilter);

    return matchKw && matchDept;
  });

  const total = filteredData.length;
  const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Available unique department names for filter (gathered from configured secretaries)
  const uniqueDeptNames = Array.from(
    new Set(data.flatMap((sec) => sec.departments.map((d) => d.name)))
  );

  // Table Columns
  const columns = [
    {
      key: "index",
      title: "序号",
      width: "70px",
      render: (_: any, idx: number) => (
        <span className="text-slate-500 font-mono text-xs">
          {(currentPage - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      key: "userName",
      title: "医保秘书",
      minWidth: "130px",
      render: (r: MedicalSecretary) => (
        <span className="font-medium text-slate-800 text-sm">{r.userName}</span>
      ),
    },
    {
      key: "employeeNo",
      title: "工号",
      minWidth: "120px",
      render: (r: MedicalSecretary) => (
        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono font-medium">
          {r.employeeNo || "-"}
        </span>
      ),
    },
    {
      key: "departments",
      title: "医保秘书分管科室",
      minWidth: "240px",
      render: (r: MedicalSecretary) => (
        <div className="flex flex-wrap gap-1.5 py-1">
          {r.departments && r.departments.length > 0 ? (
            r.departments.map((d) => (
              <span
                key={d.code}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                {d.name}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">未分管科室</span>
          )}
        </div>
      ),
    },
    {
      key: "deptCode",
      title: "科室编码",
      minWidth: "160px",
      render: (r: MedicalSecretary) => (
        <div className="flex flex-wrap gap-1 py-1">
          {r.departments && r.departments.length > 0 ? (
            r.departments.map((d) => (
              <span
                key={d.code}
                className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono"
              >
                {d.code}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          )}
        </div>
      ),
    },
    {
      key: "updateTime",
      title: "最后更新时间",
      minWidth: "160px",
      render: (r: MedicalSecretary) => (
        <span className="text-slate-400 text-xs">{r.updateTime || r.createTime}</span>
      ),
    },
    {
      key: "action",
      title: "操作",
      width: "140px",
      fixed: "right" as const,
      render: (r: MedicalSecretary) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(r)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2.5"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm({ open: true, item: r })}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5 w-full h-full flex flex-col overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full min-h-full flex flex-col flex-1">
        
        {/* Page Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">医保秘书配置</h2>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all h-9"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              新增医保秘书
            </Button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                placeholder="搜索医保秘书姓名、工号、分管科室、编码..."
                value={searchKw}
                onChange={(e) => {
                  setSearchKw(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Department Filter */}
            <div className="w-52 shrink-0">
              <select
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">全部分管科室</option>
                {uniqueDeptNames.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden relative px-6 py-4 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <Table
              columns={columns}
              data={currentData}
              rowKey={(r: MedicalSecretary) => r.id}
              emptyText="暂无医保秘书配置记录"
            />
          </div>

          {total > 0 && (
            <div className="pt-4 border-t border-slate-100 bg-white shrink-0">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      </div>

      {/* --- Add / Edit Modal --- */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={formData.id ? "编辑医保秘书配置" : "新增医保秘书配置"}
        width="max-w-[520px]"
        bodyClassName="overflow-visible"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              保存配置
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-slate-700">
          {/* 3. 提示语 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-500 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            <span>如果无法查询某医保秘书，请联系管理员先给该用户账号分配「医保秘书」角色。</span>
          </div>

          {/* 1. 医保秘书 (下拉单选，可选门户的所有用户；选中已配置用户自动带出历史维护内容) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              医保秘书 <span className="text-red-500">*</span>
            </label>
            <SearchableUserSelect
              value={formData.userId}
              placeholder="请选择医保秘书..."
              searchPlaceholder="搜索医保秘书..."
              options={PORTAL_USERS.map((u) => ({ value: u.id, label: u.name }))}
              onChange={handleSelectSecretaryUser}
            />
          </div>

          {/* 2. 工号 (自动带出) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">工号</label>
            <input
              id="secretary-employee-no-input"
              readOnly
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm font-mono cursor-not-allowed select-none"
              placeholder="自动带出"
              value={formData.employeeNo || ""}
            />
          </div>

          {/* 3. 医保秘书分管科室 (下拉多选) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                医保秘书分管科室 <span className="text-red-500">*</span>
              </label>
              {formData.departments && formData.departments.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">
                  已选 {formData.departments.length} 个科室
                </span>
              )}
            </div>
            <MultiDepartmentSelect
              value={formData.departments || []}
              options={PORTAL_DEPARTMENTS}
              placeholder="请选择医保秘书分管科室（支持多选）..."
              onChange={(depts) => {
                setFormData({
                  ...formData,
                  departments: depts,
                });
              }}
            />
          </div>

          {/* 4. 科室编码 (自动带出) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">科室编码</label>
            <div className="min-h-[40px] px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-mono flex flex-wrap gap-1.5 items-center select-none">
              {formData.departments && formData.departments.length > 0 ? (
                formData.departments.map((d) => (
                  <span
                    key={d.code}
                    className="inline-flex items-center px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 font-medium"
                  >
                    {d.name} ({d.code})
                  </span>
                ))
              ) : (
                <span className="text-slate-400">选择分管科室后自动带出</span>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, item: null })}
        title="确认删除医保秘书配置"
        width="max-w-[420px]"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm({ open: false, item: null })}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              确认删除
            </Button>
          </div>
        }
      >
        <div className="py-2 text-sm text-slate-600 space-y-3">
          <p>
            确定要删除医保秘书 <strong className="text-slate-800">{deleteConfirm.item?.userName}</strong> 的配置记录吗？
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-md border border-amber-200">
            提示：删除后，“科室映射配置”中选中该医保秘书时将不再包含其分管的科室选项。
          </p>
        </div>
      </Modal>
    </div>
  );
}
