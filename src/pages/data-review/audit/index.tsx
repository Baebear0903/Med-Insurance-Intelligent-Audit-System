import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, CheckCircle2, Info, Filter, Settings, FileText, X, Image as ImageIcon, Upload, ChevronDown, Sparkles, AlertCircle } from "lucide-react";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { AiBasisDrawer } from "@/src/components/AiBasisDrawer";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Table } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Select } from "@/src/components/ui/Select";
import { Drawer } from "@/src/components/ui/Drawer";
import { Modal } from "@/src/components/ui/Modal";
import { toast } from "@/src/components/ui/Toast";
import { mockApi, Task, ReviewTemplate } from "@/src/lib/mockData";
import { DEPARTMENTS, TASK_STATUS } from "@/src/lib/constants";
import { useUser } from "@/src/lib/userContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

export function Audit() {
  const { role } = useUser();
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [configurableColumns, setConfigurableColumns] = useState<ColumnItem[]>([]);

  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const deptId = searchParams.get("deptId");
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [subTask, setSubTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Active review record for modal
  const [activeRecord, setActiveRecord] = useState<any | null>(null);

  // Modal states
  const [auditModal, setAuditModal] = useState(false);
  const [isAiResultOpen, setIsAiResultOpen] = useState(false);
  const [aiBasisModal, setAiBasisModal] = useState<{ show: boolean, record: any | null }>({ show: false, record: null });
  const [batchAuditModal, setBatchAuditModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectOpinion, setRejectOpinion] = useState("");
  const [auditForm, setAuditForm] = useState<{
    confirm: "APPEAL" | "NO_APPEAL" | "";
    opinion: string;
    evidence: string[];
    remark: string;
  }>({
    confirm: "",
    opinion: "",
    evidence: [],
    remark: ""
  });

  const [filterStatus, setFilterStatus] = useState("全部");
  const [showFilter, setShowFilter] = useState(false);
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const [appliedSearch, setAppliedSearch] = useState<Record<string, string>>({});
  const [batchAuditOpinion, setBatchAuditOpinion] = useState("");

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
        let detailRecords = mockApi.getTaskDetailRecords(taskId, false);
        
        // Filter by deptId if provided
        if (deptId && deptId !== "all") {
          const deptRef = parseInt(deptId) as keyof typeof DEPARTMENTS;
          const deptName = DEPARTMENTS[deptRef];
          if (deptName) {
             detailRecords = detailRecords.filter(r => r.data.DISPATCH_DEPT === deptName || r.data.DISPATCH_DEPT === deptName + "专管员");
             const allTasks = mockApi.getTasks(1, 1000).data;
             const foundSubTask = allTasks.find(t => t.parentId === taskId && t.departmentId === deptRef);
             if (foundSubTask) {
               setSubTask(foundSubTask);
             }
          }
        }

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
  }, [taskId, deptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (template && template.fields) {
      const items = template.fields
        .filter(f => f.isShow !== false && (role === "ADMIN" || !f.adminVisible))
        .map(f => ({
          key: `data.${f.name}`,
          title: f.displayName || f.comment || f.name,
          visible: true
        }));
      setConfigurableColumns(items);
    }
  }, [template, role]);

  const handleBack = () => navigate("/data-review/index");

  const handlePreviewFile = (fileName: string) => {
    const content = `=========================================
【国家医保自查与合规审核系统 - 演示附件电子凭证】
=========================================

文件名: ${fileName}
文件大小: 1.2 MB
预览状态: 加载成功 (沙箱演示模式)
归属患者: ${activeRecord?.data?.PATIENT_NAME || "张三"}
住院号/登记号: ${activeRecord?.data?.HOSPITAL_NO || "ZY1002"}
经办/病区: ${activeRecord?.data?.DISPATCH_DEPT || "专管科室"}
对应项目: ${activeRecord?.data?.PROJECT_NAME || "关联诊疗项目"}
涉及违规金额: ¥${activeRecord?.data?.VIOLATION_AMOUNT ? Number(activeRecord?.data?.VIOLATION_AMOUNT).toFixed(2) : "0.00"}

-----------------------------------------
【申诉补充佐证材料摘要】
-----------------------------------------
该报告/申诉件已加载到临时沙箱，文件底层编码无损。
此文档作为对医保检查结果的正式申诉说明凭证。

此文件可用于配合完成本次【${task?.name || "医保数据排查"}】的审核流转。 

[医保智能平台] 技术支持
=========================================`;
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const checkAndCompleteTaskStatus = (tId: string, dId?: string | null) => {
    let tasksList = JSON.parse(localStorage.getItem("tasks_v24") || "null") as Task[];
    if (!tasksList) return;
    
    const deptRef = dId && dId !== "all" ? parseInt(dId) : null;
    const deptName = deptRef ? DEPARTMENTS[deptRef as keyof typeof DEPARTMENTS] : null;
    
    const subtask = deptRef ? tasksList.find(t => t.parentId === tId && t.departmentId === deptRef) : null;
    
    // Fetch all detail records under the parent task from database
    const allDetails = mockApi.getTaskDetailRecords(tId, false);
    
    // Check subtask
    if (subtask && deptName) {
      const subtaskDetails = allDetails.filter(r => r.data.DISPATCH_DEPT === deptName || r.data.DISPATCH_DEPT === deptName + "专管员");
      const subtaskAllAudited = subtaskDetails.every(r => r.auditStatus === 1 || r.auditStatus === 9);
      if (subtaskAllAudited && subtaskDetails.length > 0) {
        const idx = tasksList.findIndex(t => t.id === subtask.id);
        if (idx > -1) {
          tasksList[idx].status = "COMPLETE";
          tasksList[idx].updateTime = new Date().toLocaleString();
        }
      }
    }
    
    // Check parent task
    const allAudited = allDetails.every(r => r.auditStatus === 1 || r.auditStatus === 9);
    if (allAudited && allDetails.length > 0) {
      const parentIdx = tasksList.findIndex(t => t.id === tId);
      if (parentIdx > -1) {
        tasksList[parentIdx].status = "COMPLETE";
        tasksList[parentIdx].updateTime = new Date().toLocaleString();
      }
      
      // Also update any sibling subtasks belonging to this parent
      tasksList.forEach((t, i) => {
        if (t.parentId === tId) {
          tasksList[i].status = "COMPLETE";
          tasksList[i].updateTime = new Date().toLocaleString();
        }
      });
    }
    
    localStorage.setItem("tasks_v24", JSON.stringify(tasksList));
  };

  const handleConfirmAudit = () => {
    if (!activeRecord) return;
    
    // Check if same or changed
    const origConfirm = activeRecord.data.IS_APPEAL === "否" ? "NO_APPEAL" : (activeRecord.data.IS_APPEAL === "是" ? "APPEAL" : "");
    const origOpinion = activeRecord.data.APPEAL_REASON || "";
    const origEvidence = Array.isArray(activeRecord.evidence) 
      ? activeRecord.evidence 
      : (activeRecord.data.APPEAL_ATTACHMENT ? activeRecord.data.APPEAL_ATTACHMENT.split(", ") : []);
    const origRemark = activeRecord.data.APPEAL_REMARK || "";
      
    const isSame = 
      origConfirm === auditForm.confirm &&
      origOpinion === auditForm.opinion &&
      origRemark === auditForm.remark &&
      origEvidence.length === auditForm.evidence.length &&
      origEvidence.every((val, i) => val === auditForm.evidence[i]);
      
    let newFillStatus = "APPROVED"; // 审核通过
    let newAuditStatus = 1; // 审批通过
    
    const updatedRecord = {
      ...activeRecord,
      fillStatus: newFillStatus,
      auditStatus: newAuditStatus,
      evidence: auditForm.evidence,
      data: {
        ...activeRecord.data,
        IS_APPEAL: auditForm.confirm === "APPEAL" ? "申诉" : (auditForm.confirm === "NO_APPEAL" ? "不申诉" : ""),
        APPEAL_REASON: auditForm.opinion,
        APPEAL_REMARK: auditForm.remark,
        APPEAL_ATTACHMENT: auditForm.evidence.join(", ")
      }
    };
    
    // Save to mock database
    mockApi.saveTaskDetailRecord(taskId!, updatedRecord);
    
    toast(
      isSame 
        ? `审核完成！内容未修改，已标记为“审核通过”` 
        : `审核完成！由于内容已被修改，已标记为“已驳回”`, 
      "success"
    );
    
    // Trigger task_updated event to notify other screens
    window.dispatchEvent(new Event("task_updated"));
    
    // Close modal & reload lists
    setAuditModal(false);
    fetchData(); // reload records
    
    // Sync completion status of tasks
    checkAndCompleteTaskStatus(taskId!, deptId);
  };

  const handleConfirmChange = (val: "APPEAL" | "NO_APPEAL") => {
    if (val === "NO_APPEAL") {
      setAuditForm({
        confirm: "NO_APPEAL",
        opinion: "",
        evidence: []
      });
    } else {
      setAuditForm(prev => ({
        ...prev,
        confirm: "APPEAL"
      }));
    }
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

  const queryFields = template.fields.filter(f => f.isQueryable && (role === "ADMIN" || !f.adminVisible));
  const dynamicCols = template.fields.filter(f => f.isShow !== false && (role === "ADMIN" || !f.adminVisible)).map(f => ({
    key: `data.${f.name}`,
    title: f.displayName || f.comment || f.name,
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
    if (r.auditStatus === 1) return <Badge status="success">审核通过</Badge>;
    if (r.auditStatus === 9) return <Badge status="warning">审核变更</Badge>;
    if (r.auditStatus === 2) return <Badge status="error">已驳回</Badge>;
    if (r.auditStatus === 7) return <Badge status="info">填报中</Badge>;
    if (r.auditStatus === 8) return <Badge status="warning">待审核</Badge>;
    return <Badge status="default">待审核</Badge>;
  };

  const isDeductionTask = task?.templateId === "TPL_DED";

  const computedColumns = template ? [
    { key: "index", title: "序号", width: "50px", render: (_: any, idx: number) => idx + 1 },
    ...configurableColumns
      .filter(item => item.visible)
      .map(item => dynamicCols.find(d => d.key === item.key)!)
      .filter(Boolean),
    ...(!isDeductionTask ? [{
      key: "status_col",
      title: "审核状态",
      fixed: "right" as const,
      fixedOffset: "140px",
      width: "120px",
      render: (r: any) => getStatusBadge(r)
    },
    { key: "action", title: "操作", fixed: "right" as const, width: "140px", render: (r: any) => (
      <div className="flex gap-1 items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setActiveRecord(r);
            setIsAiResultOpen(false);
            setAuditForm({
              confirm: (r.data.IS_APPEAL === "不申诉" || r.data.IS_APPEAL === "否") ? "NO_APPEAL" : ((r.data.IS_APPEAL === "申诉" || r.data.IS_APPEAL === "是") ? "APPEAL" : ""),
              opinion: r.data.APPEAL_REASON || "",
              evidence: (r.data.IS_APPEAL === "申诉" || r.data.IS_APPEAL === "是") ? (Array.isArray(r.evidence) ? [...r.evidence] : (r.data.APPEAL_ATTACHMENT ? r.data.APPEAL_ATTACHMENT.split(", ") : [])) : [],
              remark: r.data.APPEAL_REMARK || ""
            });
            setAuditModal(true);
          }}
          className="text-blue-600 font-medium px-2"
        >
          审核
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={r.fillStatus === 3 || r.auditStatus === 2}
          onClick={() => {
            setActiveRecord(r);
            setRejectOpinion("");
            setRejectModal(true);
          }}
          className="text-red-500 hover:text-red-700 font-medium px-2"
        >
          驳回
        </Button>
      </div>
    )}] : [])
  ] : [];

  const filteredRecords = records.filter(r => {
    if (filterStatus === "填报中" && r.auditStatus !== 7) return false;
    if (filterStatus === "待审核" && r.auditStatus !== 8) return false;
    if (filterStatus === "已驳回" && r.auditStatus !== 2) return false;
    if (filterStatus === "审核通过" && r.auditStatus !== 1) return false;
    if (filterStatus === "审核变更" && r.auditStatus !== 9) return false;

    return Object.entries(appliedSearch).every(([key, val]) => {
      if (!val) return true;
      const strVal = String(val).trim();
      const rawVal = r.data?.[key] !== undefined ? String(r.data[key]).trim() : (r[key] !== undefined ? String(r[key]).trim() : "");
      if (key === "IS_APPEAL" || key.includes("APPEAL") || key.includes("申诉")) {
        if (strVal === "空白") {
          return !rawVal || rawVal === "-" || rawVal === "未填报";
        }
        return rawVal === strVal;
      }
      return rawVal.toLowerCase().includes(strVal.toLowerCase());
    });
  });

  const handleBulkAuditClick = () => {
    if (selectedIds.length > 0) {
      const hasFinalState = records.filter(r => selectedIds.includes(r.id)).some(r => r.auditStatus === 1 || r.auditStatus === 9 || r.auditStatus === 2);
      if (hasFinalState) {
        toast("部分记录不可批量审核，请重新选择", "error");
        return;
      }
      setBatchAuditOpinion("");
      setBatchAuditModal(true);
    }
  };

  const handleConfirmReject = () => {
    if (!activeRecord || !taskId) {
      return;
    }
    const updatedRecord = {
      ...activeRecord,
      fillStatus: 3,
      auditStatus: 2, // 已驳回
      reviewOpinion: rejectOpinion,
    };
    mockApi.saveTaskDetailRecord(taskId, updatedRecord);
    
    // Find subtask matching the department and set its status to WITHDRAWN
    const allTasks = mockApi.getTasks(1, 1000).data;
    const subtask = allTasks.find(t => t.parentId === taskId && DEPARTMENTS[t.departmentId as keyof typeof DEPARTMENTS] === activeRecord.data.DISPATCH_DEPT);
    if (subtask) {
      mockApi.updateTaskStatus(subtask.id, "WITHDRAWN");
    }

    setRecords(records.map(r => r.id === activeRecord.id ? updatedRecord : r));
    toast("已驳回该明细", "success");
    setRejectModal(false);
    setActiveRecord(null);
    setRejectOpinion("");
  };

  const handleConfirmBatchReject = () => {
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
      const rec = records.find(r => r.id === id);
      if (rec) {
        const updatedRecord = {
          ...rec,
          fillStatus: 3,
          auditStatus: 2, // 已驳回
          reviewOpinion: batchAuditOpinion,
        };
        mockApi.saveTaskDetailRecord(taskId!, updatedRecord);
      }
    });

    toast(`已批量驳回已选的 ${selectedIds.length} 项数据审核！`, "success");
    
    window.dispatchEvent(new Event("task_updated"));
    setBatchAuditModal(false);
    setSelectedIds([]);
    setBatchAuditOpinion("");
    fetchData(); 
    checkAndCompleteTaskStatus(taskId!, deptId);
  };

  const handleConfirmBatchApprove = () => {
    if (selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
      const rec = records.find(r => r.id === id);
      if (rec) {
        const updatedRecord = {
          ...rec,
          fillStatus: 2,
          auditStatus: 1, // 审批通过
        };
        mockApi.saveTaskDetailRecord(taskId!, updatedRecord);
      }
    });

    toast(`已批量通过已选的 ${selectedIds.length} 项数据审核！`, "success");
    
    window.dispatchEvent(new Event("task_updated"));
    setBatchAuditModal(false);
    setSelectedIds([]);
    setBatchAuditOpinion("");
    fetchData(); 
    checkAndCompleteTaskStatus(taskId!, deptId);
  };

  const renderTopStatusBadge = () => {
    const targetStatus = subTask ? subTask.status : task.status;
    const badgeStatus = ['END', 'COMPLETE'].includes(targetStatus) ? "success" : 
                        targetStatus === "SUBMITTED" ? "info" : 
                        targetStatus === "WITHDRAWN" ? "error" : 
                        ['CANCELLATION', 'BACK'].includes(targetStatus) ? "warning" : "default";
    const label = TASK_STATUS[targetStatus as keyof typeof TASK_STATUS] || "填报中";
    
    return <Badge status={badgeStatus} className="ml-3 font-normal">{label}</Badge>;
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold flex items-center text-slate-800">
            {task.name}
            {renderTopStatusBadge()}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {!isDeductionTask && role === "ADMIN" && (
            <Button 
              variant="primary" 
              onClick={handleBulkAuditClick} 
              disabled={selectedIds.length === 0}
              className={selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
            >
              批量审核
            </Button>
          )}
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />返回
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-0 bg-white rounded-xl shadow-sm border border-slate-200 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            {!isDeductionTask && (
              <>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 mr-2">
                    <span className="text-blue-600 text-xs font-bold">已选 {selectedIds.length} 项</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">审核状态</span>
                  <Select
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(val as string)}
                    placeholder="全部"
                    options={[
                      { label: "全部", value: "全部" },
                      { label: "填报中", value: "填报中" },
                      { label: "待审核", value: "待审核" },
                      { label: "已驳回", value: "已驳回" },
                      { label: "审核通过", value: "审核通过" },
                      { label: "审核变更", value: "审核变更" }
                    ]}
                    className="w-36"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilter(!showFilter)} className={`text-slate-600 ${showFilter ? 'bg-slate-50 ring-2 ring-blue-500/20 border-blue-500' : ''}`}>
              <Filter className="w-4 h-4 mr-1.5" /> 筛选
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsColumnSettingsOpen(true)} className="text-slate-500 shadow-sm border-slate-200 hover:bg-slate-50 h-8 w-8 p-0 flex items-center justify-center rounded" title="列表设置">
              <Settings className="w-4 h-4" />
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
                {queryFields.map(f => {
                  const isAppeal = 
                    f.name === "IS_APPEAL" || 
                    f.mappedStandardField === "IS_APPEAL" || 
                    (f.comment && f.comment.includes("申诉")) || 
                    (f.displayName && f.displayName.includes("申诉"));

                  return (
                    <div key={f.id} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{f.displayName || f.comment || f.name}</span>
                      {isAppeal ? (
                        <div className="w-36">
                          <Select
                            size="sm"
                            value={searchValues[f.name] || ""}
                            onChange={(val) => setSearchValues(prev => ({ ...prev, [f.name]: String(val || "") }))}
                            options={[
                              { label: "全部", value: "" },
                              { label: "申诉", value: "申诉" },
                              { label: "不申诉", value: "不申诉" },
                              { label: "空白", value: "空白" }
                            ]}
                            placeholder="请选择"
                          />
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder={`请输入${f.displayName || f.comment || f.name}`}
                          value={searchValues[f.name] || ""}
                          onChange={(e) => setSearchValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm w-44 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
                
                <div className="flex items-center gap-2 ml-auto shrink-0 pl-4 border-l border-slate-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="px-4" 
                    onClick={() => {
                      setSearchValues({});
                      setAppliedSearch({});
                      setFilterStatus("全部");
                      toast("已重置", "success");
                    }}
                  >
                    重置
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="px-4 bg-blue-600 hover:bg-blue-700 shadow-sm" 
                    onClick={() => {
                      setAppliedSearch({ ...searchValues });
                      toast("查询成功", "success");
                    }}
                  >
                    <Search className="w-4 h-4 mr-1"/>
                    查询
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Table<any>
          columns={computedColumns}
          data={filteredRecords}
          rowKey={(r) => r.id}
          selectable={!isDeductionTask}
          selectedRowKeys={selectedIds}
          onSelectChange={setSelectedIds}
          className="h-full border-0 rounded-none absolute inset-0 pb-12"
        />
      </div>

      <ColumnSettingsModal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        columns={configurableColumns}
        onConfirm={(updated) => {
          setConfigurableColumns(updated);
          setIsColumnSettingsOpen(false);
          toast("列表设置已保存", "success");
        }}
      />

      <Drawer
        isOpen={auditModal}
        onClose={() => setAuditModal(false)}
        title={
          <div className="flex items-center gap-2">
            <span>数据审核</span>
            {activeRecord && (
              <Badge status={activeRecord.auditStatus === 1 ? "success" : activeRecord.auditStatus === 2 ? "error" : "warning"}>
                {activeRecord.auditStatus === 1 ? "审核通过" : activeRecord.auditStatus === 2 ? "已驳回" : "待审核"}
              </Badge>
            )}
          </div>
        }
        size="xl"
        placement="right"
      >
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {activeRecord && (
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100/80 text-blue-600 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 tracking-tight">数据基本信息</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-[13px]">
                  {[
                    "HOSPITAL_NO",
                    "PATIENT_NAME",
                    "ADMIT_DATE",
                    "DISCHARGE_DATE",
                    "PROJECT_NAME",
                    "VIOLATION_AMOUNT",
                    "VIOLATION_DESC"
                  ].map(fieldName => {
                    const field = template.fields.find(f => f.name === fieldName);
                    if (!field) return null;
                    const isFullWidth = fieldName === "VIOLATION_DESC";
                    const val = activeRecord?.data[fieldName];
                    const label = field.displayName || field.comment || field.name;
                    
                    return (
                      <div className={cn("flex flex-col gap-1.5", isFullWidth ? "col-span-1 md:col-span-2 lg:col-span-3 mt-1 bg-white p-3.5 rounded-lg border border-slate-200/60" : "")} key={field.id}>
                        <span className="text-slate-400 text-xs font-medium">{label}</span>
                        <span 
                          className={cn(
                            "text-slate-800 font-medium", 
                            isFullWidth ? "text-xs leading-relaxed max-h-36 overflow-y-auto w-full break-words whitespace-pre-wrap text-slate-700" : "truncate text-sm"
                          )} 
                          title={String(val || "")}
                        >
                          {fieldName === "VIOLATION_AMOUNT" ? (val !== undefined ? `¥${Number(val).toFixed(2)}` : "-") : (val || "-")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-2 h-4 bg-blue-600 rounded-full" />
                <h4 className="text-sm font-bold text-slate-800">审核与申诉信息</h4>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                  是否申诉 <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-4 max-w-md">
                  <button 
                    onClick={() => handleConfirmChange("APPEAL")}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 font-medium text-sm",
                      auditForm.confirm === "APPEAL" 
                        ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-500/20" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>申诉</span>
                  </button>
                  <button 
                    onClick={() => handleConfirmChange("NO_APPEAL")}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 font-medium text-sm",
                      auditForm.confirm === "NO_APPEAL" 
                        ? "border-slate-700 bg-slate-700 text-white shadow-md" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <X className="w-4 h-4" />
                    <span>不申诉</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  申诉原因 {auditForm.confirm === "APPEAL" && <span className="text-rose-500">*</span>}
                </label>
                <textarea 
                  className="w-full h-28 px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none text-slate-700"
                  placeholder={auditForm.confirm === "APPEAL" ? "请详细叙述申诉理由与依据..." : "可选填申诉或不申诉说明..."}
                  value={auditForm.opinion}
                  onChange={(e) => setAuditForm({...auditForm, opinion: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">申诉附件</label>
                  <span className="text-xs text-slate-400">支持 PDF, JPG, PNG, DOCX (≤20MB)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {auditForm.evidence.map((fileName, i) => {
                    const isImg = /\.(jpg|jpeg|png)$/i.test(fileName);
                    const isPdf = /\.pdf$/i.test(fileName);
                    const isWord = /\.(doc|docx)$/i.test(fileName);
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl group transition-all hover:bg-white hover:border-blue-300 hover:shadow-sm">
                        <div 
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" 
                          onClick={() => handlePreviewFile(fileName)}
                          title="点击在浏览器新标签页中打开预览"
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-colors",
                            isImg ? "bg-blue-50 text-blue-500 group-hover:bg-blue-100" : 
                            isPdf ? "bg-rose-50 text-rose-500 group-hover:bg-rose-100" : 
                            isWord ? "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                          )}>
                            {isImg ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 group-hover:underline" title={fileName}>{fileName}</span>
                            <span className="text-[11px] text-slate-400 font-medium">1.2 MB • 点击预览</span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAuditForm({...auditForm, evidence: auditForm.evidence.filter((_, idx) => idx !== i)});
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {auditForm.confirm === "APPEAL" && auditForm.evidence.length < 5 && (
                  <button 
                    onClick={() => {
                      const patientName = activeRecord?.data.PATIENT_NAME || "张三";
                      const dischargeDate = activeRecord?.data.DISCHARGE_DATE || activeRecord?.data.ADMIT_DATE || "2024-03-10";
                      const projectName = activeRecord?.data.PROJECT_NAME || "项目";
                      const sources = ["出院小结", "入院记录", "手术记录", "检查报告", "医嘱单"];
                      const exts = [".pdf", ".docx", ".png", ".jpg", ".doc"];
                      const index = auditForm.evidence.length;
                      const src = sources[index % sources.length];
                      const ext = exts[index % exts.length];
                      const nextFile = `${patientName}_${dischargeDate}_${projectName}_${src}${ext}`;
                      setAuditForm({...auditForm, evidence: [...auditForm.evidence, nextFile]});
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all group mt-2"
                  >
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    <span className="text-xs font-semibold">点击上传新附件</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-2 pt-1">
                <label className="text-sm font-bold text-slate-700">
                  申诉备注
                </label>
                <textarea 
                  className="w-full h-24 px-4 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none text-slate-700"
                  placeholder="可在此补充或修改申诉备注说明..."
                  value={auditForm.remark}
                  onChange={(e) => setAuditForm({...auditForm, remark: e.target.value})}
                />
              </div>
            </div>

            {/* AI填报结果展示参考 - 仅当有AI填报结论时展示，默认折叠 */}
            {activeRecord && (activeRecord.fillStatus === 5 || activeRecord.isAiFilled || (activeRecord.aiResult && Object.keys(activeRecord.aiResult).length > 0)) && (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm transition-all">
                <button
                  type="button"
                  onClick={() => setIsAiResultOpen(!isAiResultOpen)}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/90 hover:bg-slate-100/90 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">AI填报结果参考</span>
                    <Badge status="success">AI已填报</Badge>
                    {activeRecord.doNotIssue && (
                      <Badge status="default">不下发</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span>{isAiResultOpen ? "收起" : "展开查看"}</span>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isAiResultOpen && "rotate-180")} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isAiResultOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 border-t border-slate-100 space-y-4">
                        <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-lg text-amber-800 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                          <span>该AI审核/填报结果仅用于参考，已默认回填至上方表单，您可根据实际情况进行复核与调整。</span>
                        </div>

                        <div className="bg-blue-50/40 rounded-lg p-4 border border-blue-100/80">
                          <div className="grid grid-cols-1 gap-y-4">
                            {template.fields.filter(f => f.isFeedback && (role === "ADMIN" || !f.adminVisible)).map(f => {
                              const recordData = activeRecord?.data || {};
                              const val = activeRecord?.aiResult?.[f.name] !== undefined ? activeRecord?.aiResult?.[f.name] : recordData[f.name];
                              const isAttachment = f.name.includes("ATTACHMENT") || f.comment?.includes("附件");
                              const hasValue = val !== undefined && val !== null && String(val).trim() !== "" && String(val).trim() !== "-";
                              
                              return (
                                <div key={f.name} className="flex flex-col gap-1.5">
                                  <span className="text-xs font-semibold text-slate-600">{f.displayName || f.comment || f.name}</span>
                                  {hasValue ? (
                                    isAttachment ? (
                                      <div 
                                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => handlePreviewFile(val)}
                                        title="点击在浏览器新标签页中打开预览"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="break-all">{val}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm break-all text-slate-800 font-medium whitespace-pre-wrap bg-white/80 p-2.5 rounded-lg border border-blue-100/50">
                                        {val}
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-sm text-slate-400 font-normal">
                                      -
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 查看填报依据按钮 */}
                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setAiBasisModal({ show: true, record: activeRecord })}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            查看填报依据
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
            <Button variant="ghost" onClick={() => setAuditModal(false)} className="px-6">取消</Button>
            <Button variant="primary" onClick={handleConfirmAudit} className="bg-blue-600 hover:bg-blue-700 shadow-sm px-8 border-0 text-white">确定</Button>
          </div>
        </div>
      </Drawer>

      {/* AI Basis Drawer */}
      <AiBasisDrawer
        isOpen={aiBasisModal.show}
        onClose={() => setAiBasisModal({ show: false, record: null })}
        record={aiBasisModal.record}
      />

      <Modal 
        isOpen={rejectModal}
        title="审核驳回"
        onClose={() => setRejectModal(false)}
        width="max-w-[540px]"
      >
        <div className="flex flex-col bg-white space-y-4">
          <div className="p-1">
            <div className="mb-4 text-sm text-slate-600">
              请填写驳回意见，驳回后由科室重新填报。
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                审核意见
              </label>
              <textarea 
                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none"
                placeholder="请输入内容（最多500字）"
                maxLength={500}
                value={rejectOpinion}
                onChange={(e) => setRejectOpinion(e.target.value)}
              />
              <div className="text-right text-xs text-slate-400 mt-1">
                {rejectOpinion.length}/500
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setRejectModal(false)}>取消</Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmReject}
              className="bg-red-500 hover:bg-red-600 shadow-sm border-0 text-white"
            >
              确定驳回
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={batchAuditModal} 
        onClose={() => setBatchAuditModal(false)} 
        title="审核" 
        width="max-w-[540px]"
      >
        <div className="flex flex-col bg-white space-y-4">
          <div className="p-1">
            <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 px-4 py-3 rounded-lg text-blue-700 text-sm mb-4">
              <Info className="w-4 h-4 shrink-0 text-blue-500" />
              <span>
                已选中{selectedIds.length}条数据，其中{records.filter(r => selectedIds.includes(r.id) && r.data?.IS_APPEAL === "是").length}条申诉，{records.filter(r => selectedIds.includes(r.id) && r.data?.IS_APPEAL === "否").length}条不申诉
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                审核意见
              </label>
              <textarea 
                className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none"
                placeholder="请输入内容"
                value={batchAuditOpinion}
                onChange={(e) => setBatchAuditOpinion(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setBatchAuditModal(false)} className="px-8 shadow-sm">取消</Button>
            <Button 
              className="bg-red-400 hover:bg-red-500 text-white shadow-sm border-0 px-8"
              onClick={handleConfirmBatchReject}
            >
              驳回
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-0 px-8"
              onClick={handleConfirmBatchApprove}
            >
              同意
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
