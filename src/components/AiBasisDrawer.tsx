import React from "react";
import { Drawer, DrawerSize } from "@/src/components/ui/Drawer";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Sparkles, FileText, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AiBasisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record?: any;
  size?: DrawerSize;
  width?: string;
}

export const AiBasisDrawer: React.FC<AiBasisDrawerProps> = ({
  isOpen,
  onClose,
  record,
  size = "xl" as DrawerSize,
  width,
}) => {
  const patientName = record?.data?.PATIENT_NAME || record?.PATIENT_NAME || "患者";
  const projectName = record?.data?.PROJECT_NAME || record?.PROJECT_NAME || "扣款项目";
  const violationDesc = record?.data?.VIOLATION_DESC || record?.VIOLATION_DESC || "规则校验";

  const appealVal = record?.data?.IS_APPEAL || record?.aiResult?.IS_APPEAL || record?.IS_APPEAL || "";
  const appealRemark = record?.data?.APPEAL_REMARK || record?.aiResult?.APPEAL_REMARK || record?.APPEAL_REMARK || "";
  const isUnable = appealRemark.includes("无法处理") || (!appealVal && appealRemark);
  const isAppeal = !isUnable && (appealVal === "申诉" || appealVal === "APPEAL");
  const isNoAppeal = !isUnable && (appealVal === "不申诉" || appealVal === "NO_APPEAL");

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800">AI 智能填报依据</span>
        </div>
      }
      size={size}
      width={width}
      placement="right"
    >
      <div className="flex flex-col h-full bg-[#f8fafc]">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-800">思维链路与推理依据</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 font-medium">
                  {patientName} · {projectName}
                </span>
                {isAppeal && <Badge status="success">AI建议申诉</Badge>}
                {isNoAppeal && <Badge status="default">AI建议不申诉</Badge>}
                {isUnable && <Badge status="warning">AI无法处理</Badge>}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              针对违规疑点「{violationDesc}」，医保审核智能体提取并分析患者病历数据的完整推理过程：
            </p>
          </div>

          {/* Reasoning Timeline */}
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {isAppeal && (
              <>
                {/* Timeline Item 1 - 申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-purple-500 text-white shadow shadow-purple-200 shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">1</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>提取出院小结与入院主诉诊断</span>
                      </div>
                      <Badge status="success">符合指征</Badge>
                    </div>
                    <div className="text-slate-600 text-xs mb-3">入院主诉及出院诊断明确，病案首页诊断编码与医保违规疑点校验项对应，具备临床基础。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 出院小结 / 入院记录</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-10 10:20</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 - 申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-purple-500 text-white shadow shadow-purple-200 shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">2</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>核查检验指标与临床病程记录</span>
                      </div>
                      <Badge status="success">生化指标支持</Badge>
                    </div>
                    <div className="text-slate-600 text-xs mb-3">生化检验及病程记录显示患者病情进展符合国家医保限定支付指征，诊疗过程具有充分必要性。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 生化检验单 / 病程记录</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-11 09:15</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 - 申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-purple-500 text-white shadow shadow-purple-200 shrink-0 relative z-10">
                    <span className="absolute -inset-1 rounded-full animate-ping bg-purple-400 opacity-20"></span>
                    <span className="text-xs font-bold leading-none">3</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-purple-200 shadow-sm ring-1 ring-purple-500/20 ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>医嘱比对与申诉决策判定</span>
                      </div>
                      <Badge status="success">建议申诉</Badge>
                    </div>
                    <div className="text-slate-700 font-medium text-xs mb-3">电子医嘱与执行记录闭环完整，已自动调取病历附件支持，推荐科室发起医保申诉。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 长期/临时医嘱单</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-12 14:30</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isNoAppeal && (
              <>
                {/* Timeline Item 1 - 不申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-500 text-white shadow shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">1</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-slate-500" />
                        <span>计费记录与单日频次核验</span>
                      </div>
                      <Badge status="default">已提取计费</Badge>
                    </div>
                    <div className="text-slate-600 text-xs mb-3">已调取该就诊记录全量费用明细，定位到对应项目的执行时间与计费频次。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 费用明细清单</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-10 11:00</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 - 不申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-amber-500 text-white shadow shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">2</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-amber-200 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span>规则知识库匹配与指征核对</span>
                      </div>
                      <Badge status="error">超出限定标准</Badge>
                    </div>
                    <div className="text-slate-600 text-xs mb-3">项目使用超出医保目录限定的单日计费频次/剂量，病案中未检索到急救抢救或特殊超频知情同意书。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 医保规则库 V2.4</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-11 10:15</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 - 不申诉 */}
                <div className="relative flex items-center justify-start group is-active pb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-slate-700 text-white shadow shrink-0 relative z-10">
                    <span className="text-xs font-bold leading-none">3</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-slate-300 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-slate-600" />
                        <span>违规事实明确，建议接受核减</span>
                      </div>
                      <Badge status="default">建议不申诉</Badge>
                    </div>
                    <div className="text-slate-700 text-xs mb-3">违规事实明确，证据链不支持发起申诉，智能系统建议科室确认并接受扣减。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 智能审核判定报告</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-12 15:00</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isUnable && (
              <>
                {/* Timeline Item 1 - 无法处理 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-purple-500 text-white shadow shadow-purple-200 shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">1</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>调取患者病案基本信息</span>
                      </div>
                      <Badge status="success">已获取</Badge>
                    </div>
                    <div className="text-slate-600 text-xs mb-3">成功检索到就诊流水号、患者身份信息及基础入院病案信息。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> HIS 就诊主索引</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-10 09:30</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 - 无法处理 */}
                <div className="relative flex items-center justify-start group is-active pb-8">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-amber-500 text-white shadow shadow-amber-200 shrink-0 z-10">
                    <span className="text-xs font-bold leading-none">2</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>关键病历佐证资料核查</span>
                      </div>
                      <Badge status="warning">关键资料缺失</Badge>
                    </div>
                    <div className="text-slate-700 text-xs mb-3">EMR及PACS系统中未检索到对应日期的手术麻醉记录单原件或影像检验报告，关键佐证材料不完整。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> EMR / PACS 接口检索</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-11 11:20</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 - 无法处理 */}
                <div className="relative flex items-center justify-start group is-active pb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-amber-600 text-white shadow shadow-amber-200 shrink-0 relative z-10">
                    <span className="text-xs font-bold leading-none">3</span>
                  </div>
                  <div className="w-[calc(100%-3rem)] bg-white p-4 rounded-xl border border-amber-300 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>无法自动判定，转人工审核</span>
                      </div>
                      <Badge status="warning">需人工介入</Badge>
                    </div>
                    <div className="text-slate-700 text-xs mb-3">由于关键诊疗材料缺失，智能规则无法完成闭环自动判定，申诉意见与附件置空，需专管员线下调取纸质病历后人工填报。</div>
                    <div className="flex items-center text-[10px] text-slate-400 gap-3">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 智能质控分流建议</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2024-03-12 16:00</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 text-white">
            我知道了
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

