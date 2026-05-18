import React from "react";
import { CheckCircle2, MessageCircleQuestion } from "lucide-react";

export function OperateIns() {
  return (
    <div className="p-5 flex justify-center w-full h-full overflow-y-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-10 max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">系统操作与业务指引</h1>
          <p className="text-slate-500">版本 V2.0.1 | 更新时间：2023-11-20</p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3">01</span>
              任务管理流程
            </h2>
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p>业务人员通过“任务列表”菜单查看所有被分配的自查和审核任务。每个任务的状态会根据您的操作实时更新。</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>待发任务：系统自动创建，等待医保办审核并下发。</li>
                <li>填报中任务：已下发给相关科室的填报人员。您可以点击“编排”设置填报截止日期。</li>
              </ul>
              {/* placeholder image */}
              <div className="w-full h-64 bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
                <span>[任务管理流程界面截图占位]</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3">02</span>
              智能审核与模板配置
            </h2>
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p>在“审核模板”中，我们预置了多种医保合规性检查规则。用户可以配置规则的启用/停用。</p>
              <p>当任务流转至“数据审核”阶段，系统会自动调用这些启用的模板，为您标记疑似异常数据。</p>
              <div className="w-full h-64 bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                <MessageCircleQuestion className="w-10 h-10 mb-2 opacity-50" />
                <span>[模板配置界面截图占位]</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
