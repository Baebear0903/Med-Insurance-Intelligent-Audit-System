import React, { useState, useEffect, useRef } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Plus, Search, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

// Mock Data Type
interface MappingRule {
  id: string;
  sourceName: string;
  targetName: string;
  targetCode: string;
  createTime: string;
}

const TREE_DATA = [
  {
    id: "ALL",
    name: "全院",
    children: [
      {
        id: "TH",
        name: "天河院区",
        children: [
          { id: "TH_001", name: "心血管内科" },
          { id: "TH_002", name: "神经外科" },
          { id: "TH_003", name: "普通外科" },
          { id: "TH_004", name: "骨科" },
        ]
      },
      {
        id: "TD",
        name: "同德院区",
        children: [
          { id: "TD_001", name: "呼吸内科" },
          { id: "TD_002", name: "消化内科" },
          { id: "TD_003", name: "儿科" },
        ]
      },
      {
        id: "ZJ",
        name: "珠玑院区",
        children: [
          { id: "ZJ_001", name: "妇产科" },
          { id: "ZJ_002", name: "急诊科" },
          { id: "ZJ_003", name: "重症医学科(ICU)" },
        ]
      }
    ]
  }
];

const TreeNode = ({ node, level, onSelect, selectedId }: any) => {
  const [expanded, setExpanded] = useState(true);
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div className="w-full text-sm">
      <div 
        className={cn(
          "flex items-center py-1.5 px-2 hover:bg-slate-50 cursor-pointer rounded-md transition-colors",
          selectedId === node.id ? "bg-blue-50 text-blue-600" : "text-slate-700"
        )}
        onClick={() => isLeaf ? onSelect(node) : setExpanded(!expanded)}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {!isLeaf && (
          <span className="mr-1 text-slate-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        {isLeaf && <span className="w-5" />}
        <span className={isLeaf ? "" : "font-medium"}>{node.name}</span>
        {isLeaf && <span className="ml-2 text-slate-400 text-xs text-opacity-80">({node.id})</span>}
      </div>
      {expanded && !isLeaf && (
        <div className="flex flex-col">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
};

export function MappingConfig() {
  const [rules, setRules] = useState<MappingRule[]>([]);
  const [searchKw, setSearchKw] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MappingRule>>({});
  const [showDeptTree, setShowDeptTree] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mapping_rules");
      if (stored) {
        setRules(JSON.parse(stored));
      } else {
        const initData = [
          { id: "1", sourceName: "心内", targetName: "心血管内科", targetCode: "TH_001", createTime: "2024-05-15 10:00:00" },
          { id: "2", sourceName: "神外", targetName: "神经外科", targetCode: "TH_002", createTime: "2024-05-15 10:05:00" },
        ];
        setRules(initData);
        localStorage.setItem("mapping_rules", JSON.stringify(initData));
      }
    } catch (e) {}
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDeptTree(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRules = (newRules: MappingRule[]) => {
    setRules(newRules);
    localStorage.setItem("mapping_rules", JSON.stringify(newRules));
  };

  const handleAdd = () => {
    setFormData({});
    setModalOpen(true);
    setShowDeptTree(false);
  };

  const handleEdit = (rule: MappingRule) => {
    setFormData({ ...rule });
    setModalOpen(true);
    setShowDeptTree(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此映射关系吗？")) {
      saveRules(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.sourceName || !formData.targetName) {
      alert("请填写源科室名称并选择标准科室");
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
    r.sourceName.includes(searchKw) || r.targetName.includes(searchKw) || r.targetCode.includes(searchKw)
  );

  const columns = [
    { key: "index", title: "序号", width: "80px", render: (_: any, idx: number) => idx + 1 },
    { key: "sourceName", title: "医保审核数据科室名称", minWidth: "200px" },
    { key: "targetName", title: "院内标准科室名称", minWidth: "200px" },
    { key: "targetCode", title: "科室编码", minWidth: "150px" },
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
                className="pl-9 w-64 h-9 bg-slate-50/50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                placeholder="搜索科室名称或编码..."
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
        <div className="py-4 space-y-5 flex flex-col min-h-[300px] mb-[12px]">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">医保审核数据科室名称 <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
              placeholder="请输入上传的科室名称，例如：心内" 
              value={formData.sourceName || ""}
              onChange={e => setFormData({ ...formData, sourceName: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-sm font-medium text-slate-700">标准科室名称 <span className="text-red-500">*</span></label>
            <div 
              className={cn(
                "border rounded-md px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors",
                showDeptTree ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"
              )}
              onClick={() => setShowDeptTree(!showDeptTree)}
            >
              <span className={formData.targetName ? "text-slate-900" : "text-slate-400"}>
                {formData.targetName || "请选择院内标准科室"}
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDeptTree && "rotate-180")} />
            </div>
            
            {showDeptTree && (
              <div className="absolute top-[68px] left-0 right-0 max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg z-[200] p-1.5 pointer-events-auto">
                {TREE_DATA.map(node => (
                  <TreeNode 
                    key={node.id} 
                    node={node} 
                    level={0} 
                    selectedId={formData.targetCode}
                    onSelect={(node: any) => {
                       setFormData({ ...formData, targetName: node.name, targetCode: node.id });
                       setShowDeptTree(false);
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-1.5 pb-20">
            <label className="text-sm font-medium text-slate-700 truncate">标准科室编码</label>
            <input 
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none bg-slate-50 text-slate-500 pointer-events-none text-sm"
              placeholder="选择标准科室后自动带出"
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
