import React, { useState, useMemo } from "react";
import { Table } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

function ColumnSettings({
  columns,
  visibleKeys,
  onChange
}: {
  columns: { key: string, title: string }[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (key: string) => {
    if (visibleKeys.includes(key)) {
      onChange(visibleKeys.filter(k => k !== key));
    } else {
      onChange([...visibleKeys, key]);
    }
  };

  const selectAll = () => onChange(columns.map(c => c.key));

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 shadow-sm" onClick={() => setIsOpen(!isOpen)}>
        <Settings className="h-4 w-4" />
      </Button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-lg rounded-md z-50 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-800">自定义列显示</span>
              <button className="text-xs text-blue-600 hover:underline" onClick={selectAll}>全选</button>
            </div>
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
              {columns.map(c => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={visibleKeys.includes(c.key)} 
                    onChange={() => toggleColumn(c.key)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900">{c.title}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
  { id: 9, idmCode: "7323.00", projectCode: "02004", projectNameSpec: "紫苏子 ※5g,10g", unit: "g", quantity: "100.00", unitPrice: "0.06", amount: "5.81", prescribeDept: "中医科", execDept: "中药房", execWard: "天河8楼骨科病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 91, idmCode: "7326.00", projectCode: "02007", projectNameSpec: "盐菟丝子 ※10g,15g", unit: "g", quantity: "100.00", unitPrice: "0.13", amount: "13.13", prescribeDept: "中医科", execDept: "中药房", execWard: "天河8楼骨科病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 92, idmCode: "7342.00", projectCode: "02018", projectNameSpec: "莱菔子 ※10g,15g", unit: "g", quantity: "100.00", unitPrice: "0.05", amount: "5.00", prescribeDept: "中医科", execDept: "中药房", execWard: "天河8楼骨科病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 93, idmCode: "7344.00", projectCode: "02019", projectNameSpec: "芥子 ※5g,10g", unit: "g", quantity: "100.00", unitPrice: "0.03", amount: "3.13", prescribeDept: "中医科", execDept: "中药房", execWard: "天河8楼骨科病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 94, idmCode: "7386.00", projectCode: "02049", projectNameSpec: "吴茱萸 ※3g,5g", unit: "g", quantity: "60.00", unitPrice: "0.14", amount: "8.29", prescribeDept: "中医科", execDept: "中药房", execWard: "天河8楼骨科病区", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费" },
  { id: 95, idmCode: "0.00", projectCode: "", projectNameSpec: "△△以上：中草药费 ※", unit: "", quantity: "460.00", unitPrice: "", amount: "35.36", prescribeDept: "", execDept: "", execWard: "", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", majorCode: "04", majorName: "中草药费", isSubtotal: true },
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
  const [level, setLevel] = useState<"major" | "minor" | "detail">("major");
  const [selectedMajor, setSelectedMajor] = useState<any>(null);
  const [selectedMinor, setSelectedMinor] = useState<any>(null);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-slate-600 text-sm font-medium">
            <span 
              className={`cursor-pointer hover:text-blue-600 ${level === 'major' ? 'text-slate-900 font-bold' : ''}`}
              onClick={() => setLevel("major")}
            >
              费用大项
            </span>
            {level !== 'major' && (
              <>
                <span className="mx-2 text-slate-400">/</span>
                <span 
                  className={`cursor-pointer hover:text-blue-600 ${level === 'minor' ? 'text-slate-900 font-bold' : ''}`}
                  onClick={() => {
                     setLevel("minor");
                     setSelectedMinor(null);
                  }}
                >
                  费用细项
                </span>
              </>
            )}
            {level === 'detail' && (
              <>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-900 font-bold">
                  费用明细
                </span>
              </>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          返回填报
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-sm">
          {level === "major" && (
            <MajorChargeTable 
              onViewMinor={(major) => {
                setSelectedMajor(major);
                setLevel("minor");
              }} 
            />
          )}
          {level === "minor" && (
            <MinorChargeTable 
              selectedMajor={selectedMajor}
              onViewDetail={(minor) => {
                setSelectedMinor(minor);
                setLevel("detail");
              }}
            />
          )}
          {level === "detail" && (
            <DetailChargeTable minorItem={selectedMinor} />
          )}
        </div>
      </div>
    </div>
  );
}

function MajorChargeTable({ onViewMinor }: { onViewMinor: (major: any) => void }) {
  const [filterName, setFilterName] = useState("");

  const allColumns = useMemo(() => [
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
      fixed: "right" as const,
      render: (r: any) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-600"
          onClick={() => onViewMinor(r)}
        >
          查看细项
        </Button>
      )
    },
  ], [onViewMinor]);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const columns = useMemo(() => allColumns.filter(c => visibleKeys.includes(c.key)), [allColumns, visibleKeys]);

  const filteredData = useMemo(() => {
    return majorData.filter(item => {
      if (filterName && !item.name.includes(filterName)) return false;
      return true;
    });
  }, [filterName]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 bg-slate-50">
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
        <ColumnSettings columns={allColumns} visibleKeys={visibleKeys} onChange={setVisibleKeys} />
      </div>
      <div className="flex-1 min-h-0">
        <Table
          className="h-full border-none rounded-none"
          columns={columns}
          data={filteredData}
          rowKey={(r: any) => r.id}
          rowClassName={(r: any) => {
            if (r.code === "01") return "bg-orange-100 hover:bg-orange-200";
            return "";
          }}
        />
      </div>
    </div>
  );
}

function MinorChargeTable({ 
  selectedMajor, 
  onViewDetail
}: { 
  selectedMajor: any, 
  onViewDetail: (minor: any) => void
}) {
  const majorCodeFilter = selectedMajor?.code || "";
  const [filterNameSpec, setFilterNameSpec] = useState("");

  const allColumns = useMemo(() => [
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
    { 
      key: "action", 
      title: "操作", 
      width: "100px",
      fixed: "right" as const,
      render: (r: any) => {
        if (r.isSubtotal || !r.projectCode) return null;
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600"
            onClick={() => onViewDetail(r)}
          >
            查看明细
          </Button>
        );
      }
    },
  ], [onViewDetail]);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const columns = useMemo(() => allColumns.filter(c => visibleKeys.includes(c.key)), [allColumns, visibleKeys]);

  const filteredData = useMemo(() => {
    return minorData.filter(item => {
      if (majorCodeFilter && item.majorCode !== majorCodeFilter) return false;
      if (filterNameSpec && !item.projectNameSpec.includes(filterNameSpec)) return false;
      return true;
    });
  }, [majorCodeFilter, filterNameSpec]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex flex-row items-start justify-between shrink-0 bg-slate-50">
        <div className="flex flex-col gap-4">
          {selectedMajor && (
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                {selectedMajor.name}
              </h3>
            </div>
          )}
          <div className="flex items-center gap-6">
            {majorCodeFilter === "" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">所属费用大项:</label>
                <select
                  value={majorCodeFilter}
                  disabled
                  className="h-8 px-2 border border-slate-300 rounded text-sm w-48 focus:outline-none focus:border-blue-500 bg-slate-100 text-slate-500"
                >
                  <option value="">全部</option>
                </select>
              </div>
            )}

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
        </div>
        <ColumnSettings columns={allColumns} visibleKeys={visibleKeys} onChange={setVisibleKeys} />
      </div>
      <div className="flex-1 min-h-0">
        <Table
          className="h-full border-none rounded-none"
          columns={columns}
          data={filteredData}
          rowKey={(r: any) => r.id}
          rowClassName={(r: any) => {
            if (r.isSubtotal || !r.projectCode) return "bg-orange-50 font-medium text-orange-900 hover:bg-orange-50";
            if (r.projectCode === "010001") return "bg-orange-100 hover:bg-orange-200";
            return "";
          }}
        />
      </div>
    </div>
  );
}

const detailData = [
  { id: 1, requestDate: "2026.07.05 08:30", chargeDate: "2026.07.04 20:30", projectCode: "600103", projectNameSpec: "(集采)0.9%氯化钠注射液250ml ※250ml*1瓶/瓶", unit: "瓶", quantity: "1.00", unitPrice: "2.25", amount: "2.25", chargeDept: "珠玑心血管科(心病科)住院", execDept: "珠玑西药房", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", category: "长期医嘱", operatorCode: "Y00303", operator: "邓建勇", ward: "珠玑13楼病区", dateGroup: "2026.07.04" },
  { id: 2, requestDate: "2026.07.06 08:30", chargeDate: "2026.07.05 11:30", projectCode: "600103", projectNameSpec: "(集采)0.9%氯化钠注射液250ml ※250ml*1瓶/瓶", unit: "瓶", quantity: "1.00", unitPrice: "2.25", amount: "2.25", chargeDept: "珠玑心血管科(心病科)住院", execDept: "珠玑西药房", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", category: "长期医嘱", operatorCode: "007276", operator: "杨丽君", ward: "珠玑13楼病区", dateGroup: "2026.07.05" },
  { id: 3, requestDate: "2026.07.07 08:30", chargeDate: "2026.07.06 12:30", projectCode: "600103", projectNameSpec: "(集采)0.9%氯化钠注射液250ml ※250ml*1瓶/瓶", unit: "瓶", quantity: "1.00", unitPrice: "2.25", amount: "2.25", chargeDept: "珠玑心血管科(心病科)住院", execDept: "珠玑西药房", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", category: "长期医嘱", operatorCode: "000749", operator: "严玉翠", ward: "珠玑13楼病区", dateGroup: "2026.07.06" },
  { id: 4, requestDate: "2026.07.08 08:30", chargeDate: "2026.07.07 12:30", projectCode: "600103", projectNameSpec: "(集采)0.9%氯化钠注射液250ml ※250ml*1瓶/瓶", unit: "瓶", quantity: "1.00", unitPrice: "2.25", amount: "2.25", chargeDept: "珠玑心血管科(心病科)住院", execDept: "珠玑西药房", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", category: "长期医嘱", operatorCode: "000500", operator: "谭燕仪", ward: "珠玑13楼病区", dateGroup: "2026.07.07" },
  { id: 5, requestDate: "2026.07.09 08:30", chargeDate: "2026.07.08 12:30", projectCode: "600103", projectNameSpec: "(集采)0.9%氯化钠注射液250ml ※250ml*1瓶/瓶", unit: "瓶", quantity: "1.00", unitPrice: "2.25", amount: "2.25", chargeDept: "珠玑心血管科(心病科)住院", execDept: "珠玑西药房", classifiedPay: "0.00", selfPay: "0.00", discount: "0.00", category: "长期医嘱", operatorCode: "006481", operator: "董水燕", ward: "珠玑13楼病区", dateGroup: "2026.07.08" }
];

function DetailChargeTable({ minorItem }: { minorItem: any }) {
  const processedData = useMemo(() => {
    const groups: any = {};
    detailData.forEach(item => {
      if (!groups[item.dateGroup]) {
        groups[item.dateGroup] = [];
      }
      groups[item.dateGroup].push(item);
    });
    
    const result: any[] = [];
    let grandTotalQty = 0;
    let grandTotalAmount = 0;
    let grandTotalClassifiedPay = 0;
    let grandTotalSelfPay = 0;
    let grandTotalDiscount = 0;

    Object.keys(groups).sort().forEach(date => {
      let subQty = 0;
      let subAmount = 0;
      let subClassifiedPay = 0;
      let subSelfPay = 0;
      let subDiscount = 0;

      groups[date].forEach((item: any) => {
        subQty += Number(item.quantity) || 0;
        subAmount += Number(item.amount) || 0;
        subClassifiedPay += Number(item.classifiedPay) || 0;
        subSelfPay += Number(item.selfPay) || 0;
        subDiscount += Number(item.discount) || 0;
        result.push({
          ...item,
          projectNameSpec: minorItem ? minorItem.projectNameSpec : item.projectNameSpec
        });
      });

      result.push({
        id: `subtotal-${date}`,
        isSubtotal: true,
        requestDate: `${date}~`,
        projectNameSpec: `△△以上: ${date}`,
        quantity: subQty.toFixed(2),
        amount: subAmount.toFixed(2),
        classifiedPay: subClassifiedPay.toFixed(2),
        selfPay: subSelfPay.toFixed(2),
        discount: subDiscount.toFixed(2),
      });

      grandTotalQty += subQty;
      grandTotalAmount += subAmount;
      grandTotalClassifiedPay += subClassifiedPay;
      grandTotalSelfPay += subSelfPay;
      grandTotalDiscount += subDiscount;
    });

    if (result.length > 0) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
      result.push({
        id: 'grand-total',
        isGrandTotal: true,
        requestDate: `至 ${todayStr}~`,
        projectNameSpec: `△△总计: ※`,
        quantity: grandTotalQty.toFixed(2),
        amount: grandTotalAmount.toFixed(2),
        classifiedPay: grandTotalClassifiedPay.toFixed(2),
        selfPay: grandTotalSelfPay.toFixed(2),
        discount: grandTotalDiscount.toFixed(2),
      });
    }

    return result;
  }, [minorItem]);

  const allColumns = useMemo(() => [
    { key: "chargeDate", title: "收费日期", width: "160px" },
    { key: "requestDate", title: "请求日期", width: "160px" },
    { key: "projectCode", title: "项目代码", width: "120px" },
    { key: "projectNameSpec", title: "项目名称规格", width: "300px" },
    { key: "unit", title: "单位", width: "80px", align: "center" as const },
    { key: "quantity", title: "数量", width: "80px", align: "right" as const },
    { key: "unitPrice", title: "单价", width: "100px", align: "right" as const },
    { key: "amount", title: "金额", width: "100px", align: "right" as const },
    { key: "chargeDept", title: "发生费用病区所在科室", width: "200px" },
    { key: "execDept", title: "执行科室", width: "120px" },
    { key: "classifiedPay", title: "分类支付金额", width: "120px", align: "right" as const },
    { key: "selfPay", title: "自费金额", width: "100px", align: "right" as const },
    { key: "discount", title: "减免金额", width: "100px", align: "right" as const },
    { key: "category", title: "费用类别", width: "100px" },
    { key: "operatorCode", title: "操作员代码", width: "100px" },
    { key: "operator", title: "操作员", width: "100px" },
    { key: "ward", title: "病区", width: "120px" },
  ], []);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(allColumns.map(c => c.key));
  const columns = useMemo(() => allColumns.filter(c => visibleKeys.includes(c.key)), [allColumns, visibleKeys]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
           <h3 className="text-base font-bold text-slate-800">
             {minorItem ? minorItem.projectNameSpec : "明细列表"}
           </h3>
           <span className="text-xs text-slate-500">按日期进行分类汇总</span>
        </div>
        <ColumnSettings columns={allColumns} visibleKeys={visibleKeys} onChange={setVisibleKeys} />
      </div>
      <div className="flex-1 min-h-0">
        <Table
          className="h-full border-none rounded-none"
          columns={columns}
          data={processedData}
          rowKey={(r: any) => r.id}
          rowClassName={(r: any) => {
            if (r.isSubtotal) return "bg-orange-50 font-medium text-orange-900 hover:bg-orange-50";
            if (r.isGrandTotal) return "bg-orange-100 font-bold text-orange-900 hover:bg-orange-100";
            return "";
          }}
        />
      </div>
    </div>
  );
}