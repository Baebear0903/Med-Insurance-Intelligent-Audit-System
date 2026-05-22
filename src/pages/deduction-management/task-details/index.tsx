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

// --- Helper Functions ---
const extractMonthFromTaskName = (name: string) => {
  const match = name.match(/\d{4}年\d{2}月/);
  return match ? match[0] : "";
};

interface TaskSummary {
  id: string;
  name: string;
  businessCategory: string;
  deductibleCount: number;
  totalViolationAmount: number;
  totalDeductionAmount: number;
  isNew: boolean;
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  
  const [columnsSettings, setColumnsSettings] = useState<ColumnItem[]>(BASE_COLUMNS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [page, pageSize, taskId]);

  const loadData = () => {
    if (!taskId) return;
    setIsLoading(true);
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const t = allTasks.find(t => t.id === taskId);
      
      const details = mockApi.getTaskDetailRecords(taskId);
      const validDetails = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => ({...d.data, id: d.id})).sort((a,b) => (a.ADMIT_DATE > b.ADMIT_DATE ? -1 : 1));
      
      if (t) {
        const allTemplates = mockApi.getTemplates();
        const template = allTemplates.find(tpl => tpl.id === t.templateId);
        
        let sumViolation = 0;
        let sumDeduction = 0;
        validDetails.forEach(d => {
          sumViolation += Number(d.VIOLATION_AMOUNT) || 0;
          sumDeduction += (Number(d._DEDUCTION_MED_COM) || 0) + (Number(d._DEDUCTION_OTHER) || 0);
        });
        
        setTaskSummary({
          id: t.id,
          name: t.name,
          businessCategory: template?.businessCategory || "广州医保（线下）",
          deductibleCount: validDetails.length,
          totalViolationAmount: sumViolation,
          totalDeductionAmount: sumDeduction,
          isNew: false
        });
      }

      setTotal(validDetails.length);
      const start = (page - 1) * pageSize;
      setData(validDetails.slice(start, start + pageSize));
      setIsLoading(false);
    }, 300);
  };

  const handleExport = () => {
    if (!taskId) return;
    const details = mockApi.getTaskDetailRecords(taskId);
    const exportData = details.filter(d => d.data && d.data.IS_APPEAL === "否").map(d => d.data);

    if (exportData.length === 0) {
      toast("没有可导出的数据", "info");
      return;
    }
    exportToExcel(exportData, `${taskSummary?.businessCategory || ""}医保扣减明细.xlsx`);
    toast("院内扣减明细已下载", "success");
  };

  const visibleTableColumns: Column<any>[] = columnsSettings.filter(c => c.visible).map(c => {
    const col: Column<any> = { key: c.key, title: c.title, width: "120px" };
    if (c.key === "index") {
      col.width = "70px"; col.fixed = "left"; col.render = (_, idx) => (page - 1) * pageSize + idx + 1;
    } else if (["_PERSON_CATEGORY", "PATIENT_NAME"].includes(c.key)) {
      col.width = "100px";
    } else if (["_IS_ONLINE", "MEDICAL_CATEGORY"].includes(c.key)) {
      col.width = "90px";
    } else if (c.key === "ID_CARD") {
      col.width = "180px";
    } else if (c.key === "_DATA_SOURCE") {
       col.width = "220px";
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

  return (
    <div className="h-full flex flex-col space-y-4 bg-slate-50 relative p-6">
      <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-4">
           <div className="flex items-center space-x-4">
             <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100 flex items-center justify-center">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="text-xl font-bold text-slate-800">{taskSummary?.name || "任务详情"}</h2>
             <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-medium">已结束</span>
           </div>
           <div className="flex space-x-3">
             <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
               <Download className="w-4 h-4" />
               下载明细
             </Button>
             <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors">
               <Settings className="w-5 h-5" />
             </button>
           </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-10">
             <div>
               <div className="text-xs text-slate-500 mb-1">医保业务分类</div>
               <div className="font-semibold text-slate-800">{taskSummary?.businessCategory}</div>
             </div>
             <div>
               <div className="text-xs text-slate-500 mb-1">可扣减记录数</div>
               <div className="font-semibold text-slate-800">{taskSummary?.deductibleCount} 条</div>
             </div>
             <div>
               <div className="text-xs text-slate-500 mb-1">违规金额合计</div>
               <div className="font-semibold items-baseline flex gap-1">
                  <span className="text-lg">{taskSummary?.totalViolationAmount.toFixed(2)}</span>
                  <span className="text-xs font-normal text-slate-500">元</span>
               </div>
             </div>
             <div>
               <div className="text-xs text-slate-500 mb-1">扣减金额合计</div>
               <div className="font-semibold items-baseline flex gap-1 text-red-600">
                  <span className="text-lg">{taskSummary?.totalDeductionAmount.toFixed(2)}</span>
                  <span className="text-xs font-normal">元</span>
               </div>
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-md shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
           <h2 className="text-base font-semibold text-slate-800">{taskSummary?.businessCategory} 医保扣减明细</h2>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>
          ) : (
            <Table data={data} columns={visibleTableColumns} rowKey={r => r.id} className="h-full" />
          )}
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <Pagination current={page} total={total} pageSize={pageSize} onChange={setPage} />
        </div>
      </div>

      <ColumnSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        columns={columnsSettings}
        onConfirm={(updated) => { setColumnsSettings(updated); setIsSettingsOpen(false); }}
      />
    </div>
  );
}
