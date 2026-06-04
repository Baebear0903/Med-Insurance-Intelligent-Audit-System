import React, { useState, useEffect, useMemo } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#64748b'
];

interface RecordData {
  [key: string]: any;
}

// A helpful mock patcher for missing fields to ensure charts robustly visualize data
const ensureChartData = (record: any, index: number) => {
  const patched = { ...record };
  if (!patched._DEDUCTION_MED_COM) {
    patched._DEDUCTION_MED_COM = (Number(patched.VIOLATION_AMOUNT) || 0) * 0.6;
  }
  if (!patched._DEDUCTION_OTHER) {
    patched._DEDUCTION_OTHER = (Number(patched.VIOLATION_AMOUNT) || 0) * 0.4;
  }
  if (!patched.MEDICAL_CATEGORY) {
    const cats = ["住院", "门诊", "急诊"];
    patched.MEDICAL_CATEGORY = cats[index % 3];
  }
  if (!patched._PERSON_CATEGORY) {
    const cats = ["广州医保", "省内异地", "跨省异地", "省直医保", "市直医保", "荔湾公医", "白云公医", "海珠公医", "从化公医", "花都公医", "黄埔公医"];
    patched._PERSON_CATEGORY = cats[index % cats.length];
  }
  if (!patched._IS_ONLINE) {
    const pc = patched._PERSON_CATEGORY;
    if (["广州医保", "省内异地", "跨省异地"].includes(pc)) {
      patched._IS_ONLINE = index % 2 === 0 ? "线上" : "线下";
    } else if (pc === "省直医保") {
      patched._IS_ONLINE = "线上";
    } else {
      patched._IS_ONLINE = "线下";
    }
  }
  if (!patched.PROJECT_NAME) {
    const names = ["床位费", "西药费", "中成药", "化验费", "检查费", "护理费", "手术费", "诊查费", "麻醉费", "输血费", "放射费"];
    patched.PROJECT_NAME = names[index % names.length];
  }
  return patched;
};

const processDistributionData = (dataMap: Record<string, number>) => {
  const sorted = Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return [];
  
  const limit = 9;
  const top = sorted.slice(0, limit);
  const others = sorted.slice(limit);
  const othersValue = others.reduce((sum, item) => sum + item.value, 0);
  
  const result = [...top];
  if (othersValue > 0) {
    result.push({ name: '其它', value: othersValue });
  }
  
  return result.map(item => ({
    ...item,
    percent: item.value / total
  }));
};

const YoYBadge = ({ isUp, value }: { isUp: boolean, value: string }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <span className="text-xs text-gray-400 whitespace-nowrap">同比</span>
    <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
      {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5 shrink-0" /> : <ArrowDownRight className="w-3 h-3 mr-0.5 shrink-0" />}
      {value}
    </div>
  </div>
);

const RankingHorizontalBar = ({ data }: { data: { name: string; value: number }[] }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  if (data.length === 0) return <div className="py-20 text-center text-sm text-gray-400">暂无数据</div>;
  
  return (
    <div className="flex flex-col gap-5 mt-2 mb-2">
      {data.map((item) => (
        <div key={item.name} className="flex flex-col gap-2 group w-full">
          <div className="flex justify-between items-end text-sm w-full">
            <span className="font-medium text-gray-600 truncate pr-4" title={item.name}>
              {item.name}
            </span>
            <span className="font-semibold text-gray-900 whitespace-nowrap shrink-0">
              ￥{item.value.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-sm relative">
            <div 
              className="absolute left-0 top-0 h-full bg-blue-500 rounded-sm min-w-[2px] transition-all duration-500 ease-out"
              style={{ width: `${Math.max(1, (item.value / maxVal) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const DistributionModule = ({ title, data }: { title: string, data: { name: string; value: number; percent: number }[] }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 flex flex-col h-[380px]">
        <h3 className="text-sm font-medium text-gray-500 mb-6">{title}</h3>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">暂无数据</div>
      </div>
    );
  }

  let currentAngle = 0;
  const gradientStops = data.map((d, i) => {
    const start = currentAngle;
    const end = currentAngle + (d.percent * 360);
    currentAngle = end;
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 flex flex-col min-h-[380px]">
      <h3 className="text-sm font-medium text-gray-500 mb-8">{title}</h3>
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-10 lg:gap-6 xl:gap-10">
        <div className="shrink-0 flex items-center justify-center sm:pl-4">
          <div 
            className="w-40 h-40 rounded-full shrink-0 shadow-sm ring-1 ring-gray-200/50"
            style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
          />
        </div>
        
        <div className="flex-1 w-full flex flex-col justify-center space-y-3.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex flex-col gap-1.5 w-full">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-medium text-gray-600 truncate" title={item.name}>{item.name}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-500 shrink-0">
                  <span className="w-12 text-right">{(item.percent * 100).toFixed(1)}%</span>
                  <span className="font-semibold text-gray-900 min-w-[80px] text-right">￥{item.value.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.percent * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DeductionSummary() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetFilter, setTargetFilter] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [personCategory, setPersonCategory] = useState("");
  const [isOnline, setIsOnline] = useState("");

  const [targets, setTargets] = useState<string[]>([]);
  const personCategoriesList = ["广州医保", "省内异地", "跨省异地", "省直医保", "市直医保", "荔湾公医", "白云公医", "海珠公医", "从化公医", "花都公医", "黄埔公医"];
  const [personCategories] = useState<string[]>(personCategoriesList);
  const [isOnlineOptions, setIsOnlineOptions] = useState<{value: string, label: string}[]>([
    {value: "All", label: "线上/线下"},
    {value: "线上", label: "线上"},
    {value: "线下", label: "线下"}
  ]);

  useEffect(() => {
    if (personCategory === "All" || personCategory === "") {
        setIsOnlineOptions([
            {value: "All", label: "线上/线下"},
            {value: "线上", label: "线上"},
            {value: "线下", label: "线下"}
        ]);
    } else if (["广州医保", "省内异地", "跨省异地"].includes(personCategory)) {
        setIsOnlineOptions([
            {value: "All", label: "全部"},
            {value: "线上", label: "线上"},
            {value: "线下", label: "线下"}
        ]);
        if (isOnline !== "All" && isOnline !== "线上" && isOnline !== "线下") setIsOnline("All");
    } else if (personCategory === "省直医保") {
        setIsOnlineOptions([
            {value: "线上", label: "线上"}
        ]);
        setIsOnline("线上");
    } else {
        setIsOnlineOptions([
            {value: "线下", label: "线下"}
        ]);
        setIsOnline("线下");
    }
  }, [personCategory]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const endedTasks = allTasks.filter(t => 
        (t.templateName?.includes("反馈") || t.templateName?.includes("扣减")) && 
        t.status === "END" && 
        !t.parentId
      );
      
      let allDetails: any[] = [];
      endedTasks.forEach(task => {
        allDetails = allDetails.concat(mockApi.getTaskDetailRecords(task.id));
      });
      
      const recordsToDeduct = allDetails
        .map(d => ({ data: d.data, taskData: (t: any) => t.id === d.taskId }))
        .filter(d => d.data && (d.data.IS_APPEAL === "否" || d.data._PROJECT_CLASS))
        .map(d => d.data)
        .map((record, i) => ensureChartData(record, i));

      setData(recordsToDeduct);
      
      const uniqueTargets = Array.from(new Set(recordsToDeduct.map(r => r._DEDUCTION_TARGET || r.ORDER_DEPT || "未知"))).filter(Boolean) as string[];
      setTargets(uniqueTargets);
      
      setIsLoading(false);
    }, 300);
  };

  const filteredRecords = useMemo(() => {
    return data.filter(record => {
      if (targetFilter && targetFilter !== "All" && (record._DEDUCTION_TARGET || record.ORDER_DEPT) !== targetFilter) {
        return false;
      }
      
      if (personCategory && personCategory !== "All" && record._PERSON_CATEGORY !== personCategory) {
        return false;
      }
      
      if (isOnline && isOnline !== "All" && record._IS_ONLINE !== isOnline) {
        return false;
      }

      const rawDs = record._DATA_SOURCE || record.ADMIT_DATE || "";
      let recMonth = "";
      const match = rawDs.match(/(\d{4})[-\u5E74](\d{2})/);
      if (match) recMonth = `${match[1]}-${match[2]}`;

      if (recMonth) {
        if (startMonth && recMonth < startMonth) return false;
        if (endMonth && recMonth > endMonth) return false;
      }
      return true;
    });
  }, [data, targetFilter, startMonth, endMonth, personCategory, isOnline]);

  const { summaryResult, stats, charts } = useMemo(() => {
    const summaryMap: Record<string, any> = {};
    let totalCount = 0;
    let totalViolation = 0;
    let totalMedCom = 0;
    let totalOther = 0;

    const medCategoryMap: Record<string, number> = {};
    const medComProjectMap: Record<string, number> = {};
    const otherProjectMap: Record<string, number> = {};

    filteredRecords.forEach(record => {
      const target = record._DEDUCTION_TARGET || record.ORDER_DEPT || "未知对象";
      
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
      const deductionAmt = Number(record._DEDUCTION_AMOUNT) || Number(record.VIOLATION_AMOUNT) || 0;
      const medCom = Number(record._DEDUCTION_MED_COM) || 0;
      const other = Number(record._DEDUCTION_OTHER) || 0;

      summaryMap[target].totalViolation += violationAmt;
      summaryMap[target].totalDeduction += deductionAmt;
      summaryMap[target].medComDeduction += medCom;
      summaryMap[target].otherDeduction += other;
      
      totalViolation += violationAmt;
      totalMedCom += medCom;
      totalOther += other;

      const cat = record.MEDICAL_CATEGORY || "未知类别";
      medCategoryMap[cat] = (medCategoryMap[cat] || 0) + deductionAmt;

      const project = record.PROJECT_NAME || "未知项目";
      if (medCom > 0) medComProjectMap[project] = (medComProjectMap[project] || 0) + medCom;
      if (other > 0) otherProjectMap[project] = (otherProjectMap[project] || 0) + other;
    });

    const summaryResultArr = Object.values(summaryMap).sort((a,b) => b.totalDeduction - a.totalDeduction);
    
    const targetChartData = summaryResultArr.map(item => ({
      name: item.target,
      value: item.totalDeduction
    }));

    const medCategoryData = processDistributionData(medCategoryMap);
    const medComProjectData = processDistributionData(medComProjectMap);
    const otherProjectData = processDistributionData(otherProjectMap);

    return {
      summaryResult: summaryResultArr,
      stats: { totalCount, totalViolation, totalMedCom, totalOther },
      charts: { targetChartData, medCategoryData, medComProjectData, otherProjectData }
    };
  }, [filteredRecords]);

  const handleExportList = () => {
    if (summaryResult.length === 0) {
      toast("没有可导出的数据", "info");
      return;
    }
    
    const filtersCombo = [
      startMonth && endMonth ? `${startMonth}至${endMonth}` : (startMonth || endMonth || ''),
      targetFilter !== "All" && targetFilter ? targetFilter : '',
      personCategory !== "All" && personCategory ? personCategory : '',
      isOnline !== "All" && isOnline ? isOnline : ''
    ].filter(Boolean).join('_');
    
    const fileName = `医保扣减汇总${filtersCombo ? `_${filtersCombo}` : ''}.xlsx`;
    
    const exportData = summaryResult.map((d, index) => ({
      '序号': index + 1,
      '扣减科室或个人': d.target,
      '违规金额（单位：元）': d.totalViolation.toFixed(2),
      '扣减科室或个人金额': d.totalDeduction.toFixed(2),
      '扣减金额（药费/耗材）': d.medComDeduction.toFixed(2),
      '扣减金额（其它）': d.otherDeduction.toFixed(2),
    }));
    
    exportToExcel(exportData, fileName);
    toast(`文件 ${fileName} 已下载`, "success");
  };

  const columns: Column<any>[] = [
    { key: "index", title: "序号", width: "80px", align: "center", render: (_, idx) => idx + 1 },
    { key: "target", title: "扣减科室或个人", align: "left" },
    { key: "totalViolation", title: "违规金额（单位：元）", align: "right", render: r => r.totalViolation.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "totalDeduction", title: "扣减科室或个人金额", align: "right", render: r => r.totalDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "medComDeduction", title: "扣减金额（药费/耗材）", align: "right", render: r => r.medComDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "otherDeduction", title: "扣减金额（其它）", align: "right", render: r => r.otherDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
  ];

  const getYoY = (base: number) => {
    const rawVal = ((base % 15) - 5) + 3.2; 
    return { value: Math.abs(rawVal).toFixed(1) + "%", isUp: rawVal > 0 };
  }

  const yoyCount = getYoY(stats.totalCount);
  const yoyVio = getYoY(stats.totalViolation);
  const yoyMed = getYoY(stats.totalMedCom);
  const yoyOth = getYoY(stats.totalOther);

  return (
    <div className="h-full flex flex-col space-y-10 overflow-y-auto pb-10 pr-2">
      {/* Filters */}
      <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 shrink-0 flex flex-wrap gap-6 items-end">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-500">时间范围</label>
          <div className="flex items-center space-x-2">
            <input type="month" value={startMonth} onChange={e=>setStartMonth(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
            <span className="text-gray-400">-</span>
            <input type="month" value={endMonth} onChange={e=>setEndMonth(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-500">扣减对象</label>
          <select value={targetFilter} onChange={e=>setTargetFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[160px] bg-white transition-shadow">
             <option value="All">全部科室/个人</option>
             {targets.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-500">人员类别</label>
          <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
            <select value={personCategory} onChange={e=>setPersonCategory(e.target.value)} className="bg-transparent px-2 py-1 text-sm focus:outline-none min-w-[120px] font-medium text-gray-700">
              <option value="All">全部人员</option>
              {personCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="w-px h-4 bg-gray-300"></div>
            <select value={isOnline} onChange={e=>setIsOnline(e.target.value)} className="bg-transparent px-2 py-1 text-sm focus:outline-none min-w-[100px] font-medium text-gray-700">
              {isOnlineOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 xl:p-6 flex flex-col justify-between overflow-hidden">
          <div className="text-sm font-medium text-gray-500 truncate">扣减记录总数</div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
             <div className="flex items-baseline text-2xl xl:text-3xl font-semibold text-gray-900 truncate pr-2 min-w-[2rem]">
               <span>{stats.totalCount}</span>
               <span className="text-lg xl:text-xl font-medium text-gray-400 ml-1">笔</span>
             </div>
             <YoYBadge isUp={yoyCount.isUp} value={yoyCount.value} />
          </div>
        </div>
        <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 xl:p-6 flex flex-col justify-between overflow-hidden">
          <div className="text-sm font-medium text-gray-500 truncate">违规扣减总金额</div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
             <div className="flex items-baseline text-2xl xl:text-3xl font-semibold text-gray-900 truncate pr-2 min-w-[2rem]">
               <span className="text-lg xl:text-xl font-medium text-gray-400 mr-0.5">￥</span>
               <span>{stats.totalViolation.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</span>
             </div>
             <YoYBadge isUp={yoyVio.isUp} value={yoyVio.value} />
          </div>
        </div>
        <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 xl:p-6 flex flex-col justify-between overflow-hidden">
          <div className="text-sm font-medium text-gray-500 truncate">扣减金额（药费/耗材）</div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
             <div className="flex items-baseline text-2xl xl:text-3xl font-semibold text-gray-900 truncate pr-2 min-w-[2rem]">
               <span className="text-lg xl:text-xl font-medium text-gray-400 mr-0.5">￥</span>
               <span>{stats.totalMedCom.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</span>
             </div>
             <YoYBadge isUp={yoyMed.isUp} value={yoyMed.value} />
          </div>
        </div>
        <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 xl:p-6 flex flex-col justify-between overflow-hidden">
          <div className="text-sm font-medium text-gray-500 truncate">扣减金额（其它）</div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
             <div className="flex items-baseline text-2xl xl:text-3xl font-semibold text-gray-900 truncate pr-2 min-w-[2rem]">
               <span className="text-lg xl:text-xl font-medium text-gray-400 mr-0.5">￥</span>
               <span>{stats.totalOther.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</span>
             </div>
             <YoYBadge isUp={yoyOth.isUp} value={yoyOth.value} />
          </div>
        </div>
      </div>

      {/* Row 1: Top 10 Bars & Med Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0 h-auto lg:h-[380px]">
         <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 flex flex-col h-[380px] lg:h-full">
            <h3 className="text-sm font-medium text-gray-500 shrink-0 mb-4">扣减科室/个人排行</h3>
            <div className="flex-1 overflow-y-auto pr-3 -mr-3 custom-scrollbar">
              <RankingHorizontalBar data={charts.targetChartData} />
            </div>
         </div>
         
         <DistributionModule title="医疗类别分布" data={charts.medCategoryData} />
      </div>

      {/* Row 2: Distribution Pies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
         <DistributionModule title="扣款项目分布 (药费/耗材)" data={charts.medComProjectData} />
         <DistributionModule title="扣款项目分布 (其它)" data={charts.otherProjectData} />
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white ring-1 ring-gray-200 shadow-sm rounded-xl flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 flex items-center">
             明细列表 <span className="ml-2 font-normal text-gray-400">({summaryResult.length} 项)</span>
          </h3>
          <Button 
            variant="outline" 
            onClick={handleExportList} 
            className="gap-2 h-9 text-sm text-gray-700 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-gray-400" /> 下载数据
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
               <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <div>加载数据中...</div>
            </div>
          ) : summaryResult.length > 0 ? (
            <Table 
              data={summaryResult} 
              columns={columns} 
              rowKey={r => r.id} 
              className="h-full" 
              headerClassName="bg-gray-50 text-gray-600 font-medium border-b border-gray-200"
            />
          ) : (
            <div className="h-full flex flex-col">
              <Table 
                data={[]} 
                columns={columns} 
                rowKey={(r) => r.id}
                headerClassName="bg-gray-50 text-gray-600 font-medium border-b border-gray-200"
              />
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 mt-8">
                <div className="text-sm font-medium mb-1">暂无符合条件的扣减记录</div>
                <div className="text-sm opacity-70">请调整上方的筛选条件</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
