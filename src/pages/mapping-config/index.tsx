import React, { useState, useEffect, useRef } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Plus, Search, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

// Mock Data Type
interface MappingRule {
  id: string;
  sourceName: string;
  targetUserId?: string;
  targetUserName?: string;
  targetName: string;
  targetCode: string;
  createTime: string;
}

const MOCK_USERS = [
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
  }
];

export function MappingConfig() {
  const [rules, setRules] = useState<MappingRule[]>([]);
  const [searchKw, setSearchKw] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MappingRule>>({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mapping_rules_v2");
      if (stored) {
        setRules(JSON.parse(stored));
      } else {
        const initData = [
          { id: "1", sourceName: "心内", targetUserId: "U001", targetUserName: "张三", targetName: "心血管内科", targetCode: "TH_001", createTime: "2024-05-15 10:00:00" },
          { id: "2", sourceName: "神外", targetUserId: "U002", targetUserName: "李四", targetName: "神经外科", targetCode: "TH_002", createTime: "2024-05-15 10:05:00" },
        ];
        setRules(initData);
        localStorage.setItem("mapping_rules_v2", JSON.stringify(initData));
      }
    } catch (e) {}
    
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRules = (newRules: MappingRule[]) => {
    setRules(newRules);
    localStorage.setItem("mapping_rules_v2", JSON.stringify(newRules));
  };

  const handleAdd = () => {
    setFormData({});
    setModalOpen(true);
    setShowUserDropdown(false);
    setShowDeptDropdown(false);
  };

  const handleEdit = (rule: MappingRule) => {
    setFormData({ ...rule });
    setModalOpen(true);
    setShowUserDropdown(false);
    setShowDeptDropdown(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此映射关系吗？")) {
      saveRules(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.sourceName || !formData.targetUserId || !formData.targetCode) {
      alert("请填写源科室名称，选择医保秘书并确认所属科室");
      return;
    }
    
    if (formData.id) {
      saveRules(rules.map(r => r.id === formData.id ? { ...r, ...formData } as MappingRule : r));
    } else {
      saveRules([{ 
        ...formData, 
        id: Date.now().toString(),
        createTime: new Date().toLocaleString()
      } as MappingRule, ...rules]);
    }
    setModalOpen(false);
  };

  const filteredRules = rules.filter(r => 
    r.sourceName.includes(searchKw) || 
    r.targetName.includes(searchKw) || 
    r.targetCode.includes(searchKw) ||
    (r.targetUserName && r.targetUserName.includes(searchKw))
  );

  const columns = [
    { key: "index", title: "序号", width: "80px", render: (_: any, idx: number) => idx + 1 },
    { key: "sourceName", title: "医保审核数据科室名称", minWidth: "200px" },
    { key: "targetUserName", title: "医保秘书", minWidth: "120px" },
    { key: "targetName", title: "院内标准科室名称", minWidth: "180px" },
    { key: "targetCode", title: "科室编码", minWidth: "120px" },
    { key: "createTime", title: "创建时间", minWidth: "180px" },
    { 
      key: "action", 
      title: "操作", 
      width: "150px",
      fixed: "right" as const,
      render: (r: MappingRule) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(r)} className="text-blue-600 px-2">
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 transition-colors">
            删除
          </Button>
        </div>
      )
    }
  ];

  const selectedUserObj = MOCK_USERS.find(u => u.id === formData.targetUserId);
  const availableDepts = selectedUserObj ? selectedUserObj.departments : [];

  return (
    <div className="p-6 h-full flex flex-col bg-slate-50">
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Header toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">映射配置</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-9 w-72 h-9 bg-slate-50/50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                placeholder="搜索科室、编码或医保秘书..."
                value={searchKw}
                onChange={e => setSearchKw(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all h-9">
            <Plus className="w-4 h-4 mr-2" />
            新建映射
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden relative">
           <Table columns={columns} data={filteredRules} rowKey={(r: MappingRule) => r.id} emptyText="暂无映射配置" />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={formData.id ? "编辑映射关系" : "新增映射关系"}
        width="max-w-[480px]"
      >
        <div className="py-4 space-y-5 flex flex-col min-h-[350px] mb-[12px]">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">医保审核数据科室名称 <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
              placeholder="请输入上传的科室名称，例如：心内" 
              value={formData.sourceName || ""}
              onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5 relative" ref={userDropdownRef}>
            <label className="text-sm font-medium text-slate-700">选择医保秘书 <span className="text-red-500">*</span></label>
            <div 
              className={cn(
                "border rounded-md px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors bg-white",
                showUserDropdown ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
              )}
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span className={formData.targetUserName ? "text-slate-900" : "text-slate-400"}>
                {formData.targetUserName ? formData.targetUserName : "请选择对应医保秘书"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showUserDropdown && "rotate-180")} />
            </div>
            
            {showUserDropdown && (
              <div className="absolute top-[68px] left-0 right-0 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[200] p-1.5 pointer-events-auto">
                {MOCK_USERS.map(user => (
                  <div
                    key={user.id}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-slate-50 transition-colors",
                      formData.targetUserId === user.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                    )}
                    onClick={() => {
                      const newDept = user.departments.length === 1 ? user.departments[0] : null;
                      setFormData({ 
                        ...formData, 
                        targetUserId: user.id,
                        targetUserName: user.name,
                        targetName: newDept ? newDept.name : "",
                        targetCode: newDept ? newDept.id : ""
                      });
                      setShowUserDropdown(false);
                    }}
                  >
                    {user.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5 relative" ref={deptDropdownRef}>
            <label className="text-sm font-medium text-slate-700">所属科室 <span className="text-red-500">*</span></label>
            <div 
              className={cn(
                "border rounded-md px-3 py-2 text-sm flex justify-between items-center transition-colors",
                !formData.targetUserId ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-70" : "cursor-pointer bg-white",
                showDeptDropdown ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
              )}
              onClick={() => {
                if (formData.targetUserId && availableDepts.length > 1) {
                  setShowDeptDropdown(!showDeptDropdown);
                }
              }}
            >
              <span className={formData.targetName ? "text-slate-900" : "text-slate-400"}>
                {formData.targetName || (availableDepts.length === 0 ? "暂无科室" : "请选择所属科室")}
              </span>
              {availableDepts.length > 1 && (
                 <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDeptDropdown && "rotate-180")} />
              )}
            </div>
            
            {showDeptDropdown && availableDepts.length > 1 && (
              <div className="absolute top-[68px] left-0 right-0 max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[200] p-1.5 pointer-events-auto">
                {availableDepts.map(dept => (
                  <div
                    key={dept.id}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-slate-50 transition-colors",
                      formData.targetCode === dept.id ? "bg-blue-50 text-blue-600 font-medium" : "text-slate-700"
                    )}
                    onClick={() => {
                      setFormData({ 
                        ...formData, 
                        targetName: dept.name,
                        targetCode: dept.id
                      });
                      setShowDeptDropdown(false);
                    }}
                  >
                    {dept.name} <span className="text-slate-400 text-xs ml-1">({dept.id})</span>
                  </div>
                ))}
              </div>
            )}
            
            {formData.targetUserId && availableDepts.length === 1 && (
              <p className="text-xs text-slate-500 mt-1">该医保秘书仅关联一个科室，已自动选择</p>
            )}
          </div>
          
          <div className="space-y-1.5 pb-8">
            <label className="text-sm font-medium text-slate-700 truncate">科室编码</label>
            <input 
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none bg-slate-50 text-slate-500 pointer-events-none text-sm"
              placeholder="选择科室后自动带出"
              value={formData.targetCode || ""}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            确定
          </Button>
        </div>
      </Modal>
    </div>
  );
}
