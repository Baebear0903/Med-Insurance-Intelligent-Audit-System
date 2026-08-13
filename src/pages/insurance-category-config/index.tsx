import React, { useState, useEffect } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Pagination } from "@/src/components/ui/Pagination";
import { Plus, Search } from "lucide-react";
import { InsuranceCategory, getInsuranceCategories, saveInsuranceCategories } from "@/src/lib/insuranceCategoryStore";
import { cn } from "@/src/lib/utils";

export function InsuranceCategoryConfig() {
  const [data, setData] = useState<InsuranceCategory[]>([]);
  const [searchKw, setSearchKw] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsuranceCategory>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setData(getInsuranceCategories());
  }, []);

  const handleSaveData = (newData: InsuranceCategory[]) => {
    setData(newData);
    saveInsuranceCategories(newData);
  };

  const handleAdd = () => {
    setFormData({ enabled: true });
    setModalOpen(true);
  };

  const handleEdit = (item: InsuranceCategory) => {
    setFormData({ ...item });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除此医保业务分类吗？")) {
      handleSaveData(data.filter(r => r.id !== id));
    }
  };

  const handleToggleEnabled = (id: string, currentEnabled: boolean) => {
    handleSaveData(data.map(r => r.id === id ? { ...r, enabled: !currentEnabled } : r));
  };

  const handleSave = () => {
    if (!formData.categoryName || !formData.personnelCategory) {
      alert("请填写必填项");
      return;
    }
    if (formData.categoryName.length > 20) {
      alert("医保业务分类不能超过20个字");
      return;
    }
    if (formData.personnelCategory.length > 20) {
      alert("人员类别不能超过20个字");
      return;
    }
    
    if (formData.id) {
      handleSaveData(data.map(r => r.id === formData.id ? { ...r, ...formData } as InsuranceCategory : r));
    } else {
      handleSaveData([
        { 
          ...formData, 
          id: Date.now().toString(),
          enabled: formData.enabled ?? true,
          onlineOffline: formData.onlineOffline || ""
        } as InsuranceCategory,
        ...data
      ]);
    }
    setModalOpen(false);
  };

    const filteredData = data.filter(r => 
      r.categoryName.includes(searchKw) || 
      r.personnelCategory.includes(searchKw)
    );
    const total = filteredData.length;
    const currentData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
    const columns = [
      { key: "index", title: "序号", width: "80px", render: (_: any, idx: number) => (currentPage - 1) * pageSize + idx + 1 },
      { key: "categoryName", title: "医保业务分类", minWidth: "150px" },
    { key: "personnelCategory", title: "人员类别", minWidth: "150px" },
    { key: "onlineOffline", title: "线上/线下", width: "120px", render: (r: InsuranceCategory) => r.onlineOffline || "-" },
    { 
      key: "enabled", 
      title: "状态", 
      width: "100px", 
      render: (r: InsuranceCategory) => (
        <button
          onClick={() => handleToggleEnabled(r.id, r.enabled)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
            r.enabled ? "bg-blue-600" : "bg-slate-200"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              r.enabled ? "translate-x-[18px]" : "translate-x-0.5"
            )}
          />
        </button>
      )
    },
    { 
      key: "action", 
      title: "操作", 
      width: "150px",
      fixed: "right" as const,
      render: (r: InsuranceCategory) => (
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
            <h2 className="text-lg font-semibold text-slate-800">业务分类配置</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="pl-9 w-72 h-9 bg-slate-50/50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
                placeholder="搜索业务分类或人员类别..."
                value={searchKw}
                onChange={e => { setSearchKw(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all h-9">
            <Plus className="w-4 h-4 mr-2" />
            新增分类
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
             <Table columns={columns} data={currentData} rowKey={(r: InsuranceCategory) => r.id} emptyText="暂无医保业务分类配置" />
          </div>
          {total > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0">
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={formData.id ? "编辑医保业务分类" : "新增医保业务分类"}
        width="max-w-[480px]"
      >
        <div className="py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">医保业务分类 <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
              placeholder="请输入医保业务分类" 
              maxLength={20}
              value={formData.categoryName || ""}
              onChange={e => setFormData({ ...formData, categoryName: e.target.value })}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">人员类别 <span className="text-red-500">*</span></label>
            <input 
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
              placeholder="请输入对应的人员类别" 
              maxLength={20}
              value={formData.personnelCategory || ""}
              onChange={e => setFormData({ ...formData, personnelCategory: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">线上/线下</label>
            <select 
              className="w-full px-3 py-2 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-white"
              value={formData.onlineOffline || ""}
              onChange={e => setFormData({ ...formData, onlineOffline: e.target.value as any })}
            >
              <option value="">请选择</option>
              <option value="线上">线上</option>
              <option value="线下">线下</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-sm font-medium text-slate-700">是否启用</label>
            <button
              onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                formData.enabled ? "bg-blue-600" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            确定
          </Button>
        </div>
      </Modal>
    </div>
  );
}
