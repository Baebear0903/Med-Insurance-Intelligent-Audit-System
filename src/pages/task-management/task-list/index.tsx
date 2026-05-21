import React, { useState, useEffect } from "react";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Pagination } from "@/src/components/ui/Pagination";
import { toast } from "@/src/components/ui/Toast";
import { mockApi, Task, ReviewTemplate } from "@/src/lib/mockData";
import { TASK_STATUS, DEPARTMENTS } from "@/src/lib/constants";
import { Search, Plus, MoreVertical, Settings, Filter, Download, Trash2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "@/src/components/ui/Modal";
import { cn } from "@/src/lib/utils";

export function TaskList() {
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [configurableColumns, setConfigurableColumns] = useState<ColumnItem[]>([
    { key: "name", title: "任务名称", visible: true },
    { key: "departmentId", title: "下发科室", visible: true },
    { key: "templateName", title: "数据模板", visible: true },
    { key: "status", title: "任务状态", visible: true },
    { key: "creator", title: "任务创建人", visible: true },
    { key: "createTime", title: "创建时间", visible: true }
  ]);

  const [data, setData] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [searchParams, setSearchParams] = useState({ name: "", creator: "", status: "", createTime: "", templateId: "" });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Modal States
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isMatchVisitModalOpen, setIsMatchVisitModalOpen] = useState(false);
  const [isEndTaskModalOpen, setIsEndTaskModalOpen] = useState(false);
  const [isResultImportModalOpen, setIsResultImportModalOpen] = useState(false);
  const [isIntelligentFillModalOpen, setIsIntelligentFillModalOpen] = useState(false);

  // New task form state
  const [newTaskForm, setNewTaskForm] = useState({ name: "", dueDate: "", templateId: "", departmentId: "1", desc: "" });
  const [importFile, setImportFile] = useState<File | null>(null);

  const inputClasses = "h-9 px-3 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm w-full bg-white";
  const selectClasses = "h-9 px-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm w-full bg-white cursor-pointer";

  const fetchData = () => {
    // Fetch a large number to ensure we get subtasks too for calculating counts
    const res = mockApi.getTasks(1, 1000, searchParams);
    
    // Sort and filter handled by mockApi, but we need to merge subtasks
    const parentTasks = res.data.filter(t => !t.parentId);
    
    const enhancedData = parentTasks.map(pt => {
      const subTasks = res.data.filter(t => t.parentId === pt.id);
      return {
        ...pt,
        subTasks
      };
    });

    const startIndex = (page - 1) * pageSize;
    setData(enhancedData.slice(startIndex, startIndex + pageSize));
    setTotal(enhancedData.length);
    setSelectedIds([]); // Reset selection on page change
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    setTemplates(mockApi.getTemplates());
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const resetSearch = () => {
    setSearchParams({ name: "", creator: "", status: "", createTime: "", templateId: "" });
    setPage(1);
    setTimeout(fetchData, 0);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(d => d.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: keyof typeof TASK_STATUS) => {
    switch(status) {
      case "CREATE": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      case "PUBLISH": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      case "SUBMITTED": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      case "WITHDRAWN": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      case "COMPLETE": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      case "END": return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
      default: return <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span><span className="text-slate-700">{TASK_STATUS[status]}</span></div>;
    }
  };

  // Action generators
  const renderActions = (r: Task) => {
    const actions: Array<{ label: string, onClick: () => void, isLink?: boolean, linkTo?: string, isDanger?: boolean }> = [];
    
    // Actions mapping
    const endTask = { label: "结束任务", onClick: () => { setActiveTask(r); setIsEndTaskModalOpen(true); }, isDanger: true };
    const issueData = { label: "问题数据", isLink: true, linkTo: `/task-management/task-list/issue-data/index?id=${r.id}`, onClick: () => {} };
    const matchVisit = { label: "匹配就诊", onClick: () => { setActiveTask(r); setIsMatchVisitModalOpen(true); } };
    const resultImport = { label: "结果导入", onClick: () => { setActiveTask(r); setIsResultImportModalOpen(true); } };
    const intelligentFill = { label: "智能填报", onClick: () => { 
      toast("正在进行AI智能填报", "success"); 
      mockApi.startAIFill(r.id);
      fetchData();
    } };
    const importAction = { label: "导入", onClick: () => { setActiveTask(r); setIsImportModalOpen(true); } };
    const dispatchAction = { label: "下发", onClick: () => { setActiveTask(r); setIsDispatchModalOpen(true); } };
    const downloadDataAction = { label: "下载数据", onClick: () => { toast("数据已下载", "success"); } };

    if (r.templateId === "TPL_DED") {
      switch(r.status) {
        case "CREATE": // 待下发
          actions.push(importAction, dispatchAction, issueData, endTask); break;
        case "PUBLISH": // 填报中
          actions.push(issueData, endTask); break;
        case "SUBMITTED": // 已提交
          actions.push(issueData, endTask); break;
        case "COMPLETE": // 审核完成
          actions.push(issueData, downloadDataAction, endTask); break;
        case "END": // 已结束
          actions.push(issueData, downloadDataAction); break;
        default: // 对于其他异常状态（已取消BACK、已撤回CANCELLATION、已驳回WITHDRAWN等），展示问题数据
          actions.push(issueData); break;
      }
    } else {
      // Normal logic for non-TPL_DED tasks
      switch(r.status) {
        case "CREATE":
          actions.push(importAction, dispatchAction, issueData, matchVisit, intelligentFill, endTask); break;
        case "PUBLISH":
          actions.push(issueData, matchVisit, intelligentFill, endTask); break;
        case "SUBMITTED":
        case "WITHDRAWN":
          actions.push(issueData, matchVisit, endTask); break;
        case "COMPLETE":
          actions.push(issueData, resultImport, matchVisit, endTask); break;
        case "END":
          actions.push(issueData, resultImport, matchVisit); break;
        default:
          actions.push(issueData); break;
      }
    }

    return (
      <div className="flex items-center gap-x-3 gap-y-1 flex-nowrap whitespace-nowrap">
        {actions.map((act, i) => {
          const colorClass = act.isDanger ? "text-red-500 hover:text-red-700" : "text-blue-600 hover:text-blue-800";
          return act.isLink ? 
            <Link key={i} to={act.linkTo!} className={`${colorClass} text-sm whitespace-nowrap`}>{act.label}</Link> :
            <button key={i} onClick={act.onClick} className={`${colorClass} text-sm whitespace-nowrap`}>{act.label}</button>;
        })}
      </div>
    );
  };

  const columns: Column<Task>[] = [
    { 
      key: "checkbox",
      fixed: "left",
      title: (
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            checked={data.length > 0 && selectedIds.length === data.length} 
            onChange={toggleSelectAll} 
          />
        </div>
      ), 
      width: "50px", 
      render: (r: Task) => (
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
            checked={selectedIds.includes(r.id)} 
            onChange={() => toggleSelectRow(r.id)} 
          />
        </div>
      )
    },
    { key: "index", title: "序号", width: "60px", render: (r: Task) => (page - 1) * pageSize + data.findIndex(d => d.id === r.id) + 1 },
    { key: "name", title: "任务名称", width: "22%", render: (r: Task) => <Link to={`/task-management/task-list/data-query/index?id=${r.id}`} className="text-blue-600 hover:text-blue-800 font-medium decoration-blue-600/30 underline-offset-4 hover:underline">{r.name}</Link> },
    { key: "departmentId", title: "下发科室", width: "15%", render: (r: any) => DEPARTMENTS[r.departmentId as keyof typeof DEPARTMENTS] || "-" },
    { key: "templateName", title: "数据模板", width: "15%", render: (r: Task) => r.templateName || "-" },
    { key: "status", title: "任务状态", width: "12%", render: (r: Task) => getStatusBadge(r.status) },
    { key: "creator", title: "任务创建人", width: "10%" },
    { key: "createTime", title: "创建时间", width: "15%" },
    { key: "action", title: "操作", width: "25%", fixed: "right", render: (r: Task) => renderActions(r) },
  ];

  const computedColumns = [
    columns.find(c => c.key === "checkbox")!,
    columns.find(c => c.key === "index")!,
    ...configurableColumns
      .filter(item => item.visible)
      .map(item => columns.find(c => c.key === item.key)!),
    columns.find(c => c.key === "action")!
  ].filter(Boolean);

  // Logic handlers
  const handleCreateTask = () => {
    if (!newTaskForm.name || !newTaskForm.dueDate || !newTaskForm.templateId || !newTaskForm.departmentId) {
      toast("请填写带*号的必填项", "error");
      return;
    }
    const tpl = templates.find(t => t.id === newTaskForm.templateId);
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    if (!tasks || tasks.length === 0) { tasks = mockApi.getTasks(1, 100).data; } // Load defaults if empty
    
    const newTask: Task = {
      id: "T" + Date.now(),
      name: newTaskForm.name,
      year: new Date().getFullYear().toString(),
      departmentId: Number(newTaskForm.departmentId) as any,
      templateId: newTaskForm.templateId,
      templateName: tpl ? tpl.name : "",
      status: "CREATE",
      creator: "当前用户",
      createTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      updateTime: new Date().toISOString().slice(0, 16).replace("T", " "),
      dueDate: newTaskForm.dueDate
    };
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    setIsNewTaskModalOpen(false);
    toast("新建任务成功", "success");
    setNewTaskForm({ name: "", dueDate: "", templateId: "", departmentId: "1", desc: "" });
    fetchData();
  };

  const handleImport = (isResult = false) => {
    if (!importFile) {
      toast("请先上传文件", "error");
      return;
    }
    if (importFile.size > 20 * 1024 * 1024) {
      toast("单个文件不超过 20MB", "error");
      return;
    }
    if (isResult) {
      setIsResultImportModalOpen(false);
      toast("医保局反馈结果更新成功", "success");
    } else {
      setIsImportModalOpen(false);
      toast("导入成功并生成了问题数据", "success");
    }
    setImportFile(null);
  };

  const handleDispatch = () => {
    if(!activeTask) return;
    const success = mockApi.dispatchTask(activeTask.id);
    if (!success) {
      toast("下发失败，可能该任务不在待下发状态", "error");
      setIsDispatchModalOpen(false);
      return;
    }
    setIsDispatchModalOpen(false);
    toast("下发成功", "success");
    fetchData();
  };

  const handleMatchVisit = () => {
    setIsMatchVisitModalOpen(false);
    toast("更新成功", "success");
  };

  const handleEndTask = () => {
    if(!activeTask) return;
    let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const t = tasks.find((t: Task) => t.id === activeTask.id);
    if(t) t.status = "END";
    localStorage.setItem("tasks", JSON.stringify(tasks));
    setIsEndTaskModalOpen(false);
    toast("任务已结束", "success");
    fetchData();
  };

  return (
    <div className="p-5 flex flex-col h-full bg-slate-50/50">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col h-full">
        {/* Toolbar Top */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="请输入任务名称"
                className={cn(inputClasses, "w-64 pl-9")}
                value={searchParams.name}
                onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <Button variant="primary" size="sm" onClick={handleSearch} className="h-9 px-5">搜索</Button>
            <button 
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded border transition-colors",
                isFilterOpen ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="高级筛选"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={() => setIsNewTaskModalOpen(true)} className="h-9 px-4">
              <Plus className="w-4 h-4 mr-1"/> 新建
            </Button>
            
            {/* More Actions Dropdown */}
            <div className="relative">
              <button 
                className={cn(
                  "flex items-center gap-1 px-4 h-9 rounded border transition-all text-sm font-medium",
                  selectedIds.length > 0 
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm active:bg-slate-100" 
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                )}
                disabled={selectedIds.length === 0}
                onClick={() => setIsMoreOpen(!isMoreOpen)}
              >
                更多 <MoreVertical className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </button>
              
              {isMoreOpen && selectedIds.length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMoreOpen(false)} />
                  <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-20 animate-in zoom-in-95 duration-100 flex flex-col">
                    <button className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors" onClick={() => { setIsMoreOpen(false); toast(`确认删除所选的 ${selectedIds.length} 个任务？`, "error"); }}>
                      <Trash2 className="w-4 h-4 mr-2" /> 删除任务
                    </button>
                    <button className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors" onClick={() => { setIsMoreOpen(false); toast("正在生成模板并下载...", "success"); }}>
                      <Download className="w-4 h-4 mr-2" /> 模板下载
                    </button>
                    <button className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors" onClick={() => { setIsMoreOpen(false); setSelectedIds([]); }}>
                      <XCircle className="w-4 h-4 mr-2" /> 取消选择
                    </button>
                  </div>
                </>
              )}
            </div>

            <button className="text-slate-500 hover:text-slate-800 p-1.5 border border-transparent hover:bg-slate-50 rounded transition-colors" title="设置" onClick={() => setIsColumnSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="mb-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-wrap gap-x-8 gap-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">任务创建人</label>
              <input 
                type="text" 
                className={cn(inputClasses, "w-48")}
                placeholder="请输入"
                value={searchParams.creator}
                onChange={e => setSearchParams({...searchParams, creator: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">任务状态</label>
              <select 
                className={cn(selectClasses, "w-48")}
                value={searchParams.status}
                onChange={e => setSearchParams({...searchParams, status: e.target.value})}
              >
                <option value="">全部状态</option>
                {Object.entries(TASK_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">创建日期</label>
              <input 
                type="date" 
                className={cn(inputClasses, "w-48")}
                value={searchParams.createTime}
                onChange={e => setSearchParams({...searchParams, createTime: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">数据模板</label>
              <select 
                className={cn(selectClasses, "w-48")}
                value={searchParams.templateId}
                onChange={e => setSearchParams({...searchParams, templateId: e.target.value})}
              >
                <option value="">全部模板</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-3 ml-auto">
              <Button size="sm" variant="outline" onClick={resetSearch} className="h-9 px-6 border-slate-300 font-medium">重置</Button>
              <Button size="sm" variant="primary" onClick={handleSearch} className="h-9 px-6 font-medium">筛选</Button>
            </div>
          </div>
        )}

        {/* Table Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto border border-slate-100 rounded-md mb-4 shadow-inner">
            <Table<Task>
              columns={computedColumns}
              data={data}
              rowKey={(r) => r.id}
            />
          </div>
          <div className="flex-shrink-0 flex items-center justify-between py-2 px-1">
            <span className="text-sm text-slate-500">共 {total} 条记录</span>
            <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} />
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
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
      
      {/* 新建任务 */}
      <Modal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} title="新建任务" width="max-w-xl"
        footer={<><Button variant="outline" onClick={() => setIsNewTaskModalOpen(false)}>取消</Button><Button variant="primary" onClick={handleCreateTask}>确认</Button></>}
      >
        <div className="flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-right font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>任务名称</label>
            <input type="text" placeholder="请输入限制在50字符内" maxLength={50} className={inputClasses} 
              value={newTaskForm.name} onChange={e => setNewTaskForm({...newTaskForm, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-right font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>截止日期</label>
            <input type="date" className={inputClasses} 
              value={newTaskForm.dueDate} onChange={e => setNewTaskForm({...newTaskForm, dueDate: e.target.value})} />
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-right font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>模板选择</label>
            <select className={selectClasses}
              value={newTaskForm.templateId} onChange={e => setNewTaskForm({...newTaskForm, templateId: e.target.value})}>
              <option value="">请选择模板</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <label className="text-right font-medium text-slate-700"><span className="text-red-500 mr-1">*</span>下发科室</label>
            <select className={selectClasses} disabled
              value={newTaskForm.departmentId} onChange={e => setNewTaskForm({...newTaskForm, departmentId: e.target.value})}>
              <option value="1">医保办</option>
            </select>
          </div>
          <div className="grid grid-cols-[100px_1fr] items-start gap-2">
            <label className="text-right font-medium text-slate-700 mt-2">任务描述</label>
            <textarea placeholder="请输入" className={cn(inputClasses, "h-24 py-2 resize-none")} 
              value={newTaskForm.desc} onChange={e => setNewTaskForm({...newTaskForm, desc: e.target.value})}></textarea>
          </div>
        </div>
      </Modal>

      {/* 导入弹窗 / 结果导入 */}
      <Modal isOpen={isImportModalOpen || isResultImportModalOpen} onClose={() => { setIsImportModalOpen(false); setIsResultImportModalOpen(false); }} 
        title={isResultImportModalOpen ? "结果导入" : "数据导入"} width="max-w-md"
        footer={<><Button variant="outline" onClick={() => { setIsImportModalOpen(false); setIsResultImportModalOpen(false); }}>取消</Button><Button variant="primary" onClick={() => handleImport(isResultImportModalOpen)}>确认</Button></>}
      >
        <div className="flex flex-col gap-4 text-sm text-center py-6">
          <input type="file" id="file_upload" className="hidden" accept=".xls,.xlsx" onChange={(e) => { 
            const files = e.target.files;
            if(files && files.length > 0) setImportFile(files[0]);
          }}/>
          <Button variant="outline" className="mx-auto w-32" onClick={() => document.getElementById("file_upload")?.click()}>选择文件</Button>
          <div className="text-slate-500">
            {importFile ? <span className="text-blue-600 font-medium">{importFile.name}</span> : "暂未选择文件"}
          </div>
          <div className="text-slate-400 text-xs mt-2 space-y-1">
            <p>支持上传 .xls, .xlsx 格式文件</p>
            <p>单个文件不超过 20MB</p>
            {isResultImportModalOpen && <p className="text-orange-500 mt-2">注意：只更新医保局反馈结果列对应的字段</p>}
          </div>
        </div>
      </Modal>

      {/* 下发弹窗 */}
      <Modal isOpen={isDispatchModalOpen} onClose={() => setIsDispatchModalOpen(false)} title="下发提示" width="max-w-md"
        footer={<><Button variant="outline" onClick={() => setIsDispatchModalOpen(false)}>取消</Button><Button variant="primary" onClick={handleDispatch}>确认下发</Button></>}
      >
        <div className="text-sm text-slate-700 flex flex-col gap-3">
          <div className="bg-orange-50 text-orange-700 p-3 rounded border border-orange-100">
            <span className="font-medium">温馨提示：</span> 下发任务后，任务只能进行详情查看、撤回、结束操作。
          </div>
          <p className="font-medium text-slate-800 mt-2">任务下发规则：</p>
          <ul className="list-disc list-inside text-slate-600 space-y-1">
            <li>登录账号科室 = 下发目标科室名称</li>
          </ul>
        </div>
      </Modal>

      {/* 匹配就诊记录 */}
      <Modal isOpen={isMatchVisitModalOpen} onClose={() => setIsMatchVisitModalOpen(false)} title="匹配就诊记录" width="max-w-sm"
        footer={<><Button variant="outline" onClick={() => setIsMatchVisitModalOpen(false)}>取消</Button><Button variant="primary" onClick={handleMatchVisit}>确认</Button></>}
      >
        <div className="text-sm text-slate-700 py-4 text-center">
          是否匹配院内就诊记录，并更新任务数据？
        </div>
      </Modal>

      {/* 结束任务 */}
      <Modal isOpen={isEndTaskModalOpen} onClose={() => setIsEndTaskModalOpen(false)} title="结束任务" width="max-w-sm"
        footer={<><Button variant="outline" onClick={() => setIsEndTaskModalOpen(false)}>取消</Button><Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleEndTask}>确认结束</Button></>}
      >
        <div className="text-sm text-slate-700 py-4 text-center">
          结束任务后该填报任务的数据不可修改，只能查询。确定要结束任务吗？
        </div>
      </Modal>
      
      {/* 智能填报 (Placeholder, waits for integration) */}
      <Modal isOpen={isIntelligentFillModalOpen} onClose={() => setIsIntelligentFillModalOpen(false)} title="选择智能填报规则" width="max-w-md"
         footer={<><Button variant="outline" onClick={() => setIsIntelligentFillModalOpen(false)}>取消</Button><Button variant="primary" onClick={() => { setIsIntelligentFillModalOpen(false); toast("智能填报规则应用成功", "success"); }}>确认</Button></>}
      >
        <div className="text-sm text-slate-600 py-4 text-center flex flex-col gap-3">
          <p>请选择要应用的智能填报规则策略</p>
          <select className="h-9 px-3 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-full bg-white transition-all">
             <option value="1">默认填写策略（按模板历史数据提取）</option>
             <option value="2">医嘱关联分析策略</option>
          </select>
          <p className="text-xs text-slate-400 mt-2">与“智能填写”模块共用规则库</p>
        </div>
      </Modal>

    </div>
  );
}
