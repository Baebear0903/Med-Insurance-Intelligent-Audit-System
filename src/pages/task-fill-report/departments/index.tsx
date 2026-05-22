import React, { useState, useEffect, useRef } from "react";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { 
  Search, 
  Filter, 
  Settings, 
  AlertCircle, 
  Download, 
  Upload, 
  Send, 
  RotateCcw, 
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSearch,
  MessageSquare,
  MoreVertical
} from "lucide-react";
import { Table, Column } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Pagination } from "@/src/components/ui/Pagination";
import { Modal } from "@/src/components/ui/Modal";
import { toast } from "@/src/components/ui/Toast";
import { mockApi, Task } from "@/src/lib/mockData";
import { TASK_STATUS, DEPARTMENTS } from "@/src/lib/constants";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { downloadZipWithExcel } from "@/src/lib/exportUtils";

import { useUser } from "@/src/lib/userContext";

// ... scroll down to TaskFillReport component
export function TaskFillReport() {
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [configurableColumns, setConfigurableColumns] = useState<ColumnItem[]>([
    { key: "name", title: "任务名称", visible: true },
    { key: "templateName", title: "模板名称", visible: true },
    { key: "departmentId", title: "下发科室", visible: true },
    { key: "status", title: "任务状态", visible: true },
    { key: "creator", title: "任务创建人", visible: true },
    { key: "dueDate", title: "截止时间", visible: true }
  ]);

  const navigate = useNavigate();
  const { role } = useUser();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [showDetailedFilter, setShowDetailedFilter] = useState(false);
  const [filterTaskName, setFilterTaskName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  // Modals state
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: "submit" | "withdraw" | "read" | null;
    taskId: string | null;
  }>({ show: false, type: null, taskId: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    setLoading(true);
    // Use either group search or detailed filter
    const name = showDetailedFilter ? filterTaskName : searchText;
    const res = mockApi.getTasks(page, 100, { name }); // Fetch more for local filter
    
    let filteredData = res.data;
    
    // 过滤掉未下发的任务
    filteredData = filteredData.filter(t => t.status !== "CREATE");
    
    // Filter by role and remove subtasks
    filteredData = filteredData.filter(t => !t.parentId);

    if (role === "DEP_SURGERY" || role === "DEP_INTERNAL") {
      const deptName = role === "DEP_SURGERY" ? "外科" : "内科";
      filteredData = filteredData.filter(t => {
        const details = mockApi.getTaskDetailRecords(t.id);
        return details.some((d: any) => d.data && d.data.DEPARTMENT_NAME === deptName);
      });
    }

    // Manual filter for status if detailed filter is shown
    if (showDetailedFilter && filterStatus) {
      filteredData = filteredData.filter(t => t.status === filterStatus);
    }

    // Also hide parent tasks if they have sub-tasks? The prompt says admin sees all. Let's just show all for admin.
    // For department users, they only see their assigned subtasks (dept=3 or 4)

    const startIndex = (page - 1) * 10;
    setTasks(filteredData.slice(startIndex, startIndex + 10));
    setTotal(filteredData.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page, showDetailedFilter, role]); // Re-fetch when switching back and forth if needed

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleReset = () => {
    setFilterTaskName("");
    setFilterStatus("");
    setPage(1);
    // We delay slightly to let state update or just call fetchData with empty values
    setTimeout(fetchData, 0);
  };

  const handleAction = (type: "submit" | "withdraw" | "read", taskId: string) => {
    setConfirmModal({ show: true, type, taskId });
  };

  const executeAction = () => {
    if (!confirmModal.taskId || !confirmModal.type) return;
    
    if (confirmModal.type === "submit") {
      mockApi.updateTaskStatus(confirmModal.taskId, "SUBMITTED");
      toast("提交成功", "success");
    } else if (confirmModal.type === "read") {
      mockApi.updateTaskStatus(confirmModal.taskId, "END");
      toast("确认已读成功", "success");
    } else if (confirmModal.type === "withdraw") {
      if (confirmModal.taskId === "T1003") { // Special case for mock
        toast("当前任务无可撤回数据", "info");
      } else {
        mockApi.updateTaskStatus(confirmModal.taskId, "PUBLISH");
        toast("撤回成功", "success");
      }
    }
    
    setConfirmModal({ show: false, type: null, taskId: null });
    fetchData();
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast("正在解析文件并匹配数据...", "info");
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          toast("成功匹配数据并上传", "success");
        } else {
          toast("上传失败，文件格式不正确或缺少必要字段", "error");
        }
      }, 1000);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTask = async (t: Task) => {
    toast("正在准备打包数据...", "info");
    
    // 获取该任务的所有记录
    const allRecords = mockApi.getTaskDetailRecords(t.id);
    if (!allRecords || allRecords.length === 0) {
      toast("该任务暂无可用填报明细数据", "info");
      return;
    }

    // 获取该任务关联的模板，用于组装字段名
    const allTemplates = mockApi.getTemplates();
    const tpl = allTemplates.find(tpl => tpl.id === t.templateId) || allTemplates[0];
    
    // 组装表头
    const headers = [
      "序号",
      "填报状态",
      "审核状态"
    ];
    if (tpl && tpl.fields) {
      tpl.fields.forEach(f => {
        headers.push(f.displayName || f.comment || f.name);
      });
    } else {
      headers.push("数据明细内容");
    }

    // 组装行内容
    const rows = allRecords.map((r: any, idx: number) => {
      const getStatusLabel = (s: string) => {
        if (s === "UNFILLED") return "待填报";
        if (s === "FILLED") return "已提交";
        if (s === "AI_FILLED") return "AI已填";
        if (s === "AI_FILLING") return "AI填充中";
        return s || "未开始";
      };
      
      const getAuditStatusLabel = (ast: number) => {
        if (ast === 0) return "已送审";
        if (ast === 1) return "待审核";
        if (ast === 2) return "审核通过";
        if (ast === 3) return "审核驳回";
        if (ast === 7) return "未作申诉填报";
        if (ast === 8) return "已申诉";
        return "-";
      };

      const baseCols = [
        String(idx + 1),
        getStatusLabel(r.fillStatus),
        getAuditStatusLabel(r.auditStatus)
      ];

      if (tpl && tpl.fields) {
        const templateCols = tpl.fields.map(f => {
          const val = r.data[f.name];
          return val === undefined || val === null ? "" : String(val);
        });
        return [...baseCols, ...templateCols];
      } else {
        return [...baseCols, JSON.stringify(r.data)];
      }
    });

    // 收集附件列表
    const attachments: { name: string; recordInfo?: string; folderName?: string }[] = [];
    allRecords.forEach((r: any) => {
      const fileString = r.data.APPEAL_ATTACHMENT;
      if (fileString) {
        const patientName = r.data.PATIENT_NAME || "未名";
        const disDate = r.data.DISCHARGE_DATE || r.data.ADMIT_DATE || "无出院日";
        const projName = r.data.PROJECT_NAME || "未提项目";
        const folderName = `${patientName}_${disDate}_${projName}`;
        attachments.push({
          name: fileString,
          recordInfo: `患者姓名：${patientName}，出院时间：${disDate}`,
          folderName
        });
      }
    });

    try {
      const zipName = `${t.name}_全部填报数据及附件.zip`;
      const excelName = `${t.name}_填报数据表.xlsx`;
      await downloadZipWithExcel(zipName, excelName, headers, rows, attachments);
      toast("导出打包成功！开始下载...", "success");
    } catch (e) {
      toast("下载打包失败，请重试", "error");
      console.error(e);
    }
  };

  const statsGroups = [
    {
      title: "任务 / 所有数据",
      cards: [
        { label: "已完成任务", value: 24, icon: CheckCircle2, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-200/50" },
        { label: "填报中任务", value: 110, icon: Clock, color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-200/50" },
        { label: "已延期任务", value: 101, icon: AlertTriangle, color: "from-rose-400 to-red-500", shadow: "shadow-rose-200/50" },
      ]
    },
    {
      title: "数据 / 所有数据",
      cards: [
        { label: "待填报数据", value: 341, icon: FileText, color: "from-orange-400 to-amber-500", shadow: "shadow-orange-200/50" },
        { label: "数据审核中", value: 192, icon: FileSearch, color: "from-violet-400 to-purple-500", shadow: "shadow-violet-200/50" },
        { label: "驳回重填", value: 0, icon: RotateCcw, color: "from-slate-400 to-slate-600", shadow: "shadow-slate-200/50" },
      ]
    }
  ];

  const columns: Column<Task>[] = [
    { key: "index", title: "序号", width: "60px", render: (_: Task, index: number) => (page - 1) * 10 + index + 1 },
    { 
      key: "name", 
      title: "任务名称", 
      render: (t: Task) => (
        <Link 
          to={`/task-fill-report/departments/fill-report/index?id=${t.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {t.name}
        </Link>
      )
    },
    { key: "templateName", title: "模板名称" },
    { key: "departmentId", title: "下发科室", render: (t: Task) => DEPARTMENTS[t.departmentId] || "-" },
    { 
      key: "status", 
      title: "任务状态", 
      render: (t: Task) => (
        <Badge status={
          t.status === "COMPLETE" || t.status === "END" ? "success" : 
          t.status === "PUBLISH" ? "info" : 
          t.status === "SUBMITTED" ? "warning" : 
          t.status === "WITHDRAWN" ? "error" : "default"
        }>
          {TASK_STATUS[t.status]}
        </Badge>
      )
    },
    { key: "creator", title: "任务创建人" },
    { key: "dueDate", title: "截止时间" },
    {
      key: "action",
      title: "操作",
      fixed: "right",
      width: "240px",
      render: (t: Task) => {
        const common = (
          <Button variant="ghost" size="sm" onClick={() => handleDownloadTask(t)} className="text-blue-600 h-7 px-2">
            下载数据
          </Button>
        );

        return (
          <div className="flex items-center gap-1">
            {common}
            {t.status === "PUBLISH" && t.templateId !== "TPL_DED" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleUpload} className="text-blue-600 h-7 px-2">上传申报</Button>
                <Button variant="ghost" size="sm" onClick={() => handleAction("submit", t.id)} className="text-blue-600 h-7 px-2">提交审核</Button>
              </>
            )}
            {t.status === "PUBLISH" && t.templateId === "TPL_DED" && (
              <Button variant="ghost" size="sm" onClick={() => handleAction("read", t.id)} className="text-blue-600 h-7 px-2">确认已读</Button>
            )}
            {t.status === "SUBMITTED" && t.templateId !== "TPL_DED" && (
              <Button variant="ghost" size="sm" onClick={() => handleAction("withdraw", t.id)} className="text-blue-600 h-7 px-2">撤回</Button>
            )}
            {t.status === "WITHDRAWN" && t.templateId !== "TPL_DED" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleUpload} className="text-blue-600 h-7 px-2">上传申报</Button>
                <Button variant="ghost" size="sm" onClick={() => handleAction("submit", t.id)} className="text-blue-600 h-7 px-2">提交审核</Button>
                <Button variant="ghost" size="sm" onClick={() => setRejectModalId(t.id)} className="text-orange-600 h-7 px-2">驳回意见</Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  const computedColumns = [
    columns.find(c => c.key === "index")!,
    ...configurableColumns
      .filter(item => item.visible)
      .map(item => columns.find(c => c.key === item.key)!),
    columns.find(c => c.key === "action")!
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden p-4">
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      {/* Alarm Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-100 rounded-lg py-2.5 px-4 flex items-center gap-3 shadow-sm"
      >
        <div className="bg-red-500 rounded-full p-1 shadow-lg shadow-red-200">
          <AlertCircle className="w-4 h-4 text-white" />
        </div>
        <p className="text-red-700 text-[13px] font-medium">
          您有<span className="font-bold mx-1 text-red-800">110</span>个智能审核任务填报中，其中<span className="font-bold mx-1 text-red-800">101</span>个已延期，请尽快完成填报！
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4">
        {statsGroups.map((group, gIdx) => (
          <div key={group.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
              <span className="w-1 h-3 bg-blue-500 rounded-full" />
              {group.title}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {group.cards.map((card, cIdx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (gIdx * 3 + cIdx) * 0.05 }}
                  className={cn(
                    "relative overflow-hidden bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group",
                    card.shadow
                  )}
                >
                  <div className="relative z-10 flex flex-col gap-1">
                    <span className="text-slate-500 text-xs font-medium">{card.label}</span>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-slate-800 leading-tight">{card.value}</span>
                    </div>
                  </div>
                  
                  {/* Decorative Icon Background */}
                  <div className={cn(
                    "absolute -right-2 -bottom-2 w-16 h-16 rounded-2xl flex items-center justify-center opacity-10 rotate-12 transition-transform group-hover:rotate-6 bg-gradient-to-br",
                    card.color
                  )}>
                    <card.icon className="w-10 h-10" />
                  </div>
                  
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl flex-1 flex flex-col shadow-sm border border-slate-100 overflow-hidden min-h-0">
        {/* Table Toolbar */}
        <div className="p-4 flex flex-col border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50 group focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <div className="flex items-center px-3 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  type="text"
                  placeholder="请输入任务名称"
                  className="flex-1 py-1.5 pr-3 bg-transparent text-sm focus:outline-none w-64"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium border-l border-slate-200 transition-colors"
                >
                  搜索
                </button>
              </div>

              <button 
                onClick={() => setShowDetailedFilter(!showDetailedFilter)}
                className={cn(
                  "p-2 rounded-md transition-all border shadow-sm flex items-center justify-center",
                  showDetailedFilter 
                    ? "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/10" 
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                <Filter className="w-4 h-4 shadow-[0_0_8px_rgba(0,0,0,0.1)]" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-400 transition-colors shadow-sm" onClick={() => setIsColumnSettingsOpen(true)}>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Detailed Filter Panel */}
          <AnimatePresence>
            {showDetailedFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-slate-100/50 border border-slate-100/30 rounded flex items-center justify-between gap-12">
                  <div className="flex flex-1 items-center gap-12">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">任务名称</span>
                      <input 
                        type="text"
                        placeholder="请输入内容"
                        className="w-72 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-inner"
                        value={filterTaskName}
                        onChange={(e) => setFilterTaskName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap">任务状态</span>
                      <div className="relative w-72">
                        <select 
                          className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer shadow-inner"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="">请选择</option>
                          {Object.entries(TASK_STATUS).filter(([key]) => key !== 'CREATE').map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <Clock className="w-3.5 h-3.5" /> {/* Small placeholder icon for arrow */}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <Button onClick={handleSearch} className="px-8 py-2 bg-[#1665ff] hover:bg-blue-700 text-white border-none shadow-md h-auto text-sm font-medium rounded-md">
                      查询
                    </Button>
                    <Button variant="ghost" onClick={handleReset} className="px-8 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-auto text-sm font-medium rounded-md">
                      重置
                    </Button>
                    <button className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm" onClick={() => toast("切换视图成功", "success")}>
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-[1px]" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-[1px]" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-[1px]" />
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-[1px]" />
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto bg-[#fafbfc]">
          <div className="p-4 h-full">
            <Table<Task>
              columns={computedColumns}
              data={tasks}
              rowKey={(t) => t.id}
              className="bg-white rounded-lg border border-slate-100"
            />
          </div>
        </div>

        {/* Pagination Section */}
        <div className="p-4 bg-white border-t border-slate-50 flex justify-end">
          <Pagination 
            current={page} 
            total={total} 
            pageSize={10}
            onChange={(p) => setPage(p)} 
          />
        </div>
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

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, type: null, taskId: null })}
        title={confirmModal.type === "submit" ? "确认提交" : confirmModal.type === "read" ? "确认已读" : "确认撤回"}
      >
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              confirmModal.type === "submit" || confirmModal.type === "read" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
            )}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <p className="text-slate-700 font-medium whitespace-pre-wrap">
              {confirmModal.type === "submit" 
                ? "确认提交该任务吗？提交后将无法修改申报数据。" 
                : confirmModal.type === "read"
                  ? "确认后表示已阅读本次院内扣减明细并接受扣减结果，是否继续？"
                  : "确认撤回该任务吗？撤回后任务状态将由“已提交”变为“填报中”。"}
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setConfirmModal({ show: false, type: null, taskId: null })}>取消</Button>
            <Button onClick={executeAction} variant={confirmModal.type === "submit" || confirmModal.type === "read" ? "primary" : "secondary"}>确认</Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Opinion Modal */}
      <Modal
        isOpen={!!rejectModalId}
        onClose={() => setRejectModalId(null)}
        title="驳回意见"
      >
        <div className="py-4">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 mb-6">
            <div className="p-1.5 bg-amber-500 rounded-lg text-white shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-amber-900 font-bold text-sm">审核未通过</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                申报数据中“医保结算金额”与实际住院明细对账不符，部分患者（如张三、李四）的住院天数计算逻辑有误，请核实数据并完善必填项后再行提交。
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <span className="text-[11px] text-amber-700/70 font-medium">审核人：王主任</span>
                <span className="text-[11px] text-amber-700/70 ml-auto">2024-05-12 10:00</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setRejectModalId(null)}>关闭</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
