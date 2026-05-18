import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  RefreshCw,
  Settings,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/components/ui/Button";
import { Table } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Pagination } from "@/src/components/ui/Pagination";
import { toast } from "@/src/components/ui/Toast";
import {
  mockApi,
  Task,
  ReviewTemplate,
  TemplateField,
} from "@/src/lib/mockData";
import { TASK_STATUS } from "@/src/lib/constants";

// Mock data generator no longer used, removed

const handleDownload = (filename: string) => {
  const blob = new Blob(["mock data"], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast(`成功导出 ${filename}`);
};

export default function DataQuery() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [task, setTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;

  const handleSwitchDepartment = () => {
    if (selectedIds.length === 0) {
      toast("请先勾选记录");
      return;
    }

    const records = mockApi.getTaskDetailRecords(task!.id);
    let updatedCount = 0;
    records.forEach((r: any) => {
      if (selectedIds.includes(r.id)) {
        if (r.data.EXECUTE_DEPT) {
          r.data.DEPARTMENT_NAME = r.data.EXECUTE_DEPT;
          mockApi.saveTaskDetailRecord(task!.id, r);
          updatedCount++;
        }
      }
    });

    if (updatedCount > 0) {
      toast(`成功切换 ${updatedCount} 条记录的下发科室`, "success");
      const updatedRecords = mockApi.getTaskDetailRecords(task!.id);
      setData(updatedRecords.map((rec: any) => ({ ...rec.data, id: rec.id })));
      setSelectedIds([]);
    } else {
      toast("未找到执行科室数据，无法切换");
    }
  };

  const fetchTaskData = () => {
    const allTasks = mockApi.getTasks(1, 1000).data;
    const t = allTasks.find((t) => t.id === id) || allTasks[0];
    if (t) {
      setTask(t);
      const allTemplates = mockApi.getTemplates();
      const tpl =
        allTemplates.find((tpl) => tpl.id === t.templateId) || allTemplates[0];
      if (tpl && !template) {
        setTemplate(tpl);
      }
      const details = mockApi.getTaskDetailRecords(t.id);
      const tableData = details.map((rec: any) => ({
        ...rec.data,
        id: rec.id,
      }));
      setData(tableData);
    }
  };

  useEffect(() => {
    fetchTaskData();
    const handleUpdate = () => {
      fetchTaskData();
    };
    window.addEventListener("task_updated", handleUpdate);
    return () => {
      window.removeEventListener("task_updated", handleUpdate);
    };
  }, [id]);

  const handleRestartAIFill = () => {
    if (task) {
      toast("正在重新智能填报...", "success");
      mockApi.startAIFill(task.id);
      fetchTaskData();
    }
  };

  if (!task || !template)
    return <div className="p-6">加载中或任务未找到...</div>;

  const queryFields = template.fields.filter((f) => f.isQueryable);

  const renderSearchInput = (field: TemplateField) => {
    const isSpecialSelect = [
      "PATIENT_NAME",
      "PROJECT_NAME",
      "RULE_NAME",
      "DEPARTMENT_NAME",
      "DOCTOR",
      "MEDICAL_MODE",
    ].includes(field.name);

    if (isSpecialSelect || field.name === "STATUS") {
      return (
        <select
          className="h-8 border border-slate-300 rounded px-2 text-sm bg-white min-w-[120px] max-w-[160px] truncate"
          defaultValue=""
        >
          <option value="">全部</option>
          <option value="1">选项1</option>
          <option value="2">选项2</option>
        </select>
      );
    }
    return (
      <input
        type="text"
        className="h-8 border border-slate-300 rounded px-2 text-sm min-w-[120px] max-w-[160px]"
        placeholder="请输入"
      />
    );
  };

  const columns = [
    {
      key: "checkbox",
      fixed: "left" as const,
      title: (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={
            data.length > 0 &&
            selectedIds.length === Math.min(pageSize, data.length)
          }
          onChange={(e) => {
            const currentIds = data
              .slice((page - 1) * pageSize, page * pageSize)
              .map((d) => d.id);
            if (e.target.checked) setSelectedIds(currentIds);
            else setSelectedIds([]);
          }}
        />
      ),
      width: "50px",
      render: (r: any) => (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={selectedIds.includes(r.id)}
          onChange={() => {
            setSelectedIds((prev) =>
              prev.includes(r.id)
                ? prev.filter((i) => i !== r.id)
                : [...prev, r.id],
            );
          }}
        />
      ),
    },
    ...template.fields.map((f) => ({
      key: f.name,
      title: f.comment || f.name,
      width: "15%",
      render: (r: any) => {
        const val = r[f.name];
        if (f.name === "VIOLATION_AMOUNT")
          return val ? `¥${Number(val).toFixed(2)}` : "-";
        if (f.name === "APPEAL_ATTACHMENT") {
          return val ? (
            <span className="text-blue-600 hover:underline cursor-pointer">
              {val}
            </span>
          ) : (
            "-"
          );
        }
        return (
          <div className="truncate max-w-[150px]" title={val}>
            {val || "-"}
          </div>
        );
      },
    })),
  ];

  const currentData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-5 flex flex-col h-full bg-slate-50/50">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full p-5">
        {/* Title and Back */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800">数据查询</h1>
          </div>
          <Link to="/task-management/task-list/index">
            <Button variant="outline" size="sm">
              返回
            </Button>
          </Link>
        </div>

        {/* Task Info */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 flex-wrap">
          <h2 className="text-lg text-slate-700 font-medium">{task.name}</h2>
          <Badge status="info">{TASK_STATUS[task.status]}</Badge>
          
          {task.aiFillTotal !== undefined && task.aiFillProgress !== undefined && (
            <div className="flex items-center gap-3 ml-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                智能填报
              </span>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(task.aiFillProgress / task.aiFillTotal) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-slate-500 font-mono">
                {task.aiFillProgress}/{task.aiFillTotal} ({Math.round((task.aiFillProgress / task.aiFillTotal) * 100)}%)
              </span>
              {task.aiFillProgress === task.aiFillTotal && (
                <button 
                  onClick={handleRestartAIFill}
                  className="flex items-center justify-center p-1 hover:bg-slate-200 rounded text-blue-600 transition-colors ml-1"
                  title="重新智能填报"
                >
                  <RefreshCw className="w-4 h-4 cursor-pointer" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-end gap-2 flex-shrink-0 order-1 xl:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={
                showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : ""
              }
            >
              <Filter className="w-4 h-4 mr-1.5" />
              筛选
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwitchDepartment}
              disabled={selectedIds.length === 0}
              className={
                selectedIds.length === 0
                  ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
                  : "text-blue-600 border-blue-200 hover:bg-blue-50"
              }
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              切换科室
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("部分数据")}
              disabled={selectedIds.length === 0}
              className={
                selectedIds.length === 0
                  ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
                  : "text-blue-600 border-blue-200 hover:bg-blue-50"
              }
            >
              <Download className="w-4 h-4 mr-1.5" />
              下载数据
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast("刷新成功", "success")}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              刷新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload("所有数据")}
            >
              <Download className="w-4 h-4 mr-1.5" />
              导出所有数据
            </Button>
            <Button variant="outline" size="sm" className="px-2" onClick={() => toast("设置已打开")}>
              <Settings className="w-4 h-4 text-slate-500" />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="overflow-hidden order-2 xl:order-1"
              >
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                  {queryFields.map((f) => (
                    <div key={f.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap min-w-[70px]">
                        {f.comment || f.name}
                      </span>
                      {renderSearchInput(f)}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="primary" size="sm" className="px-5" onClick={() => toast("查询成功", "success")}>
                      <Search className="w-4 h-4 mr-1.5" />
                      查询
                    </Button>
                    <Button variant="outline" size="sm" className="px-5" onClick={() => toast("搜索条件已重置", "success")}>
                      重置
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border border-slate-100 rounded-md mb-4 scrollbar-thin">
          <Table
            columns={columns}
            data={currentData}
            rowKey={(r: any) => r.id}
          />
        </div>

        {/* Pagination */}
        <div className="flex-shrink-0 flex items-center justify-end py-2">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              共 {Math.ceil(data.length / pageSize)} 页，{data.length} 条
            </span>
            <span className="text-sm text-slate-500 bg-white border border-slate-300 rounded px-2 py-1 relative -top-px inline-flex items-center">
              20条/页
            </span>
            <Pagination
              current={page}
              total={data.length}
              pageSize={pageSize}
              onChange={setPage}
            />
            <div className="flex items-center gap-1 text-sm text-slate-500">
              前往
              <input
                type="number"
                min="1"
                max={Math.ceil(data.length / pageSize)}
                className="w-12 h-7 border border-slate-300 rounded px-1 text-center bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (
                      !isNaN(val) &&
                      val > 0 &&
                      val <= Math.ceil(data.length / pageSize)
                    ) {
                      setPage(val);
                    }
                  }
                }}
              />
              页
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
