import React, { useState, useEffect, useMemo } from "react";
import { mockApi } from "@/src/lib/mockData";
import { RefreshCw, Search } from "lucide-react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Drawer } from "@/src/components/ui/Drawer";

const CATEGORIES = [
  "广州医保（线上）",
  "广州医保（线下）",
  "省内异地（线上）",
  "省内异地（线下）",
  "跨省异地（线上）",
  "跨省异地（线下）",
  "市直医保",
  "省直医保",
  "荔湾公医",
  "白云公医",
  "海珠公医",
  "从化公医",
  "花都公医",
  "黄埔公医"
];

export default function DeductionCalendar() {
  const [year, setYear] = useState("2024");
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ category: string, month: number } | null>(null);

  useEffect(() => {
    loadData();
  }, [year]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allTasks = mockApi.getTasks(1, 1000).data;
      const dedTasks = allTasks.filter(t => t.templateName === "医保院内扣减");
      setTasks(dedTasks);
      setIsLoading(false);
    }, 400);
  };

  // Build matrix data
  const matrixData = useMemo(() => {
    return CATEGORIES.map((category, index) => {
      const row: any = { id: category, index: index + 1, category };
      for (let m = 1; m <= 12; m++) {
        const monthStr = m.toString().padStart(2, '0');
        const yearMonth = `${year}年${monthStr}月`;
        
        let status = "";
        
        // --- Mocking precise business logic matching the requirement ---
        // For demonstration to match the requested output:
        // "1月默认显示已完成, 2月默认显示进行中, 3月空白"
        // Also we tie it to "广州医保（线下）" because the mock feedback tasks were "广州医保线下反馈核查"
        if (category === "广州医保（线下）") {
           if (year === "2024") {
              if (m === 1) status = "已完成";
              if (m === 2) status = "进行中";
           }
        }
        
        // Find if this category+month really has any deduction tasks in the mock
        if (!status) {
           const relatedDeductions = tasks.filter(t => !t.parentId && t.name.includes(yearMonth));
           // (In a real system, we look at the tasks' underlying records to see if they match the `category`)
           // We bypass assigning status for other categories here so they remain empty as expected.
        }

        row[`month_${m}`] = status;
      }
      return row;
    });
  }, [tasks, year]);

  const handleCellClick = (category: string, month: number, status: string) => {
    if (!status) return; // Ignore empty cells
    setSelectedCell({ category, month });
    setIsDrawerOpen(true);
  };

  // Get matching tasks for Drawer based on clicked cell
  const drawerTasks = useMemo(() => {
    if (!selectedCell) return [];
    const monthStr = selectedCell.month.toString().padStart(2, '0');
    const yearMonth = `${year}年${monthStr}月`;
    
    // Parent deduction tasks for the period
    const parentTasks = tasks.filter(t => !t.parentId && t.name.includes(yearMonth));
    
    return parentTasks.map(parent => {
       const subtasks = tasks.filter(t => t.parentId === parent.id);
       const isAllConfirmed = parent.status === "END"; // If parent is END, meaning all sub tasks ended
       return {
           id: parent.id,
           name: parent.name,
           status: parent.status,
           publishTime: parent.createTime,
           confirmedStatus: isAllConfirmed ? "已全部确认" : "部分确认/未确认", 
           totalDeduction: mockApi.getTaskDetailRecords(parent.id)
                              .reduce((sum, d) => sum + (Number(d.data?.VIOLATION_AMOUNT || 0)), 0)
                              .toFixed(2) // mocking an aggregation
       };
    });
  }, [selectedCell, tasks, year]);

  const columns: Column<any>[] = [
    { key: "index", title: "序号", width: "60px", align: "center", fixed: "left", className: "bg-slate-50/80 !bg-slate-50" },
    { key: "category", title: "医保分类", width: "160px", fixed: "left", className: "bg-slate-50/80 !bg-slate-50", render: (r) => <span className="font-medium text-slate-700">{r.category}</span> },
    ...Array.from({ length: 12 }).map((_, i) => ({
      key: `month_${i + 1}`,
      title: `${i + 1}月`,
      minWidth: "90px",
      align: "center" as const,
      render: (r: any) => {
        const status = r[`month_${i + 1}`];
        if (!status) return null;
        const isComplete = status === "已完成";
        return (
          <div 
            onClick={() => handleCellClick(r.category, i + 1, status)}
            className={`
              inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors
              ${isComplete ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-sky-50 text-sky-600 hover:bg-sky-100"}
            `}
          >
            {status}
          </div>
        );
      }
    }))
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* 顶部操作区 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm border border-slate-200 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700">统计年份</span>
          <select 
            className="text-sm border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2025">2025年</option>
            <option value="2024">2024年</option>
            <option value="2023">2023年</option>
          </select>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {/* 主表格 */}
      <div className="flex-1 min-h-0 bg-white rounded-md shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center justify-center py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-wide">{year}年院内扣减台历</h2>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          <Table 
            data={matrixData} 
            columns={columns} 
            rowKey={(r) => r.id} 
            className="h-full" 
            // 题头浅橙色/浅米色
            headerClassName="bg-amber-50/60 text-amber-900 font-semibold"
          />
        </div>
      </div>

      {/* 详情抽屉 */}
      <Drawer
        title={selectedCell ? `${year}年${selectedCell.month}月 - ${selectedCell.category} 相关关联任务` : "相关任务"}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width="max-w-[500px]"
      >
        <div className="p-4">
            {drawerTasks.length > 0 ? (
                <div className="space-y-4">
                    {drawerTasks.map(task => (
                        <div key={task.id} className="p-5 border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col space-y-3 relative overflow-hidden transition-all hover:shadow-md">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === "END" ? "bg-slate-300" : "bg-sky-500"}`}></div>
                            
                            <div className="font-semibold text-slate-800 text-base">{task.name}</div>
                            
                            <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 px-3 py-2.5 rounded-md border border-slate-100">
                                <div><span className="text-slate-400">任务状态：</span>
                                  <span className={task.status === "END" ? "text-slate-500" : "text-sky-600 font-medium"}>
                                    {task.status === "END" ? "已结束" : "进行中"}
                                  </span>
                                </div>
                                <div><span className="text-slate-400">下发时间：</span>{task.publishTime}</div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm pt-1">
                                <span className="text-slate-500 font-medium">扣减金额合计</span>
                                <span className="text-rose-600 font-bold text-lg">￥{task.totalDeduction}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        <span className="text-2xl opacity-60">📅</span>
                    </div>
                    <p className="text-base text-slate-500">暂无相关院内扣减任务</p>
                </div>
            )}
        </div>
      </Drawer>
    </div>
  );
}

