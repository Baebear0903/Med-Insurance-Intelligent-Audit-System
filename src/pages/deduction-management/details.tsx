import React, { useState, useEffect } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Settings, RotateCcw, ArrowDownToLine, Plus } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { Modal } from "@/src/components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { ImportDeductionModal } from "./ImportDeductionModal";

// --- Types ---
interface TaskSummary {
  id: string;
  name: string;
  businessCategory: string;
  belongingMonth: string;
  deductibleCount: number;
  totalViolationAmount: number;
  totalDeductionAmount: number;
  taskIds: string[];
  isNew: boolean;
  isManual?: boolean;
}

import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";

// --- Helper Functions ---

export default function DeductionDetails() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  
  // Get latest categories dynamically on render
  const businessCategories = getInsuranceCategories().filter(c => c.enabled).map(c => c.categoryName);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState("");
  const [filterBelongingMonth, setFilterBelongingMonth] = useState("");
  
  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // Modal
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<"manual" | "batch" | "update">("manual");
  const [currentUpdateTaskId, setCurrentUpdateTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const allTemplates = mockApi.getTemplates();
      // "扣减明细" lists tasks, maybe it uses TPL_GZ_YB as before.
      const validTasks = allTasks.filter(t => t.templateId === "TPL_GZ_YB" && t.status === "END" && !t.parentId);
      
      const viewedIds = JSON.parse(localStorage.getItem("viewed_deduction_tasks") || "[]");

      const groups: Record<string, TaskSummary> = {};

      validTasks.forEach(t => {
        const template = allTemplates.find(tpl => tpl.id === t.templateId);
        const bc = t.businessCategory || template?.businessCategory || "广州医保（线下）";
        const month = t.belongingMonth || "-";
        const groupId = t.isManual ? t.id : `${bc}_${month}`;

        if (!groups[groupId]) {
          groups[groupId] = {
            id: groupId,
            name: t.isManual ? t.name : `${bc} ${month} 扣减明细`,
            businessCategory: bc,
            belongingMonth: month,
            deductibleCount: 0,
            totalViolationAmount: 0,
            totalDeductionAmount: 0,
            taskIds: [],
            isNew: false,
            isManual: t.isManual
          };
        }

        const details = mockApi.getTaskDetailRecords(t.id, false);
        const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);

        let sumViolation = 0;
        let sumDeduction = 0;
        validDetails.forEach(d => {
          sumViolation += Number(d.VIOLATION_AMOUNT) || 0;
          sumDeduction += (Number(d._DEDUCTION_MED_COM) || 0) + (Number(d._DEDUCTION_OTHER) || 0); // or _DEDUCTION_AMOUNT
        });

        groups[groupId].deductibleCount += validDetails.length;
        groups[groupId].totalViolationAmount += sumViolation;
        groups[groupId].totalDeductionAmount += sumDeduction;
        groups[groupId].taskIds.push(t.id);
        
        if (!viewedIds.includes(groupId)) {
          groups[groupId].isNew = true;
        }
      });

      setTasks(Object.values(groups));
      
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
    let allDetails: any[] = [];
    task.taskIds.forEach(tId => {
      const details = mockApi.getTaskDetailRecords(tId, false);
      const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);
      allDetails = allDetails.concat(validDetails);
    });
    exportToExcel(allDetails, `${task.name}明细.xlsx`);
    toast("下载完成", "success");
  };

  const handleMergeDownloadClick = () => {
    if (selectedRowKeys.length === 0) {
      toast("请先选择需要合并下载的任务", "info");
      return;
    }
    setIsMergeModalOpen(true);
  };

  const handleCreateTask = () => {
    setImportMode("manual");
    setIsImportModalOpen(true);
  };

  const handleBatchImport = () => {
    setImportMode("batch");
    setIsImportModalOpen(true);
  };

  const handleUpdateTask = (taskId: string) => {
    setCurrentUpdateTaskId(taskId);
    setImportMode("update");
    setIsImportModalOpen(true);
  };

  const handleImportConfirm = (taskName: string | null, _file: File, category?: string, belongingMonth?: string) => {
    // 根据需求，生成随机数来充当扣减的记录数和金额
    const recordCount = Math.floor(Math.random() * 16) + 5; // 5 to 20 records
    const fakeRecords = Array.from({ length: recordCount }).map((_, i) => {
      const deduction = Math.floor(Math.random() * 5000) + 100;
      return {
        id: `DED_CUSTOM_${Date.now()}_${i}`,
        data: {
          IS_APPEAL: "否",
          VIOLATION_AMOUNT: deduction + Math.floor(Math.random() * 1000),
          _DEDUCTION_MED_COM: deduction,
          _DEDUCTION_OTHER: 0,
          PATIENT_NAME: `患者${Math.floor(Math.random() * 1000)}`,
          MEDICAL_CATEGORY: category || "普通门诊",
          DEDUCTION_REASON: "违规扣减",
          DEPARTMENT: "内科"
        }
      };
    });

    if (importMode === "manual" || importMode === "batch") {
      const generatedCategory = category || "未知分类";
      const generatedMonth = belongingMonth || new Date().toISOString().slice(0,7);
      const name = taskName || "导入的扣减明细";
      
      const newTask = mockApi.addTask(name, "TPL_GZ_YB", generatedCategory, generatedMonth, importMode === "manual");
      mockApi.updateTaskDetails(newTask.id, fakeRecords);
      toast("扣减明细导入成功", "success");
    } else if (importMode === "update" && currentUpdateTaskId) {
      mockApi.updateTaskDetails(currentUpdateTaskId, fakeRecords);
      toast("扣减明细更新成功", "success");
    }

    setIsImportModalOpen(false);
    loadTasks();
  };

  const executeMergeDownload = () => {
    const selectedTasks = tasks.filter(t => selectedRowKeys.includes(t.id));
    let allDetails: any[] = [];
    selectedTasks.forEach(task => {
      task.taskIds.forEach(tId => {
        const details = mockApi.getTaskDetailRecords(tId, false);
        const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);
        allDetails = allDetails.concat(validDetails);
      });
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

  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [configurableColumns, setConfigurableColumns] = useState<ColumnItem[]>([
    { key: "businessCategory", title: "医保业务分类", visible: true },
    { key: "belongingMonth", title: "所属年月", visible: true },
    { key: "deductibleCount", title: "可扣减记录数", visible: true },
    { key: "totalDeductionAmount", title: "扣减金额合计 (元)", visible: true }
  ]);

  const filteredTasks = tasks.filter(t => 
    (filterMonth ? t.businessCategory === filterMonth : true) &&
    (filterBelongingMonth ? t.belongingMonth === filterBelongingMonth : true)
  );

  const selectedTaskObjects = tasks.filter(t => selectedRowKeys.includes(t.id));
  const mergeTotalRecords = selectedTaskObjects.reduce((acc, t) => acc + t.deductibleCount, 0);
  const mergeTotalDeduction = selectedTaskObjects.reduce((acc, t) => acc + t.totalDeductionAmount, 0);
  const uniqueMonths = Array.from(new Set(selectedTaskObjects.map(t => t.businessCategory))).join("、");

  const columns: Column<TaskSummary>[] = [
    { key: "index", title: "序号", width: "70px", render: (_, idx) => idx + 1 },
    ...configurableColumns.filter(c => c.visible).map(c => {
      let align: "right" | "center" | "left" | undefined = undefined;
      let width: string | undefined = undefined;
      let render: ((r: TaskSummary) => React.ReactNode) | undefined = undefined;

      if (c.key === "name") {
        width = "250px";
        render = (r) => (
          <div className="flex items-center space-x-2">
            <span className="truncate">{r.name}</span>
            {r.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 select-none">
                NEW
              </span>
            )}
          </div>
        );
      } else if (c.key === "businessCategory") {
        width = "160px";
        render = (r) => (
          <div className="flex items-center space-x-2">
            <span className="truncate">{r.businessCategory}</span>
            {r.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 select-none">
                NEW
              </span>
            )}
          </div>
        );
      } else if (c.key === "belongingMonth") {
        width = "120px";
        render = (r) => r.belongingMonth;
      } else if (c.key === "deductibleCount") {
        width = "130px";
        align = "center";
      } else if (c.key === "totalDeductionAmount") {
        width = "160px";
        align = "right";
        render = (r) => r.totalDeductionAmount.toFixed(2);
      }
      return { key: c.key, title: c.title, width, align, render };
    }),
    { key: "action", title: "操作", width: "220px", align: "left", fixed: "right", render: (r) => (
      <div className="flex items-center justify-start space-x-3">
        <button onClick={() => handleView(r.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">查看详情</button>
        <button onClick={() => handleMockDownload(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">下载明细</button>
        <button onClick={() => handleUpdateTask(r.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">导入更新</button>
        {r.id.startsWith("T_CUSTOM_") && (
          <button 
            onClick={() => {
              if (window.confirm("确定要删除该扣减明细吗？")) {
                mockApi.deleteTask(r.id);
                toast("删除成功", "success");
                loadTasks();
              }
            }} 
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            删除
          </button>
        )}
      </div>
    )}
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
         <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
              <select 
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="bg-transparent text-sm w-36 outline-none text-slate-700" 
              >
                <option value="">全部业务分类</option>
                {businessCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
              <input 
                type="month" 
                value={filterBelongingMonth}
                onChange={e => setFilterBelongingMonth(e.target.value)}
                className="bg-transparent text-sm w-36 outline-none text-slate-700" 
              />
            </div>
            <div className="flex items-center space-x-2 pl-2">
               <Button variant="primary" size="sm" onClick={() => {}}>查询</Button>
               <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setFilterMonth(""); setFilterBelongingMonth(""); }}>
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
              <Button variant="primary" size="sm" onClick={handleCreateTask} className="gap-2">
                <Plus className="w-4 h-4" />
                手动新增
              </Button>
              <Button variant="outline" size="sm" onClick={handleBatchImport} className="gap-2">
                <ArrowDownToLine className="w-4 h-4" />
                批量导入
              </Button>
              <Button variant="outline" size="sm" onClick={handleMergeDownloadClick} className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                <ArrowDownToLine className="w-4 h-4" />
                合并下载
              </Button>
              <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors" onClick={() => setIsColumnSettingsOpen(true)}>
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
                 <div className="text-xs text-slate-500 mb-1">包含分类</div>
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
                         <th className="px-4 py-2 bg-slate-50">医保业务分类</th>
                         <th className="px-4 py-2 bg-slate-50">所属年月</th>
                         <th className="px-4 py-2 text-center bg-slate-50">可扣减记录数</th>
                         <th className="px-4 py-2 text-right bg-slate-50">扣减金额合计 (元)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                       {selectedTaskObjects.map(t => (
                         <tr key={t.id} className="hover:bg-slate-50">
                           <td className="px-4 py-3">{t.businessCategory}</td>
                           <td className="px-4 py-3">{t.belongingMonth}</td>
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
      <ColumnSettingsModal
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        columns={configurableColumns as ColumnItem[]}
        onSave={(newCols) => {
          setConfigurableColumns(newCols);
          setIsColumnSettingsOpen(false);
        }}
      />
      <ImportDeductionModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        mode={importMode}
        onConfirm={handleImportConfirm}
      />
    </div>
  );
}

