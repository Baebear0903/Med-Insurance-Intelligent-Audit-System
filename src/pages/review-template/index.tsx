import React, { useState, useEffect } from "react";
import { Plus, LayoutTemplate, MoreHorizontal, FileText, CheckCircle2, Search, Filter, Trash2, Edit3, Copy, User, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/src/components/ui/Toast";
import { mockApi } from "@/src/lib/mockData";
import type { ReviewTemplate } from "@/src/lib/mockData";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/Badge";

export function ReviewTemplate() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadData = () => {
    const data = mockApi.getTemplates(search, statusFilter, typeFilter);
    setTemplates(data);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const handleSearch = () => {
    loadData();
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    const data = mockApi.getTemplates("", "", "");
    setTemplates(data);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleDeleteClick = (ids: string[]) => {
    setIdsToDelete(ids);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    mockApi.deleteTemplates(idsToDelete);
    toast("删除成功", "success");
    setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));
    setShowDeleteConfirm(false);
    setIdsToDelete([]);
    loadData();
  };

  const handleCopy = (tpl: ReviewTemplate) => {
    const newTpl = { ...tpl, id: "", name: tpl.name + " - 副本" };
    mockApi.saveTemplate(newTpl as any);
    toast("副本创建成功", "success");
    loadData();
  };

  return (
    <div className="p-5 flex flex-col h-full bg-slate-50">
      {/* Header section with Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="请输入模板名称"
              className="w-64 h-9 pl-9 pr-3 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all bg-white text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={cn(
              "w-40 h-9 px-3 rounded border border-slate-300 bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer",
              typeFilter === "" ? "text-slate-400" : "text-slate-700"
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="" className="text-slate-400">全部类型</option>
            <option value="医保审核反馈" className="text-slate-700">医保审核反馈</option>
            <option value="医保明细下发" className="text-slate-700">医保明细下发</option>
            <option value="医保院内扣减" className="text-slate-700">医保院内扣减</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "w-40 h-9 px-3 rounded border border-slate-300 bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer",
              statusFilter === "" ? "text-slate-400" : "text-slate-700"
            )}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
          >
            <option value="" className="text-slate-400">全部状态</option>
            <option value="ENABLED" className="text-slate-700">启用中</option>
            <option value="DISABLED" className="text-slate-700">已禁用</option>
          </select>
          <Button variant="primary" size="sm" onClick={handleSearch}>搜索</Button>
          <Button variant="outline" size="sm" onClick={handleReset}>重置</Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="danger" 
            size="sm" 
            disabled={selectedIds.length === 0}
            onClick={() => handleDeleteClick(selectedIds)}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
          <Link to="/review-template/add-review-template/index">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              新建
            </Button>
          </Link>
        </div>
      </div>

      {/* Template Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start content-start overflow-y-auto">
        {templates.map(tpl => (
          <div 
            key={tpl.id} 
            className={cn(
              "group relative bg-white border-2 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all",
              selectedIds.includes(tpl.id) ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-100"
            )}
          >
            {/* Card Header */}
            <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(tpl.id)}
                  onChange={() => handleToggleSelect(tpl.id)}
                  className="w-3.5 h-3.5 mt-0.5"
                />
                <span>创建时间：{tpl.createTime}</span>
              </div>
              <Badge 
                status={tpl.status === 'ENABLED' ? 'success' : 'default'} 
                variant="soft"
                className="scale-90 transform origin-right"
              >
                {tpl.status === 'ENABLED' ? '启用中' : '已禁用'}
              </Badge>
            </div>

            {/* Card Body */}
            <div className="p-5 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shadow-sm">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{tpl.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded text-slate-600">
                      {tpl.templateType || "医保审核反馈"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-300" />
                      {tpl.creator}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-300" />
                      任务：{tpl.taskCount}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-slate-500 h-10 overflow-hidden line-clamp-2 leading-relaxed">
                {tpl.desc || "暂无描述"}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="bg-white border-t border-slate-50 grid grid-cols-3 divide-x divide-slate-50">
              <button 
                onClick={() => navigate(`/review-template/add-review-template/index?id=${tpl.id}`)}
                className="py-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                title="编辑"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑</span>
              </button>
              <button 
                onClick={() => handleCopy(tpl)}
                className="py-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                title="复制"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制</span>
              </button>
              <button 
                onClick={() => handleDeleteClick([tpl.id])}
                className="py-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="删除"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4 font-bold text-lg">
              <AlertCircle className="w-6 h-6" />
              <h3>确认删除</h3>
            </div>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              确定要删除选中的 {idsToDelete.length} 个模板吗？此操作不可撤销。
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>取消</Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>确定删除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
