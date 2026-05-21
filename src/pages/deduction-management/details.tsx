import React, { useState, useEffect, useMemo } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Pagination } from "@/src/components/ui/Pagination";
import { Download, Search, Settings, RotateCcw, ArrowLeft, ArrowDownToLine } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { Modal } from "@/src/components/ui/Modal";
import { useNavigate } from "react-router-dom";

// --- Types ---
interface TaskSummary {
  id: string;
  name: string;
  month: string;
  deductibleCount: number;
  totalViolationAmount: number;
  totalDeductionAmount: number;
  isNew: boolean;
}

// --- Helper Functions ---
const extractMonthFromTaskName = (name: string) => {
  const match = name.match(/\d{4}年\d{2}月/);
  return match ? match[0] : "";
};

export default function DeductionDetails() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState("");
  const [filterName, setFilterName] = useState("");
  
  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // Modal
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const validTasks = allTasks.filter(t => t.templateId === "TPL_GZ_YB" && t.status === "END" && !t.parentId);
      
      const viewedIds = JSON.parse(localStorage.getItem("viewed_deduction_tasks") || "[]");

      const taskSummaries: TaskSummary[] = validTasks.map(t => {
        const details = mockApi.getTaskDetailRecords(t.id);
        const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);
        
        let sumViolation = 0;
        let sumDeduction = 0;
        validDetails.forEach(d => {
          sumViolation += Number(d.VIOLATION_AMOUNT) || 0;
          sumDeduction += (Number(d._DEDUCTION_MED_COM) || 0) + (Number(d._DEDUCTION_OTHER) || 0); // or _DEDUCTION_AMOUNT
        });

        return {
          id: t.id,
          name: t.name,
          month: extractMonthFromTaskName(t.name) || (t.createTime.substring(0, 7).replace('-', '年') + '月'),
          deductibleCount: validDetails.length,
          totalViolationAmount: sumViolation,
          totalDeductionAmount: sumDeduction,
          isNew: !viewedIds.includes(t.id)
        };
      }).sort((a,b) => (a.month > b.month ? -1 : 1));

      setTasks(taskSummaries);
      setIsLoading(false);
    }, 300);
  };

  const handleView = (id: string) => {
    const viewedIds = JSON.parse(localStorage.getItem("viewed_deduction_tasks") || "[]");
    if (!viewedIds.includes(id)) {
      viewedIds.push(id);
      localStorage.setItem("viewed_deduction_tasks", JSON.stringify(viewedIds));
    }
    // Update local state to remove NEW badge
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isNew: false } : t));
    navigate(`/deduction-management/task-details/index?taskId=${id}`);
  };

  const handleMockDownload = (task: TaskSummary) => {
    const details = mockApi.getTaskDetailRecords(task.id);
    const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);
    exportToExcel(validDetails, `${task.name}明细.xlsx`);
    toast("下载完成", "success");
  };

  const handleMergeDownloadClick = () => {
    if (selectedRowKeys.length === 0) {
      toast("请先选择需要合并下载的任务", "info");
      return;
    }
    setIsMergeModalOpen(true);
  };

  const executeMergeDownload = () => {
    const selectedTasks = tasks.filter(t => selectedRowKeys.includes(t.id));
    let allDetails: any[] = [];
    selectedTasks.forEach(task => {
      const details = mockApi.getTaskDetailRecords(task.id);
      const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);
      allDetails = allDetails.concat(validDetails);
    });

    if (allDetails.length === 0) {
      toast("所选任务缺少可扣减金额", "info");
      setIsMergeModalOpen(false);
      return;
    }

    exportToExcel(allDetails, "合并扣减明细.xlsx");
    toast("合并扣减明细下载完成", "success");
    setIsMergeModalOpen(false);
    setSelectedRowKeys([]);
  };

  const filteredTasks = tasks.filter(t => 
    (filterMonth ? t.month.includes(filterMonth) : true) &&
    (filterName ? t.name.includes(filterName) : true)
  );

  const selectedTaskObjects = tasks.filter(t => selectedRowKeys.includes(t.id));
  const mergeTotalRecords = selectedTaskObjects.reduce((acc, t) => acc + t.deductibleCount, 0);
  const mergeTotalViolation = selectedTaskObjects.reduce((acc, t) => acc + t.totalViolationAmount, 0);
  const mergeTotalDeduction = selectedTaskObjects.reduce((acc, t) => acc + t.totalDeductionAmount, 0);
  const uniqueMonths = Array.from(new Set(selectedTaskObjects.map(t => t.month))).join("、");

  const columns: Column<TaskSummary>[] = [
    { key: "index", title: "序号", width: "70px", render: (_, idx) => idx + 1 },
    { key: "name", title: "任务名称", width: "250px", render: (r) => (
      <div className="flex items-center space-x-2">
        <span className="truncate">{r.name}</span>
        {r.isNew && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 select-none">
            NEW
          </span>
        )}
      </div>
    )},
    { key: "month", title: "数据时间", width: "120px" },
    { key: "deductibleCount", title: "可扣减记录数", width: "130px", align: "center" },
    { key: "totalDeductionAmount", title: "扣减金额合计 (元)", width: "160px", align: "right", render: (r) => r.totalDeductionAmount.toFixed(2) },
    { key: "action", title: "操作", width: "160px", align: "center", fixed: "right", render: (r) => (
      <div className="flex items-center justify-center space-x-3">
        <button onClick={() => handleView(r.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">查看明细</button>
        <button onClick={() => handleMockDownload(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">下载明细</button>
      </div>
    )}
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="查询年份/月份" 
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm w-32 outline-none text-slate-700" 
              />
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="任务名称" 
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                className="bg-transparent text-sm w-60 outline-none text-slate-700" 
              />
            </div>
            <div className="flex items-center space-x-2 pl-2">
               <Button variant="primary" size="sm" onClick={() => {}}>查询</Button>
               <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setFilterMonth(""); setFilterName(""); }}>
                 <RotateCcw className="w-3.5 h-3.5" />
                 重置
               </Button>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-md shadow-sm border border-slate-200 min-h-0">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
           <h2 className="text-base font-semibold text-slate-800">医保扣减清单</h2>
           <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleMergeDownloadClick} className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                <ArrowDownToLine className="w-4 h-4" />
                合并下载
              </Button>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <Table 
             data={filteredTasks} 
             columns={columns} 
             rowKey={r => r.id} 
             selectable 
             selectedRowKeys={selectedRowKeys}
             onSelectChange={setSelectedRowKeys}
          />
        </div>
      </div>

      {/* Merge Modal */}
      <Modal isOpen={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} title="合并下载统计" width="max-w-3xl">
         <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div>
                 <div className="text-xs text-slate-500 mb-1">选择任务数</div>
                 <div className="font-semibold text-slate-800 text-lg">{selectedTaskObjects.length} 个</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">包含月份</div>
                 <div className="font-semibold text-slate-800 truncate" title={uniqueMonths}>{uniqueMonths}</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">记录总数</div>
                 <div className="font-semibold text-slate-800 text-lg">{mergeTotalRecords} 条</div>
               </div>
               <div>
                 <div className="text-xs text-slate-500 mb-1">扣减合计</div>
                 <div className="font-semibold items-baseline flex gap-1 text-red-600">
                    <span className="text-lg">{mergeTotalDeduction.toFixed(2)}</span>
                    <span className="text-xs font-normal">元</span>
                 </div>
               </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-800 mb-3">将合并以下任务信息：</h3>
               <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                 <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600">
                       <tr>
                         <th className="px-4 py-2 bg-slate-50">任务名称</th>
                         <th className="px-4 py-2 bg-slate-50">数据时间</th>
                         <th className="px-4 py-2 text-center bg-slate-50">可扣减记录数</th>
                         <th className="px-4 py-2 text-right bg-slate-50">扣减金额合计 (元)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                       {selectedTaskObjects.map(t => (
                         <tr key={t.id} className="hover:bg-slate-50">
                           <td className="px-4 py-3">{t.name}</td>
                           <td className="px-4 py-3">{t.month}</td>
                           <td className="px-4 py-3 text-center">{t.deductibleCount}</td>
                           <td className="px-4 py-3 text-right">{t.totalDeductionAmount.toFixed(2)}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
               <Button variant="outline" onClick={() => setIsMergeModalOpen(false)}>取消</Button>
               <Button variant="primary" onClick={executeMergeDownload}>确认并导出 Excel</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}

