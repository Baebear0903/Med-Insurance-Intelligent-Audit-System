import React, { useState } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Plus, Wand2 } from "lucide-react";
import { toast } from "@/src/components/ui/Toast";

export function IntelligentFill() {
  const [data] = useState([
    { id: 1, name: "门诊收费项目自动匹配", type: "数据抽取", target: "报销明细表", status: "生效中" },
    { id: 2, name: "患者基础信息自动回填", type: "表单回填", target: "患者主索引", status: "生效中" },
    { id: 3, name: "异地就医结算公式计算", type: "逻辑计算", target: "跨省结算单", status: "已停用" },
  ]);

  const columns: Column<any>[] = [
    { key: "name", title: "规则名称" },
    { key: "type", title: "规则类型" },
    { key: "target", title: "目标表单" },
    { key: "status", title: "状态", render: (r: any) => <span className={r.status === '生效中' ? 'text-green-600' : 'text-slate-400'}>{r.status}</span> },
    { key: "action", title: "操作", fixed: "right", render: () => <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={() => toast("展示配置说明", "info")}>配置说明</button> }
  ];

  return (
    <div className="p-5 flex flex-col h-full">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
              <Wand2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">智能填写规则配置</h2>
          </div>
          <Button variant="primary" size="sm" onClick={() => toast("开发中：新建智能填写规则", "info")}>
            <Plus className="w-4 h-4 mr-1" />
            新建规则
          </Button>
        </div>

        <Table columns={columns} data={data} rowKey={(r) => r.id.toString()} />
      </div>
    </div>
  );
}
