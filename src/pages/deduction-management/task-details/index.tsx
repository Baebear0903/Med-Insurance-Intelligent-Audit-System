import React, { useState, useEffect } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Pagination } from "@/src/components/ui/Pagination";
import { Download, Settings, ArrowLeft } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";
import { generateManualDeductionRecords, getAvailableManualScenarios } from "@/src/lib/manualDeductionHelper";

// --- Helper Functions ---

interface TaskSummary {
  id: string;
  name: string;
  businessCategory: string;
  belongingMonth?: string;
  deductibleCount: number;
  totalViolationAmount: number;
  totalDeductionAmount: number;
  isNew: boolean;
  isManual?: boolean;
}

const BASE_COLUMNS: ColumnItem[] = [
  { key: "index", title: "序号", visible: true },
  { key: "_PERSON_CATEGORY", title: "人员类别", visible: true },
  { key: "_IS_ONLINE", title: "线上/线下", visible: true },
  { key: "HOSPITAL_NO", title: "住院号/门诊号", visible: true },
  { key: "PATIENT_NAME", title: "患者姓名", visible: true },
  { key: "ID_CARD", title: "证件号码", visible: true },
  { key: "ADMIT_DATE", title: "入院时间", visible: true },
  { key: "DISCHARGE_DATE", title: "出院时间", visible: true },
  { key: "MEDICAL_CATEGORY", title: "医疗类别", visible: true },
  { key: "PROJECT_NAME", title: "扣款项目", visible: true },
  { key: "VIOLATION_AMOUNT", title: "违规金额（单位：元）", visible: true },
  { key: "VIOLATION_DESC", title: "扣减原因", visible: true },
  { key: "ORDER_DEPT", title: "涉及科室", visible: true },
  { key: "DOCTOR_NAME", title: "涉及医生", visible: true },
  { key: "_DEDUCTION_TARGET", title: "扣减科室或个人", visible: true },
  { key: "VIOLATION_AMOUNT_2", title: "违规金额", visible: true },
  { key: "_DEDUCTION_AMOUNT", title: "扣减科室/个人金额", visible: true },
  { key: "_DEDUCTION_MED_COM", title: "扣减金额（药费/耗材）", visible: true },
  { key: "_DEDUCTION_OTHER", title: "扣减金额（其它）", visible: true },
  { key: "_PROJECT_CLASS", title: "项目分类", visible: true },
  { key: "REMARK", title: "备注", visible: true },
  { key: "IS_APPEAL", title: "是否申诉/同意扣减", visible: true },
  { key: "_DATA_SOURCE", title: "数据来源", visible: true },
];

export default function DeductionTaskDetails() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);

  // Column settings
  const [columnsSettings, setColumnsSettings] = useState<ColumnItem[]>(BASE_COLUMNS);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    const allTasks = mockApi.getTasks(1, 1000).data;
    let matchedTasks = allTasks.filter(t => t.id === taskId);
    
    let bc = "";
    let month = "";

    if (matchedTasks.length === 0 && taskId.includes("_")) {
      const parts = taskId.split("_");
      bc = parts.slice(0, -1).join("_");
      month = parts[parts.length - 1];
      
      const allTemplates = mockApi.getTemplates();
      matchedTasks = allTasks.filter(t => {
        if (t.status !== "END" || t.parentId) return false;
        const template = allTemplates.find(tpl => tpl.id === t.templateId);
        const tBc = t.businessCategory || template?.businessCategory || "广州医保（线下）";
        const tMonth = t.belongingMonth || "-";
        return tBc === bc && tMonth === month;
      });
    } else if (matchedTasks.length > 0) {
      const t = matchedTasks[0];
      const allTemplates = mockApi.getTemplates();
      const template = allTemplates.find(tpl => tpl.id === t.templateId);
      bc = t.businessCategory || template?.businessCategory || "广州医保（线下）";
      month = t.belongingMonth || "-";
    }

    let allRawDetails: any[] = [];
    matchedTasks.forEach(t => {
      let details = mockApi.getTaskDetailRecords(t.id, true);
      // 如果是手动新增或扣减明细任务且暂无明细数据，自动补全演示数据
      if ((!details || details.length === 0) && (t.isManual || t.isDeductionOnly || t.templateId === "TPL_DED_CUSTOM" || t.id.startsWith("T_CUSTOM_"))) {
        details = generateManualDeductionRecords(t.businessCategory || bc || "手动新增", t.belongingMonth || month || "2026-09", 6);
        mockApi.updateTaskDetails(t.id, details);
      }

      const filtered = details
        .filter(d => {
          if (!d.data) return false;
          // 仅查看最终的明细数据，不需要查看移除的数据
          if (d.isRemoved || d.data.IS_INCLUDED_IN_DEDUCTION === "否") return false;
          return (
            d.data.IS_APPEAL === "否" || 
            d.data.IS_APPEAL === "不申诉" || 
            d.data._PROJECT_CLASS || 
            t.isManual || 
            t.isDeductionOnly
          );
        })
        .map(d => ({
          ...d.data,
          id: d.id,
          taskId: t.id,
          _DATA_SOURCE: d.data._DATA_SOURCE || (d.id?.startsWith("DED_MANUAL_") || d.id?.startsWith("DED_NEW_") ? "导入新增" : "审核任务自动生成")
        }));
      allRawDetails = allRawDetails.concat(filtered);
    });
    
    allRawDetails.sort((a,b) => (a.ADMIT_DATE > b.ADMIT_DATE ? -1 : 1));
    
    const configs = getInsuranceCategories();
    const matchedConfig = configs.find(c => c.categoryName === bc);
    const availableScenarios = getAvailableManualScenarios();
    const fallbackScenario = availableScenarios[0] || { personnelCategory: "城乡居民医保", onlineOffline: "线下" };

    const isManualTask = matchedTasks.some(t => t.isManual || t.templateId === "TPL_DED_CUSTOM" || t.id.startsWith("T_CUSTOM_"));
    const personCategory = matchedConfig ? matchedConfig.personnelCategory : (bc.includes("异地") ? "异地医保" : (isManualTask ? fallbackScenario.personnelCategory : "广州医保"));
    const onlineOffline = matchedConfig ? matchedConfig.onlineOffline : (bc.includes("线上") ? "线上" : (isManualTask ? fallbackScenario.onlineOffline : "线下"));
    
    let sumViolation = 0;
    let sumDeduction = 0;
    let activeDeductibleCount = 0;

    const normalizedDetails = allRawDetails.map((d, idx) => {
       const dMedCom = d._DEDUCTION_MED_COM || (Number(d.VIOLATION_AMOUNT) || 0) * 0.6;
       const dOther = d._DEDUCTION_OTHER || (Number(d.VIOLATION_AMOUNT) || 0) * 0.4;
       
       sumViolation += Number(d.VIOLATION_AMOUNT) || 0;
       sumDeduction += (Number(dMedCom) || 0) + (Number(dOther) || 0);
       activeDeductibleCount++;
       
       const scenario = isManualTask && (!d._PERSON_CATEGORY || !d._IS_ONLINE)
         ? availableScenarios[idx % availableScenarios.length]
         : null;

       return {
         ...d,
         _PERSON_CATEGORY: d._PERSON_CATEGORY || (scenario ? scenario.personnelCategory : personCategory),
         _IS_ONLINE: d._IS_ONLINE || (scenario ? scenario.onlineOffline : onlineOffline),
         _DEDUCTION_MED_COM: dMedCom,
         _DEDUCTION_OTHER: dOther,
         _DEDUCTION_AMOUNT: d._DEDUCTION_AMOUNT || (Number(dMedCom) + Number(dOther)),
         VIOLATION_AMOUNT_2: d.VIOLATION_AMOUNT
       };
    });

    setTaskSummary({
      id: taskId,
      name: `${bc} ${month} 扣减明细`,
      businessCategory: bc,
      belongingMonth: month,
      deductibleCount: activeDeductibleCount,
      totalViolationAmount: sumViolation,
      totalDeductionAmount: sumDeduction,
      isNew: false
    });

    setData(normalizedDetails);
  }, [taskId]);

  const handleDownload = () => {
    if (!taskId) return;
    const allTasks = mockApi.getTasks(1, 1000).data;
    let matchedTasks = allTasks.filter(t => t.id === taskId);

    if (matchedTasks.length === 0 && taskId.includes("_")) {
      const parts = taskId.split("_");
      const bc = parts.slice(0, -1).join("_");
      const month = parts[parts.length - 1];
      const allTemplates = mockApi.getTemplates();
      matchedTasks = allTasks.filter(t => {
        if (t.status !== "END" || t.parentId) return false;
        const template = allTemplates.find(tpl => tpl.id === t.templateId);
        const tBc = t.businessCategory || template?.businessCategory || "广州医保（线下）";
        const tMonth = t.belongingMonth || "-";
        return tBc === bc && tMonth === month;
      });
    }

    let allDetails: any[] = [];
    matchedTasks.forEach(t => {
      const details = mockApi.getTaskDetailRecords(t.id, true)
        .filter(d => {
          if (!d.data) return false;
          if (d.isRemoved || d.data.IS_INCLUDED_IN_DEDUCTION === "否") return false;
          return (
            d.data.IS_APPEAL === "否" || 
            d.data.IS_APPEAL === "不申诉" || 
            d.data._PROJECT_CLASS || 
            t.isManual || 
            t.isDeductionOnly
          );
        })
        .map(d => ({
          ...d.data,
          _DATA_SOURCE: d.data._DATA_SOURCE || (d.id?.startsWith("DED_MANUAL_") || d.id?.startsWith("DED_NEW_") ? "导入新增" : "审核任务自动生成")
        }));
      allDetails = allDetails.concat(details);
    });

    exportToExcel(allDetails, `${taskSummary?.name || "扣减"}明细.xlsx`);
    toast("下载完成", "success");
  };

  const visibleTableColumns: Column<any>[] = columnsSettings.filter(c => c.visible).map(c => {
    const col: Column<any> = { key: c.key, title: c.title, width: "120px" };
    if (c.key === "index") {
      col.width = "70px"; 
      col.fixed = "left"; 
      col.render = (_, idx) => (page - 1) * pageSize + idx + 1;
    } else if (["_PERSON_CATEGORY", "PATIENT_NAME"].includes(c.key)) {
      col.width = "100px";
    } else if (["_IS_ONLINE", "MEDICAL_CATEGORY"].includes(c.key)) {
      col.width = "90px";
    } else if (c.key === "ID_CARD") {
      col.width = "180px";
    } else if (c.key === "_DATA_SOURCE") {
       col.width = "160px";
       col.render = (r) => (
         <span className={`text-xs px-1.5 py-0.5 rounded border ${
           r._DATA_SOURCE === "导入新增" ? "bg-purple-50 text-purple-700 border-purple-200" :
           r._DATA_SOURCE === "导入更新" ? "bg-blue-50 text-blue-700 border-blue-200" :
           "bg-slate-50 text-slate-600 border-slate-200"
         }`}>
           {r._DATA_SOURCE || "审核任务自动生成"}
         </span>
       );
    } else if (c.key === "VIOLATION_AMOUNT") {
       col.width = "160px"; col.align = "right"; col.render = (r) => (Number(r.VIOLATION_AMOUNT) || 0).toFixed(2);
    } else if (c.key === "VIOLATION_AMOUNT_2") {
       col.width = "120px"; col.align = "right"; col.render = (r) => (Number(r.VIOLATION_AMOUNT) || 0).toFixed(2);
    } else if (c.key === "_DEDUCTION_AMOUNT") {
       col.width = "160px"; col.align = "right"; col.render = (r) => (Number(r._DEDUCTION_AMOUNT) || 0).toFixed(2);
    } else if (c.key === "_DEDUCTION_MED_COM") {
       col.width = "180px"; col.align = "right"; col.render = (r) => (Number(r._DEDUCTION_MED_COM) || 0).toFixed(2);
    } else if (c.key === "_DEDUCTION_OTHER") {
       col.width = "150px"; col.align = "right"; col.render = (r) => (Number(r._DEDUCTION_OTHER) || 0).toFixed(2);
    }
    return col;
  });

  const pagedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="h-full flex flex-col space-y-4 bg-slate-50 relative p-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-5">
           <div className="flex items-center space-x-3">
             <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="flex items-center space-x-3">
               <h1 className="text-xl font-bold text-slate-900">{taskSummary?.name || "扣减明细"}</h1>
               <span className="px-2 py-0.5 text-xs text-slate-600 bg-slate-100 rounded">已结束</span>
             </div>
           </div>
           
           <div className="flex items-center space-x-3">
             <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-blue-600 border-blue-400 hover:bg-blue-50">
               <Download className="w-3.5 h-3.5" />
               下载明细
             </Button>
             <button 
               onClick={() => setIsColumnSettingsOpen(true)}
               className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer" 
               title="列设置"
             >
               <Settings className="w-4 h-4" />
             </button>
           </div>
         </div>

         {/* 4 Summary Stats */}
         <div className="grid grid-cols-4 gap-6 pt-1">
           <div>
             <div className="text-xs text-slate-400 mb-1.5">医保业务分类</div>
             <div className="text-base font-bold text-slate-800">
               {taskSummary?.businessCategory || "-"}
             </div>
           </div>
           <div>
             <div className="text-xs text-slate-400 mb-1.5">可扣减记录数</div>
             <div className="text-base font-bold text-slate-800">
               {taskSummary?.deductibleCount || 0} <span className="text-sm font-normal text-slate-600">条</span>
             </div>
           </div>
           <div>
             <div className="text-xs text-slate-400 mb-1.5">违规金额合计</div>
             <div className="text-base font-bold text-slate-800">
               {(taskSummary?.totalViolationAmount || 0).toFixed(2)} <span className="text-sm font-normal text-slate-600">元</span>
             </div>
           </div>
           <div>
             <div className="text-xs text-slate-400 mb-1.5">扣减金额合计</div>
             <div className="text-base font-bold text-red-600">
               {(taskSummary?.totalDeductionAmount || 0).toFixed(2)} <span className="text-sm font-normal text-red-600">元</span>
             </div>
           </div>
         </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white p-5 rounded-md shadow-sm border border-slate-200 flex flex-col justify-between min-h-0">
        <div className="text-base font-bold text-slate-900 mb-3">
          {taskSummary?.businessCategory ? `${taskSummary.businessCategory} 医保扣减明细` : "医保扣减明细"}
        </div>
        <div className="flex-1 overflow-auto">
          <Table<any> 
            columns={visibleTableColumns}
            data={pagedData}
            rowKey={(r: any) => r.id || String(Math.random())}
          />
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Pagination 
            current={page}
            pageSize={pageSize}
            showSizeChanger={true}
            total={data.length}
            onChange={(p) => setPage(p)}
            onPageSizeChange={(ps) => {
              setPageSize(ps);
              setPage(1);
            }}
          />
        </div>
      </div>

      <ColumnSettingsModal 
        isOpen={isColumnSettingsOpen}
        onClose={() => setIsColumnSettingsOpen(false)}
        columns={columnsSettings}
        onSave={(newCols) => setColumnsSettings(newCols)}
      />
    </div>
  );
}
