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
  Upload,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/src/components/ui/Button";
import { Table } from "@/src/components/ui/Table";
import { Badge } from "@/src/components/ui/Badge";
import { Pagination } from "@/src/components/ui/Pagination";
import { toast } from "@/src/components/ui/Toast";
import { Modal } from "@/src/components/ui/Modal";
import {
  mockApi,
  Task,
  ReviewTemplate,
  TemplateField,
} from "@/src/lib/mockData";
import { TASK_STATUS, DEPARTMENTS } from "@/src/lib/constants";
import { downloadZipWithExcel } from "@/src/lib/exportUtils";
import { ColumnSettingsModal, ColumnItem } from "@/src/components/ColumnSettingsModal";
import { useUser } from "@/src/lib/userContext";

// Mock data generator no longer used, removed

export default function DataQuery() {
  const { role } = useUser();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [task, setTask] = useState<Task | null>(null);
  const [template, setTemplate] = useState<ReviewTemplate | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;
  const [isSwitchDeptOpen, setIsSwitchDeptOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("内科");

  const handleDownload = async (type: "部分数据" | "所有数据") => {
    if (!task || !template) return;
    toast("正在准备打包数据...", "info");

    const allRecords = mockApi.getTaskDetailRecords(task.id);
    let targetRecords = allRecords;

    if (type === "部分数据") {
      targetRecords = allRecords.filter((r: any) => selectedIds.includes(r.id));
      if (targetRecords.length === 0) {
        toast("没有勾选任何数据！", "error");
        return;
      }
    }

    // 拼装表头
    const headers = [
      "序号",
      "填报状态",
      "审核状态",
      ...template.fields.map(f => f.displayName || f.comment || f.name)
    ];

    // 拼装数据行
    const rows = targetRecords.map((r: any, idx: number) => {
      const getStatusLabel = (s: number) => {
        if (s === 0) return "未填报";
        if (s === 1) return "已提交/已填报";
        if (s === 5) return "AI填报";
        if (s === 51) return "填报中";
        if (s === 52) return "AI暂停";
        if (s === 2) return "审核通过";
        if (s === 6) return "审核变更";
        if (s === 3) return "驳回";
        if (s === 4) return "撤销";
        return s || "未开始";
      };
      
      const getAuditStatusLabel = (ast: number) => {
        if (ast === 1) return "审批通过";
        if (ast === 9) return "审核变更";
        if (ast === 2) return "已驳回";
        if (ast === 0) return "编辑待审核";
        if (ast === 3) return "编辑待提交";
        if (ast === 7) return "填报中";
        if (ast === 8) return "填报待审核";
        return "-";
      };

      const baseCols = [
        String(idx + 1),
        getStatusLabel(r.fillStatus),
        getAuditStatusLabel(r.auditStatus)
      ];

      const templateCols = template.fields.map(f => {
        const val = r.data[f.name];
        return val === undefined || val === null ? "" : String(val);
      });

      return [...baseCols, ...templateCols];
    });

    // 收集附件列表
    const attachments: { name: string; recordInfo?: string; folderName?: string }[] = [];
    targetRecords.forEach((r: any) => {
      const fileString = r.data.APPEAL_ATTACHMENT;
      if (fileString) {
        const patientName = r.data.PATIENT_NAME || "未名";
        const disDate = r.data.DISCHARGE_DATE || r.data.ADMIT_DATE || "无出院日";
        const projName = r.data.PROJECT_NAME || "未提项目";
        const folderName = `${patientName}_${disDate}_${projName}`;
        attachments.push({
          name: fileString,
          recordInfo: `患者姓名：${patientName}，出院时间：${disDate}`,
          folderName
        });
      }
    });

    try {
      const zipName = `${task.name}_${type === "部分数据" ? "部分" : "全部"}数据导出.zip`;
      const excelName = `${task.name}_明细表.xlsx`;
      await downloadZipWithExcel(zipName, excelName, headers, rows, attachments);
      toast("导出打包成功！开始下载...", "success");
    } catch (e) {
      toast("导出过程发生错误，请重试", "error");
      console.error(e);
    }
  };

  const handleOpenSwitchDeptModal = () => {
    if (selectedIds.length === 0) {
      toast("请先勾选记录");
      return;
    }
    setSelectedDept("内科");
    setIsSwitchDeptOpen(true);
  };

  const handleConfirmSwitchDept = () => {
    const records = mockApi.getTaskDetailRecords(task!.id);
    let updatedCount = 0;
    
    records.forEach((r: any) => {
      if (selectedIds.includes(r.id)) {
        r.data.DEPARTMENT_NAME = selectedDept;
        mockApi.saveTaskDetailRecord(task!.id, r);
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      toast(`已成功将 ${updatedCount} 条记录的科室切换为“${selectedDept}”`, "success");
      const updatedRecords = mockApi.getTaskDetailRecords(task!.id);
      setData(updatedRecords.map((rec: any) => ({ ...rec.data, id: rec.id })));
    }
    setIsSwitchDeptOpen(false);
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
        fillStatus: rec.fillStatus,
      }));
      setData(tableData);
    }
  };

  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImport = () => {
    if (!importFile) {
      toast("请选择需要导入的文件", "error");
      return;
    }
    if (importFile.size > 20 * 1024 * 1024) {
      toast("单个文件不超过 20MB", "error");
      return;
    }
    setIsImportModalOpen(false);
    toast("导入成功并生成了问题数据", "success");
    setImportFile(null);
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
      toast("正在重新AI填报...", "success");
      mockApi.startAIFill(task.id, true);
      fetchTaskData();
    }
  };

  const handleAbortAIFill = () => {
    if (task) {
      toast("已暂停AI填报", "success");
      mockApi.abortAIFill(task.id);
      fetchTaskData();
    }
  };

  const handleContinueAIFill = () => {
    if (task) {
      toast("继续AI填报...", "success");
      mockApi.startAIFill(task.id, false);
      fetchTaskData();
    }
  };

  if (!task || !template)
    return <div className="p-6">加载中或任务未找到...</div>;

  const queryFields = template.fields.filter((f) => f.isQueryable && (role === "ADMIN" || !f.adminVisible));

  const aiProgressCount = data.filter((d) => d.fillStatus === 5).length;
  const aiTotalCount = data.length;
  
  const isAIFillingActive = data.some(d => d.fillStatus === 51);
  const isAIPaused = data.some(d => d.fillStatus === 52);
  // Only show progress if it's "医保审核反馈" type and we have some records, and we've engaged AI filling features
  // Or just if we have started filling before (like `aiProgressCount > 0`, `isAIFillingActive`, `isAIPaused`)
  const hasEngagedAIFill = aiProgressCount > 0 || isAIFillingActive || isAIPaused;
  const showAiProgress = template.templateType === "医保审核反馈" && aiTotalCount > 0 && hasEngagedAIFill;

  const configurableColumns: ColumnItem[] = template.fields
    .filter(f => f.isShow !== false && (role === "ADMIN" || !f.adminVisible))
    .map(f => ({
      key: f.name,
      title: f.displayName || f.comment || f.name,
      visible: !hiddenColumns.includes(f.name)
    }));

  const handleSaveColumns = (newCols: ColumnItem[]) => {
    const newHidden = newCols.filter(c => !c.visible).map(c => c.key);
    setHiddenColumns(newHidden);
    setIsColumnSettingsOpen(false);
  };

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
    ...template.fields.filter(f => f.isShow !== false && (role === "ADMIN" || !f.adminVisible) && !hiddenColumns.includes(f.name)).map((f) => ({
      key: f.name,
      title: f.displayName || f.comment || f.name,
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
          
          {showAiProgress && (
            <div className="flex items-center gap-3 ml-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                AI填报
              </span>
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(aiProgressCount / aiTotalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm text-slate-500 font-mono">
                {aiProgressCount}/{aiTotalCount} ({Math.round((aiProgressCount / aiTotalCount) * 100)}%)
              </span>
              
              {aiProgressCount === aiTotalCount && (
                <button 
                  onClick={handleRestartAIFill}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors focus:outline-none"
                  title="重新AI填报"
                >
                  重新填报
                </button>
              )}

              {aiProgressCount < aiTotalCount && isAIFillingActive && (
                <button 
                  onClick={handleAbortAIFill}
                  className="text-xs text-red-500 hover:text-red-700 font-medium ml-2 transition-colors focus:outline-none"
                  title="暂停AI填报"
                >
                  暂停
                </button>
              )}

              {aiProgressCount < aiTotalCount && isAIPaused && (
                <div className="flex items-center gap-1 ml-2">
                  <button 
                    onClick={handleContinueAIFill}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors px-1 focus:outline-none"
                    title="继续AI填报"
                  >
                    继续
                  </button>
                  <div className="w-px h-3 bg-slate-300 mx-1"></div>
                  <button 
                    onClick={handleRestartAIFill}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors px-1 focus:outline-none"
                    title="重新AI填报"
                  >
                    重新填报
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
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
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSwitchDeptModal}
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
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-1.5" />
                导入更新
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
              <Button variant="outline" size="sm" className="px-2" onClick={() => setIsColumnSettingsOpen(true)} title="设置">
                <Settings className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                  {queryFields.map((f) => (
                    <div key={f.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 whitespace-nowrap min-w-[70px]">
                        {f.displayName || f.comment || f.name}
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

        {/* 切换科室弹窗 */}
        <Modal
          isOpen={isSwitchDeptOpen}
          onClose={() => setIsSwitchDeptOpen(false)}
          title="选择切换科室"
          footer={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsSwitchDeptOpen(false)}>
                取消
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSwitchDept}>
                确认切换
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-slate-600 leading-relaxed font-sans">
              请选择所选明细数据的下发目标科室。
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">切换目标科室</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="内科">内科</option>
                <option value="外科">外科</option>
                <option value="医保办">医保办</option>
              </select>
            </div>
          </div>
        </Modal>
        {/* 导入更新弹窗 */}
        <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} 
          title="数据导入更新" width="max-w-md"
          footer={<><Button variant="outline" onClick={() => setIsImportModalOpen(false)}>取消</Button><Button variant="primary" onClick={handleImport}>确认</Button></>}
        >
          <div className="flex flex-col gap-4 text-sm text-center py-6">
            <input type="file" id="file_upload_update" className="hidden" accept=".xls,.xlsx" onChange={(e) => { 
              const files = e.target.files;
              if(files && files.length > 0) setImportFile(files[0]);
            }}/>
            <Button variant="outline" className="mx-auto w-32" onClick={() => document.getElementById("file_upload_update")?.click()}>选择文件</Button>
            <div className="text-slate-500">
              {importFile ? <span className="text-blue-600 font-medium">{importFile.name}</span> : "暂未选择文件"}
            </div>
          </div>
        </Modal>

        <ColumnSettingsModal
          isOpen={isColumnSettingsOpen}
          onClose={() => setIsColumnSettingsOpen(false)}
          columns={configurableColumns}
          onSave={handleSaveColumns}
        />
      </div>
    </div>
  );
}
