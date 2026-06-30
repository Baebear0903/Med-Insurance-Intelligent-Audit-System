import React, { useState, useMemo } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { useNavigate } from "react-router-dom";

const majorData = [
  { id: 1, code: "01", name: "西药费", amount: "670.39", classifiedPay: "0.00", selfPay: "543.29", reimbursable: "127.10", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 2, code: "014200", name: "针法", amount: "582.00", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "582.00", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 3, code: "02", name: "中成药费", amount: "68.62", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "68.62", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 4, code: "04", name: "中草药费", amount: "320.32", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "320.32", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 5, code: "1102_C", name: "门急诊诊查费", amount: "150.00", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "150.00", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 6, code: "1109", name: "床位费", amount: "300.00", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "300.00", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 7, code: "1110", name: "会诊费", amount: "20.00", classifiedPay: "0.00", selfPay: "20.00", reimbursable: "0.00", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 8, code: "1204_E", name: "注射-治疗费", amount: "145.16", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "145.16", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 9, code: "130100", name: "分级护理", amount: "344.00", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "344.00", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 10, code: "250101", name: "血液一般检查", amount: "18.40", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "18.40", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 11, code: "250102", name: "尿液一般检查", amount: "30.36", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "30.36", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 12, code: "250203", name: "凝血检查", amount: "158.24", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "158.24", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
  { id: 13, code: "250301", name: "蛋白质测定", amount: "54.28", classifiedPay: "0.00", selfPay: "0.00", reimbursable: "54.28", discount: "0.00", settlementNo: "162795.00", infantAmount: "0.00", dxmdm2: "", dxmmc2: "", status: "已结算" },
];

const minorData = [
  { id: 1, idmCode: "0.00", projectCode: "250101015-2", projectNameSpec: "血常规-五分类 ※次", unit: "次", quantity: "1.00", unitPrice: "18.40", amount: "18.40", prescribeDept: "", execDept: "", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250101", majorName: "血液一般检查" },
  { id: 2, idmCode: "0.00", projectCode: "", projectNameSpec: "△△以上：血液一般检查※", unit: "", quantity: "1.00", unitPrice: "18.40", amount: "18.40", prescribeDept: "", execDept: "", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250101", majorName: "血液一般检查" },
  { id: 3, idmCode: "0.00", projectCode: "250102013", projectNameSpec: "尿液分析(仪器法)", unit: "次", quantity: "1.00", unitPrice: "11.00", amount: "11.00", prescribeDept: "", execDept: "", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250102", majorName: "尿液一般检查" },
  { id: 4, idmCode: "0.00", projectCode: "250102026", projectNameSpec: "尿沉渣定量", unit: "次", quantity: "1.00", unitPrice: "19.36", amount: "19.36", prescribeDept: "", execDept: "", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250102", majorName: "尿液一般检查" },
  { id: 5, idmCode: "0.00", projectCode: "", projectNameSpec: "△△以上：尿液一般检查※", unit: "", quantity: "1.00", unitPrice: "30.36", amount: "30.36", prescribeDept: "", execDept: "", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250102", majorName: "尿液一般检查" },
  { id: 6, idmCode: "0.00", projectCode: "010001", projectNameSpec: "阿莫西林胶囊 0.25g", unit: "盒", quantity: "2.00", unitPrice: "25.00", amount: "50.00", prescribeDept: "消化内科", execDept: "药房", execWard: "", classifiedPay: "0.00", selfPay: "50.00", discount: "0.00", majorCode: "01", majorName: "西药费" },
  { id: 7, idmCode: "0.00", projectCode: "01420001", projectNameSpec: "普通针刺", unit: "次", quantity: "3.00", unitPrice: "194.00", amount: "582.00", prescribeDept: "针灸科", execDept: "针灸科", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "014200", majorName: "针法" },
  { id: 8, idmCode: "0.00", projectCode: "020001", projectNameSpec: "连花清瘟胶囊 0.35g", unit: "盒", quantity: "1.00", unitPrice: "68.62", amount: "68.62", prescribeDept: "呼吸内科", execDept: "药房", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "02", majorName: "中成药费" },
  { id: 9, idmCode: "0.00", projectCode: "040001", projectNameSpec: "黄芪 10g", unit: "付", quantity: "5.00", unitPrice: "64.06", amount: "320.32", prescribeDept: "中医科", execDept: "中药房", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 10, idmCode: "0.00", projectCode: "1102001", projectNameSpec: "专家门诊诊查费", unit: "次", quantity: "1.00", unitPrice: "150.00", amount: "150.00", prescribeDept: "专家门诊", execDept: "门诊部", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "1102_C", majorName: "门急诊诊查费" },
  { id: 11, idmCode: "0.00", projectCode: "1109001", projectNameSpec: "普通病房床位费", unit: "日", quantity: "3.00", unitPrice: "100.00", amount: "300.00", prescribeDept: "住院部", execDept: "住院部", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "1109", majorName: "床位费" },
  { id: 12, idmCode: "0.00", projectCode: "1110001", projectNameSpec: "院内会诊费", unit: "次", quantity: "1.00", unitPrice: "20.00", amount: "20.00", prescribeDept: "住院部", execDept: "各科室", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "20.00", discount: "0.00", majorCode: "1110", majorName: "会诊费" },
  { id: 13, idmCode: "0.00", projectCode: "1204001", projectNameSpec: "静脉注射", unit: "次", quantity: "5.00", unitPrice: "29.03", amount: "145.16", prescribeDept: "住院部", execDept: "护士站", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "1204_E", majorName: "注射-治疗费" },
  { id: 14, idmCode: "0.00", projectCode: "1301001", projectNameSpec: "一级护理", unit: "日", quantity: "4.00", unitPrice: "86.00", amount: "344.00", prescribeDept: "住院部", execDept: "护士站", execWard: "同德8楼病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "130100", majorName: "分级护理" },
  { id: 15, idmCode: "0.00", projectCode: "250203001", projectNameSpec: "凝血酶原时间测定(PT)", unit: "项", quantity: "1.00", unitPrice: "158.24", amount: "158.24", prescribeDept: "检验科", execDept: "检验科", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250203", majorName: "凝血检查" },
  { id: 16, idmCode: "0.00", projectCode: "250301001", projectNameSpec: "总蛋白测定(TP)", unit: "项", quantity: "1.00", unitPrice: "54.28", amount: "54.28", prescribeDept: "检验科", execDept: "检验科", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "250301", majorName: "蛋白质测定" }
];

export function ChargeDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"major" | "minor">("major");
  const [selectedMajorCode, setSelectedMajorCode] = useState<string>("");

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            返回
          </Button>
          <h1 className="text-xl font-bold text-slate-800">收费明细</h1>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 px-6 pt-4 bg-white shrink-0">
        <button
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "major"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("major")}
        >
          费用大项信息
        </button>
        <button
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "minor"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("minor")}
        >
          费用细项信息
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
          {activeTab === "major" ? (
            <MajorChargeTable 
              onViewMinor={(majorCode) => {
                setSelectedMajorCode(majorCode);
                setActiveTab("minor");
              }} 
            />
          ) : (
            <MinorChargeTable 
              majorCodeFilter={selectedMajorCode} 
              onMajorCodeFilterChange={setSelectedMajorCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MajorChargeTable({ onViewMinor }: { onViewMinor: (code: string) => void }) {
  const [filterName, setFilterName] = useState("");

  const columns = [
    { key: "code", title: "项目代码", width: "100px" },
    { key: "name", title: "项目名称", width: "150px" },
    { key: "amount", title: "项目金额", width: "100px" },
    { key: "classifiedPay", title: "分类支付金额", width: "120px" },
    { key: "selfPay", title: "自费金额", width: "100px" },
    { key: "reimbursable", title: "可报金额", width: "100px" },
    { key: "discount", title: "减免金额", width: "100px" },
    { key: "settlementNo", title: "结算序号", width: "120px" },
    { key: "infantAmount", title: "婴儿金额", width: "100px" },
    { key: "dxmdm2", title: "dxmdm2", width: "100px" },
    { key: "dxmmc2", title: "dxmmc2", width: "100px" },
    { key: "status", title: "结算状态", width: "100px" },
    { 
      key: "action", 
      title: "操作", 
      width: "100px",
      fixed: "right",
      render: (r: any) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600"
          onClick={() => onViewMinor(r.code)}
        >
          查看细项
        </Button>
      )
    },
  ];

  const filteredData = useMemo(() => {
    return majorData.filter(item => {
      if (filterName && !item.name.includes(filterName)) return false;
      return true;
    });
  }, [filterName]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center gap-4 shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">项目名称:</label>
          <div className="relative">
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="h-8 px-3 pr-8 border border-slate-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
              placeholder="请输入项目名称"
            />
            {filterName && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setFilterName("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Table
          columns={columns}
          data={filteredData}
          rowKey={(r) => r.id}
        />
      </div>
    </div>
  );
}

function MinorChargeTable({ 
  majorCodeFilter, 
  onMajorCodeFilterChange 
}: { 
  majorCodeFilter: string, 
  onMajorCodeFilterChange: (val: string) => void 
}) {
  const [filterNameSpec, setFilterNameSpec] = useState("");

  const columns = [
    { key: "majorName", title: "所属费用大项", width: "120px" },
    { key: "majorCode", title: "大项目代码", width: "120px" },
    { key: "idmCode", title: "idm代码", width: "100px" },
    { key: "projectCode", title: "项目代码", width: "120px" },
    { key: "projectNameSpec", title: "项目名称规格", width: "220px" },
    { key: "unit", title: "单位", width: "80px" },
    { key: "quantity", title: "数量", width: "80px" },
    { key: "unitPrice", title: "单价", width: "100px" },
    { key: "amount", title: "金额", width: "100px" },
    { key: "prescribeDept", title: "开方科室", width: "120px" },
    { key: "execDept", title: "执行科室", width: "120px" },
    { key: "execWard", title: "执行病区", width: "120px" },
    { key: "classifiedPay", title: "分类支付金额", width: "120px" },
    { key: "selfPay", title: "自费金额", width: "100px" },
    { key: "discount", title: "减免金额", width: "100px" },
  ];

  const majorOptions = useMemo(() => {
    const optionsMap = new Map<string, string>();
    optionsMap.set("", "全部");
    minorData.forEach(item => {
      if (item.majorCode) {
        optionsMap.set(item.majorCode, item.majorName);
      }
    });
    return Array.from(optionsMap.entries()).map(([value, label]) => ({ value, label }));
  }, []);

  const filteredData = useMemo(() => {
    return minorData.filter(item => {
      if (majorCodeFilter && item.majorCode !== majorCodeFilter) return false;
      if (filterNameSpec && !item.projectNameSpec.includes(filterNameSpec)) return false;
      return true;
    });
  }, [majorCodeFilter, filterNameSpec]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center gap-6 shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">所属费用大项:</label>
          <select
            value={majorCodeFilter}
            onChange={(e) => onMajorCodeFilterChange(e.target.value)}
            className="h-8 px-2 border border-slate-300 rounded text-sm w-48 focus:outline-none focus:border-blue-500 bg-white"
          >
            {majorOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700 whitespace-nowrap">项目名称规格:</label>
          <div className="relative">
            <input
              type="text"
              value={filterNameSpec}
              onChange={(e) => setFilterNameSpec(e.target.value)}
              className="h-8 px-3 pr-8 border border-slate-300 rounded text-sm w-64 focus:outline-none focus:border-blue-500"
              placeholder="请输入项目名称规格"
            />
            {filterNameSpec && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                onClick={() => setFilterNameSpec("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Table
          columns={columns}
          data={filteredData}
          rowKey={(r) => r.id}
        />
      </div>
    </div>
  );
}
