import React, { useState } from "react";
import { CheckCircle2, MessageCircleQuestion, FileEdit, Calculator, ShieldCheck } from "lucide-react";
import { useUser } from "@/src/lib/userContext";

export function OperateIns() {
  const { role } = useUser();
  const isAdmin = role === "ADMIN";
  const [activeTab, setActiveTab] = useState<"admin" | "secretary">(isAdmin ? "admin" : "secretary");

  // React to role changes
  React.useEffect(() => {
    if (!isAdmin) {
      setActiveTab("secretary");
    }
  }, [isAdmin]);

  return (
    <div className="p-5 w-full h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 max-w-4xl w-full mx-auto min-h-full flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-2">
          {isAdmin && (
            <button
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === "admin"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("admin")}
            >
              医保管理员操作手册
            </button>
          )}
          <button
            className={`px-6 py-4 font-medium text-sm transition-colors relative ${
              activeTab === "secretary"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-[1px]"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("secretary")}
          >
            医保秘书操作手册
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-12">
          {activeTab === "admin" && isAdmin && (
            <>
              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3 font-semibold">01</span>
                  任务管理流程 (管理员)
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>管理员通过“任务列表”菜单查看和管理所有科室的任务状态，确保按时完成。</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>待发任务：系统自动创建，等待医保办审核并下发给相关临床科室。</li>
                    <li>填报中任务：已下发给相关科室的填报人员。您可以点击“编排”设置填报截止日期。</li>
                  </ul>
                  <div className="w-full h-64 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
                    <span>[任务管理流程界面截图占位]</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3 font-semibold">02</span>
                  智能审核与模板配置
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>在“配置中心”中，预置了多种医保合规性检查规则。管理员可以根据医院实际情况配置规则的启用/停用及严重程度。</p>
                  <p>当任务流转至“数据审核”阶段，系统会自动调用这些启用的模板，智能标记疑似异常数据。</p>
                  <div className="w-full h-64 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                    <MessageCircleQuestion className="w-10 h-10 mb-2 opacity-50" />
                    <span>[模板配置界面截图占位]</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm mr-3 font-semibold">03</span>
                  院内扣减管理
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>管理员在“院内扣减管理”模块中，可以汇总和审核各科室的扣款情况，生成最终报表并归档。</p>
                  <div className="w-full h-64 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                    <Calculator className="w-10 h-10 mb-2 opacity-50" />
                    <span>[扣减管理界面截图占位]</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "secretary" && (
            <>
              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm mr-3 font-semibold">01</span>
                  任务接收与填报 (医保秘书)
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>医保秘书通过“任务填报”菜单，查看分配给本科室的医保审核任务，并按要求提交自查数据。</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>未填报：收到新任务后，需尽快完成填报工作。支持在线录入和AI智能填报。</li>
                    <li>待审核：填报完成并提交后，等待医保办审核。</li>
                  </ul>
                  <div className="w-full h-64 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                    <FileEdit className="w-10 h-10 mb-2 opacity-50" />
                    <span>[任务填报界面截图占位]</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm mr-3 font-semibold">02</span>
                  缺陷数据修正与申诉
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4">
                  <p>当填报的数据被医保办“审核变更”或“驳回”时，医保秘书需要根据反馈意见进行数据修正或提起申诉。</p>
                  <p>对于系统智能标记的违规项，如果不认可，可上传相关医疗凭证材料进行申诉。</p>
                  <div className="w-full h-64 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-slate-400 mt-6">
                    <ShieldCheck className="w-10 h-10 mb-2 opacity-50" />
                    <span>[修正与申诉界面截图占位]</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
