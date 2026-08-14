import React, { useState, useEffect, useRef } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { Settings, RotateCcw, ArrowDownToLine, Plus, ChevronDown, FileText, Upload } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { Modal } from "@/src/components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { ImportDeductionModal } from "./ImportDeductionModal";
import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";
import { addImportRecord } from "./import-records/index";
import { cn } from "@/src/lib/utils";

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

export default function DeductionDetails() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  
  // Get latest categories dynamically on render
  const configCategories = getInsuranceCategories().filter(c => c.enabled).map(c => c.categoryName);
  
  // Filters
  const [filterMonth, setFilterMonth] = useState("");
  const [filterBelongingMonth, setFilterBelongingMonth] = useState("");
  
  // Selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // Modal & Dropdown
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<"manual" | "batch">("manual");
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsImportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadTasks = () => {
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const allTemplates = mockApi.getTemplates();
      // "扣减明细" lists deduction management tasks
      const validTasks = allTasks.filter(t => 
        (t.templateId === "TPL_GZ_YB" || t.templateId === "TPL_DED" || t.templateId === "TPL_DED_CUSTOM" || t.isDeductionOnly || t.isManual) && 
        t.status === "END" && 
        !t.parentId
      );
      
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
        const validDetails = details.filter(d => d.data && (d.data.IS_APPEAL === "不申诉" || d.data.IS_APPEAL === "否" || d.data._PROJECT_CLASS)).map(d => d.data);

        let sumViolation = 0;
        let sumDeduction = 0;
        validDetails.forEach(d => {
          sumViolation += Number(d.VIOLATION_AMOUNT) || 0;
          sumDeduction += (Number(d._DEDUCTION_MED_COM) || 0) + (Number(d._DEDUCTION_OTHER) || 0) || (Number(d._DEDUCTION_AMOUNT) || 0);
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
      const validDetails = details.filter(d => d.data && (d.data.IS_APPEAL === "否" || d.data._PROJECT_CLASS)).map(d => d.data);
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

  const handleBatchImportClick = () => {
    setIsImportDropdownOpen(false);
    setImportMode("batch");
    setIsImportModalOpen(true);
  };

  const handleNavigateToImportRecords = () => {
    setIsImportDropdownOpen(false);
    navigate("/deduction-management/import-records/index");
  };

  const handleImportConfirm = (taskName: string | null, file: File, category?: string, belongingMonth?: string) => {
    const month = belongingMonth || new Date().toISOString().slice(0, 7);

    if (importMode === "batch") {
      // 批量导入：导入医保业务分类配置中已启用的分类对应的扣减数据，只在院内扣减管理模块生效
      const enabledCategories = getInsuranceCategories().filter(c => c.enabled);
      
      if (enabledCategories.length === 0) {
        toast("未找到已启用的医保业务分类配置", "error");
        setIsImportModalOpen(false);
        return;
      }

      enabledCategories.forEach((cat) => {
        const recordCount = Math.floor(Math.random() * 12) + 5; // 5 to 16 records
        const fakeRecords = Array.from({ length: recordCount }).map((_, i) => {
          const deduction = Math.floor(Math.random() * 4000) + 200;
          const dMedCom = Math.floor(deduction * 0.6);
          const dOther = deduction - dMedCom;
          return {
            id: `DED_BATCH_${Date.now()}_${cat.id}_${i}`,
            data: {
              IS_APPEAL: "否",
              VIOLATION_AMOUNT: (deduction + Math.floor(Math.random() * 800)).toFixed(2),
              _PERSON_CATEGORY: cat.personnelCategory,
              _IS_ONLINE: cat.onlineOffline,
              _DEDUCTION_AMOUNT: deduction,
              _DEDUCTION_MED_COM: dMedCom,
              _DEDUCTION_OTHER: dOther,
              PATIENT_NAME: `患者${Math.floor(Math.random() * 9000) + 1000}`,
              ID_CARD: `44010619${Math.floor(Math.random() * 30 + 70)}${month.replace("-", "")}${1000 + i}`,
              HOSPITAL_NO: `ZY${month.replace("-", "")}${100 + i}`,
              ADMIT_DATE: `${month}-01`,
              DISCHARGE_DATE: `${month}-12`,
              MEDICAL_CATEGORY: cat.onlineOffline === "线上" ? "普通门诊" : "住院",
              PROJECT_NAME: i % 2 === 0 ? "血常规" : "CT检查",
              DEDUCTION_REASON: "违规扣减",
              ORDER_DEPT: i % 2 === 0 ? "内科" : "外科",
              DOCTOR_NAME: i % 2 === 0 ? "王医生" : "李医生",
              _DEDUCTION_TARGET: i % 2 === 0 ? "内科" : "外科",
              _DATA_SOURCE: `${month}批量导入扣减明细`
            }
          };
        });

        const task = mockApi.addTask(
          `${cat.categoryName} ${month} 扣减明细`,
          "TPL_DED_CUSTOM",
          cat.categoryName,
          month,
          false,
          true // isDeductionOnly = true: only in 院内扣减管理
        );
        mockApi.updateTaskDetails(task.id, fakeRecords);
      });

      // 记录到导入记录
      addImportRecord({
        fileName: file ? file.name : `扣减明细_${month}.xlsx`,
        fileSize: file ? `${(file.size / 1024).toFixed(0)}kb` : "28kb",
        operator: "当前用户",
        uploadTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        status: "全部通过"
      });

      toast(`批量导入成功，已为 ${enabledCategories.length} 个医保业务分类生成 ${month} 扣减明细`, "success");
    } else if (importMode === "manual") {
      // 手动新增：医保业务分类支持手动自定义文本，只在院内扣减管理模块生效
      const customCategory = category || "自定义业务分类";
      const recordCount = Math.floor(Math.random() * 12) + 5;
      const fakeRecords = Array.from({ length: recordCount }).map((_, i) => {
        const deduction = Math.floor(Math.random() * 5000) + 100;
        const dMedCom = Math.floor(deduction * 0.6);
        const dOther = deduction - dMedCom;
        return {
          id: `DED_CUSTOM_${Date.now()}_${i}`,
          data: {
            IS_APPEAL: "不申诉",
            VIOLATION_AMOUNT: (deduction + Math.floor(Math.random() * 1000)).toFixed(2),
            _DEDUCTION_AMOUNT: deduction,
            _DEDUCTION_MED_COM: dMedCom,
            _DEDUCTION_OTHER: dOther,
            PATIENT_NAME: `患者${Math.floor(Math.random() * 9000) + 1000}`,
            ID_CARD: `44010619${Math.floor(Math.random() * 30 + 70)}${month.replace("-", "")}${1000 + i}`,
            HOSPITAL_NO: `ZY${month.replace("-", "")}${100 + i}`,
            ADMIT_DATE: `${month}-01`,
            DISCHARGE_DATE: `${month}-12`,
            MEDICAL_CATEGORY: "普通门诊",
            PROJECT_NAME: "诊疗检查",
            DEDUCTION_REASON: "违规扣减",
            ORDER_DEPT: "内科",
            DOCTOR_NAME: "赵医生",
            _DEDUCTION_TARGET: "内科",
            _DATA_SOURCE: `${customCategory} ${month} 手动新增`
          }
        };
      });

      const newTask = mockApi.addTask(
        taskName || `${customCategory} ${month} 手动新增明细`,
        "TPL_DED_CUSTOM",
        customCategory,
        month,
        true, // isManual
        true // isDeductionOnly
      );
      mockApi.updateTaskDetails(newTask.id, fakeRecords);

      // 记录到导入记录
      addImportRecord({
        fileName: file ? file.name : `${customCategory}_${month}.xlsx`,
        fileSize: file ? `${(file.size / 1024).toFixed(0)}kb` : "24kb",
        operator: "当前用户",
        uploadTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        status: "全部通过"
      });

      toast("手动新增扣减明细成功", "success");
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
        const validDetails = details.filter(d => d.data && (d.data.IS_APPEAL === "否" || d.data._PROJECT_CLASS)).map(d => d.data);
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

  const allAvailableCategories = Array.from(new Set([...configCategories, ...tasks.map(t => t.businessCategory)]));

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
        width = "180px";
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
    { key: "action", title: "操作", width: "180px", align: "left", fixed: "right", render: (r) => (
      <div className="flex items-center justify-start space-x-3">
        <button onClick={() => handleView(r.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">查看详情</button>
        <button onClick={() => handleMockDownload(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">下载明细</button>
        {r.isManual && (
          <button 
            onClick={() => {
              if (window.confirm("确定要删除该扣减明细吗？")) {
                r.taskIds.forEach(id => mockApi.deleteTask(id));
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
          <div className="flex items-center space-x-3">
            <div className="w-48">
              <Select
                value={filterMonth}
                onChange={val => setFilterMonth(val || "")}
                placeholder="全部业务分类"
                size="sm"
                allowClear
                options={[
                  { label: "全部业务分类", value: "" },
                  ...allAvailableCategories.map(cat => ({ label: cat, value: cat }))
                ]}
              />
            </div>
            <div className="flex items-center bg-white border border-slate-300 rounded px-2.5 h-8 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input 
                type="month" 
                value={filterBelongingMonth}
                onChange={e => setFilterBelongingMonth(e.target.value)}
                className="bg-transparent text-xs outline-none text-slate-700 w-32" 
              />
            </div>
            <div className="flex items-center space-x-2 pl-1">
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
           <div className="flex items-center space-x-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateTask}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>手动新增</span>
              </Button>
              
              {/* 批量导入下拉按钮 */}
              <div className="relative inline-block text-left" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsImportDropdownOpen(!isImportDropdownOpen)}
                  className={cn(
                    "h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium rounded border transition-all cursor-pointer select-none",
                    isImportDropdownOpen
                      ? "border-[#1677ff] text-[#1677ff] bg-blue-50/50"
                      : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400"
                  )}
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>批量导入</span>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-slate-400 transition-transform duration-200",
                      isImportDropdownOpen && "rotate-180 text-blue-500"
                    )}
                  />
                </button>

                {isImportDropdownOpen && (
                  <div className="absolute left-0 w-full min-w-[110px] mt-1 bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.06)] border border-slate-100 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                    <button
                      onClick={handleBatchImportClick}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>批量导入</span>
                    </button>
                    <button
                      onClick={handleNavigateToImportRecords}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>导入记录</span>
                    </button>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleMergeDownloadClick}
                className="gap-1.5 text-[#1677ff] border-blue-200 hover:bg-blue-50"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-[#1677ff]" />
                <span>合并下载</span>
              </Button>
              <button 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer" 
                onClick={() => setIsColumnSettingsOpen(true)}
                title="表格列设置"
              >
                <Settings className="w-4 h-4" />
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
                 <Table<any> 
                   columns={[
                     { key: "name", title: "任务名称" },
                     { key: "businessCategory", title: "医保业务分类" },
                     { key: "belongingMonth", title: "所属年月" },
                     { key: "deductibleCount", title: "可扣减记录数", align: "center" },
                     { key: "totalDeductionAmount", title: "扣减金额合计 (元)", align: "right", render: (r: any) => r.totalDeductionAmount.toFixed(2) }
                   ]}
                   data={selectedTaskObjects}
                   rowKey={(r: any) => r.id}
                 />
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
