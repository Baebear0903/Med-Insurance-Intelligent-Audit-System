import React, { useState, useEffect, useMemo } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Download, FileText, AlertCircle, Pill, Package } from "lucide-react";
import { mockApi } from "@/src/lib/mockData";
import { toast } from "@/src/components/ui/Toast";
import { exportToExcel } from "@/src/lib/exportUtils";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#ec4899', '#f43f5e', '#14b8a6', '#f97316', '#64748b'
];

interface RecordData {
  [key: string]: any;
}

// A helpful mock patcher
const ensureChartData = (record: any, index: number) => {
  const patched = { ...record };
  if (!patched._DEDUCTION_MED_COM) {
    patched._DEDUCTION_MED_COM = (Number(patched.VIOLATION_AMOUNT) || 0) * 0.6;
  }
  if (!patched._DEDUCTION_OTHER) {
    patched._DEDUCTION_OTHER = (Number(patched.VIOLATION_AMOUNT) || 0) * 0.4;
  }
  if (!patched.MEDICAL_CATEGORY) {
    const cats = ["普通门诊", "门诊慢特病", "普通住院"];
    patched.MEDICAL_CATEGORY = cats[index % 3];
  }
  if (!patched._PERSON_CATEGORY) {
    const cats = ["广州医保", "省内异地", "跨省异地", "市直医保", "省直医保"];
    patched._PERSON_CATEGORY = cats[index % cats.length];
  }
  if (!patched._IS_ONLINE) {
    const pc = patched._PERSON_CATEGORY;
    if (["广州医保", "省内异地", "跨省异地"].includes(pc)) {
      patched._IS_ONLINE = index % 2 === 0 ? "线上" : "线下";
    } else if (pc === "市直医保") {
      patched._IS_ONLINE = "线下";
    } else {
      patched._IS_ONLINE = "线上";
    }
  }
  if (!patched.PROJECT_NAME) {
    const names = ["血常规", "血脂", "血压", "CT", "B超", "核磁共振", "尿检"];
    patched.PROJECT_NAME = names[index % names.length];
  }
  return patched;
};

const processDistributionData = (dataMap: Record<string, number>) => {
  const sorted = Object.entries(dataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);
  const total = sorted.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return [];
  
  const limit = 8;
  const top = sorted.slice(0, limit);
  const others = sorted.slice(limit);
  const othersValue = others.reduce((sum, item) => sum + item.value, 0);
  
  const result = [...top];
  if (othersValue > 0) {
    result.push({ name: '其它', value: othersValue });
  }
  
  return result.map((item, index) => ({
    ...item,
    percent: item.value / total,
    color: COLORS[index % COLORS.length]
  }));
};

const StatCard = ({ title, value, unit, yoyIsUp, yoyValue, iconBg, iconColor, iconNode }: any) => (
  <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
         {iconNode}
      </div>
    </div>
    <div className="mt-2 flex items-baseline gap-1.5">
      <div className="text-[28px] font-semibold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-500">{unit}</div>
      <div className="ml-2 flex items-center gap-1.5 text-xs text-gray-400">
        同比: {yoyValue === '-' ? <span>-</span> : <span className={yoyIsUp ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>{yoyIsUp ? '↗ ' : '↘ '}{yoyValue}</span>}
      </div>
    </div>
  </div>
);

const RankingList = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-0 flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
         <h3 className="text-sm font-semibold text-gray-800">扣减科室/个人排行</h3>
      </div>
      <div className="flex text-xs font-medium text-gray-400 px-5 py-3 bg-gray-50/50">
         <div className="w-12 text-center">排名</div>
         <div className="flex-1 px-4">科室</div>
         <div className="w-24 text-right">金额</div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 mb-2 custom-scrollbar">
         {data.slice(0, 15).map((item, index) => {
            const rank = index + 1;
            let bgClass = "bg-transparent";
            let rankBgClass = "bg-gray-100 text-gray-500";
            if (rank === 1) {
               bgClass = "bg-[#fef3c7] border border-amber-100/50";
               rankBgClass = "bg-[#fcd34d] text-amber-900";
            } else if (rank === 2) {
               bgClass = "bg-[#eff6ff] border border-blue-100/50";
               rankBgClass = "bg-[#93c5fd] text-blue-900";
            } else if (rank === 3) {
               bgClass = "bg-[#fff7ed] border border-orange-100/50";
               rankBgClass = "bg-[#fdba74] text-orange-900";
            }

            return (
              <div key={item.name} className={`flex items-center text-sm px-3 py-2.5 my-1 mx-1 rounded-md ${bgClass}`}>
                 <div className="w-12 flex justify-center">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-[4px] text-xs font-bold ${rankBgClass}`}>{rank}</span>
                 </div>
                 <div className="flex-1 px-4 text-gray-700 truncate" title={item.name}>{item.name}</div>
                 <div className="w-28 text-right font-medium text-gray-900">
                    ¥ {item.value.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </div>
              </div>
            )
         })}
      </div>
    </div>
  )
}

const DonutLegend = ({ title, data }: any) => {
  return (
    <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 flex flex-col h-[280px]">
       <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>
       <div className="flex-1 flex items-center">
          <div className="w-[140px] h-[140px] shrink-0 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={2} dataKey="value" stroke="none">
                   {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex-1 ml-6 flex flex-col justify-center gap-2.5 overflow-y-auto max-h-full pr-2 custom-scrollbar">
            {data.map((item: any) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                   <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="flex gap-2 text-right justify-end font-medium">
                   {item.valueLabel && <span className="text-gray-900">{item.valueLabel}/</span>}
                   <span className="text-gray-500">{(item.percent * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
       </div>
    </div>
  )
}

const DonutBarChart = ({ title, data }: any) => {
  return (
    <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-6 flex flex-col min-h-[300px]">
      <h3 className="text-sm font-semibold text-gray-800 mb-6">{title}</h3>
      <div className="flex flex-1 gap-8 min-h-[180px]">
        {/* Donut */}
        <div className="w-[160px] h-[180px] shrink-0 relative flex items-center justify-center">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                  {data.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
              </PieChart>
           </ResponsiveContainer>
        </div>
        {/* Bar */}
        <div className="flex-1 h-[200px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }} barSize={16}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
               <XAxis dataKey="name" axisLine={{ stroke: '#E5E7EB' }} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(val) => val.toLocaleString()} />
               <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                 <Cell fill="#3b82f6" />
                 <Cell fill="#10b981" />
                 <Cell fill="#f59e0b" />
                 <Cell fill="#06b6d4" />
                 <Cell fill="#8b5cf6" />
                 <Cell fill="#ec4899" />
                 <Cell fill="#14b8a6" />
                 <Cell fill="#64748b" />
               </Bar>
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default function DeductionSummary() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetFilter, setTargetFilter] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [personCategory, setPersonCategory] = useState("");
  const [isOnline, setIsOnline] = useState("");

  const [targets, setTargets] = useState<string[]>([]);
  const personCategoriesList = ["广州医保", "省内异地", "跨省异地", "省直医保", "市直医保"];
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
    const businessCategoryMap: Record<string, number> = {};
    const medComProjectMap: Record<string, number> = {};
    const otherProjectMap: Record<string, number> = {};

    // For business category counts
    const businessCategoryCountMap: Record<string, number> = {};

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

      const isOnlineStr = record._IS_ONLINE ? `(${record._IS_ONLINE})` : "";
      const bCat = `${record._PERSON_CATEGORY || "其它"} ${isOnlineStr}`.trim();
      businessCategoryMap[bCat] = (businessCategoryMap[bCat] || 0) + deductionAmt;
      businessCategoryCountMap[bCat] = (businessCategoryCountMap[bCat] || 0) + 1;

      const project = record.PROJECT_NAME || "未知项目";
      if (medCom > 0) medComProjectMap[project] = (medComProjectMap[project] || 0) + medCom;
      if (other > 0) otherProjectMap[project] = (otherProjectMap[project] || 0) + other;
    });

    const summaryResultArr = Object.values(summaryMap).sort((a,b) => b.totalDeduction - a.totalDeduction);
    
    // Default mocks if data is empty
    const ensureChartFallback = (data: any[], defaultMocks: any[]) => {
       if (data.length > 0) return data;
       return [];
    };

    const targetChartData = summaryResultArr.map(item => ({
      name: item.target,
      value: item.totalDeduction
    }));
    
    const fallbackTarget = [
       {name: "儿科（小儿内科）", value: 17017.00},
       {name: "呼吸与危重症医学科", value: 17017.00},
       {name: "耳鼻咽喉头颈外科学科", value: 17017.00},
       {name: "耳鼻喉科", value: 17017.00},
       {name: "口腔科", value: 17017.00},
       {name: "全科门诊", value: 17017.00},
       {name: "疑难肝病与感染性疾病诊疗中心", value: 17017.00},
       {name: "临床药理与药物临床试验专科", value: 17017.00},
       {name: "高压氧康复与预脑损伤治疗科", value: 17017.00},
       {name: "中医科", value: 17017.00},
    ];

    const medCategoryData = processDistributionData(medCategoryMap);
    
    const rawBusinessData = processDistributionData(businessCategoryMap);
    const businessCategoryData = rawBusinessData.map(d => ({
        ...d,
        valueLabel: businessCategoryCountMap[d.name] || 0
    }));

    const medComProjectData = processDistributionData(medComProjectMap);
    const otherProjectData = processDistributionData(otherProjectMap);

    const fallbackMedCategory = ensureChartFallback([], [
       {name: "普通门诊", value: 30},
       {name: "门诊慢特病", value: 30},
       {name: "普通住院", value: 40},
    ]);

    const fallbackBusinessCategory = ensureChartFallback([], [
       {name: "广州医保 (线上)", value: 1048, valueLabel: 1048},
       {name: "广州医保 (线下)", value: 735, valueLabel: 735},
       {name: "省内异地 (线上)", value: 580, valueLabel: 580},
       {name: "省内异地 (线下)", value: 484, valueLabel: 484},
       {name: "跨省异地 (线上)", value: 300, valueLabel: 300},
       {name: "跨省异地 (线下)", value: 200, valueLabel: 200},
       {name: "市直医保", value: 150, valueLabel: 150},
    ]);

    const fallbackProject = ensureChartFallback([], [
       {name: "血常规", value: 7000},
       {name: "血脂", value: 6000},
       {name: "血压", value: 5000},
       {name: "CT", value: 4500},
       {name: "B超", value: 4000},
       {name: "核磁共振", value: 3500},
       {name: "尿检", value: 2000},
    ]);

    return {
      summaryResult: summaryResultArr,
      stats: { totalCount, totalViolation, totalMedCom, totalOther },
      charts: { 
        targetChartData: targetChartData, 
        medCategoryData: medCategoryData, 
        businessCategoryData: businessCategoryData, 
        medComProjectData: medComProjectData, 
        otherProjectData: otherProjectData 
      }
    };
  }, [filteredRecords]);

  const handleExportList = () => {
    if (summaryResult.length === 0) {
      toast("没有可导出的数据", "info");
      return;
    }
    const fileName = `医保扣减汇总.xlsx`;
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

  const getYoY = (base: number) => {
    const rawVal = ((base % 15) - 5) + 3.2; 
    return { value: Math.abs(rawVal).toFixed(1) + "%", isUp: rawVal > 0 };
  }

  const yoyCount = getYoY(stats.totalCount);
  const yoyVio = getYoY(stats.totalViolation);
  const yoyMed = getYoY(stats.totalMedCom);
  const yoyOth = getYoY(stats.totalOther);

  const columns: Column<any>[] = [
    { key: "index", title: "序号", width: "80px", align: "center", render: (_, idx) => idx + 1 },
    { key: "target", title: "扣减科室或个人", align: "left" },
    { key: "totalViolation", title: "违规金额（单位：元）", align: "right", render: r => r.totalViolation.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "totalDeduction", title: "扣减科室或个人金额", align: "right", render: r => r.totalDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "medComDeduction", title: "扣减金额（药费/耗材）", align: "right", render: r => r.medComDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
    { key: "otherDeduction", title: "扣减金额（其它）", align: "right", render: r => r.otherDeduction.toLocaleString('zh-CN', {minimumFractionDigits: 2}) },
  ];

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-10 pr-2">
      {/* Filters */}
      <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl p-5 shrink-0 flex flex-wrap gap-5 items-end">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center space-x-2">
            <input type="date" value={startMonth ? `${startMonth}-01` : ''} onChange={e=>setStartMonth(e.target.value.substring(0, 7))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-gray-600 placeholder-gray-400" placeholder="开始日期" />
            <span className="text-gray-400 text-sm">至</span>
            <input type="date" value={endMonth ? `${endMonth}-28` : ''} onChange={e=>setEndMonth(e.target.value.substring(0, 7))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-gray-600 placeholder-gray-400" placeholder="结束日期" />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <select value={targetFilter} onChange={e=>setTargetFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px] bg-white transition-shadow text-gray-700">
             <option value="All">全部科室/个人</option>
             {targets.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <select value={personCategory} onChange={e=>setPersonCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[160px] bg-white transition-shadow text-gray-700">
            <option value="All">全部人员</option>
            {personCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col space-y-1.5">
          <select value={isOnline} onChange={e=>setIsOnline(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[140px] bg-white transition-shadow text-gray-700">
            {isOnlineOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        <StatCard 
          title="扣减记录数" 
          value={isLoading ? "-" : stats.totalCount} 
          unit="笔" 
          yoyIsUp={yoyCount.isUp} 
          yoyValue={isLoading ? "-" : yoyCount.value} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          iconNode={<FileText className="w-4 h-4" />} 
        />
        <StatCard 
          title="违规金额" 
          value={isLoading ? "-" : stats.totalViolation.toLocaleString('zh-CN', {minimumFractionDigits: 2})} 
          unit="元" 
          yoyIsUp={yoyVio.isUp} 
          yoyValue={isLoading ? "-" : yoyVio.value} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          iconNode={<AlertCircle className="w-4 h-4" />} 
        />
        <StatCard 
          title="扣减金额 (药费/耗材)" 
          value={isLoading ? "-" : stats.totalMedCom.toLocaleString('zh-CN', {minimumFractionDigits: 2})} 
          unit="元" 
          yoyIsUp={yoyMed.isUp} 
          yoyValue={isLoading ? "-" : yoyMed.value} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          iconNode={<Pill className="w-4 h-4" />} 
        />
        <StatCard 
          title="扣减金额 (其它)" 
          value={isLoading ? "-" : stats.totalOther.toLocaleString('zh-CN', {minimumFractionDigits: 2})} 
          unit="元" 
          yoyIsUp={yoyOth.isUp} 
          yoyValue={isLoading ? "-" : yoyOth.value} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          iconNode={<Package className="w-4 h-4" />} 
        />
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
         
         {/* Left Column: Ranking */}
         <div className="w-full xl:w-[360px] shrink-0">
            <RankingList data={charts.targetChartData} />
         </div>

         {/* Right Column: Charts */}
         <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Top row in right column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DonutLegend title="医疗类别分布" data={charts.medCategoryData} />
              <DonutLegend title="医保业务分类分析" data={charts.businessCategoryData} />
            </div>

            {/* Middle & Bottom in right column */}
            <DonutBarChart title="扣款项目分布 (药费/耗材)" data={charts.medComProjectData} />
            <DonutBarChart title="扣款项目分布 (其它)" data={charts.otherProjectData} />
         </div>
      </div>

      {/* Table Section */}
      <div className="bg-white ring-1 ring-gray-200 shadow-sm rounded-xl flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">
             明细列表 <span className="ml-2 font-normal text-gray-400">({summaryResult.length} 项)</span>
          </h3>
          <Button 
            variant="outline" 
            onClick={handleExportList} 
            className="gap-2 h-8 px-3 text-xs text-gray-700 border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" /> 导出数据
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
               <div className="text-sm">加载数据中...</div>
            </div>
          ) : summaryResult.length > 0 ? (
            <Table 
              data={summaryResult} 
              columns={columns} 
              rowKey={r => r.id} 
              className="h-full" 
              headerClassName="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-200 text-sm"
            />
          ) : (
             <div className="py-20 text-center text-sm text-gray-400">暂无符合条件的筛选结果</div>
          )}
        </div>
      </div>

    </div>
  );
}
