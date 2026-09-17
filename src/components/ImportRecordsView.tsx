import React, { useState, useEffect } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Pagination } from "@/src/components/ui/Pagination";
import { Select } from "@/src/components/ui/Select";
import { ArrowLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "@/src/lib/exportUtils";
import { toast } from "@/src/components/ui/Toast";

export type ImportValidationStatus =
  | "全部通过"
  | "存在问题数据"
  | "待处理"
  | "校验中"
  | "校验失败"
  | "校验过程异常"
  | "文件上传失败";

export const VALIDATION_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "全部", value: "" },
  { label: "全部通过", value: "全部通过" },
  { label: "存在问题数据", value: "存在问题数据" },
  { label: "校验中", value: "校验中" },
  { label: "待处理", value: "待处理" },
  { label: "校验失败", value: "校验失败" },
  { label: "文件上传失败", value: "文件上传失败" },
  { label: "校验过程异常", value: "校验过程异常" },
];

export interface ImportRecordItem {
  id: string;
  taskId?: string;
  taskName?: string;
  fileName: string;
  fileSize: string;
  operator: string;
  uploadTime: string;
  status: ImportValidationStatus;
  problemCount?: number;
  problemData?: any[];
}

// 演示数据按上传时间严格降序（最新在上），且状态演进逻辑合理：
// 1. 最新刚上传正在排队或校验中的任务（待处理 / 校验中）
// 2. 紧接着前不久校验完成的记录（存在问题数据 / 全部通过）
// 3. 早期已完成或失败的历史记录（全部通过、校验失败、校验过程异常、文件上传失败）
// 彻底解决“旧记录已完成通过，却有更早时间的记录还在待处理”的非真实状态倒挂问题
const DEFAULT_TASK_IMPORT_RECORDS: ImportRecordItem[] = [
  {
    id: "REC_001",
    fileName: "2026年6月跨省异地医保扣减清单.xlsx",
    fileSize: "34kb",
    operator: "王芳",
    uploadTime: "2026-07-31 16:50:11",
    status: "待处理"
  },
  {
    id: "REC_002",
    fileName: "门诊慢性病特殊病种扣减数据_v2.xlsx",
    fileSize: "42kb",
    operator: "李明",
    uploadTime: "2026-07-31 16:45:05",
    status: "校验中"
  },
  {
    id: "REC_003",
    fileName: "省内异地（线上）_副本.xlsx",
    fileSize: "27kb",
    operator: "赖礼尊",
    uploadTime: "2026-07-31 16:35:20",
    status: "存在问题数据",
    problemCount: 3,
    problemData: [
      {
        "序号": 1,
        "住院号/门诊号": "ZY202607001",
        "患者姓名": "张三",
        "证件号码": "440106198501011234",
        "涉及科室": "内科",
        "违规金额": "520.00",
        "校验未通过原因": "身份证号校验位不合法，医保编码缺失"
      },
      {
        "序号": 2,
        "住院号/门诊号": "ZY202607002",
        "患者姓名": "李四",
        "证件号码": "440106199003055678",
        "涉及科室": "外科",
        "违规金额": "1280.00",
        "校验未通过原因": "出院日期早于入院日期，逻辑异常"
      },
      {
        "序号": 3,
        "住院号/门诊号": "MZ202607088",
        "患者姓名": "王五",
        "证件号码": "440106197812123344",
        "涉及科室": "儿科",
        "违规金额": "340.00",
        "校验未通过原因": "扣减金额大于违规金额"
      }
    ]
  },
  {
    id: "REC_004",
    fileName: "问题数据_省内异地（线上）_副本 (1).xls",
    fileSize: "25kb",
    operator: "江昊",
    uploadTime: "2026-07-31 16:22:15",
    status: "全部通过"
  },
  {
    id: "REC_005",
    fileName: "城乡居民医保门诊统筹扣减.xlsx",
    fileSize: "18kb",
    operator: "张敏",
    uploadTime: "2026-07-31 14:22:30",
    status: "校验失败",
    problemCount: 1,
    problemData: [
      {
        "序号": 1,
        "住院号/门诊号": "MZ202607155",
        "患者姓名": "赵六",
        "证件号码": "440106198205121234",
        "涉及科室": "急诊科",
        "违规金额": "890.00",
        "校验未通过原因": "文件模版版本过旧，字段名与最新规范不一致"
      }
    ]
  },
  {
    id: "REC_006",
    fileName: "特病药品直报扣减汇总表_202607.xlsx",
    fileSize: "29kb",
    operator: "陈建国",
    uploadTime: "2026-07-31 11:05:18",
    status: "校验过程异常"
  },
  {
    id: "REC_007",
    fileName: "大病保险合规费用核减清单_0730.xlsx",
    fileSize: "55kb",
    operator: "赵强",
    uploadTime: "2026-07-30 17:48:02",
    status: "文件上传失败"
  }
];

const DEFAULT_STORAGE_KEY = "task_import_records_v3";

export function getStoredImportRecords(storageKey: string = DEFAULT_STORAGE_KEY): ImportRecordItem[] {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    localStorage.setItem(storageKey, JSON.stringify(DEFAULT_TASK_IMPORT_RECORDS));
    return DEFAULT_TASK_IMPORT_RECORDS;
  }
  try {
    const list: ImportRecordItem[] = JSON.parse(data);
    return list.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  } catch (e) {
    return DEFAULT_TASK_IMPORT_RECORDS;
  }
}

export function addImportRecord(record: Omit<ImportRecordItem, "id">, storageKey: string = DEFAULT_STORAGE_KEY) {
  const records = getStoredImportRecords(storageKey);
  const newRecord: ImportRecordItem = {
    ...record,
    id: "REC_" + Date.now().toString().slice(-6)
  };
  const updated = [newRecord, ...records].sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
  localStorage.setItem(storageKey, JSON.stringify(updated));
  return newRecord;
}

interface ImportRecordsViewProps {
  title?: string;
  storageKey?: string;
  taskId?: string | null;
  taskName?: string | null;
  onBack?: () => void;
}

export function ImportRecordsView({
  title = "导入记录",
  storageKey = DEFAULT_STORAGE_KEY,
  taskId,
  taskName,
  onBack
}: ImportRecordsViewProps) {
  const navigate = useNavigate();

  // Filter States
  const [operator, setOperator] = useState("");
  const [status, setStatus] = useState<string>("");
  const [searchParams, setSearchParams] = useState({ operator: "", status: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [records, setRecords] = useState<ImportRecordItem[]>([]);

  useEffect(() => {
    loadRecords();
  }, [storageKey, taskId]);

  const loadRecords = () => {
    const list = getStoredImportRecords(storageKey);
    if (taskId) {
      const taskSpecific = list.filter(item => !item.taskId || item.taskId === taskId);
      setRecords(taskSpecific.length > 0 ? taskSpecific : list);
    } else {
      setRecords(list);
    }
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

  const handleDownloadProblemData = (item: ImportRecordItem) => {
    if (!item.problemData || item.problemData.length === 0) {
      const mockProblemList = [
        {
          "序号": 1,
          "住院号/门诊号": "ZY202607001",
          "患者姓名": "张三",
          "证件号码": "440106198501011234",
          "涉及科室": "心血管内科",
          "违规金额": "520.00",
          "校验未通过原因": "身份证号校验位不合法，医保编码缺失"
        },
        {
          "序号": 2,
          "住院号/门诊号": "ZY202607002",
          "患者姓名": "李四",
          "证件号码": "440106199003055678",
          "涉及科室": "骨科",
          "违规金额": "1280.00",
          "校验未通过原因": "出院日期早于入院日期，逻辑异常"
        }
      ];
      exportToExcel(mockProblemList, `问题数据_${item.fileName.replace(/\.[^/.]+$/, "")}`);
    } else {
      exportToExcel(item.problemData, `问题数据_${item.fileName.replace(/\.[^/.]+$/, "")}`);
    }
    toast("问题数据文件已开始下载", "success");
  };

  // Filtered & strictly sorted by uploadTime descending
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

  const getStatusDisplay = (st: ImportValidationStatus) => {
    switch (st) {
      case "全部通过":
        return <span className="text-slate-700 text-sm">全部通过</span>;
      case "存在问题数据":
        return <span className="text-slate-700 text-sm">存在问题数据</span>;
      case "待处理":
        return <span className="text-amber-500 font-medium text-sm">待处理</span>;
      case "校验中":
        return <span className="text-blue-600 font-medium text-sm">校验中</span>;
      case "校验失败":
        return <span className="text-red-500 font-medium text-sm">校验失败</span>;
      case "校验过程异常":
        return <span className="text-orange-500 font-medium text-sm">校验过程异常</span>;
      case "文件上传失败":
        return <span className="text-red-500 font-medium text-sm">文件上传失败</span>;
      default:
        return <span className="text-slate-700 text-sm">{st}</span>;
    }
  };

  const columns: Column<ImportRecordItem>[] = [
    {
      key: "index",
      title: "序号",
      width: "80px",
      align: "center",
      render: (_, idx) => startIdx + idx + 1
    },
    {
      key: "fileName",
      title: "文件名",
      width: "300px",
      render: (r) => <span className="text-slate-800 font-normal">{r.fileName}</span>
    },
    {
      key: "fileSize",
      title: "文件大小",
      width: "120px",
      render: (r) => <span className="text-slate-600">{r.fileSize}</span>
    },
    {
      key: "operator",
      title: "操作人",
      width: "120px",
      render: (r) => <span className="text-slate-700 font-normal">{r.operator}</span>
    },
    {
      key: "uploadTime",
      title: "上传时间",
      width: "180px",
      render: (r) => <span className="text-slate-600">{r.uploadTime}</span>
    },
    {
      key: "status",
      title: "校验情况",
      width: "140px",
      render: (r) => getStatusDisplay(r.status)
    },
    {
      key: "action",
      title: "操作",
      width: "120px",
      render: (r) => {
        if (r.status === "存在问题数据" || r.status === "校验失败") {
          return (
            <button
              onClick={() => handleDownloadProblemData(r)}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              问题数据下载
            </button>
          );
        }
        if (r.status === "全部通过") {
          return <span className="text-slate-400 text-sm">-</span>;
        }
        if (r.status === "待处理" || r.status === "校验中") {
          return <span className="text-slate-400 text-sm">处理中</span>;
        }
        if (r.status === "校验过程异常" || r.status === "文件上传失败") {
          return (
            <button
              onClick={() => toast("已重新提交后台排队校验", "info")}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              重新校验
            </button>
          );
        }
        return <span className="text-slate-400 text-sm">-</span>;
      }
    }
  ];

  // 默认任务名称显示，保持与业务上下文一致
  const displayTaskName = taskName || "2024年06月广州医保线下反馈核查";

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                navigate(-1);
              }
            }}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-600 transition-colors"
            title="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {displayTaskName && (
              <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-normal">
                {displayTaskName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        {/* Blue Info Notice Banner */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-2.5 text-sm text-slate-700">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>通过校验的数据已自动入库，可下载校验未通过的数据修改后再次提交</span>
        </div>

        {/* Filter Card */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">操作人：</span>
              <input
                type="text"
                placeholder="请输入内容"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-48 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 whitespace-nowrap">校验情况：</span>
              <div className="w-44">
                <Select
                  options={VALIDATION_STATUS_OPTIONS}
                  value={status}
                  onChange={(val) => setStatus(val)}
                  placeholder="请选择"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm rounded-md transition-colors font-normal"
            >
              重置
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors font-normal"
            >
              查询
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
          <div className="p-4 border-t border-slate-200 flex justify-end">
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
