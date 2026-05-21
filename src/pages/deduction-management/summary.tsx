import React, { useState, useEffect, useMemo } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Download, Settings, Search } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";

export default function DeductionSummary() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetFilter, setTargetFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      // 只要已结束医保审核反馈任务（或者院内扣减本身的任务，只要是已结束并生成扣减明细）
      // 这里根据 mock 数据逻辑，只取 name 包含相关内容，且 status==="END" 且没有 parentId 的主任务
      const endedTasks = allTasks.filter(t => 
        (t.templateName?.includes("反馈") || t.templateName?.includes("扣减")) && 
        t.status === "END" && 
        !t.parentId
      );
      
      let allDetails: any[] = [];
      endedTasks.forEach(task => {
        allDetails = allDetails.concat(mockApi.getTaskDetailRecords(task.id));
      });
      
      // 过滤出生成了扣减明细的记录（例如 IS_APPEAL === "否" 或者在扣减任务里）
      const recordsToDeduct = allDetails
        .map(d => {
          // If task is deduction task, it uses different data fields or just raw data.
          return { data: d.data, taskData: t => t.id === d.taskId };
        })
        .filter(d => d.data && (d.data.IS_APPEAL === "否" || d.data._PROJECT_CLASS)) // heuristically getting deduction records
        .map(d => d.data);

      setData(recordsToDeduct);
      setIsLoading(false);
    }, 300);
  };

  const filteredRecords = useMemo(() => {
    return data.filter(record => {
      if (targetFilter && !(record._DEDUCTION_TARGET || "").includes(targetFilter)) {
        return false;
      }
      if (monthFilter) {
        // Assume _DATA_SOURCE string contains the year-month, or ADMIT_DATE, etc.
        // Usually mock task has '2024年01月' in data source or task name
        const monthStr = monthFilter.replace("-", "年") + "月"; // 2024-01 -> 2024年01月
        const ds = record._DATA_SOURCE || "";
        if (!ds.includes(monthStr)) {
          return false;
        }
      }
      return true;
    });
  }, [data, targetFilter, monthFilter]);

  const { summaryResult, stats } = useMemo(() => {
    const summaryMap: Record<string, any> = {};
    let totalCount = 0;
    let totalViolation = 0;
    let totalMedCom = 0;
    let totalOther = 0;

    filteredRecords.forEach(record => {
      // "扣减科室或个人" 字段
      const target = record._DEDUCTION_TARGET || "未知对象";
      
      if (!summaryMap[target]) {
        summaryMap[target] = {
          id: target,
          target: target,
          totalViolation: 0,
          totalDeduction: 0,
          medComDeduction: 0,
          otherDeduction: 0,
        };
      }
      
      totalCount += 1;
      const violationAmt = Number(record.VIOLATION_AMOUNT) || 0;
      const deductionAmt = Number(record._DEDUCTION_AMOUNT) || Number(record.VIOLATION_AMOUNT) || 0; // 若无直接扣款金额则以违规计
      const medCom = Number(record._DEDUCTION_MED_COM) || 0;
      const other = Number(record._DEDUCTION_OTHER) || 0;

      summaryMap[target].totalViolation += violationAmt;
      summaryMap[target].totalDeduction += deductionAmt;
      summaryMap[target].medComDeduction += medCom;
      summaryMap[target].otherDeduction += other;
      
      totalViolation += violationAmt;
      totalMedCom += medCom;
      totalOther += other;
    });

    const summaryResult = Object.values(summaryMap).sort((a,b) => b.totalDeduction - a.totalDeduction);
    
    return {
      summaryResult,
      stats: {
        totalCount,
        totalViolation,
        totalMedCom,
        totalOther
      }
    };
  }, [filteredRecords]);

  const handleExport = () => {
    if (summaryResult.length === 0) {
      toast("没有可导出的数据", "info");
      return;
    }
    const exportData = summaryResult.map((d, index) => ({
      序号: index + 1,
      扣减科室或个人: d.target,
      '违规金额（单位：元）': d.totalViolation.toFixed(2),
      扣减科室或个人金额: d.totalDeduction.toFixed(2),
      '扣减金额（药费/耗材）': d.medComDeduction.toFixed(2),
      '扣减金额（其它）': d.otherDeduction.toFixed(2),
    }));
    exportToExcel(exportData, "医保扣减总览表.xlsx");
    toast("医保扣减总览已下载", "success");
  };

  const columns: Column<any>[] = [
    { key: "index", title: "序号", width: "80px", align: "center", render: (_, idx) => idx + 1 },
    { key: "target", title: "扣减科室或个人" },
    { key: "totalViolation", title: "违规金额（单位：元）", width: "200px", align: "right", render: (r) => r.totalViolation.toFixed(2) },
    { key: "totalDeduction", title: "扣减科室或个人金额", width: "220px", align: "right", render: (r) => r.totalDeduction.toFixed(2) },
    { key: "medComDeduction", title: "扣减金额（药费/耗材）", width: "220px", align: "right", render: (r) => r.medComDeduction.toFixed(2) },
    { key: "otherDeduction", title: "扣减金额（其它）", width: "200px", align: "right", render: (r) => r.otherDeduction.toFixed(2) },
  ];

  let displayTitle = "医保扣减总览";
  if (monthFilter) {
    const [year, month] = monthFilter.split("-");
    displayTitle = `${year}年${month}月医保扣减总览`;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 顶部筛选区 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm border border-slate-200 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">月份</span>
            <input 
              type="month" 
              className="text-sm border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">扣减对象</span>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索科室或个人..."
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            导出数据
          </Button>
          <Button variant="outline" size="sm" className="px-2" title="设置">
            <Settings className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">扣减记录数</div>
          <div className="text-2xl font-semibold text-slate-800">{stats.totalCount} <span className="text-sm font-normal text-slate-500">条</span></div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">违规金额</div>
          <div className="text-2xl font-semibold text-rose-600">￥{stats.totalViolation.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">扣减金额（药费/耗材）</div>
          <div className="text-2xl font-semibold text-blue-600">￥{stats.totalMedCom.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200">
          <div className="text-sm text-slate-500 mb-1">扣减金额（其它）</div>
          <div className="text-2xl font-semibold text-orange-600">￥{stats.totalOther.toFixed(2)}</div>
        </div>
      </div>

      {/* 主表格 */}
      <div className="flex-1 min-h-0 bg-white rounded-md shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center justify-center p-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-wide">{displayTitle}</h2>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">加载中...</div>
          ) : summaryResult.length > 0 ? (
            <Table 
              data={summaryResult} 
              columns={columns} 
              rowKey={r => r.id} 
              className="h-full" 
              headerClassName="bg-emerald-50 text-emerald-800 font-semibold"
            />
          ) : (
            <div className="h-full flex flex-col">
              <Table 
                data={[]} 
                columns={columns} 
                rowKey={(r) => r.id}
                headerClassName="bg-emerald-50 text-emerald-800 font-semibold"
              />
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="text-base mb-2">暂无医保扣减总览</div>
                <div className="text-sm">请调整筛选条件或等待扣减明细生成</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

