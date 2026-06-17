import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Copy, Trash2, ArrowUp, ArrowDown, HelpCircle, AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { toast } from "@/src/components/ui/Toast";
import { Drawer } from "@/src/components/ui/Drawer";
import { mockApi, ReviewTemplate, TemplateField } from "@/src/lib/mockData";
import { cn } from "@/src/lib/utils";

const FIELD_TYPES = ["BIGINT", "INT", "VARCHAR", "DECIMAL", "DATE", "DATETIME", "TEXT", "DOUBLE", "FLOAT", "CHAR", "TIMESTAMP", "LONGTEXT"];

const BUSINESS_CATEGORIES = [
  "广州医保（线上）", "广州医保（线下）", "省内异地（线上）", "省内异地（线下）",
  "跨省异地（线上）", "跨省异地（线下）", "市直医保", "省直医保",
  "荔湾公医", "白云公医", "海珠公医", "从化公医", "花都公医", "黄埔公医"
];

const STANDARD_FIELDS = [
  { name: "ORDER_DEPT_CODE", comment: "开单科室编码", remark: "标准开单科室编码" },
  { name: "ORDER_DEPT_NAME", comment: "开单科室名称", remark: "标准开单科室名称" },
  { name: "ORDER_DOC_ID", comment: "开单医生ID", remark: "标准开单医生ID" },
  { name: "ORDER_DOC_NAME", comment: "开单医生名称", remark: "标准开单医生名称" },
  { name: "EXEC_DEPT_CODE", comment: "执行科室编码", remark: "标准执行科室编码" },
  { name: "EXEC_DEPT_NAME", comment: "执行科室名称", remark: "标准执行科室名称" },
  { name: "EXEC_DOC_ID", comment: "执行医生ID", remark: "标准执行医生ID" },
  { name: "EXEC_DOC_NAME", comment: "执行医生名称", remark: "标准执行医生名称" },
  { name: "VISIT_ID", comment: "就诊ID", remark: "患者就诊唯一标识" },
  { name: "INOUT_NO", comment: "住院门诊流水号", remark: "门诊或住院的流水编号" },
  { name: "PATIENT_UID", comment: "院内患者唯一ID", remark: "患者的院内唯一标识" },
  { name: "ID_CARD", comment: "身份证号", remark: "居民身份证号码" },
  { name: "INSURED_NAME", comment: "参保人姓名", remark: "参保人员真实姓名" },
];

const DEFAULT_FEEDBACK_FIELDS: TemplateField[] = [
  { id: "DF_ORDER_DEPT", name: "ORDER_DEPT", comment: "开单科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "开单科室", isQueryable: false, isFeedback: false, noUpdate: true },
  { id: "DF_EXECUTE_DEPT", name: "EXECUTE_DEPT", comment: "执行科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "执行科室", isQueryable: false, isFeedback: false, noUpdate: true },
  { id: "DF_DISPATCH_DEPT", name: "DISPATCH_DEPT", comment: "下发科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "下发科室", isQueryable: true, isFeedback: false, noUpdate: true },
  { id: "DF_IS_APPEAL", name: "IS_APPEAL", comment: "是/否申诉", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "是/否申诉", isQueryable: false, isFeedback: true, noUpdate: false },
  { id: "DF_APPEAL_REASON", name: "APPEAL_REASON", comment: "申诉原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "申诉原因", isQueryable: false, isFeedback: true, noUpdate: false },
  { id: "DF_APPEAL_ATTACHMENT", name: "APPEAL_ATTACHMENT", comment: "申诉附件", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "申诉附件", isQueryable: false, isFeedback: true, noUpdate: false },
  { id: "DF_APPEAL_REMARK", name: "APPEAL_REMARK", comment: "申诉备注", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "申诉备注", isQueryable: false, isFeedback: true, noUpdate: true },
];

const DEFAULT_DISPATCH_FIELDS: TemplateField[] = [
  { id: "DF_DISPATCH_DEPT", name: "DISPATCH_DEPT", comment: "下发科室", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "下发科室", isQueryable: true, isFeedback: false, noUpdate: true },
];

export function AddReviewTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [searchStdKeyword, setSearchStdKeyword] = useState("");

  const [formData, setFormData] = useState<Partial<ReviewTemplate>>({
    name: "",
    templateType: "医保审核反馈",
    status: "ENABLED",
    desc: "",
    fields: [...JSON.parse(JSON.stringify(DEFAULT_FEEDBACK_FIELDS))]
  });

  const handleOpenStandardFields = (index: number) => {
    setActiveFieldIndex(index);
    setSearchStdKeyword("");
    setDrawerOpen(true);
  };

  const handleLinkStandardField = (stdField: typeof STANDARD_FIELDS[0]) => {
    if (activeFieldIndex === null) return;
    const usedBy = formData.fields?.find(f => f.mappedStandardField === stdField.name && f.id !== formData.fields![activeFieldIndex].id);
    if (usedBy) {
      toast(`当前所选变量已被字段 ${usedBy.comment || usedBy.name} 选中，请重新选择`, "error");
      return;
    }
    const newFields = [...(formData.fields || [])];
    newFields[activeFieldIndex] = { ...newFields[activeFieldIndex], mappedStandardField: stdField.name };
    setFormData({ ...formData, fields: newFields });
    setHasChanges(true);
    toast("关联成功", "success");
  };

  const handleUnlinkStandardField = () => {
    if (activeFieldIndex === null) return;
    const newFields = [...(formData.fields || [])];
    newFields[activeFieldIndex] = { ...newFields[activeFieldIndex], mappedStandardField: undefined };
    setFormData({ ...formData, fields: newFields });
    setHasChanges(true);
    toast("已解除关联", "success");
  };

  const handleTemplateTypeChange = (value: any) => {
    let currentFields = formData.fields || [];
    let newFields = [...currentFields];
    
    const prevType = formData.templateType || "医保审核反馈";
    
    const oldDefaults = prevType === "医保审核反馈" ? DEFAULT_FEEDBACK_FIELDS : DEFAULT_DISPATCH_FIELDS;
    const newDefaults = value === "医保审核反馈" ? DEFAULT_FEEDBACK_FIELDS : DEFAULT_DISPATCH_FIELDS;
    
    const newDefaultNames = new Set(newDefaults.map(f => f.name));
    const oldDefaultNames = new Set(oldDefaults.map(f => f.name));

    const namesToRemove = new Set([...oldDefaultNames].filter(x => !newDefaultNames.has(x)));
    newFields = newFields.filter(f => !namesToRemove.has(f.name));

    const existingNames = new Set(newFields.map(f => f.name));
    const missingDefaults = newDefaults.filter(f => !existingNames.has(f.name));
    
    if (missingDefaults.length > 0) {
      newFields = [...JSON.parse(JSON.stringify(missingDefaults)), ...newFields];
    }

    setFormData({ ...formData, templateType: value, fields: newFields });
    setHasChanges(true);
  };

  useEffect(() => {
    if (id) {
      const all = mockApi.getTemplates();
      const existing = all.find(t => t.id === id);
      if (existing) {
        setFormData(JSON.parse(JSON.stringify(existing)));
      }
    }
  }, [id]);

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmBack(true);
    } else {
      navigate("/review-template/index");
    }
  };

  const confirmBack = () => {
    setShowConfirmBack(false);
    navigate("/review-template/index");
  };

  const handleAddField = () => {
    const newField: TemplateField = {
      id: "F" + Date.now(),
      name: "",
      comment: "",
      type: "VARCHAR",
      length: 255,
      decimal: 0,
      isPrimaryKey: false,
      isNotNull: false,
      isRequired: false,
      isShow: true,
      displayName: "",
      isQueryable: false,
      isFeedback: false,
      noUpdate: false
    };
    setFormData(prev => ({ ...prev, fields: [...(prev.fields || []), newField] }));
    setHasChanges(true);
  };

  const handleUpdateField = (index: number, updates: Partial<TemplateField>) => {
    const newFields = [...(formData.fields || [])];
    const updated = { ...newFields[index], ...updates };
    
    // Logic: Primary key must be not null
    if (updates.isPrimaryKey === true) {
      updated.isNotNull = true;
    }
    
    newFields[index] = updated;
    setFormData(prev => ({ ...prev, fields: newFields }));
    setHasChanges(true);
  };

  const handleAction = (index: number, action: "copy" | "delete" | "up" | "down") => {
    const newFields = [...(formData.fields || [])];
    if (action === "copy") {
      const copy = { ...newFields[index], id: "F" + Date.now() + index, name: newFields[index].name + "_COPY" };
      newFields.splice(index + 1, 0, copy);
    } else if (action === "delete") {
      const fieldToDelete = newFields[index];
      if ((formData.templateType || "医保审核反馈") === "医保审核反馈") {
        const defaultNames = DEFAULT_FEEDBACK_FIELDS.map(f => f.name);
        if (defaultNames.includes(fieldToDelete.name)) {
          toast(`模板类型为“医保审核反馈”时，【${fieldToDelete.comment || fieldToDelete.name}】为固定字段，不可删除`, "error");
          return;
        }
      } else if (formData.templateType === "医保明细下发") {
        const defaultNames = DEFAULT_DISPATCH_FIELDS.map(f => f.name);
        if (defaultNames.includes(fieldToDelete.name)) {
          toast(`模板类型为“医保明细下发”时，【${fieldToDelete.comment || fieldToDelete.name}】为固定字段，不可删除`, "error");
          return;
        }
      }
      newFields.splice(index, 1);
    } else if (action === "up" && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    } else if (action === "down" && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setFormData(prev => ({ ...prev, fields: newFields }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast("请输入模板名称", "error");
      return;
    }
    if (formData.templateType === "医保审核反馈" && !formData.businessCategory) {
      toast("请选择医保业务分类", "error");
      return;
    }
    const fields = formData.fields || [];
    if (fields.length === 0) {
      toast("请至少设计一个字段", "error");
      return;
    }

    // Validations
    const names = new Set();
    const comments = new Set();
    let hasPk = false;

    for (const f of fields) {
      if (!f.name) { toast("字段名称必填", "error"); return; }
      if (!f.comment) { toast("字段注释必填", "error"); return; }
      if (names.has(f.name)) { toast(`字段名称重复: ${f.name}`, "error"); return; }
      if (comments.has(f.comment)) { toast(`字段注释重复: ${f.comment}`, "error"); return; }
      names.add(f.name);
      comments.add(f.comment);
      if (f.isPrimaryKey) hasPk = true;
    }

    if (!hasPk) {
      toast("至少需要设置一个主键字段", "error");
      return;
    }

    mockApi.saveTemplate({ ...formData, creator: "管理员", taskCount: formData.taskCount || 0 } as any);
    toast("保存成功", "success");
    setHasChanges(false);
    navigate("/review-template/index");
  };

  const activeField = activeFieldIndex !== null ? formData.fields?.[activeFieldIndex] : null;
  const currentMappedField = STANDARD_FIELDS.find(f => f.name === activeField?.mappedStandardField);
  const filteredStandardFields = STANDARD_FIELDS.filter(f => 
    f.name.toLowerCase().includes(searchStdKeyword.toLowerCase()) || 
    f.comment.toLowerCase().includes(searchStdKeyword.toLowerCase()) ||
    f.remark.toLowerCase().includes(searchStdKeyword.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white px-5 py-3 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-800">
            {id ? "编辑模板" : "新建模板"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>取消</Button>
          <Button variant="primary" size="sm" onClick={handleSave} className="flex items-center">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmBack && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-500 mb-4 font-bold text-lg">
              <AlertCircle className="w-6 h-6" />
              <h3>离开页面</h3>
            </div>
            <p className="text-slate-600 text-sm mb-8 leading-relaxed">
              返回会导致你当前的数据丢失, 是否返回?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmBack(false)}>我再想想</Button>
              <Button variant="primary" size="sm" onClick={confirmBack}>继续返回</Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-l-4 border-blue-500 pl-3">基本信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                模板名称 <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="请输入模板名称"
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setHasChanges(true); }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                模板类型 <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                className="w-full h-10 px-3 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                value={formData.templateType || "医保审核反馈"}
                onChange={(e) => { handleTemplateTypeChange(e.target.value as any); }}
              >
                <option value="医保审核反馈">医保审核反馈</option>
                <option value="医保明细下发">医保明细下发</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">启用状态</label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "ENABLED"}
                    onChange={() => { setFormData({ ...formData, status: "ENABLED" }); setHasChanges(true); }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-slate-600">启用</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === "DISABLED"}
                    onChange={() => { setFormData({ ...formData, status: "DISABLED" }); setHasChanges(true); }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-slate-600">已禁用</span>
                </label>
              </div>
            </div>
            {formData.templateType === "医保审核反馈" && (
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  医保业务分类 <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  className="w-full h-10 px-3 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  value={formData.businessCategory || ""}
                  onChange={(e) => { setFormData({ ...formData, businessCategory: e.target.value }); setHasChanges(true); }}
                >
                  <option value="" disabled>请选择医保业务分类</option>
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="md:col-span-3 space-y-2">
              <label className="text-sm font-medium text-slate-700">模板描述</label>
              <textarea
                className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[80px]"
                placeholder="请输入详细描述..."
                value={formData.desc}
                onChange={(e) => { setFormData({ ...formData, desc: e.target.value }); setHasChanges(true); }}
              />
            </div>
          </div>
        </div>

        {/* Field Design */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-l-4 border-blue-500 pl-3">字段设计</h3>
            <Button variant="primary" size="sm" onClick={handleAddField}>
              <Plus className="w-4 h-4 mr-1" />
              新增字段
            </Button>
          </div>

          <div className="overflow-x-auto border rounded border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">序号</th>
                  <th className="px-3 py-3 min-w-[120px]">字段名称<span className="text-red-500 ml-1">*</span></th>
                  <th className="px-3 py-3 min-w-[120px]">字段注释<span className="text-red-500 ml-1">*</span></th>
                  <th className="px-3 py-3 min-w-[120px]">展示名称</th>
                  <th className="px-3 py-3 w-28">字段类型</th>
                  <th className="px-3 py-3 w-20">长度</th>
                  <th className="px-3 py-3 w-16">小数点</th>
                  <th className="px-2 py-3 w-12 text-center">主键</th>
                  <th className="px-2 py-3 w-12 text-center">非空</th>
                  <th className="px-2 py-3 w-12 text-center">必填</th>
                  <th className="px-2 py-3 w-12 text-center">展示</th>
                  <th className="px-2 py-3 w-16 text-center">管理可见</th>
                  <th className="px-2 py-3 w-12 text-center">查询</th>
                  <th className="px-2 py-3 w-14 text-center">反馈</th>
                  <th className="px-2 py-3 w-14 text-center">不更新</th>
                  <th className="px-3 py-3 w-40 text-left sticky right-0 bg-slate-50 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 divide-x divide-slate-100">
                {(formData.fields || []).map((field, idx) => {
                  const isDispatchDeptFixed = field.name === "DISPATCH_DEPT" && (formData.templateType === "医保审核反馈" || formData.templateType === "医保明细下发");
                  return (
                  <tr key={field.id} className="group hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2 text-center text-slate-400 font-mono italic">{idx + 1}</td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="text" 
                        value={field.name} 
                        disabled={isDispatchDeptFixed}
                        onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                        className={cn("w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10", isDispatchDeptFixed && "opacity-60 bg-slate-100 cursor-not-allowed")} 
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="text" 
                          value={field.comment} 
                          disabled={isDispatchDeptFixed}
                          onChange={(e) => handleUpdateField(idx, { comment: e.target.value })}
                          className={cn("w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10", isDispatchDeptFixed && "opacity-60 bg-slate-100 cursor-not-allowed")} 
                        />
                        {field.mappedStandardField && (
                          <div className="w-4 h-4 text-green-500 shrink-0" title={`已关联: ${field.mappedStandardField}`}>
                            <Link2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="text" 
                        value={field.displayName || ""} 
                        disabled={isDispatchDeptFixed}
                        onChange={(e) => handleUpdateField(idx, { displayName: e.target.value })}
                        className={cn("w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10 placeholder-slate-300", isDispatchDeptFixed && "opacity-60 bg-slate-100 cursor-not-allowed")}
                        placeholder="非必填"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <select 
                        value={field.type} 
                        onChange={(e) => handleUpdateField(idx, { type: e.target.value })}
                        className="w-full h-8 px-1 border border-transparent focus:border-blue-300 bg-transparent rounded outline-none"
                      >
                        {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="number" 
                        value={field.length} 
                        onChange={(e) => handleUpdateField(idx, { length: parseInt(e.target.value) || 0 })}
                        className="w-full h-8 px-2 border border-transparent focus:border-blue-300 bg-transparent rounded outline-none" 
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="number" 
                        disabled={!["DECIMAL", "DOUBLE", "FLOAT"].includes(field.type)}
                        value={field.decimal} 
                        onChange={(e) => handleUpdateField(idx, { decimal: parseInt(e.target.value) || 0 })}
                        className="w-full h-8 px-2 border border-transparent focus:border-blue-300 bg-transparent rounded outline-none disabled:opacity-30" 
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isPrimaryKey} onChange={(e) => handleUpdateField(idx, { isPrimaryKey: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isNotNull} onChange={(e) => handleUpdateField(idx, { isNotNull: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isRequired} onChange={(e) => handleUpdateField(idx, { isRequired: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isShow !== false} onChange={(e) => handleUpdateField(idx, { isShow: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.adminVisible || false} onChange={(e) => handleUpdateField(idx, { adminVisible: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isQueryable} onChange={(e) => handleUpdateField(idx, { isQueryable: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isFeedback} onChange={(e) => handleUpdateField(idx, { isFeedback: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.noUpdate} onChange={(e) => handleUpdateField(idx, { noUpdate: e.target.checked })} />
                    </td>
                    <td className="px-3 py-2 text-left sticky right-0 bg-white group-hover:bg-blue-50 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-start gap-1.5">
                        <button onClick={() => handleOpenStandardFields(idx)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded" title="关联标准表字段"><Link2 className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleAction(idx, "copy")} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="复制一行"><Copy className="w-3.5 h-3.5"/></button>
                        {((formData.templateType === "医保审核反馈" && !DEFAULT_FEEDBACK_FIELDS.map(f => f.name).includes(field.name)) || 
                          (formData.templateType === "医保明细下发" && !DEFAULT_DISPATCH_FIELDS.map(f => f.name).includes(field.name))) && (
                          <button onClick={() => handleAction(idx, "delete")} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-3.5 h-3.5"/></button>
                        )}
                        <button onClick={() => handleAction(idx, "up")} disabled={idx === 0} className="p-1 text-slate-400 hover:bg-slate-100 rounded disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleAction(idx, "down")} disabled={idx === (formData.fields?.length || 0) - 1} className="p-1 text-slate-400 hover:bg-slate-100 rounded disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {(!formData.fields || formData.fields.length === 0) && (
                  <tr>
                    <td colSpan={16} className="px-4 py-8 text-center text-slate-400 bg-slate-50/30">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <span>未设计任何字段，请点击“新增字段”按钮</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="关联标准表字段"
        width="w-[800px]"
        placement="left"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 space-y-4 shrink-0">
            {currentMappedField && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-900 mb-1">
                    已关联标准字段
                  </div>
                  <div className="text-sm text-blue-800">
                    <span className="font-bold">{currentMappedField.comment}</span> 
                    <span className="font-mono ml-2 text-xs opacity-70">({currentMappedField.name})</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleUnlinkStandardField} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
                  解除关联
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="搜索标准表字段名称/描述/备注..."
                className="w-full h-9 px-3 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={searchStdKeyword}
                onChange={(e) => setSearchStdKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 pt-0">
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 min-w-[150px]">字段注释</th>
                    <th className="px-4 py-3 min-w-[150px]">字段名称</th>
                    <th className="px-4 py-3">备注</th>
                    <th className="px-4 py-3 w-28 text-center bg-slate-50 sticky right-0 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStandardFields.map((stdField) => {
                    const usedBy = formData.fields?.find(f => f.mappedStandardField === stdField.name);
                    const isUsed = !!usedBy;
                    const isCurrent = activeField?.mappedStandardField === stdField.name;

                    return (
                      <tr key={stdField.name} className={cn("group hover:bg-slate-50 transition-colors", isCurrent && "bg-blue-50")}>
                        <td className="px-4 py-3 font-semibold text-slate-800 tracking-tight">{stdField.comment}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{stdField.name}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{stdField.remark}</td>
                        <td className={cn(
                          "px-4 py-3 text-center sticky right-0 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)] transition-colors",
                          isCurrent ? "bg-blue-50 group-hover:bg-blue-50" : "bg-white group-hover:bg-slate-50"
                        )}>
                          {isCurrent ? (
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">当前关联</span>
                          ) : (
                            <div className="flex flex-col items-center gap-1 w-full">
                              <Button
                                variant={isUsed ? "outline" : "primary"}
                                size="sm"
                                onClick={() => handleLinkStandardField(stdField)}
                                className={cn("w-full", isUsed && "opacity-80")}
                              >
                                {isUsed ? "重新关联" : "关联"}
                              </Button>
                              {isUsed && !isCurrent && (
                                <div className="text-[10px] text-amber-600 truncate max-w-[80px]" title={`已被 ${usedBy.comment || usedBy.name} 选中`}>
                                  已被选中
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStandardFields.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        未搜索到相关字段
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
