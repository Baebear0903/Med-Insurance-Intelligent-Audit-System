import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Copy, Trash2, ArrowUp, ArrowDown, HelpCircle, AlertCircle, Link2, X, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { toast } from "@/src/components/ui/Toast";
import { Drawer } from "@/src/components/ui/Drawer";
import { mockApi, ReviewTemplate, TemplateField } from "@/src/lib/mockData";
import { cn } from "@/src/lib/utils";
import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";
import { pinyin } from "pinyin-pro";

const BUSINESS_CATEGORIES = getInsuranceCategories().filter(c => c.enabled).map(c => c.categoryName);

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
  const [currentStep, setCurrentStep] = useState(1); // 1: 基本信息, 2: 字段设计

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
      name: "F" + Date.now(),
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

    // Auto-generate english name (pinyin initials) for custom fields when comment changes
    if (updates.comment !== undefined) {
      const defaultNames = formData.templateType === "医保明细下发" 
        ? DEFAULT_DISPATCH_FIELDS.map(f => f.name) 
        : DEFAULT_FEEDBACK_FIELDS.map(f => f.name);
      
      if (!defaultNames.includes(newFields[index].name)) {
        if (updates.comment.trim() === "") {
           updated.name = "F" + Date.now();
        } else {
           const pinyinStr = pinyin(updates.comment, { pattern: 'first', toneType: 'none', type: 'array' }).join('').toUpperCase();
           // In case pinyin is empty (e.g. symbols only)
           updated.name = pinyinStr || "F" + Date.now();
        }
      }
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

  const validateBasicInfo = () => {
    if (!formData.name) {
      toast("请输入模板名称", "error");
      return false;
    }
    if (formData.templateType === "医保审核反馈" && !formData.businessCategory) {
      toast("请选择医保业务分类", "error");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateBasicInfo()) {
      setCurrentStep(2);
    }
  };

  const handleSave = () => {
    if (!validateBasicInfo()) return;
    
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
      if (!f.name) { toast("字段标识(英文)为空，请检查字段名称", "error"); return; }
      if (!f.comment) { toast("字段名称必填", "error"); return; }
      if (names.has(f.name)) { toast(`字段拼音缩写或标识重复: ${f.name}，请区分字段名称`, "error"); return; }
      if (comments.has(f.comment)) { toast(`字段名称重复: ${f.comment}`, "error"); return; }
      names.add(f.name);
      comments.add(f.comment);
      if (f.isPrimaryKey) hasPk = true;
    }

    if (!hasPk) {
      toast("至少需要设置一个唯一识别字段", "error");
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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {id ? "编辑模板" : "新建模板"}
            </h2>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className={cn("text-sm font-medium", currentStep === 1 ? "text-blue-600" : "text-slate-500")}>1. 基本信息</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className={cn("text-sm font-medium", currentStep === 2 ? "text-blue-600" : "text-slate-500")}>2. 字段定义</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className={cn("text-sm font-medium", currentStep === 3 ? "text-blue-600" : "text-slate-500")}>3. 属性配置</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleBack}>取消</Button>
          {currentStep === 1 && (
            <Button variant="primary" size="sm" onClick={handleNextStep}>下一步</Button>
          )}
          {currentStep === 2 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>上一步</Button>
              <Button variant="primary" size="sm" onClick={() => setCurrentStep(3)}>下一步</Button>
            </>
          )}
          {currentStep === 3 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>上一步</Button>
              <Button variant="primary" size="sm" onClick={handleSave} className="flex items-center">
                <Save className="w-4 h-4 mr-1" />
                完成保存
              </Button>
            </>
          )}
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
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm max-w-4xl mx-auto w-full mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-l-4 border-blue-500 pl-3">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2 md:col-span-2">
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
                <div className="flex items-center gap-4 h-10 border border-slate-200 rounded px-4 bg-slate-50">
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
                <div className="md:col-span-2 space-y-2">
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
              {formData.templateType === "医保明细下发" && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    下发备注
                  </label>
                  <div>
                    <div className="relative">
                      <select
                        className="w-full h-10 px-3 pr-8 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                        value={formData.dispatchRemark || ""}
                        onChange={(e) => { setFormData({ ...formData, dispatchRemark: e.target.value }); setHasChanges(true); }}
                      >
                        <option value="" disabled hidden>请选择</option>
                        <option value="一般明细下发">一般明细下发</option>
                        <option value="院内扣减公示">院内扣减公示</option>
                      </select>
                      {formData.dispatchRemark && (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-6 flex items-center bg-transparent text-slate-400 hover:text-slate-600 focus:outline-none"
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData({ ...formData, dispatchRemark: "" }); 
                            setHasChanges(true); 
                          }}
                        >
                          <div className="bg-white rounded-full"><X className="w-4 h-4 rounded-full" /></div>
                        </button>
                      )}
                    </div>
                    {formData.dispatchRemark === "院内扣减公示" && (
                      <p className="text-xs text-blue-500 mt-1">该模板关联任务将纳入医保院内扣减台历监控任务进度</p>
                    )}
                  </div>
                </div>
              )}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-700">模板描述</label>
                <textarea
                  className="w-full px-3 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[100px]"
                  placeholder="请输入详细描述..."
                  value={formData.desc}
                  onChange={(e) => { setFormData({ ...formData, desc: e.target.value }); setHasChanges(true); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Field Definition */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 w-full mt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-l-4 border-blue-500 pl-3">字段定义</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{formData.fields?.length || 0} 个字段</span>
              </div>
              <Button variant="primary" size="sm" onClick={handleAddField}>
                <Plus className="w-4 h-4 mr-1" />
                新增字段
              </Button>
            </div>

            <div className="space-y-3">
              {(formData.fields || []).map((field, idx) => {
                const isDispatchDeptFixed = field.name === "DISPATCH_DEPT" && (formData.templateType === "医保审核反馈" || formData.templateType === "医保明细下发");
                const isUndeletable = (formData.templateType === "医保审核反馈" && DEFAULT_FEEDBACK_FIELDS.some(f => f.name === field.name)) || 
                                      (formData.templateType === "医保明细下发" && DEFAULT_DISPATCH_FIELDS.some(f => f.name === field.name));

                return (
                  <div key={field.id} className={cn(
                    "border border-slate-200 rounded-lg bg-white shadow-sm transition-all relative overflow-hidden group hover:border-blue-300 flex items-center p-3 gap-4",
                    isDispatchDeptFixed && "opacity-90 bg-slate-50/40"
                  )}>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {idx + 1}
                      </span>
                      {isUndeletable && (
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1 py-0.5 rounded">固定</span>
                      )}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {/* 导入表字段名称 */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">导入表字段名称 <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="text" 
                            disabled={isDispatchDeptFixed}
                            value={field.comment}
                            onChange={(e) => handleUpdateField(idx, { comment: e.target.value })}
                            placeholder="例: 患者姓名"
                            className={cn("w-full h-8 px-2.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs transition-all shadow-sm", isDispatchDeptFixed && "bg-slate-100 text-slate-500 cursor-not-allowed")} 
                          />
                          {field.mappedStandardField && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-medium border border-emerald-100" title={`已关联标准字段: ${field.mappedStandardField}`}>
                              <Link2 className="w-3 h-3" />
                              已关联
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 系统展示名称 */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">系统展示名称</label>
                        <input 
                          type="text" 
                          disabled={isDispatchDeptFixed}
                          value={field.displayName || ""}
                          onChange={(e) => handleUpdateField(idx, { displayName: e.target.value })}
                          placeholder="同导入表字段名称" 
                          className={cn("w-full h-8 px-2.5 rounded border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs transition-all shadow-sm", isDispatchDeptFixed && "bg-slate-100 text-slate-500 cursor-not-allowed")} 
                        />
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-4 shrink-0">
                      <button onClick={() => handleOpenStandardFields(idx)} className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors" title="关联标准表字段">
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(idx, "copy")} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors" title="复制一行">
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="flex items-center ml-1 border-l border-slate-200 pl-1">
                        <button onClick={() => handleAction(idx, "up")} disabled={idx === 0} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors disabled:opacity-30">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAction(idx, "down")} disabled={idx === (formData.fields?.length || 0) - 1} className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors disabled:opacity-30">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      {!isUndeletable ? (
                        <button onClick={() => handleAction(idx, "delete")} className="p-1.5 ml-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="w-[28px] h-[28px] ml-1"></div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(!formData.fields || formData.fields.length === 0) && (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <AlertCircle className="w-10 h-10 opacity-20 mb-3" />
                  <p className="text-sm">未设计任何字段，请点击“新增字段”按钮</p>
                  <Button variant="outline" size="sm" onClick={handleAddField} className="mt-4">
                    <Plus className="w-4 h-4 mr-1" />
                    立即新增
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Field Properties Configuration */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 w-full mt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-l-4 border-blue-500 pl-3">属性配置</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{formData.fields?.length || 0} 个字段</span>
              </div>
            </div>

            <div className="border rounded-lg border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-0 min-w-[900px]">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th rowSpan={2} className="px-4 py-3 font-semibold w-[220px] border-b border-r border-slate-200 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">字段信息</th>
                      <th colSpan={2} className="px-4 py-2 text-center font-semibold border-b border-r border-slate-200 bg-blue-50 text-blue-700 text-xs">数据导入阶段</th>
                      <th colSpan={5} className="px-4 py-2 text-center font-semibold border-b border-r border-slate-200 bg-emerald-50 text-emerald-700 text-xs">数据填报阶段</th>
                      <th colSpan={2} className="px-4 py-2 text-center font-semibold border-b border-slate-200 bg-amber-50 text-amber-700 text-xs">任务收尾阶段</th>
                    </tr>
                    <tr className="text-[11px] bg-slate-50">
                      {[
                        { name: "唯一识别", title: "确定该字段作为数据更新的唯一判定依据" },
                        { name: "导入必有值", title: "导入数据时，此字段的值不能为空" },
                        { name: "列表展示", title: "在任务列表及详情数据中是否默认展示此字段" },
                        { name: "仅医保办可见", title: "勾选后，该字段及数据仅对医保办工作人员展示" },
                        { name: "支持查询", title: "在数据列表中，是否支持按此字段进行快速检索查询" },
                        { name: "填报必填", title: "在数据填报时，要求此字段必须填写内容" },
                        { name: "导入不更新", title: "二次导入数据时，以此字段原有数据为准，不被覆盖更新" },
                        { name: "辅助字段", title: "属于内部流转控制字段，不在导入模板中体现" },
                        { name: "结果反馈", title: "标识此字段内容是否作为处理结果反馈给相关人员" }
                      ].map((header, i) => (
                        <th key={header.name} className={cn("px-2 py-2 text-center font-medium border-b border-slate-200 w-20 group relative cursor-help hover:z-50", i !== 8 && "border-r")}>
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span>{header.name}</span>
                            <HelpCircle className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-36 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl z-50 pointer-events-none text-center leading-relaxed font-normal normal-case before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-slate-800">
                            {header.title}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child_td]:border-b-0">
                  {(formData.fields || []).map((field, idx) => (
                    <tr key={field.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 border-b border-slate-100 border-r border-r-slate-200 bg-white group-hover:bg-slate-50 sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-700 text-xs truncate" title={field.comment}>
                              {field.comment || "未命名字段"}
                            </div>
                            {field.displayName && field.displayName !== field.comment && (
                              <div className="text-[10px] text-slate-500 truncate mt-0.5" title={`展示: ${field.displayName}`}>
                                展示: <span className="text-blue-600">{field.displayName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-blue-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={field.isPrimaryKey} onChange={(e) => handleUpdateField(idx, { isPrimaryKey: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-slate-100 border-r border-r-slate-200 bg-blue-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" checked={field.isNotNull} onChange={(e) => handleUpdateField(idx, { isNotNull: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-emerald-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" checked={field.isShow !== false} onChange={(e) => handleUpdateField(idx, { isShow: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-emerald-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" checked={field.adminVisible || false} onChange={(e) => handleUpdateField(idx, { adminVisible: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-emerald-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" checked={field.isQueryable} onChange={(e) => handleUpdateField(idx, { isQueryable: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-emerald-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" checked={field.isRequired} onChange={(e) => handleUpdateField(idx, { isRequired: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-slate-100 border-r border-r-slate-200 bg-emerald-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" checked={field.noUpdate} onChange={(e) => handleUpdateField(idx, { noUpdate: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-r border-slate-100 bg-amber-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer" checked={field.isAuxiliary || false} onChange={(e) => handleUpdateField(idx, { isAuxiliary: e.target.checked })} />
                      </td>
                      <td className="px-2 py-2 text-center border-b border-slate-100 bg-amber-50/10">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer" checked={field.isFeedback} onChange={(e) => handleUpdateField(idx, { isFeedback: e.target.checked })} />
                      </td>
                    </tr>
                  ))}
                  {(!formData.fields || formData.fields.length === 0) && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-slate-400 border-b border-slate-100">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm">未设计任何字段</p>
                          <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)} className="mt-4">
                            返回字段定义
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
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
