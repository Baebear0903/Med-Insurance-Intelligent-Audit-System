import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Copy, Trash2, ArrowUp, ArrowDown, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { toast } from "@/src/components/ui/Toast";
import { mockApi, ReviewTemplate, TemplateField } from "@/src/lib/mockData";
import { cn } from "@/src/lib/utils";

const FIELD_TYPES = ["BIGINT", "INT", "VARCHAR", "DECIMAL", "DATE", "DATETIME", "TEXT", "DOUBLE", "FLOAT", "CHAR", "TIMESTAMP", "LONGTEXT"];

const DEFAULT_FEEDBACK_FIELDS: TemplateField[] = [
  { id: "DF_DEPARTMENT_NAME", name: "DEPARTMENT_NAME", comment: "科室名称", type: "VARCHAR", length: 100, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "责任科室", isQueryable: true, isFeedback: false, noUpdate: true },
  { id: "DF_IS_APPEAL", name: "IS_APPEAL", comment: "是/否申诉", type: "VARCHAR", length: 10, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "", isQueryable: false, isFeedback: true, noUpdate: false },
  { id: "DF_APPEAL_REASON", name: "APPEAL_REASON", comment: "申诉原因", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "", isQueryable: false, isFeedback: true, noUpdate: false },
  { id: "DF_APPEAL_ATTACHMENT", name: "APPEAL_ATTACHMENT", comment: "申诉附件", type: "VARCHAR", length: 500, decimal: 0, isPrimaryKey: false, isNotNull: false, isRequired: false, isShow: true, displayName: "", isQueryable: false, isFeedback: true, noUpdate: false },
];

export function AddReviewTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const [formData, setFormData] = useState<Partial<ReviewTemplate>>({
    name: "",
    templateType: "医保审核反馈",
    status: "ENABLED",
    desc: "",
    fields: [...JSON.parse(JSON.stringify(DEFAULT_FEEDBACK_FIELDS))]
  });

  const handleTemplateTypeChange = (value: any) => {
    let currentFields = formData.fields || [];
    let newFields = [...currentFields];
    if (value === "医保审核反馈") {
       // add default fields if not exist
       const defaultNames = DEFAULT_FEEDBACK_FIELDS.map(f => f.name);
       const existingNames = new Set(newFields.map(f => f.name));
       const missingDefaults = DEFAULT_FEEDBACK_FIELDS.filter(f => !existingNames.has(f.name));
       if (missingDefaults.length > 0) {
          newFields = [...newFields, ...JSON.parse(JSON.stringify(missingDefaults))];
       }
    } else {
       // remove default fields, assuming they haven't been heavily modified or we just let them be, but wait, the requirement says "如选中其他，无特殊逻辑" (no special logic if others are selected). 
       // So do we remove them? The requirement says "不可删除；如选中其他，无特殊逻辑". It implies they can be deleted if we switch to others. 
       // Let's just remove the ones that came from DEFAULT_FEEDBACK_FIELDS if they are exactly matching or we can just leave them alone and allow user to delete them. 
       // If no special logic, we just do not add/remove automatically, or do we? "如选中其他，无特殊逻辑" means we don't automatically add them.
       // It's better to remove them if they were added automatically, or just unlock them so they can be deleted. 
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
          toast(`模板类型为“医保审核反馈”时，【${fieldToDelete.comment || fieldToDelete.name}】为必填字段，不可删除`, "error");
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
                <option value="医保院内扣减">医保院内扣减</option>
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
                  <th className="px-2 py-3 w-12 text-center">查询</th>
                  <th className="px-2 py-3 w-14 text-center">反馈</th>
                  <th className="px-2 py-3 w-14 text-center">不更新</th>
                  <th className="px-3 py-3 w-36 text-left sticky right-0 bg-slate-50 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 divide-x divide-slate-100">
                {(formData.fields || []).map((field, idx) => (
                  <tr key={field.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-2 text-center text-slate-400 font-mono italic">{idx + 1}</td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="text" 
                        value={field.name} 
                        onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                        className="w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10" 
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="text" 
                        value={field.comment} 
                        onChange={(e) => handleUpdateField(idx, { comment: e.target.value })}
                        className="w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10" 
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input 
                        type="text" 
                        value={field.displayName || ""} 
                        onChange={(e) => handleUpdateField(idx, { displayName: e.target.value })}
                        className="w-full h-8 px-2 border border-transparent focus:border-blue-300 focus:bg-white rounded outline-none bg-slate-50/10 placeholder-slate-300"
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
                      <input type="checkbox" checked={field.isQueryable} onChange={(e) => handleUpdateField(idx, { isQueryable: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.isFeedback} onChange={(e) => handleUpdateField(idx, { isFeedback: e.target.checked })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input type="checkbox" checked={field.noUpdate} onChange={(e) => handleUpdateField(idx, { noUpdate: e.target.checked })} />
                    </td>
                    <td className="px-3 py-2 text-left sticky right-0 bg-white group-hover:bg-blue-50/20 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-start gap-1.5">
                        <button onClick={() => handleAction(idx, "copy")} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="复制一行"><Copy className="w-3.5 h-3.5"/></button>
                        {((formData.templateType || "医保审核反馈") !== "医保审核反馈" || !DEFAULT_FEEDBACK_FIELDS.map(f => f.name).includes(field.name)) && (
                          <button onClick={() => handleAction(idx, "delete")} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-3.5 h-3.5"/></button>
                        )}
                        <button onClick={() => handleAction(idx, "up")} disabled={idx === 0} className="p-1 text-slate-400 hover:bg-slate-100 rounded disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5"/></button>
                        <button onClick={() => handleAction(idx, "down")} disabled={idx === (formData.fields?.length || 0) - 1} className="p-1 text-slate-400 hover:bg-slate-100 rounded disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!formData.fields || formData.fields.length === 0) && (
                  <tr>
                    <td colSpan={15} className="px-4 py-8 text-center text-slate-400 bg-slate-50/30">
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
    </div>
  );
}
