import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table, Column } from "@/src/components/ui/Table";
import { Pagination } from "@/src/components/ui/Pagination";
import { Select } from "@/src/components/ui/Select";
import { toast } from "@/src/components/ui/Toast";
import * as XLSX from "xlsx";

export type DeductionValidationStatus =
  | "文件上传失败"
  | "待处理"
  | "校验中"
  | "校验失败"
  | "全部通过"
  | "存在问题数据"
  | "校验过程异常";

export interface DeductionImportRecordItem {
  id: string;
  belongingMonth?: string;
  fileName: string;
  fileSize: string;
  operator: string;
  uploadTime: string;
  status: DeductionValidationStatus;
  addCount?: number; // 新增数量
  updateCount?: number; // 更新数量
  deleteCount?: number; // 删除数量
  problemCount?: number; // 问题数据数量
  problemData?: any[];
  removeCount?: number; // 兼容
  addNormalCount?: number; // 兼容
  addOtherCount?: number; // 兼容
}

export const DEDUCTION_IMPORT_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "全部", value: "" },
  { label: "文件上传失败", value: "文件上传失败" },
  { label: "待处理", value: "待处理" },
  { label: "校验中", value: "校验中" },
  { label: "校验失败", value: "校验失败" },
  { label: "全部通过", value: "全部通过" },
  { label: "存在问题数据", value: "存在问题数据" },
  { label: "校验过程异常", value: "校验过程异常" },
];

export const DEFAULT_DEDUCTION_IMPORT_RECORDS: DeductionImportRecordItem[] = [
  {
    id: "REC_001",
    belongingMonth: "2026-09",
    fileName: "2026年09月疑难病案医保复审增补扣减汇总.xlsx",
    fileSize: "64kb",
    operator: "王芳",
    uploadTime: "2026-09-16 17:02:18",
    status: "待处理"
  },
  {
    id: "REC_002",
    belongingMonth: "2026-09",
    fileName: "2026年09月跨省异地医保门诊统筹核减导入.xlsx",
    fileSize: "52kb",
    operator: "江昊",
    uploadTime: "2026-09-16 16:50:35",
    status: "校验中"
  },
  {
    id: "REC_003",
    belongingMonth: "2026-09",
    fileName: "2026-09_医保扣减线下协商与增补明细.xlsx",
    fileSize: "38kb",
    operator: "赖礼尊",
    uploadTime: "2026-09-16 16:15:20",
    status: "全部通过",
    addCount: 16,
    updateCount: 45,
    deleteCount: 5,
    problemCount: 0
  },
  {
    id: "REC_004",
    belongingMonth: "2026-09",
    fileName: "2026年09月省内异地医保核减更新明细_v2.xlsx",
    fileSize: "45kb",
    operator: "赖礼尊",
    uploadTime: "2026-09-16 15:40:12",
    status: "存在问题数据",
    addCount: 8,
    updateCount: 28,
    deleteCount: 2,
    problemCount: 3,
    problemData: [
      {
        "序号": 1,
        "行号": 12,
        "扣减明细 ID": "DED_T202401GZ_9981",
        "住院号/门诊号": "ZY202609014",
        "患者姓名": "刘建平",
        "人员类别": "广州医保",
        "线上/线下": "线下",
        "违规金额": "680.00",
        "校验未通过原因": "系统不存在该扣减明细 ID，禁止落库"
      },
      {
        "序号": 2,
        "行号": 19,
        "扣减明细 ID": "DED_T202401GZ_1002",
        "住院号/门诊号": "ZY202609023",
        "患者姓名": "张素芬",
        "导入人员类别": "跨省异地",
        "系统原人员类别": "广州医保",
        "导入线上线下": "线上",
        "系统原线上线下": "线下",
        "违规金额": "1240.00",
        "校验未通过原因": "人员类别或线上线下与系统原记录不一致，禁止更新"
      },
      {
        "序号": 3,
        "行号": 27,
        "扣减明细 ID": "",
        "住院号/门诊号": "MZ202609088",
        "患者姓名": "赵晓明",
        "证件号码": "44010619851120001X",
        "违规金额": "350.00",
        "校验未通过原因": "出院日期早于入院日期，逻辑异常"
      }
    ]
  },
  {
    id: "REC_005",
    belongingMonth: "2026-08",
    fileName: "2026年08月门诊慢特病核减明细_旧模板.xlsx",
    fileSize: "23kb",
    operator: "李明",
    uploadTime: "2026-09-15 14:22:10",
    status: "校验失败",
    addCount: 0,
    updateCount: 0,
    deleteCount: 0,
    problemCount: 1,
    problemData: [
      {
        "序号": 1,
        "行号": 1,
        "扣减明细 ID": "-",
        "患者姓名": "-",
        "违规金额": "-",
        "校验未通过原因": "模版校验失败：表头缺少核心字段【是否删除】，请下载最新标准导入模板后重新上传"
      }
    ]
  },
  {
    id: "REC_006",
    belongingMonth: "2026-08",
    fileName: "2026年08月特病药品直报核减批量数据.xlsx",
    fileSize: "89kb",
    operator: "陈建国",
    uploadTime: "2026-09-14 11:35:40",
    status: "校验过程异常"
  },
  {
    id: "REC_007",
    belongingMonth: "2026-08",
    fileName: "2026年08月线下协商剔除扣减清单_损坏.xlsx",
    fileSize: "0kb",
    operator: "张敏",
    uploadTime: "2026-09-12 09:18:22",
    status: "文件上传失败"
  },
  {
    id: "REC_008",
    belongingMonth: "2026-08",
    fileName: "2026年08月广州医保（线上）扣减核减增补表.xlsx",
    fileSize: "32kb",
    operator: "赖礼尊",
    uploadTime: "2026-09-10 10:45:00",
    status: "全部通过",
    addCount: 22,
    updateCount: 58,
    deleteCount: 6,
    problemCount: 0
  },
  {
    id: "REC_009",
    belongingMonth: "2026-08",
    fileName: "2026年08月其他分类医保扣减协商清单.xlsx",
    fileSize: "29kb",
    operator: "赵强",
    uploadTime: "2026-09-08 15:12:34",
    status: "存在问题数据",
    addCount: 5,
    updateCount: 19,
    deleteCount: 3,
    problemCount: 2,
    problemData: [
      {
        "序号": 1,
        "行号": 8,
        "扣减明细 ID": "DED_T202401GZ_3012",
        "住院号/门诊号": "ZY202608112",
        "患者姓名": "孙国华",
        "违规金额": "420.00",
        "校验未通过原因": "系统原记录已处于结案归档状态，禁止再次更新"
      },
      {
        "序号": 2,
        "行号": 15,
        "扣减明细 ID": "",
        "住院号/门诊号": "MZ202608235",
        "患者姓名": "周秀英",
        "证件号码": "44010619710315998X",
        "违规金额": "890.00",
        "校验未通过原因": "身份证号校验位不合法，未通过医保实名核验"
      }
    ]
  }
];

const STORAGE_KEY = "deduction_import_records_v4";

export function getStoredDeductionImportRecords(): DeductionImportRecordItem[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEDUCTION_IMPORT_RECORDS));
    return DEFAULT_DEDUCTION_IMPORT_RECORDS;
  }
  try {
    const list: DeductionImportRecordItem[] = JSON.parse(data);
    return list.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  } catch (e) {
    return DEFAULT_DEDUCTION_IMPORT_RECORDS;
  }
}

export function addDeductionImportRecord(record: Omit<DeductionImportRecordItem, "id">) {
  const records = getStoredDeductionImportRecords();
  const newRecord: DeductionImportRecordItem = {
    ...record,
    id: "REC_" + Date.now().toString().slice(-6)
  };
  const updated = [newRecord, ...records].sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newRecord;
}

export function DeductionImportRecordsView() {
  const navigate = useNavigate();

  // Filter States
  const [operator, setOperator] = useState("");
  const [status, setStatus] = useState<string>("");
  const [searchParams, setSearchParams] = useState({ operator: "", status: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [records, setRecords] = useState<DeductionImportRecordItem[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const list = getStoredDeductionImportRecords();
    setRecords(list);
  };

  const handleSearch = () => {
    setSearchParams({ operator, status });
    setPage(1);
  };

  const handleReset = () => {
    setOperator("");
    setStatus("");
    setSearchParams({ operator: "", status: "" });
    setPage(1);
  };

  const handleDownloadProblemData = (item: DeductionImportRecordItem) => {
    if (!item.problemData || item.problemData.length === 0) {
      toast("暂无问题数据可下载", "warning");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(item.problemData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "问题数据");
    const downloadFileName = `问题数据_${item.fileName.replace(/\.[^/.]+$/, "")}.xlsx`;
    XLSX.writeFile(wb, downloadFileName);
    toast("问题数据文件已开始下载", "success");
  };

  // Filtered & Sorted Records (newest uploadTime first)
  const filteredRecords = records
    .filter(item => {
      const matchOperator = searchParams.operator ? item.operator.includes(searchParams.operator) : true;
      const matchStatus = searchParams.status ? item.status === searchParams.status : true;
      return matchOperator && matchStatus;
    })
    .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());

  const total = filteredRecords.length;
  const startIdx = (page - 1) * pageSize;
  const currentData = filteredRecords.slice(startIdx, startIdx + pageSize);

  const getStatusDisplay = (st: DeductionValidationStatus) => {
    switch (st) {
      case "全部通过":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            全部通过
          </span>
        );
      case "存在问题数据":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            存在问题数据
          </span>
        );
      case "校验中":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            校验中
          </span>
        );
      case "待处理":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            待处理
          </span>
        );
      case "校验失败":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            校验失败
          </span>
        );
      case "文件上传失败":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            文件上传失败
          </span>
        );
      case "校验过程异常":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            校验过程异常
          </span>
        );
      default:
        return <span className="text-slate-700 text-xs">{st}</span>;
    }
  };

  const columns: Column<DeductionImportRecordItem>[] = [
    {
      key: "id",
      title: "序号",
      width: "60px",
      align: "center",
      render: (_, idx) => startIdx + idx + 1
    },
    {
      key: "fileName",
      title: "文件名",
      width: "280px",
      render: (r) => <span className="text-slate-800 font-normal">{r.fileName}</span>
    },
    {
      key: "fileSize",
      title: "文件大小",
      width: "100px",
      render: (r) => <span className="text-slate-600">{r.fileSize}</span>
    },
    {
      key: "operator",
      title: "操作人",
      width: "110px",
      render: (r) => <span className="text-slate-700 font-medium">{r.operator}</span>
    },
    {
      key: "uploadTime",
      title: "上传时间",
      width: "160px",
      render: (r) => <span className="text-slate-600">{r.uploadTime}</span>
    },
    {
      key: "status",
      title: "校验情况",
      width: "120px",
      render: (r) => getStatusDisplay(r.status)
    },
    {
      key: "resultSummary",
      title: "数据更新情况",
      width: "280px",
      render: (r) => {
        if (
          r.status === "待处理" ||
          r.status === "校验中" ||
          r.status === "文件上传失败" ||
          r.status === "校验过程异常"
        ) {
          return <span className="text-slate-400 text-xs">-</span>;
        }

        const add = r.addCount !== undefined ? r.addCount : (r.addNormalCount || 0) + (r.addOtherCount || 0);
        const update = r.updateCount || 0;
        const del = r.deleteCount !== undefined ? r.deleteCount : (r.removeCount || 0);
        const prob = r.problemCount || 0;

        return (
          <div className="text-xs flex items-center flex-wrap gap-x-2.5 gap-y-1 text-slate-600">
            <span>新增: <strong className="text-emerald-600 font-semibold">{add}</strong></span>
            <span>更新: <strong className="text-blue-600 font-semibold">{update}</strong></span>
            <span>删除: <strong className="text-amber-600 font-semibold">{del}</strong></span>
            <span>问题: <strong className={prob > 0 ? "text-red-600 font-bold" : "text-slate-400 font-semibold"}>{prob}</strong></span>
          </div>
        );
      }
    },
    {
      key: "action",
      title: "操作",
      width: "120px",
      fixed: "right",
      render: (r) => {
        const hasProblem =
          r.status === "存在问题数据" ||
          r.status === "校验失败" ||
          (typeof r.problemCount === "number" && r.problemCount > 0);

        if (hasProblem) {
          return (
            <button
              onClick={() => handleDownloadProblemData(r)}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              问题数据下载
            </button>
          );
        }

        if (r.status === "校验过程异常") {
          return (
            <button
              onClick={() => toast("已重新提交后台排队校验", "info")}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              重新校验
            </button>
          );
        }

        // 仅显示操作按钮，无操作时不展示“处理中”、“排队中”、“-”或“0-”等非操作字符
        return null;
      }
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">导入记录</h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        {/* Filter Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">操作人:</span>
              <input
                type="text"
                placeholder="请输入操作人"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-48 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">校验情况:</span>
              <div className="w-44">
                <Select
                  options={DEDUCTION_IMPORT_STATUS_OPTIONS}
                  value={status}
                  onChange={(val) => setStatus(val)}
                  placeholder="全部"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>
        </div>

        {/* Table & Pagination Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto">
            <Table
              columns={columns}
              data={currentData}
              rowKey={(r) => r.id}
              emptyText="暂无导入记录"
            />
          </div>
          <div className="p-4 border-t border-slate-200">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(p) => setPage(p)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
