import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Download, 
  Upload, 
  Send, 
  Plus, 
  Search, 
  Filter,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users,
  Repeat,
  Bell,
  History,
  Image as ImageIcon,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Table } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { toast } from "@/src/components/ui/Toast";
import { Modal } from "@/src/components/ui/Modal";
import { Drawer } from "@/src/components/ui/Drawer";
import { mockApi, Task, ReviewTemplate, TemplateField } from "@/src/lib/mockData";
import { TASK_STATUS, AUDIT_STATUS, FILL_STATUS, DEPARTMENTS } from "@/src/lib/constants";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

import { useUser } from "@/src/lib/userContext";

// inside FillReportDetail component
export function FillReportDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get("id");
  const { role } = useUser();
  
  const [task, setTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [assignTarget, setAssignTarget] = useState("");
  const [loading, setLoading] = useState(false);

  // Modals
  const [fillModal, setFillModal] = useState<{ show: boolean, record: any | null, isBatch: boolean }>({ show: false, record: null, isBatch: false });
  const [assignModal, setAssignModal] = useState(false);
  const [deptModal, setDeptModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: string, title: string, content: string }>({ show: false, type: "", title: "", content: "" });
  const [historyModal, setHistoryModal] = useState(false);
  const [patient360Modal, setPatient360Modal] = useState<{ show: boolean, record: any | null }>({ show: false, record: null });
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("全部"); // 全部, 已填报, 未填报

  // Form states
  const [fillForm, setFillForm] = useState({
    confirm: "APPEAL", // APPEAL | NO_APPEAL
    opinion: "",
    evidence: [] as string[],
    remark: ""
  });

  const filteredRecords = React.useMemo(() => {
    return records.filter(r => {
      if (filterStatus === "待填报") return r.fillStatus === "UNFILLED";
      if (filterStatus === "填报中") return r.fillStatus === "AI_FILLING";
      if (filterStatus === "已填报") return r.fillStatus === "FILLED" || r.fillStatus === "SUBMITTED";
      return true;
    });
  }, [records, filterStatus]);

  const fetchData = React.useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    try {
      const foundTask = mockApi.getTaskById(taskId);
      
      if (foundTask) {
        setTask(foundTask);
        // Mode: PUBLISH and WITHDRAWN are editable
        setIsReadOnly(!(foundTask.status === "PUBLISH" || foundTask.status === "WITHDRAWN"));
        
        const templates = mockApi.getTemplates();
        const foundTemplate = templates.find(tpl => tpl.id === foundTask.templateId);
        if (foundTemplate) {
          // Robustness: Ensure fields exist
          if (!foundTemplate.fields) foundTemplate.fields = [];
          setTemplate(foundTemplate);
        } else {
          // Fallback if template not found
          console.warn("Template not found for task:", taskId);
          toast("未找到对应填报模板", "error");
        }

        let detailRecords = mockApi.getTaskDetailRecords(taskId);
        
        // Security rule: specific departments can only see their own data
        if (role === "DEP_SURGERY") {
          detailRecords = detailRecords.filter((d: any) => d.data.DEPARTMENT_NAME === "外科");
        } else if (role === "DEP_INTERNAL") {
          detailRecords = detailRecords.filter((d: any) => d.data.DEPARTMENT_NAME === "内科");
        }

        setRecords(detailRecords);
      } else {
        toast("未找到该任务信息", "error");
      }
    } catch (error) {
      console.error("Fetch detail failed:", error);
      toast("加载失败，请重试", "error");
    } finally {
      // Small delay for better UX and to ensure state updates don't batch into nothingness
      setTimeout(() => setLoading(false), 100);
    }
  }, [taskId, role]);

  useEffect(() => {
    fetchData();
    const handleUpdate = () => {
      fetchData();
    };
    window.addEventListener("task_updated", handleUpdate);
    return () => {
      window.removeEventListener("task_updated", handleUpdate);
    };
  }, [fetchData]);

  const handleBack = () => navigate("/task-fill-report/departments/index");

  const handleRowFill = (record: any) => {
    const data = record?.data || {};
    let evidence = [];
    if (data.APPEAL_ATTACHMENT) {
      if (typeof data.APPEAL_ATTACHMENT === 'string') {
        evidence = data.APPEAL_ATTACHMENT.split(", ");
      } else if (Array.isArray(data.APPEAL_ATTACHMENT)) {
        evidence = data.APPEAL_ATTACHMENT;
      }
    }
    setFillForm({
      confirm: data.IS_APPEAL === "否" ? "NO_APPEAL" : (data.IS_APPEAL === "是" ? "APPEAL" : ""),
      opinion: data.APPEAL_REASON || "",
      evidence: evidence,
      remark: data.REMARK || ""
    });
    setFillModal({ show: true, record, isBatch: false });
  };

  const handleBatchFill = () => {
    if (selectedIds.length === 0) {
      toast("请先选择数据", "info");
      return;
    }
    setFillForm({
      confirm: "",
      opinion: "",
      evidence: [],
      remark: ""
    });
    setFillModal({ show: true, record: null, isBatch: true });
  };

  const handleSaveFill = () => {
    if (fillForm.confirm === "APPEAL" && !fillForm.opinion) {
      toast("申诉时，申诉原因必填", "error");
      return;
    }

    const updateRecordData = (record: any) => ({
      ...record,
      data: {
        ...record.data,
        IS_APPEAL: fillForm.confirm === "APPEAL" ? "是" : "否",
        APPEAL_REASON: fillForm.opinion,
        APPEAL_ATTACHMENT: fillForm.evidence.join(", "),
        REMARK: fillForm.remark,
      },
      fillStatus: "SUBMITTED",
      auditStatus: 8,
      submitter: "当前用户"
    });

    if (fillModal.isBatch) {
      selectedIds.forEach(id => {
        const record = records.find(r => r.id === id);
        if (record) {
          mockApi.saveTaskDetailRecord(taskId!, updateRecordData(record));
        }
      });
      toast(`批量填报完成，共 ${selectedIds.length} 条`, "success");
    } else {
      mockApi.saveTaskDetailRecord(taskId!, updateRecordData(fillModal.record));
      toast("填报保存成功", "success");
    }

    setFillModal({ show: false, record: null, isBatch: false });
    setSelectedIds([]);
    fetchData();
  };

  const handleNoAppeal = () => {
    if (selectedIds.length === 0) {
      toast("请先选择数据", "info");
      return;
    }
    setConfirmModal({
      show: true,
      type: "no_appeal",
      title: "确认不申诉",
      content: `确认将选中的 ${selectedIds.length} 条数据标记为“不申诉”吗？`
    });
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast("请先选择数据", "info");
      return;
    }
    setConfirmModal({
      show: true,
      type: "delete",
      title: "确认删除",
      content: `确认删除选中的 ${selectedIds.length} 条明细数据吗？删除后不可恢复。`
    });
  };

  const handleOneClickRemind = () => {
    const unfiledCount = records.filter(r => r.fillStatus === "UNFILLED").length;
    const assignedCount = records.filter(r => r.submitter !== "-").length;
    
    setConfirmModal({
      show: true,
      type: "remind",
      title: "一键催办",
      content: `已转派 ${assignedCount} 条数据，尚有 ${records.length - assignedCount} 条数据未转派，是否一键催办填报人进行【未填报】任务的填报？`
    });
  };

  const executeConfirmAction = () => {
    if (confirmModal.type === "no_appeal") {
      selectedIds.forEach(id => {
        const record = records.find(r => r.id === id);
        if (record) {
          mockApi.saveTaskDetailRecord(taskId!, {
            ...record,
            hospitalConfirm: "NO_APPEAL",
            fillStatus: "SUBMITTED",
            auditStatus: 8,
            submitter: "当前用户"
          });
        }
      });
      toast("操作成功", "success");
    } else if (confirmModal.type === "delete") {
      mockApi.deleteTaskDetailRecords(taskId!, selectedIds);
      toast("删除成功", "success");
    } else if (confirmModal.type === "remind") {
      toast("催办通知已发送", "success");
    }
    
    setConfirmModal({ show: false, type: "", title: "", content: "" });
    setSelectedIds([]);
    fetchData();
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-medium">加载中...</span>
      </div>
    </div>
  );

  if (!task) return (
    <div className="h-full flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">未找到任务</p>
          <p className="text-sm text-slate-500">该任务可能已被删除或ID不正确</p>
        </div>
        <Button onClick={handleBack} variant="outline" className="border-slate-200">返回列表</Button>
      </div>
    </div>
  );

  if (!template) return (
    <div className="h-full flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-800">模板配置异常</p>
          <p className="text-sm text-slate-500">该任务关联的填报模板不存在</p>
        </div>
        <Button onClick={handleBack} variant="outline" className="border-slate-200">返回列表</Button>
      </div>
    </div>
  );

  // Dynamic Columns
  const dynamicCols = template.fields
    .map(f => ({
      key: `data.${f.name}`,
      title: f.comment,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UNFILLED": return <Badge status="default">待填报</Badge>;
      case "AI_FILLING": return <Badge status="info">填报中</Badge>;
      case "SUBMITTED": return <Badge status="warning">待审核</Badge>;
      case "FILLED": return <Badge status="success">已填报</Badge>;
      default: return <Badge status="default">待填报</Badge>;
    }
  };

  const fixedCols = [
    {
      key: "status_col",
      title: "状态",
      fixed: "right" as const,
      fixedOffset: "160px",
      width: "100px",
      render: (r: any) => getStatusBadge(r.fillStatus)
    },
    {
      key: "action",
      title: "操作",
      fixed: "right" as const,
      width: "160px",
      render: (r: any) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={r.fillStatus === "AI_FILLING"}
            onClick={() => handleRowFill(r)}
            className={cn("font-medium px-2", r.fillStatus === "AI_FILLING" ? "text-slate-400" : "text-blue-600")}
          >
            {isReadOnly ? "查看" : "填报"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPatient360Modal({ show: true, record: r })}
            className="text-blue-600 font-medium px-2"
          >
            患者360
          </Button>
        </div>
      )
    }
  ];

  const columns = [
    { key: "index", title: "序号", width: "50px", render: (_:any, index: number) => index + 1 },
    ...dynamicCols,
    ...fixedCols
  ];

  const filledCount = records.filter(r => r.fillStatus === "FILLED" || r.fillStatus === "SUBMITTED").length;
  const totalCount = records.length;
  const progressPercent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-800">{task.name}</h1>
              <Badge status={
                task.status === "COMPLETE" || task.status === "END" ? "success" : 
                task.status === "PUBLISH" ? "info" : 
                task.status === "SUBMITTED" ? "warning" : "default"
              }>
                {TASK_STATUS[task.status]}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">填报进度</span>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-600 font-mono mt-1">
                {filledCount} / {totalCount} {totalCount > 0 ? `(${progressPercent}%)` : ''}
              </span>
            </div>
            {!isReadOnly && (
              <Button onClick={() => toast("提交成功", "success")} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                <Send className="w-4 h-4 mr-2" /> 提交审核
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        {/* Toolbar & Filters */}
        <div className="flex flex-col gap-0 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mr-2">
                <span className="text-blue-600 text-xs font-bold">已选 {selectedIds.length} 项</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)} className={`text-slate-600 ${showFilter ? 'bg-slate-50 ring-2 ring-blue-500/20 border-blue-500' : ''}`}>
                <Filter className="w-4 h-4 mr-1.5" /> 筛选
              </Button>
              {!isReadOnly && (
                <Button variant="primary" size="sm" onClick={handleBatchFill} className="shadow-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> 批量填报
                </Button>
              )}
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
                  {template.fields.filter(f => f.isQueryable).slice(0, 3).map(f => (
                    <div key={f.id} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">{f.comment}</span>
                      <input 
                        type="text" 
                        placeholder={`请输入${f.comment}`}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm w-48 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">填报状态</span>
                    <select 
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm w-36 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="全部">全部</option>
                      <option value="待填报">待填报</option>
                      <option value="填报中">填报中</option>
                      <option value="已填报">已填报</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="primary" size="sm" className="px-5" onClick={() => toast("查询成功", "success")}><Search className="w-4 h-4 mr-1.5"/>查询</Button>
                    <Button variant="outline" size="sm" className="px-5" onClick={() => { setFilterStatus("全部"); toast("重置成功", "success"); }}>重置</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table<any>
              columns={columns}
              data={filteredRecords}
              rowKey={(r) => r.id}
              selectable={!isReadOnly}
              selectedRowKeys={selectedIds}
              onSelectChange={(keys) => setSelectedIds(keys as string[])}
            />
          </div>
        </div>
      </div>

      {/* Fill Drawer */}
      <Drawer
        isOpen={fillModal.show}
        onClose={() => setFillModal({ show: false, record: null, isBatch: false })}
        title={isReadOnly ? "查看详情" : (fillModal.isBatch ? `批量填报 (${selectedIds.length}项)` : "数据填报")}
        width="max-w-[500px]"
        placement="left"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {!fillModal.isBatch && fillModal.record && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">数据摘要</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">住院号</span>
                    <span className="text-slate-700 font-medium truncate" title={fillModal.record.data.HOSPITAL_NO}>{fillModal.record.data.HOSPITAL_NO || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">患者姓名</span>
                    <span className="text-slate-700 font-medium truncate" title={fillModal.record.data.PATIENT_NAME}>{fillModal.record.data.PATIENT_NAME || "-"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">开单科室</span>
                    <span className="text-slate-700 font-medium truncate">-</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">执行科室</span>
                    <span className="text-slate-700 font-medium truncate" title={fillModal.record.data.DEPARTMENT_NAME}>{fillModal.record.data.DEPARTMENT_NAME || "-"}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1 mt-1">
                    <span className="text-slate-400">违规描述</span>
                    <div className="text-slate-700 font-medium text-xs leading-relaxed max-h-40 overflow-y-auto w-full break-words whitespace-pre-wrap">
                      {fillModal.record.data.VIOLATION_DESC || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  是否申诉 <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button 
                    disabled={isReadOnly}
                    onClick={() => setFillForm({...fillForm, confirm: "APPEAL"})}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      fillForm.confirm === "APPEAL" 
                        ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm" 
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold text-sm">申诉</span>
                  </button>
                  <button 
                    disabled={isReadOnly}
                    onClick={() => setFillForm({...fillForm, confirm: "NO_APPEAL"})}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      fillForm.confirm === "NO_APPEAL" 
                        ? "border-slate-600 bg-slate-600 text-white shadow-md" 
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <X className="w-4 h-4" />
                    <span className="font-bold text-sm">不申诉</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">
                  申诉原因 {fillForm.confirm === "APPEAL" && <span className="text-rose-500">*</span>}
                </label>
                <textarea 
                  disabled={isReadOnly}
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none"
                  placeholder={fillForm.confirm === "APPEAL" ? "请详细叙述申诉理由..." : "可选填..."}
                  value={fillForm.opinion}
                  onChange={(e) => setFillForm({...fillForm, opinion: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">申诉附件</label>
                  <span className="text-xs text-slate-400">可多选，单个≤20MB</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {fillForm.evidence.map((img, i) => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-lg relative group overflow-hidden border border-slate-200">
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6 opacity-40" />
                      </div>
                      {!isReadOnly && (
                        <button 
                          onClick={() => setFillForm({...fillForm, evidence: fillForm.evidence.filter((_, idx) => idx !== i)})}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && fillForm.evidence.length < 4 && (
                    <button 
                      onClick={() => setFillForm({...fillForm, evidence: [...fillForm.evidence, `mock_${Date.now()}`]})}
                      className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-[10px] font-medium leading-none">上传</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50 shrink-0">
            <Button variant="ghost" onClick={() => setFillModal({ show: false, record: null, isBatch: false })} className="px-6">取消</Button>
            {!isReadOnly && (
              <Button onClick={handleSaveFill} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8">确定</Button>
            )}
          </div>
        </div>
      </Drawer>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, type: "", title: "", content: "" })}
        title={confirmModal.title}
        width="max-w-[400px]"
      >
        <div className="py-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
              confirmModal.type === "delete" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
            )}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed py-1">
              {confirmModal.content}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmModal({ show: false, type: "", title: "", content: "" })}>取消</Button>
            <Button 
              onClick={executeConfirmAction} 
              className={confirmModal.type === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              继续
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dept Change Modal */}
      <Modal
        isOpen={deptModal}
        onClose={() => setDeptModal(false)}
        title="实际科室变更"
        width="max-w-[450px]"
      >
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs border border-blue-100 flex gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>更改实际科室后，数据将流转至目标科室的专管员进行填报。医保办管理员可直接转派至任意科室，科室专管员仅可申请变更至“医保办”。</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">选择目标科室</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none cursor-pointer">
                <option value="">请选择目标科室</option>
                {Object.entries(DEPARTMENTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" onClick={() => setDeptModal(false)}>取消</Button>
            <Button onClick={() => { 
              toast("变更提交成功", "success"); 
              setDeptModal(false); 
              setSelectedIds([]); 
            }}>确认变更</Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal}
        onClose={() => { setAssignModal(false); setAssignTarget(""); }}
        title="任务转派"
        width="max-w-[450px]"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">选择转派人员</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={assignTarget}
                onChange={(e) => setAssignTarget(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">请选择填报人</option>
                <option value="1">张医生 (内科)</option>
                <option value="2">李医生 (外科)</option>
                <option value="3">王护士 (急诊)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" onClick={() => { setAssignModal(false); setAssignTarget(""); }}>取消</Button>
            <Button onClick={() => { 
              if (!assignTarget) {
                toast("请选择转派人员", "error");
                return;
              }
              toast("转派成功", "success"); 
              setAssignModal(false); 
              setAssignTarget("");
              setSelectedIds([]); 
            }}>确认转派</Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={historyModal}
        onClose={() => setHistoryModal(false)}
        title="填报/审核记录"
        width="max-w-[600px]"
      >
        <div className="py-2 space-y-6 max-h-[500px] overflow-auto pr-2">
          {[1, 2].map((_, i) => (
            <div key={i} className="relative pl-8 border-l-2 border-slate-100 space-y-4 pb-6 last:pb-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{i === 0 ? "填报记录" : "审核记录"}</span>
                  <span className="text-[10px] text-slate-400 font-mono">2024-05-12 10:30:15</span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">结果：</span>
                    <span className={cn("font-bold", i === 0 ? "text-blue-600" : "text-rose-500")}>{i === 0 ? "申诉" : "驳回重填"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-400 shrink-0">意见：</span>
                    <span className="text-slate-700 leading-relaxed">
                      {i === 0 ? "该患者住院期间确实使用了相关耗材，且医嘱记录完整，附件附带了手术报告单，请复核。" : "申诉理由不够充分，手术报告单中的耗材序列号与申报不符，请重新核对后再行提交。"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {i === 0 ? "张" : "王"}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{i === 0 ? "张科员" : "王主任"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setHistoryModal(false)}>关闭</Button>
        </div>
      </Modal>

      {/* Patient 360 Modal */}
      <Modal
        isOpen={patient360Modal.show}
        onClose={() => setPatient360Modal({ show: false, record: null })}
        title="提示"
        width="max-w-[400px]"
      >
        <div className="py-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-blue-50 text-blue-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-slate-600 text-[13px] leading-relaxed py-1">
              即将跳转打开患者全息视图对应就诊记录
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPatient360Modal({ show: false, record: null })}>取消</Button>
            <Button 
              onClick={() => {
                toast("正在为您跳转...", "success");
                setPatient360Modal({ show: false, record: null });
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              确认
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
