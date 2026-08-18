import React, { useState } from "react";
import { Bot, FileText, ChevronDown, Check, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface AiReasoningCardProps {
  record: any;
  defaultExpanded?: boolean;
  onPreviewFile?: (fileName: string) => void;
  className?: string;
}

export const AiReasoningCard: React.FC<AiReasoningCardProps> = ({
  record,
  defaultExpanded = true,
  onPreviewFile,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!record) return null;

  const data = record.data || record || {};
  const patientName = data.PATIENT_NAME || record.PATIENT_NAME || "患者";
  const age = data.AGE || data.PATIENT_AGE || "71";
  const projectName = data.PROJECT_NAME || record.PROJECT_NAME || "玻璃体腔注射雷珠单抗 (右眼)";
  const admitDate = data.ADMISSION_DATE || "2026-01-05";
  const dischargeDate = data.DISCHARGE_DATE || "2026-01-06";
  const diseaseName = data.DISEASE_NAME || "双眼2型糖尿病性视网膜病变、双眼黄斑水肿";

  // Determine judgment type
  const appealVal = data.IS_APPEAL || record.aiResult?.IS_APPEAL || record.IS_APPEAL || "";
  const appealRemark = data.APPEAL_REMARK || record.aiResult?.APPEAL_REMARK || record.APPEAL_REMARK || "";
  const isUnable = appealRemark.includes("无法处理") || appealRemark.includes("无法判断") || (!appealVal && Boolean(appealRemark));
  const isAppeal = !isUnable && (appealVal === "申诉" || appealVal === "APPEAL");
  const isNoAppeal = !isUnable && (appealVal === "不申诉" || appealVal === "NO_APPEAL");

  // Determine document slug and reference source
  let docTitle = "药品说明书 · 雷珠单抗注射液";
  let docTag = "审方系统";
  let docUrl = "https://sfxt.example.com/instructions/leizhukang-zhushesheye.pdf";
  let docNote = "作为本次推理的限定条件来源，暂无法提取说明书内知识，仅提供原文地址";
  let docCategory = "参考依据 · 药品说明书";

  if (projectName.includes("CT") || projectName.includes("核磁") || projectName.includes("检查")) {
    docTitle = `大型医用设备检查规范 · ${projectName}`;
    docTag = "医保知识库";
    docUrl = `https://sfxt.example.com/guidelines/${encodeURIComponent(projectName)}.pdf`;
    docCategory = "参考依据 · 诊疗规范与检查指征";
  } else if (projectName.includes("血") || projectName.includes("化验")) {
    docTitle = `临床检验项目医保支付指征 · ${projectName}`;
    docTag = "医保知识库";
    docUrl = `https://sfxt.example.com/guidelines/${encodeURIComponent(projectName)}.pdf`;
    docCategory = "参考依据 · 检验限定标准";
  } else if (isNoAppeal) {
    docTitle = "医保规则知识库 · 单日频次与超限计费规则";
    docTag = "规则校验库";
    docUrl = "https://sfxt.example.com/rules/daily-limit-verification.pdf";
    docCategory = "参考依据 · 医保目录规则";
  }

  // Generate Steps
  let steps: Array<{
    num: number;
    title: string;
    statusText: string;
    statusType: "success" | "danger" | "warning";
    evidence: string;
  }> = [];

  let conclusionText = "";

  if (isUnable) {
    steps = [
      {
        num: 1,
        title: "解析诊断信息",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `出院小结 ${dischargeDate} 09:20 — 诊断「双眼2型糖尿病性视网膜病变」「双眼黄斑水肿」`,
      },
      {
        num: 2,
        title: "核对年龄限制",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `病历首页 — 患者 ${age} 岁，符合「≥50 岁」限定条件`,
      },
      {
        num: 3,
        title: "核对治疗记录",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `手术记录 ${admitDate} 14:30 — ${projectName}`,
      },
      {
        num: 4,
        title: "核查病眼基线矫正视力",
        statusText: "✕ 缺失",
        statusType: "danger",
        evidence: "未找到首次处方视力记录，无法证明视力在 0.05–0.5 范围内",
      },
      {
        num: 5,
        title: "核查事前审查与影像学证据",
        statusText: "✕ 缺失",
        statusType: "danger",
        evidence: "未找到「事前审查」记录及「血管造影或 OCT」检查报告",
      },
      {
        num: 6,
        title: "核查累计使用支数",
        statusText: "✕ 缺失",
        statusType: "danger",
        evidence: "未找到该药品累计使用支数记录，无法排除超量支付风险",
      },
    ];

    conclusionText = `当前病例虽明确诊断为「双眼2型糖尿病性视网膜病变」及「双眼黄斑水肿」，且患者${age}岁符合年龄限制，病程记录证实于${admitDate}行${projectName}，但现有证据缺失以下关键审核要件：1. 缺乏首次处方时的「病眼基线矫正视力」记录，无法证明视力在0.05-0.5范围内；2. 缺乏「事前审查」记录及「血管造影或OCT」检查报告，无法证明符合初次申请影像学证据要求；3. 缺乏该药品累计使用支数记录，无法排除超量支付风险。因缺少上述核心限定条件证据，无法判断是否满足医保支付范围。`;
  } else if (isAppeal) {
    const attachment = `${patientName}_${dischargeDate}_${projectName}_病历小结.pdf`;
    steps = [
      {
        num: 1,
        title: "解析诊断信息",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `出院小结 ${dischargeDate} 09:20 — 诊断「${diseaseName}」主诉明确，具备临床依据`,
      },
      {
        num: 2,
        title: "核对用药/诊疗限定指征",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `生化指标与病程记录 ${admitDate} — 患者检验指标与适应症完全相符，符合医保限定支付指征`,
      },
      {
        num: 3,
        title: "核对医嘱执行记录",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `电子医嘱单 — ${projectName} 给药剂量与频次符合国家诊疗规范与临床路径标准`,
      },
      {
        num: 4,
        title: "核查病历附件佐证闭环",
        statusText: "✓ 符合",
        statusType: "success",
        evidence: `已成功关联调取附件「${attachment}」，形成完整证据链`,
      },
    ];

    conclusionText = `经全量病历智能比对与知识库核验，患者明确诊断为「${diseaseName}」，生化检验指标与临床病程记录符合国家基本医保限定支付指征；医嘱执行记录与费用明细闭环一致，已自动提取病历小结及用药执行佐证材料，证据链充分完整，推荐科室发起医保申诉。`;
  } else {
    // isNoAppeal
    steps = [
      {
        num: 1,
        title: "解析费用明细与计费频次",
        statusText: "✓ 已提取",
        statusType: "success",
        evidence: `费用清单 — 定位到「${projectName}」单日执行频次与计费记录`,
      },
      {
        num: 2,
        title: "核对医保限定规则标准",
        statusText: "✕ 超标",
        statusType: "danger",
        evidence: "医保目录限定单日计费上限，当前记录计费频次超出推荐限定标准",
      },
      {
        num: 3,
        title: "核查特殊指征与知情同意书",
        statusText: "✕ 缺失",
        statusType: "danger",
        evidence: "病案记录中未查见急救抢救或特殊超频知情同意书，无临床豁免依据",
      },
      {
        num: 4,
        title: "违规事实综合判定",
        statusText: "✕ 属实",
        statusType: "danger",
        evidence: "违规事实清楚，证据链不支持发起医保申诉",
      },
    ];

    conclusionText = `经医保规则库与费用清单核对，该就诊记录中「${projectName}」的使用超出了医保目录限定的单日计费频次与用量标准；病历记录中未查见抢救或特殊超频知情同意书，违规事实清楚，证据链不支持发起申诉，智能系统建议科室确认并接受扣减。`;
  }

  const handleOpenDoc = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPreviewFile) {
      onPreviewFile(docTitle);
    } else {
      window.open(docUrl, "_blank");
    }
  };

  return (
    <div className={cn("border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-sm transition-all", className)}>
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AI Robot Icon */}
          <div className="w-6 h-6 rounded-md bg-sky-100/80 flex items-center justify-center text-sky-600">
            <Bot className="w-4 h-4" />
          </div>
          
          <span className="text-sm font-bold text-slate-800">AI 智能填报依据</span>

          {/* Status Badge Tag */}
          {isUnable && (
            <span className="inline-flex items-center gap-1 bg-[#f97316] text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>AI未找到相关病历数据，无法判断</span>
            </span>
          )}

          {isAppeal && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-xs">
              <Check className="w-3.5 h-3.5" />
              <span>AI判定建议申诉</span>
            </span>
          )}

          {isNoAppeal && (
            <span className="inline-flex items-center gap-1 bg-slate-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-xs">
              <X className="w-3.5 h-3.5" />
              <span>AI判定建议不申诉，接受核减</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 shrink-0 ml-2">
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200 text-slate-400",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-slate-100 space-y-4 text-xs">
              {/* Part 1: 参考依据 · 药品说明书 */}
              <div>
                <div className="text-xs text-slate-400 font-medium mb-2.5">
                  {docCategory}
                </div>
                
                <div className="bg-[#f4f8fe] border border-[#dbeafe] rounded-lg p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-semibold text-slate-800 text-xs">
                        {docTitle}
                      </span>
                      <span className="bg-[#dbeafe] text-[#1d4ed8] text-[10px] font-medium px-1.5 py-0.5 rounded">
                        {docTag}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {docNote}
                  </p>

                  <div className="bg-white border border-blue-100/90 rounded-md px-3 py-1.5 flex items-center justify-between gap-3">
                    <span className="text-slate-600 font-mono text-[11px] truncate select-all">
                      {docUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleOpenDoc}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>打开</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Part 2: 思维链路 */}
              <div>
                <div className="text-xs text-slate-400 font-medium mt-4 mb-3">
                  思维链路
                </div>

                <div className="space-y-3.5 pl-1">
                  {steps.map((step) => (
                    <div key={step.num} className="relative">
                      {/* Step Header */}
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#dbeafe] text-[#2563eb] text-[11px] font-bold flex items-center justify-center shrink-0">
                          {step.num}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">
                          {step.title}
                        </span>
                        
                        {step.statusType === "success" && (
                          <span className="inline-flex items-center bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full font-medium">
                            {step.statusText}
                          </span>
                        )}

                        {step.statusType === "danger" && (
                          <span className="inline-flex items-center bg-rose-50 text-rose-600 border border-rose-200 text-[10px] px-1.5 py-0.2 rounded-full font-medium">
                            {step.statusText}
                          </span>
                        )}

                        {step.statusType === "warning" && (
                          <span className="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-medium">
                            {step.statusText}
                          </span>
                        )}
                      </div>

                      {/* Evidence sub-branch */}
                      <div className="ml-2 pl-3 py-1 mt-1 border-l-2 border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed break-words">{step.evidence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3: 推理结论 */}
              <div>
                <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5 mt-4 mb-2">
                  <span>💡</span>
                  <span>推理结论</span>
                </div>

                <div className="bg-[#fef9ee] border border-[#fde68a] rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed font-normal shadow-2xs">
                  {conclusionText}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
