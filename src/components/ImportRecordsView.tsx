import React, { useState, useEffect } from "react";
import { Table, Column } from "@/src/components/ui/Table";
import { Button } from "@/src/components/ui/Button";
import { Pagination } from "@/src/components/ui/Pagination";
import { Select } from "@/src/components/ui/Select";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportToExcel } from "@/src/lib/exportUtils";
import { toast } from "@/src/components/ui/Toast";

export type ImportValidationStatus =
  | "文件上传失败"
  | "待处理"
  | "校验中"
  | "校验失败"
  | "全部通过"
  | "存在问题数据"
  | "校验过程异常";

export const VALIDATION_STATUS_OPTIONS: { label: string; value: ImportValidationStatus | "" }[] = [
  { label: "文件上传失败", value: "文件上传失败" },
  { label: "待处理", value: "待处理" },
  { label: "校验中", value: "校验中" },
  { label: "校验失败", value: "校验失败" },
  { label: "全部通过", value: "全部通过" },
  { label: "存在问题数据", value: "存在问题数据" },
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

const DEFAULT_IMPORT_RECORDS: ImportRecordItem[] = [
  {
    id: "REC_001",
    fileName: "省内异地（线上）_副本.xlsx",
    fileSize: "27kb",
    operator: "赖礼尊",
    uploadTime: "2026-07-31 16:18:52",
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
    id: "REC_002",
    fileName: "问题数据_省内异地（线上）_副本 (1).xls",
    fileSize: "25kb",
    operator: "江昊",
    uploadTime: "2026-07-31 16:32:21",
    status: "全部通过"
  },
  {
    id: "REC_003",
    fileName: "2026年6月跨省异地医保扣减清单.xlsx",
    fileSize: "34kb",
    operator: "王芳",
    uploadTime: "2026-07-31 15:40:11",
    status: "待处理"
  },
  {
    id: "REC_004",
    fileName: "门诊慢性病特殊病种扣减数据_v2.xlsx",
    fileSize: "42kb",
    operator: "李明",
    uploadTime: "2026-07-31 15:10:05",
    status: "校验中"
  },
  {
    id: "REC_005",
    fileName: "城乡居民医保门诊统筹扣减.xlsx",
    fileSize: "18kb",
    operator: "张敏",
    uploadTime: "2026-07-31 14:22:30",
    status: "校验失败",
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

export function getStoredImportRecords(storageKey: string = "deduction_import_records_v1"): ImportRecordItem[] {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    localStorage.setItem(storageKey, JSON.stringify(DEFAULT_IMPORT_RECORDS));
    return DEFAULT_IMPORT_RECORDS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_IMPORT_RECORDS;
  }
}

export function addImportRecord(record: Omit<ImportRecordItem, "id">, storageKey: string = "deduction_import_records_v1") {
  const records = getStoredImportRecords(storageKey);
  const newRecord: ImportRecordItem = {
    ...record,
    id: "REC_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
  };
  const updated = [newRecord, ...records];
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
  storageKey = "deduction_import_records_v1",
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
          "住院号/门诊号": "ZY202607101",
          "患者姓名": "赵六",
          "证件号码": "440106198205121234",
          "涉及科室": "心血管内科",
          "违规金额": "680.00",
          "校验未通过原因": "科室名称未在标准科室字典中匹配"
        },
        {
          "序号": 2,
          "住院号/门诊号": "ZY202607102",
          "患者姓名": "孙七",
          "证件号码": "440106197509185678",
          "涉及科室": "骨科",
          "违规金额": "1540.00",
          "校验未通过原因": "医疗类别字段为空"
        }
      ];
      exportToExcel(mockProblemList, `问题数据_${item.fileName}`);
    } else {
      exportToExcel(item.problemData, `问题数据_${item.fileName}`);
    }
    toast("问题数据文件已开始下载", "success");
  };

  // Filtered Records
  const filteredRecords = records.filter(item => {
    const matchOperator = searchParams.operator ? item.operator.includes(searchParams.operator) : true;
    const matchStatus = searchParams.status ? item.status === searchParams.status : true;
    return matchOperator && matchStatus;
  });

  const total = filteredRecords.length;
  const startIdx = (page - 1) * pageSize;
  const pageData = filteredRecords.slice(startIdx, startIdx + pageSize);

  const getStatusDisplay = (st: ImportValidationStatus) => {
    switch (st) {
      case "全部通过":
        return <span className="text-slate-800">全部通过</span>;
      case "存在问题数据":
        return <span className="text-slate-800">存在问题数据</span>;
      case "校验中":
        return <span className="text-blue-600">校验中</span>;
      case "待处理":
        return <span className="text-amber-600">待处理</span>;
      case "校验失败":
        return <span className="text-red-500">校验失败</span>;
      case "文件上传失败":
        return <span className="text-red-500">文件上传失败</span>;
      case "校验过程异常":
        return <span className="text-orange-500">校验过程异常</span>;
      default:
        return <span className="text-slate-700">{st}</span>;
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
      width: "320px",
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
      width: "140px",
      render: (r) => <span className="text-slate-700">{r.operator}</span>
    },
    {
      key: "uploadTime",
      title: "上传时间",
      width: "190px",
      render: (r) => <span className="text-slate-600">{r.uploadTime}</span>
    },
    {
      key: "status",
      title: "校验情况",
      width: "160px",
      render: (r) => getStatusDisplay(r.status)
    },
    {
      key: "action",
      title: "操作",
      width: "140px",
      fixed: "right",
      render: (r) => (
        <div>
          {(r.status === "存在问题数据" || r.status === "校验失败") && (
            <button
              onClick={() => handleDownloadProblemData(r)}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              问题数据下载
            </button>
          )}
          {r.status === "全部通过" && (
            <span className="text-slate-400 text-xs">-</span>
          )}
          {(r.status === "校验中" || r.status === "待处理") && (
            <span className="text-slate-400 text-xs">处理中</span>
          )}
          {(r.status === "文件上传失败" || r.status === "校验过程异常") && (
            <button
              onClick={() => toast("已重新发起重试", "info")}
              className="text-blue-600 hover:text-blue-800 text-sm font-normal cursor-pointer transition-colors"
            >
              重新校验
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-4 p-5 bg-[#f4f7fc] overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (onBack) onBack();
              else navigate(-1);
            }}
            className="text-slate-600 hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            title="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            {taskName && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-normal">
                {taskName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blue Alert Info Bar */}
      <div className="bg-[#e6f4ff] border border-[#91caff] rounded-lg px-4 py-3 flex items-center space-x-2.5 text-slate-700 text-sm">
        <div className="w-4 h-4 rounded-full bg-[#1677ff] text-white flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
          i
        </div>
        <span>通过校验的数据已自动入库，可下载校验未通过的数据修改后再次提交</span>
      </div>

      {/* Filter Form Card */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600 font-normal whitespace-nowrap">操作人：</label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="请输入内容"
                className="w-60 border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-slate-600 font-normal whitespace-nowrap">校验情况：</label>
              <div className="w-60">
                <Select
                  value={status}
                  onChange={(val) => setStatus(val || "")}
                  placeholder="请选择"
                  allowClear
                  options={[
                    { label: "请选择", value: "" },
                    ...VALIDATION_STATUS_OPTIONS
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="px-5 py-1.5 text-sm text-slate-600 border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              重置
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              className="px-5 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              查询
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[380px]">
        <div className="flex-1 overflow-auto p-4">
          <Table
            data={pageData}
            columns={columns}
            rowKey={(r) => r.id}
            className="w-full"
          />
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(t) => `共页，${t}条`}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
