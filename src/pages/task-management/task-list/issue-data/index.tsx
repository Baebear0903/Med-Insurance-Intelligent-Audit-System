import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { Table, Column } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Pagination } from "@/src/components/ui/Pagination";
import { mockApi, Task, ReviewTemplate } from "@/src/lib/mockData";

export default function IssueData() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [task, setTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const allTasks = mockApi.getTasks(1, 1000).data;
    const t = allTasks.find(t => t.id === id) || allTasks[0];
    if (t) {
      setTask(t);
      const allTemplates = mockApi.getTemplates();
      const tpl = allTemplates.find(tpl => tpl.id === t.templateId) || allTemplates[0];
      if (tpl) {
        setTemplate(tpl);
        const details = mockApi.getTaskDetailRecords(t.id);
        const tableData = details.map((rec: any) => ({
          ...rec.data,
          id: rec.id
        }));
        setData(tableData);
      }
    }
  }, [id]);

  if (!task || !template) {
    return <div className="p-5">加载中...</div>;
  }

  const columns: Column<any>[] = [
    { key: "index", title: "序号", width: "80px", render: (_: any, index: number) => (page - 1) * pageSize + index + 1 },
    ...template.fields.map(f => ({
      key: f.name,
      title: f.comment || f.name,
      width: "15%",
      render: (r: any) => {
        const val = r[f.name];
        if (f.name === "VIOLATION_AMOUNT") return val ? `¥${Number(val).toFixed(2)}` : "-";
        if (f.name === "APPEAL_ATTACHMENT") {
          return val ? <span className="text-blue-600 hover:underline cursor-pointer">{val}</span> : "-";
        }
        return <div className="truncate max-w-[150px]" title={val}>{val || "-"}</div>;
      }
    }))
  ];

  const currentData = data.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(data.length / pageSize) || 1;

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="bg-white px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] z-10 relative">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">问题数据</h1>
          <Badge status="info">{task.name}</Badge>
        </div>
        <Link to="/task-management/task-list/index">
          <Button variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-50 relative">
            返回
          </Button>
        </Link>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0 relative z-0">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative z-0">
          <div className="flex-1 overflow-auto rounded-xl relative z-10 bg-white">
            <Table 
              columns={columns} 
              data={currentData} 
              rowKey={(r: any) => r.id} 
            />
          </div>
          
          <div className="shrink-0 p-4 border-t border-slate-100 bg-white flex justify-end relative z-10">
            <Pagination 
              current={page} 
              total={data.length} 
              pageSize={pageSize}
              onChange={setPage} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
