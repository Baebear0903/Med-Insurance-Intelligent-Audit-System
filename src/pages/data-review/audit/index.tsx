import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, CheckCircle2, XCircle, Info, Filter } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Table } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { toast } from "@/src/components/ui/Toast";
import { mockApi, Task, ReviewTemplate } from "@/src/lib/mockData";
import { DEPARTMENTS, TASK_STATUS } from "@/src/lib/constants";
import { motion, AnimatePresence } from "motion/react";

export function Audit() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const deptId = searchParams.get("deptId");
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [auditModal, setAuditModal] = useState(false);
  const [auditComment, setAuditComment] = useState("");
  const [filterStatus, setFilterStatus] = useState("全部");
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = React.useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    try {
      const foundTask = mockApi.getTaskById(taskId);
      if (foundTask) {
        setTask(foundTask);
        const templates = mockApi.getTemplates();
        const foundTemplate = templates.find(tpl => tpl.id === foundTask.templateId);
        if (foundTemplate) {
          if (!foundTemplate.fields) foundTemplate.fields = [];
          setTemplate(foundTemplate);
        } else {
          toast("未找到对应填报模板", "error");
        }
        // fetch mock details
        let detailRecords = mockApi.getTaskDetailRecords(taskId);
        
        // Filter by deptId if provided
        if (deptId && deptId !== "all") {
          const deptRef = parseInt(deptId) as keyof typeof DEPARTMENTS;
          const deptName = DEPARTMENTS[deptRef];
          if (deptName) {
             detailRecords = detailRecords.filter(r => r.data.DEPARTMENT_NAME === deptName || r.data.DEPARTMENT_NAME === deptName + "专管员");
          }
        }

        // No flattening needed, we will use r.data[f.name] directly
        setRecords(detailRecords);
      } else {
        toast("未找到该任务信息", "error");
      }
    } catch (error) {
      console.error("Fetch detail failed:", error);
      toast("加载失败，请重试", "error");
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  }, [taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => navigate("/data-review/index");

  const submitAudit = (status: 1 | 2) => {
    if (!selectedIds.length) {
      toast("请选择要审核的数据", "info");
      return;
    }
    // Update local state for mock
    setRecords(prev => prev.map(r => {
      if (selectedIds.includes(r.id)) {
        return { ...r, auditStatus: status }; // 1=Approval, 2=Rejected
      }
      return r;
    }));
    toast(status === 1 ? "已通过审核" : "已驳回审核", status === 1 ? "success" : "error");
    setAuditModal(false);
    setSelectedIds([]);
    setAuditComment("");
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">加载中...</span>
      </div>
    </div>
  );

  if (!task || !template) return (
    <div className="h-full flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center space-y-4">
        <p className="text-lg font-bold text-slate-800">未找到相关数据</p>
        <Button onClick={handleBack} variant="outline">返回列表</Button>
      </div>
    </div>
  );

  const queryFields = template.fields.filter(f => f.isQueryable);
  const dynamicCols = template.fields.map(f => ({
    key: `data.${f.name}`,
    title: f.comment || f.name,
    width: f.length > 100 ? "200px" : "120px",
    render: (r: any) => {
      const val = r.data[f.name];
      if (f.name === "VIOLATION_AMOUNT") return val ? `¥${Number(val).toFixed(2)}` : "-";
      if (f.name === "APPEAL_ATTACHMENT") {
        return val ? <span className="text-blue-600 hover:underline cursor-pointer">{val}</span> : "-";
      }
      return val || "-";
    }
  }));

  const getStatusBadge = (r: any) => {
    if (r.auditStatus === 1) return <Badge status="success">已通过</Badge>;
    if (r.auditStatus === 2) return <Badge status="error">已驳回</Badge>;
    if (r.fillStatus === "AI_FILLING") return <Badge status="info">填报中</Badge>;
    return <Badge status="warning">待审核</Badge>;
  };

  const columns = [
    { key: "index", title: "序号", width: "50px", render: (_: any, idx: number) => idx + 1 },
    ...dynamicCols,
    {
      key: "status_col",
      title: "状态",
      fixed: "right" as const,
      fixedOffset: "100px",
      width: "100px",
      render: (r: any) => getStatusBadge(r)
    },
    { key: "action", title: "操作", fixed: "right" as const, width: "100px", render: (r: any) => (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          setSelectedIds([r.id]);
          setAuditModal(true);
        }}
        className="text-blue-600 font-medium"
      >
        审核
      </Button>
    )}
  ];

  const filteredRecords = records.filter(r => {
    const isUnchecked = r.auditStatus === 0 || r.auditStatus === 7 || r.auditStatus === 8 || !r.auditStatus;
    if (filterStatus === "填报中") return r.fillStatus === "AI_FILLING" && isUnchecked;
    if (filterStatus === "待审核") return r.fillStatus !== "AI_FILLING" && isUnchecked;
    if (filterStatus === "已通过") return r.auditStatus === 1;
    if (filterStatus === "已驳回") return r.auditStatus === 2;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold flex items-center text-slate-800">
            {task.name}
            <Badge status="info" className="ml-3 font-normal">{TASK_STATUS[task.status as keyof typeof TASK_STATUS]}</Badge>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            onClick={() => setAuditModal(true)} 
            disabled={selectedIds.length === 0}
            className={selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
          >
            审核
          </Button>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />返回
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-0 bg-white rounded-xl shadow-sm border border-slate-200 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mr-2">
                <span className="text-blue-600 text-xs font-bold">已选 {selectedIds.length} 项</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">审核状态</span>
              <select 
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded min-w-[120px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="全部">全部</option>
                <option value="待审核">待审核</option>
                <option value="填报中">填报中</option>
                <option value="已通过">已通过</option>
                <option value="已驳回">已驳回</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)} className={`text-slate-600 ${showFilter ? 'bg-slate-50 ring-2 ring-blue-500/20 border-blue-500' : ''}`}>
              <Filter className="w-4 h-4 mr-1.5" /> 筛选
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showFilter && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
                {queryFields.map(f => (
                  <div key={f.id} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">{f.comment || f.name}</span>
                    <input 
                      type="text" 
                      placeholder={`请输入${f.comment || f.name}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm w-48 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
                
                <div className="flex items-center gap-2 ml-auto shrink-0 pl-4 border-l border-slate-200">
                  <Button variant="outline" size="sm" className="px-4" onClick={() => toast("已重置", "success")}>重置</Button>
                  <Button variant="primary" size="sm" className="px-4 bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => toast("查询成功", "success")}><Search className="w-4 h-4 mr-1"/>查询</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Table<any>
          columns={columns}
          data={filteredRecords}
          rowKey={(r) => r.id}
          selectable
          selectedRowKeys={selectedIds}
          onSelectChange={setSelectedIds}
          className="h-full border-0 rounded-none absolute inset-0 pb-12"
        />
      </div>

      <Modal isOpen={auditModal} onClose={() => setAuditModal(false)} title="审核" width="max-w-[500px]">
        <div className="py-4">
          <div className="mb-4 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <span>已选中 <span className="font-bold text-blue-700">{selectedIds.length}</span> 条数据，其中 0 条申诉，{selectedIds.length} 条不申诉</span>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">审核意见 (批量)</label>
            <textarea 
              value={auditComment}
              onChange={(e) => setAuditComment(e.target.value)}
              placeholder="请输入审核意见..."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 hover:bg-white transition-colors"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-2">
            <Button variant="ghost" onClick={() => setAuditModal(false)}>取消</Button>
            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => submitAudit(2)}>
              驳回
            </Button>
            <Button variant="primary" onClick={() => submitAudit(1)}>
              同意
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
