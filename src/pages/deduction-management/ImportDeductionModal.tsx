import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { UploadCloud, FileSpreadsheet, X, Download } from "lucide-react";
import { toast } from "@/src/components/ui/Toast";
import * as XLSX from "xlsx";
import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";

interface ImportDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "update";
  onConfirm: (taskName: string | null, file: File, category: string) => void;
}

export function ImportDeductionModal({ isOpen, onClose, mode, onConfirm }: ImportDeductionModalProps) {
  const [taskName, setTaskName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = getInsuranceCategories().filter(c => c.enabled);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setTaskName("");
      setCategory("");
      setIsDragging(false);

      if (mode === "create") {
        // 默认带出一个已经上传好的表格以供演示
        const dummyFile = new File(["dummy content"], "医保扣减明细数据_2024.xlsx", {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        setFile(dummyFile);
      } else {
        setFile(null);
      }
    }
  }, [isOpen, mode]);

  const handleDownloadTemplate = () => {

    const headers = [
      "序号", "人员类别", "线上/线下", "住院号/门诊号", "患者姓名", "证件号码",
      "入院时间", "出院时间", "医疗类别", "扣款项目", "违规金额（单位：元）", "扣减原因",
      "涉及科室", "涉及医生", "扣减科室或个人", "扣减金额（药费/耗材）", "扣减金额（其它）",
      "项目分类", "备注", "是否申诉/同意扣减", "数据来源"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "医保扣减明细导入模板");
    XLSX.writeFile(wb, "医保扣减明细导入模板.xlsx");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast("请上传 Excel 文件", "error");
      return;
    }
    setFile(selectedFile);
  };

  const handleConfirm = () => {
    if (mode === "create" && !taskName.trim()) {
      toast("请输入任务名称", "error");
      return;
    }
    if (mode === "create" && taskName.length > 50) {
      toast("任务名称不能超过50个字", "error");
      return;
    }
    if (!file) {
      toast("请上传文件", "error");
      return;
    }
    onConfirm(mode === "create" ? taskName : null, file, category);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === "create" ? "新增扣减明细" : "导入更新扣减明细"}
      width="max-w-2xl"
    >
      <div className="space-y-6">
        {mode === "update" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md text-sm">
            <strong className="font-semibold">注意：</strong>
            本次更新会覆盖该任务对应的所有扣减明细，请确保上传的医保扣减明细无误。
          </div>
        )}

        {mode === "create" && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                任务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="请输入任务名称（不超过50个字）"
                maxLength={50}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                医保业务分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">请选择</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.categoryName}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
             <label className="block text-sm font-medium text-slate-700">
                上传文件 <span className="text-red-500">*</span>
             </label>
             <button 
               onClick={handleDownloadTemplate}
               className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
             >
               <Download className="w-4 h-4" />
               下载导入模板
             </button>
          </div>
          
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:bg-slate-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <div className="text-sm text-slate-600 mb-1">
                点击或拖拽文件到此处上传
              </div>
              <div className="text-xs text-slate-400 mb-4">
                支持 .xlsx, .xls 格式文件
              </div>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                选择文件
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 rounded text-green-600">
                    <FileSpreadsheet className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-sm font-medium text-slate-800">{file.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>{(file.size / 1024).toFixed(2)} KB</span>
                      <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded text-[10px]">上传成功</span>
                    </div>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-blue-600 hover:text-blue-800 text-sm px-2"
                 >
                   重新上传
                 </button>
                 <button 
                   onClick={() => setFile(null)}
                   className="text-red-600 hover:text-red-800 p-1"
                   title="删除"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept=".xlsx, .xls"
                 onChange={handleFileSelect}
               />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={handleConfirm}>确认</Button>
      </div>
    </Modal>
  );
}
