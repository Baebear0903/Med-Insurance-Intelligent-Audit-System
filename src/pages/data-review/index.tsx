import React, { useState, useEffect } from "react";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { Info, LayoutList, XCircle, Search, Filter, Settings, ChevronRight, ChevronDown, CheckCircle2, Clock, AlertCircle, Bell, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { Badge } from "@/src/components/ui/Badge";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "@/src/components/ui/Toast";
import { mockApi } from "@/src/lib/mockData";
import { DEPARTMENTS, TASK_STATUS } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";

const PROGRESS_DATA = [
  { id: "P1", index: 1, department: "外科", amount: "5,000.00", manager: "外科", progress: "审核通过" },
  { id: "P3", index: 2, department: "内科", amount: "1,000.00", manager: "内科", progress: "填报中" },
];

export function DataReview() {
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [configurableColumns, setConfigurableColumns] = useState<ColumnItem[]>([
    { key: "name", title: "任务名称", visible: true },
    { key: "department", title: "下发科室", visible: true },
    { key: "manager", title: "专管员", visible: true },
    { key: "status", title: "任务状态", visible: true },
    { key: "creator", title: "任务创建人", visible: true },
    { key: "dueDate", title: "截止时间", visible: true }
  ]);

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const allRawTasksRef = React.useRef<any[]>([]);
  
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressModalStats, setProgressModalStats] = useState({ total: 0, filled: 0, unfilled: 0, amount: "0.00", isDeduction: false });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedProgressIds, setSelectedProgressIds] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [progressFilter, setProgressFilter] = useState("");
  const [showDetailedFilter, setShowDetailedFilter] = useState(false);
  const [filterTaskName, setFilterTaskName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadTasks = () => {
      setLoading(true);
      const allTasksRes = mockApi.getTasks(1, 1000);
      const allTasks = allTasksRes.data;
      allRawTasksRef.current = allTasks;

      // Build tree
      const parentTasks = allTasks.filter(t => !t.parentId && t.status !== "CREATE");
      
      const treeData = parentTasks.map((pt, idx) => {
        const childrenRaw = allTasks.filter(t => t.parentId === pt.id);
        
        const children = childrenRaw.map(ct => ({
          id: ct.id,
          deptId: ct.departmentId,
          deptName: DEPARTMENTS[ct.departmentId] || ct.name.split(" - ")[1],
          manager: ct.departmentId === 3 ? "李飞" : (ct.departmentId === 4 ? "赵云" : "陈磊"),
          status: ct.status
        }));

        return {
          id: pt.id,
          index: idx + 1,
          name: pt.name,
          department: DEPARTMENTS[pt.departmentId] || "医保办",
          manager: pt.creator,
          status: pt.status,
          creator: pt.creator,
          dueDate: pt.dueDate,
          children
        };
      });

      setTasks(treeData);
      setLoading(false);
    };

    loadTasks();

    const handleUpdate = () => loadTasks();
    window.addEventListener("task_updated", handleUpdate);
    return () => window.removeEventListener("task_updated", handleUpdate);
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesName = !filterTaskName || t.name.toLowerCase().includes(filterTaskName.toLowerCase());
    const matchesStatus = !filterStatus || t.status === filterStatus;
    return matchesName && matchesStatus;
  });

  const [progressData, setProgressData] = useState<any[]>([]);

  const filteredProgressData = progressFilter 
    ? progressData.filter(item => item.progress === progressFilter)
    : progressData;

  const toggleRow = (id: string) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const openProgressModal = (task: any) => {
    setSelectedProgressIds([]);

    const children = allRawTasksRef.current?.filter((t: any) => t.parentId === task.id) || [];
    const pData = children.map((c: any, index: number) => {
      let progress = "未填报";
      if (c.status === "END") progress = "审核通过";
      else if (c.status === "SUBMITTED") progress = "审核中";
      else if (c.status === "PUBLISH" || c.status === "CREATE") progress = "未填报";
      
      // Since it's a DED (扣减) task where there's no real "审核通过", 
      // let's follow the wording in the prompt:
      // "1月院内扣减任务在进度弹窗中展示所有科室已读确认。" "外科已读、内科未读"
      const isDeduction = task.name.includes("扣减");
      if (isDeduction) {
        if (c.status === "END") progress = "已读确认";
        else progress = "未读";
      }

      // calculate amounts just for demo, or mock it?
      // "违规金额" in deduction tasks.
      const details = mockApi.getTaskDetailRecords(c.id);
      let total = 0;
      details.forEach((d: any) => {
        const val = parseFloat(d.data.TOTAL_AMOUNT || 0);
        if (!isNaN(val)) total += val;
      });
      // Just mock amount if 0 for demo visual sake
      if (total === 0) total = index === 0 ? 5000 : index === 1 ? 1000 : 3000;

      return {
        id: c.id,
        index: index + 1,
        department: DEPARTMENTS[c.departmentId] || c.name.split(" - ")[1],
        amount: total.toFixed(2),
        manager: c.departmentId === 3 ? "李飞" : (c.departmentId === 4 ? "赵云" : "陈磊"),
        progress: progress
      };
    });

    const isDeduction = task.name.includes("扣减");
    const unfillCount = pData.filter((item: any) => item.progress === "未填报" || item.progress === "未读").length;
    setProgressModalStats({
      total: pData.length,
      filled: pData.length - unfillCount,
      unfilled: unfillCount,
      amount: pData.reduce((acc: number, item: any) => acc + parseFloat(item.amount), 0).toFixed(2),
      isDeduction
    });

    setProgressData(pData);
    setProgressModalOpen(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const unfilledIds = filteredProgressData.filter(item => item.progress === "未填报").map(item => item.id);
      setSelectedProgressIds(unfilledIds);
    } else {
      setSelectedProgressIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedProgressIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  };

  const handleBatchUrge = () => {
    if (selectedProgressIds.length === 0) {
      toast("请勾选一条有效数据", "error");
      return;
    }
    toast("催办成功", "success");
    setSelectedProgressIds([]);
  };

  const handleSingleUrge = (id: string) => {
    setConfirmModalOpen(true);
  };

  const confirmSingleUrge = () => {
    toast("催办成功", "success");
    setConfirmModalOpen(false);
  };

  const getProgressBadgeStatus = (progress: string) => {
    if (progress === "审核通过" || progress === "已读确认") return "success";
    if (progress === "未填报" || progress === "未读") return "error";
    return "warning";
  };

  const colHeaderMap: Record<string, React.ReactNode> = {
    name: <th key="name" className="font-medium p-3">任务名称</th>,
    department: <th key="department" className="font-medium p-3">下发科室</th>,
    manager: <th key="manager" className="font-medium p-3">专管员</th>,
    status: <th key="status" className="font-medium p-3">任务状态</th>,
    creator: <th key="creator" className="font-medium p-3">任务创建人</th>,
    dueDate: <th key="dueDate" className="font-medium p-3">截止时间</th>,
  };

  const colCellMap = (row: any): Record<string, React.ReactNode> => ({
    name: <td key="name" className="p-3 font-medium text-slate-800">{row.name}</td>,
    department: <td key="department" className="p-3 text-slate-600">{row.department}</td>,
    manager: <td key="manager" className="p-3 text-slate-600">{row.manager}</td>,
    status: (
      <td key="status" className="p-3">
        <Badge status={
          row.status === "COMPLETE" || row.status === "END" ? "success" : 
          row.status === "PUBLISH" ? "info" : 
          row.status === "SUBMITTED" ? "warning" : 
          row.status === "WITHDRAWN" ? "error" : "default"
        }>
          {TASK_STATUS[row.status as keyof typeof TASK_STATUS] || row.status}
        </Badge>
      </td>
    ),
    creator: <td key="creator" className="p-3 text-slate-600">{row.creator}</td>,
    dueDate: <td key="dueDate" className="p-3 text-slate-600">{row.dueDate}</td>,
  });

  const colChildCellMap = (child: any, row: any): Record<string, React.ReactNode> => ({
    name: (
      <td key="name" className="p-3 text-slate-600 pl-10 flex items-center gap-2 relative">
        <div className="absolute left-5 top-0 w-3 h-1/2 border-l-2 border-b-2 border-slate-200 rounded-bl"></div>
        {child.deptName}
      </td>
    ),
    department: <td key="department" className="p-3 text-slate-600">{child.deptName}</td>,
    manager: <td key="manager" className="p-3 text-slate-600">{child.manager}</td>,
    status: (
      <td key="status" className="p-3">
        {child.status ? (
          <Badge status={
            child.status === "COMPLETE" || child.status === "END" ? "success" : 
            child.status === "PUBLISH" ? "info" : 
            child.status === "SUBMITTED" ? "warning" : 
            child.status === "WITHDRAWN" ? "error" : "default"
          }>
            {TASK_STATUS[child.status as keyof typeof TASK_STATUS] || child.status}
          </Badge>
        ) : <span className="text-slate-500">-</span>}
      </td>
    ),
    creator: <td key="creator" className="p-3 text-slate-500">-</td>,
    dueDate: <td key="dueDate" className="p-3 text-slate-500">-</td>,
  });

  return (
    <div className="p-5 flex flex-col space-y-4 h-full relative bg-[#f8fafc]">
      {/* Info Bar */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center text-blue-800 text-sm shadow-sm">
        <div className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center mr-2 shrink-0">
          <Info className="w-3.5 h-3.5 text-white" />
        </div>
        当前有您有14条存在待审核数据任务
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-5">
        
        {/* Left Stat Group */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-blue-50/10 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-800 font-bold mb-4 relative z-10 flex items-center">
            <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
            任务 / 所有数据
          </h3>
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex-1 bg-slate-50 rounded-lg p-4 flex flex-col">
              <span className="text-slate-500 text-sm mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 已完成任务</span>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">24</span>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-4 flex flex-col">
              <span className="text-slate-500 text-sm mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500"/> 填报中任务</span>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">110</span>
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col shadow-sm">
              <span className="text-blue-700 font-medium text-sm mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> 待审核任务</span>
              <span className="text-3xl font-bold text-blue-700 tracking-tight">14</span>
            </div>
          </div>
        </div>

        {/* Right Stat Group */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-indigo-50/10 rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-800 font-bold mb-4 relative z-10 flex items-center">
            <span className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></span>
            数据 / 所有数据
          </h3>
          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex-1 bg-slate-50 rounded-lg p-4 flex flex-col">
              <span className="text-slate-500 text-sm mb-1 flex items-center gap-1.5"><LayoutList className="w-4 h-4 text-slate-400"/> 待填报数据</span>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">341</span>
            </div>
            <div className="flex-1 bg-slate-50 rounded-lg p-4 flex flex-col">
              <span className="text-slate-500 text-sm mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500"/> 审核中数据</span>
              <span className="text-3xl font-bold text-slate-800 tracking-tight">192</span>
            </div>
            <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col shadow-sm">
              <span className="text-indigo-700 font-medium text-sm mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> 审核通过数据</span>
              <span className="text-3xl font-bold text-indigo-700 tracking-tight">15</span>
            </div>
          </div>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[400px] overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col border-b border-slate-100">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-slate-200 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden h-9 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] pl-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="请输入任务名称搜索..." 
                  className="w-72 bg-transparent border-none text-sm focus:outline-none focus:ring-0 px-2.5 text-slate-600 placeholder:text-slate-400 font-medium"
                  value={filterTaskName}
                  onChange={(e) => setFilterTaskName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && {}}
                />
                <button 
                  onClick={() => toast("搜索成功", "success")}
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
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <Button onClick={() => toast("查询成功", "success")} className="px-8 py-2 bg-[#1665ff] hover:bg-blue-700 text-white border-none shadow-md h-auto text-sm font-medium rounded-md">
                      查询
                    </Button>
                    <Button variant="ghost" onClick={() => { setFilterTaskName(""); setFilterStatus(""); toast("已重置", "success") }} className="px-8 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm h-auto text-sm font-medium rounded-md">
                      重置
                    </Button>
                    <button className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors shadow-sm" onClick={() => toast("切换视图")}>
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

        {/* Tree Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="font-medium p-3 w-10"></th>
                <th className="font-medium p-3 w-16">序号</th>
                {configurableColumns.filter(c => c.visible).map(c => colHeaderMap[c.key])}
                <th className="font-medium p-3 sticky right-0 bg-slate-50 z-10 shadow-[-1px_0_0_#e2e8f0]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((row) => (
                <React.Fragment key={row.id}>
                  {/* Master Row */}
                  <tr className="hover:bg-slate-50 transition-colors group bg-white">
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => toggleRow(row.id)}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
                      >
                        {expandedRow === row.id ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronRight className="w-3.5 h-3.5"/>}
                      </button>
                    </td>
                    <td className="p-3 text-slate-600">{row.index}</td>
                    {configurableColumns.filter(c => c.visible).map(c => colCellMap(row)[c.key])}
                    <td className="p-3 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-1px_0_0_#e2e8f0]">
                      <button 
                        onClick={() => openProgressModal(row)} 
                        className="text-blue-600 hover:text-blue-800 font-medium transition-opacity"
                      >
                        查看进度
                      </button>
                    </td>
                  </tr>

                  {/* Child Rows */}
                  <AnimatePresence>
                    {expandedRow === row.id && row.children.map((child: any) => (
                      <motion.tr 
                        key={child.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 hover:bg-slate-100 transition-colors group"
                      >
                        <td className="p-3 border-l-2 border-blue-500/20"></td>
                        <td className="p-3"></td>
                        {configurableColumns.filter(c => c.visible).map(c => colChildCellMap(child, row)[c.key])}
                        <td className="p-3 sticky right-0 bg-slate-50 group-hover:bg-slate-100 transition-colors z-10 shadow-[-1px_0_0_#e2e8f0]">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="h-7 px-3 py-0 text-xs shadow-sm bg-blue-600 hover:bg-blue-700 border-0"
                            onClick={() => navigate(`/data-review/audit/index?taskId=${row.id}&deptId=${child.deptId}`)}
                          >
                            查看
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={progressModalOpen} onClose={() => setProgressModalOpen(false)} title="进度查看" width="max-w-[900px]">
        <div className="relative">
          <div className="space-y-6 pt-2 pb-6 px-1">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              {/* Left Group */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-slate-700 tracking-tight">{progressModalStats.total}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">数据总条目</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-emerald-600 tracking-tight">{progressModalStats.filled}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">已完结</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-rose-500 tracking-tight">{progressModalStats.unfilled}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">未完结</div>
                </div>
              </div>

              {/* Right Group */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-slate-700 tracking-tight">{progressModalStats.total}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">涉及科室</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-emerald-600 tracking-tight">{progressModalStats.filled}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">已完结</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-rose-500 tracking-tight">{progressModalStats.unfilled}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">未完结</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center flex-1">
                  <div className="text-2xl font-black text-blue-600 tracking-tight">{progressModalStats.amount}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">违规金额</div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mt-2">
              <div className="w-48 relative">
                <select 
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none text-slate-600 cursor-pointer"
                >
                  <option value="">全部进度</option>
                  {!progressModalStats.isDeduction && <option value="审核通过">审核通过</option>}
                  {!progressModalStats.isDeduction && <option value="填报中">填报中</option>}
                  {!progressModalStats.isDeduction && <option value="未填报">未填报</option>}
                  {progressModalStats.isDeduction && <option value="已读确认">已读确认</option>}
                  {progressModalStats.isDeduction && <option value="未读">未读</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              
              <Button onClick={handleBatchUrge} className="bg-blue-600 hover:bg-blue-700">
                <Bell className="w-4 h-4 mr-1.5"/>一键催办
              </Button>
            </div>

            {/* Progress Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mt-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        onChange={handleSelectAll}
                        checked={filteredProgressData.length > 0 && filteredProgressData.filter(item => item.progress === "未填报").length > 0 && selectedProgressIds.length === filteredProgressData.filter(item => item.progress === "未填报").length}
                      />
                    </th>
                    <th className="px-4 py-3 w-16">序号</th>
                    <th className="px-4 py-3">科室</th>
                    <th className="px-4 py-3">违规金额</th>
                    <th className="px-4 py-3">专管员</th>
                    <th className="px-4 py-3">填报进度</th>
                    <th className="px-4 py-3 sticky right-0 bg-slate-50 z-10 shadow-[-1px_0_0_#e2e8f0]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProgressData.map((row) => {
                    const isUnfilled = row.progress === "未填报" || row.progress === "未读";
                    return (
                      <tr key={row.id} className="bg-white hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedProgressIds.includes(row.id)}
                            onChange={() => handleSelect(row.id)}
                            disabled={!isUnfilled}
                            className={`rounded border-slate-300 focus:ring-blue-500 focus:ring-offset-0 ${!isUnfilled ? 'opacity-40 cursor-not-allowed' : 'text-blue-600'}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-500">{row.index}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{row.department}</td>
                        <td className="px-4 py-3 text-slate-600">¥ {row.amount}</td>
                        <td className="px-4 py-3 text-slate-600">{row.manager}</td>
                        <td className="px-4 py-3">
                          <Badge status={getProgressBadgeStatus(row.progress)}>{row.progress}</Badge>
                        </td>
                        <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-1px_0_0_#e2e8f0]">
                          <button 
                            className={`text-sm font-medium transition-opacity ${isUnfilled ? 'text-blue-600 hover:text-blue-800' : 'text-slate-300 cursor-not-allowed'}`}
                            disabled={!isUnfilled}
                            onClick={() => handleSingleUrge(row.id)}
                          >
                            催办
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-center pt-2">
               <Button variant="outline" className="px-8 bg-slate-50" onClick={() => setProgressModalOpen(false)}>关 闭</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="系统提示" width="max-w-[400px]">
        <div className="py-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-blue-50 text-blue-600">
               <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed py-2">
              确定催办吗？
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmModalOpen(false)}>取消</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmSingleUrge}>确定</Button>
          </div>
        </div>
      </Modal>

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
    </div>
  );
}

