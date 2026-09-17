import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { UploadCloud, FileSpreadsheet, X, Download, CheckCircle2 } from "lucide-react";
import { toast } from "@/src/components/ui/Toast";
import * as XLSX from "xlsx";
import { getInsuranceCategories } from "@/src/lib/insuranceCategoryStore";
import { mockApi, Task } from "@/src/lib/mockData";
import { addDeductionImportRecord } from "@/src/pages/deduction-management/import-records/DeductionImportRecordsView";
import { useNavigate } from "react-router-dom";
import { getCurrentUserName } from "@/src/lib/userContext";

interface ImportDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportDeductionModal({ isOpen, onClose, onSuccess }: ImportDeductionModalProps) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [belongingMonth, setBelongingMonth] = useState<string>("2026-09");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setBelongingMonth("2026-09");
      setIsDragging(false);
      setIsProcessing(false);

      // 提供默认用于演示的更新文件
      const dummyFile = new File(["dummy content"], "2026-09_医保扣减线下协商与增补明细.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      setFile(dummyFile);
    }
  }, [isOpen]);

  const handleDownloadTemplate = () => {
    const headers = [
      "扣减明细 ID",
      "是否删除",
      "人员类别",
      "线上/线下",
      "住院号/门诊号",
      "患者姓名",
      "证件号码",
      "入院时间",
      "出院时间",
      "医疗类别",
      "扣款项目",
      "违规金额（单位：元）",
      "扣减原因",
      "涉及科室",
      "涉及医生",
      "扣减科室或个人",
      "扣减金额（药费/耗材）",
      "扣减金额（其它）",
      "项目分类",
      "备注"
    ];

    const sampleRow1 = [
      "DED_T202401GZ_1000",
      "", // 是否删除默认为空
      "广州医保",
      "线下",
      "ZY202609001",
      "张建国",
      "440106196503121518",
      "2026-09-01",
      "2026-09-07",
      "住院",
      "注射用头孢哌酮钠他唑巴坦钠",
      "586.40",
      "超医保限定二级以上指征及重度感染用药范围",
      "呼吸内科",
      "王主任医师",
      "呼吸内科",
      "410.48",
      "175.92",
      "西药",
      "【更新示例】是否删除为空，根据扣减明细ID更新金额与科室"
    ];

    const sampleRow2 = [
      "DED_T202401GZ_1001",
      "是", // 手动改为“是”，匹配后执行删除
      "广州医保",
      "线下",
      "ZY202609002",
      "刘淑芬",
      "44010319720824262X",
      "2026-09-03",
      "2026-09-09",
      "住院",
      "多层螺旋CT平扫(胸部)",
      "450.00",
      "短期内重复行胸部高分辨率CT检查且无病情变化指征",
      "心血管内科",
      "李副主任医师",
      "心血管内科",
      "0.00",
      "450.00",
      "诊疗项目",
      "【删除示例】是否删除设为“是”，导入匹配后执行删除"
    ];

    const sampleRow3 = [
      "",
      "",
      "广州医保",
      "线上",
      "MZ202609105",
      "陈志强",
      "440105198111053432",
      "2026-09-05",
      "2026-09-05",
      "普通门诊",
      "重组人脑利钠肽注射液",
      "1240.00",
      "门诊单日用量超限定",
      "心血管内科",
      "刘主任医师",
      "心血管内科",
      "868.00",
      "372.00",
      "西药",
      "【新增至正式分类示例】扣减明细ID留空，人员类别+线上线下匹配广州医保（线上）"
    ];

    const sampleRow4 = [
      "",
      "",
      "灵活就业参保",
      "线上",
      "MZ202609106",
      "黄晓峰",
      "440104199007165156",
      "2026-09-08",
      "2026-09-08",
      "普通门诊",
      "动态心电图(Holter24小时)",
      "260.00",
      "医保局线下直接核减下发数据",
      "老年医学科",
      "张主治医师",
      "老年医学科",
      "0.00",
      "260.00",
      "诊疗项目",
      "【新增至其他分类示例】扣减明细ID留空，人员类别+线上线下未配置在业务分类，归入其他分类"
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2, sampleRow3, sampleRow4]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "医保扣减明细导入更新模板");
    XLSX.writeFile(wb, "医保扣减明细导入更新模板.xlsx");
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
      toast("请上传 Excel (.xlsx / .xls) 文件", "error");
      return;
    }
    setFile(selectedFile);
  };

  // 执行核心导入更新与校验引擎，没问题的数据直接落库，沉淀记录后跳转到导入记录页
  const handleExecuteImport = async () => {
    if (!belongingMonth) {
      toast("请选择所属年月", "error");
      return;
    }
    if (!file) {
      toast("请选择上传明细文件", "error");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. 读取 Excel 数据
      let rows: any[] = [];
      let headers: string[] = [];

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const aoa = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (aoa.length > 0) {
          headers = (aoa[0] || []).map(h => String(h || "").trim());
          rows = aoa.slice(1);
        }
      } catch (err) {
        // 如果是演示用的模拟 dummyFile 或者是空白文件，构造演示数据
        rows = [];
      }

      // 如果 rows 为空（如模拟点击确认或空模板），提供包含各种典型场景的完整示例行进行真实推演
      if (rows.length === 0) {
        // 查找系统中已有的真实一条明细 ID 作为更新/删除测试靶标
        const allTasks = mockApi.getTasks(1, 1000).data;
        let existingDedId1 = "";
        let existingDedId2 = "";
        for (const t of allTasks) {
          const recs = mockApi.getTaskDetailRecords(t.id, false);
          if (recs && recs.length > 0) {
            for (const r of recs) {
              if (r.data?.DEDUCTION_DETAIL_ID) {
                if (!existingDedId1) existingDedId1 = r.data.DEDUCTION_DETAIL_ID;
                else if (!existingDedId2 && r.data.DEDUCTION_DETAIL_ID !== existingDedId1) {
                  existingDedId2 = r.data.DEDUCTION_DETAIL_ID;
                  break;
                }
              }
            }
          }
          if (existingDedId1 && existingDedId2) break;
        }

        if (!existingDedId1) existingDedId1 = "DED_T202401GZ_1000";
        if (!existingDedId2) existingDedId2 = "DED_T202401GZ_1001";

        rows = [
          // 场景1: 有扣减明细ID，分类一致，是否删除为空 -> 更新
          [existingDedId1, "", "广州医保", "线下", "ZY20260901", "李伟", "440106198001011234", "2026-09-01", "2026-09-08", "住院", "注射用头孢哌酮钠他唑巴坦钠", "586.40", "超指征用药", "内科", "王医生", "内科", "350.00", "236.40", "西药", "线下协商一致确认金额"],
          // 场景2: 有扣减明细ID，分类一致，是否删除=是 -> 匹配后执行删除
          [existingDedId2, "是", "广州医保", "线下", "ZY20260902", "王芳", "440106198502022345", "2026-09-02", "2026-09-09", "住院", "CT检查", "450.00", "短期重复检查", "外科", "李医生", "外科", "0.00", "450.00", "诊疗项目", "线下判定符合急症指征，双方协商不扣减，执行删除"],
          // 场景3: 有扣减明细ID，但人员类别与原记录不一致 -> 问题数据
          [existingDedId1, "", "跨省异地", "线上", "ZY20260903", "张强", "440106197503033456", "2026-09-03", "2026-09-10", "住院", "全血细胞计数", "72.00", "多次检验", "内科", "赵医生", "内科", "0.00", "72.00", "诊疗项目", "人员类别错误"],
          // 场景4: 有扣减明细ID，但系统中不存在该ID -> 问题数据
          ["DED_NON_EXISTENT_99999", "", "广州医保", "线下", "ZY20260904", "刘洋", "440106199004044567", "2026-09-04", "2026-09-11", "住院", "精密输液器", "185.00", "高值耗材", "外科", "孙医生", "外科", "185.00", "0.00", "医用耗材", "ID不存在"],
          // 场景5: 无扣减明细ID，人员类别+线上线下唯一匹配已有业务分类配置 -> 新增至正式分类
          ["", "", "广州医保", "线上", "MZ20260905", "陈静", "440106198805055678", "2026-09-05", "2026-09-05", "普通门诊", "重组人脑利钠肽注射液", "1240.00", "NYHA心功能分级未达指征", "心血管内科", "刘主任医师", "心血管内科", "868.00", "372.00", "西药", "医保局增补数据"],
          // 场景6: 无扣减明细ID，人员类别+线上线下无法匹配任何已配置业务分类 -> 新增至其他分类
          ["", "", "企业补充工伤", "线下", "ZY20260906", "周杰", "440106197906066789", "2026-09-06", "2026-09-12", "工伤门诊", "动态心电图", "260.00", "重复计费", "门诊部", "周主治医师", "门诊部", "0.00", "260.00", "诊疗项目", "无对应业务分类，自动归入其他分类"]
        ];

        headers = [
          "扣减明细 ID", "是否删除", "人员类别", "线上/线下", "住院号/门诊号", "患者姓名", "证件号码",
          "入院时间", "出院时间", "医疗类别", "扣款项目", "违规金额（单位：元）", "扣减原因", "涉及科室",
          "涉及医生", "扣减科室或个人", "扣减金额（药费/耗材）", "扣减金额（其它）", "项目分类", "备注"
        ];
      }

      // 获取当前已启用的医保业务分类配置
      const enabledConfigs = getInsuranceCategories().filter(c => c.enabled);

      // 读取系统所有已存在记录，建立明细 ID 索引与所属任务映射
      const allTasks = mockApi.getTasks(1, 1000).data;
      const existingRecordIndex = new Map<string, { task: Task; record: any }>();

      allTasks.forEach(task => {
        const details = mockApi.getTaskDetailRecords(task.id, false);
        details.forEach(rec => {
          if (rec.data && rec.data.DEDUCTION_DETAIL_ID) {
            existingRecordIndex.set(rec.data.DEDUCTION_DETAIL_ID, { task, record: rec });
          }
        });
      });

      let updateCount = 0;
      let removeCount = 0;
      let addNormalCount = 0;
      let addOtherCount = 0;
      const problemDataList: any[] = [];

      // 暂存按业务分类待新增的明细列表: Map<categoryName, records[]>
      const newNormalRecordsMap = new Map<string, any[]>();
      const newOtherRecords: any[] = [];

      // 列索引匹配
      const colIdx = {
        dedId: headers.findIndex(h => h.includes("扣减明细") || h.includes("明细ID") || h.includes("明细 ID")),
        isDelete: headers.findIndex(h => h.includes("是否删除") || h.includes("是否纳入扣减")),
        personCat: headers.findIndex(h => h.includes("人员类别")),
        onlineOffline: headers.findIndex(h => h.includes("线上") || h.includes("线下")),
        hospNo: headers.findIndex(h => h.includes("住院号") || h.includes("门诊号")),
        patientName: headers.findIndex(h => h.includes("患者姓名") || h.includes("参保人")),
        idCard: headers.findIndex(h => h.includes("证件号码") || h.includes("身份证")),
        admitDate: headers.findIndex(h => h.includes("入院")),
        dischargeDate: headers.findIndex(h => h.includes("出院")),
        medCategory: headers.findIndex(h => h.includes("医疗类别")),
        project: headers.findIndex(h => h.includes("扣款项目") || h.includes("项目名称")),
        violationAmt: headers.findIndex(h => h.includes("违规金额")),
        violationDesc: headers.findIndex(h => h.includes("扣减原因") || h.includes("违规描述")),
        orderDept: headers.findIndex(h => h.includes("涉及科室") || h.includes("开单科室")),
        doctor: headers.findIndex(h => h.includes("涉及医生") || h.includes("医生")),
        dedTarget: headers.findIndex(h => h.includes("扣减科室或个人")),
        dMedCom: headers.findIndex(h => h.includes("药费/耗材")),
        dOther: headers.findIndex(h => h.includes("其它") || h.includes("其他")),
        projectClass: headers.findIndex(h => h.includes("项目分类")),
        remark: headers.findIndex(h => h.includes("备注"))
      };

      // 遍历每一行执行规则判断
      rows.forEach((row, rowIndex) => {
        if (!row || row.length === 0) return;

        const getVal = (idx: number) => (idx >= 0 && row[idx] !== undefined ? String(row[idx]).trim() : "");
        const dedId = getVal(colIdx.dedId);
        const isDeleteRaw = getVal(colIdx.isDelete);
        // “是否删除”默认为空，手动改为“是”的话，导入匹配后执行删除
        const isDelete = isDeleteRaw === "是" || isDeleteRaw === "删除" || isDeleteRaw === "已删除";
        const personCat = getVal(colIdx.personCat);
        const onlineOffline = getVal(colIdx.onlineOffline);
        const hospNo = getVal(colIdx.hospNo) || `HOSP_${Date.now()}_${rowIndex}`;
        const patientName = getVal(colIdx.patientName) || `患者_${rowIndex + 1}`;
        const idCard = getVal(colIdx.idCard);
        const admitDate = getVal(colIdx.admitDate) || `${belongingMonth}-01`;
        const dischargeDate = getVal(colIdx.dischargeDate) || `${belongingMonth}-08`;
        const medCategory = getVal(colIdx.medCategory) || (onlineOffline === "线上" ? "普通门诊" : "住院");
        const project = getVal(colIdx.project) || "医保审核核减项目";
        const violationAmt = parseFloat(getVal(colIdx.violationAmt)) || 0;
        const violationDesc = getVal(colIdx.violationDesc) || "违规核减";
        const orderDept = getVal(colIdx.orderDept) || "内科";
        const doctor = getVal(colIdx.doctor) || "主治医师";
        const dedTarget = getVal(colIdx.dedTarget) || orderDept;
        const dMedCom = parseFloat(getVal(colIdx.dMedCom)) || Math.round(violationAmt * 0.6 * 100) / 100;
        const dOther = parseFloat(getVal(colIdx.dOther)) || Math.round((violationAmt - dMedCom) * 100) / 100;
        const totalDeduction = Math.round((dMedCom + dOther) * 100) / 100;
        const projectClass = getVal(colIdx.projectClass) || "诊疗项目";
        const remark = getVal(colIdx.remark) || "导入更新处理";

        const baseRecordData = {
          HOSPITAL_NO: hospNo,
          PATIENT_NAME: patientName,
          ID_CARD: idCard,
          ADMIT_DATE: admitDate,
          DISCHARGE_DATE: dischargeDate,
          MEDICAL_CATEGORY: medCategory,
          PROJECT_NAME: project,
          VIOLATION_AMOUNT: violationAmt.toFixed(2),
          VIOLATION_DESC: violationDesc,
          ORDER_DEPT: orderDept,
          EXECUTE_DEPT: orderDept,
          DISPATCH_DEPT: orderDept,
          DOCTOR_NAME: doctor,
          _DEDUCTION_TARGET: dedTarget,
          VIOLATION_AMOUNT_2: violationAmt.toFixed(2),
          _DEDUCTION_AMOUNT: totalDeduction.toFixed(2),
          _DEDUCTION_MED_COM: dMedCom.toFixed(2),
          _DEDUCTION_OTHER: dOther.toFixed(2),
          _PROJECT_CLASS: projectClass,
          REMARK: remark,
          IS_APPEAL: "否"
        };

        // 情况 A: 携带扣减明细 ID (按行更新或执行删除)
        if (dedId) {
          const matched = existingRecordIndex.get(dedId);
          if (!matched) {
            // 问题数据：系统不存在该 ID
            problemDataList.push({
              "行号": rowIndex + 2,
              "扣减明细 ID": dedId,
              "患者姓名": patientName,
              "人员类别": personCat,
              "线上/线下": onlineOffline,
              "违规金额": violationAmt.toFixed(2),
              "校验未通过原因": "系统不存在该扣减明细 ID，禁止落库"
            });
            return;
          }

          const origPersonCat = matched.record.data._PERSON_CATEGORY || "";
          const origOnlineOffline = matched.record.data._IS_ONLINE || "";

          // 校验人员类别与线上线下是否与原记录一致
          if (
            (personCat && origPersonCat && personCat !== origPersonCat) ||
            (onlineOffline && origOnlineOffline && onlineOffline !== origOnlineOffline)
          ) {
            // 问题数据：人员类别或线上线下不一致
            problemDataList.push({
              "行号": rowIndex + 2,
              "扣减明细 ID": dedId,
              "患者姓名": patientName,
              "导入人员类别": personCat,
              "系统原人员类别": origPersonCat,
              "导入线上线下": onlineOffline,
              "系统原线上线下": origOnlineOffline,
              "违规金额": violationAmt.toFixed(2),
              "校验未通过原因": "人员类别或线上线下与系统原记录不一致，禁止更新"
            });
            return;
          }

          // 一致：根据“是否删除”执行更新或删除
          if (isDelete) {
            // 手动改为“是”，匹配后执行删除
            matched.record.isRemoved = true;
            matched.record.data.IS_INCLUDED_IN_DEDUCTION = "否";
            matched.record.data.REMARK = remark || "导入标记删除";
            mockApi.saveTaskDetailRecord(matched.task.id, matched.record);
            removeCount++;
          } else {
            // “是否删除”默认为空，执行更新
            matched.record.isRemoved = false;
            matched.record.data = {
              ...matched.record.data,
              ...baseRecordData,
              DEDUCTION_DETAIL_ID: dedId,
              IS_INCLUDED_IN_DEDUCTION: "是",
              _PERSON_CATEGORY: origPersonCat || personCat,
              _IS_ONLINE: origOnlineOffline || onlineOffline,
              _DATA_SOURCE: matched.record.data._DATA_SOURCE || "导入更新"
            };
            mockApi.saveTaskDetailRecord(matched.task.id, matched.record);
            updateCount++;
          }
        } 
        // 情况 B: 无扣减明细 ID (新增数据，自动业务分类)
        else {
          // 若无 ID 且标记了删除，跳过
          if (isDelete) return;

          const newDedId = `DED_REC_${belongingMonth.replace("-", "")}_${Date.now().toString().slice(-4)}_${rowIndex}`;
          const newRecord = {
            id: `DED_NEW_${Date.now()}_${rowIndex}`,
            data: {
              ...baseRecordData,
              DEDUCTION_DETAIL_ID: newDedId,
              IS_INCLUDED_IN_DEDUCTION: "是",
              ORIGIN_TASK_DETAIL_ID: "",
              _PERSON_CATEGORY: personCat,
              _IS_ONLINE: onlineOffline,
              _DATA_SOURCE: "导入新增"
            },
            evidence: [],
            fillStatus: 2,
            auditStatus: 1,
            submitter: "当前用户",
            updateTime: new Date().toLocaleString(),
            dispatchStatus: "已下发"
          };

          // 匹配已配置业务分类 (人员类别 + 线上/线下 唯一匹配)
          const matchedConfig = enabledConfigs.find(
            c => c.personnelCategory === personCat && c.onlineOffline === onlineOffline
          );

          if (matchedConfig) {
            // 新增扣减明细，归入对应正式医保业务分类
            const categoryName = matchedConfig.categoryName;
            if (!newNormalRecordsMap.has(categoryName)) {
              newNormalRecordsMap.set(categoryName, []);
            }
            newNormalRecordsMap.get(categoryName)!.push(newRecord);
            addNormalCount++;
          } else {
            // 无法匹配任何已配置业务分类，统一归入“其他分类”
            newOtherRecords.push(newRecord);
            addOtherCount++;
          }
        }
      });

      // 处理新增数据落库：没问题的数据直接落库
      newNormalRecordsMap.forEach((records, categoryName) => {
        let task = allTasks.find(
          t => t.businessCategory === categoryName && t.belongingMonth === belongingMonth && (t.isDeductionOnly || t.templateId === "TPL_DED_CUSTOM")
        );
        if (!task) {
          task = mockApi.addTask(
            `${categoryName} ${belongingMonth} 扣减明细`,
            "TPL_DED_CUSTOM",
            categoryName,
            belongingMonth,
            false,
            true
          );
        }
        const existingDetails = mockApi.getTaskDetailRecords(task.id, true);
        mockApi.updateTaskDetails(task.id, [...existingDetails, ...records]);
      });

      if (newOtherRecords.length > 0) {
        const otherCategoryName = "其他分类";
        let task = allTasks.find(
          t => t.businessCategory === otherCategoryName && t.belongingMonth === belongingMonth
        );
        if (!task) {
          task = mockApi.addTask(
            `${otherCategoryName} ${belongingMonth} 扣减明细`,
            "TPL_DED_CUSTOM",
            otherCategoryName,
            belongingMonth,
            false,
            true
          );
        }
        const existingDetails = mockApi.getTaskDetailRecords(task.id, true);
        mockApi.updateTaskDetails(task.id, [...existingDetails, ...newOtherRecords]);
      }

      // 沉淀导入记录（供导入记录页查看，有问题的数据提供问题数据下载的入口）
      const validationStatus = problemDataList.length > 0 ? "存在问题数据" : "全部通过";
      addDeductionImportRecord({
        belongingMonth,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)}kb`,
        operator: getCurrentUserName(),
        uploadTime: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        status: validationStatus,
        addCount: addNormalCount + addOtherCount,
        updateCount,
        deleteCount: removeCount,
        removeCount,
        addNormalCount,
        addOtherCount,
        problemCount: problemDataList.length,
        problemData: problemDataList
      });

      toast("导入任务已提交，已进入解析处理", "success");
      onSuccess();
      onClose();
      // 确定导入以后直接跳转到导入记录页
      navigate("/deduction-management/import-records/index");
    } catch (error: any) {
      console.error("导入更新失败:", error);
      toast("导入更新失败: " + (error?.message || "文件解析异常"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="导入更新扣减明细"
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* 简化后的导入更新规则说明：仅保留“自动业务分类”与“按行更新/删除” */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-md text-xs text-blue-900 leading-relaxed">
          <div className="font-semibold mb-2 flex items-center gap-1.5 text-blue-900">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            导入更新规则说明
          </div>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-700">
            <li>
              <strong>自动业务分类：</strong>未填写「扣减明细 ID」时按新增明细处理，系统根据「人员类别 + 线上/线下」自动匹配归入对应业务分类，无法匹配的统一归入「其他分类」。
            </li>
            <li>
              <strong>按行更新/删除：</strong>填写「扣减明细 ID」时按行匹配更新。「是否删除」默认为空，若手动填写为“是”，则系统在匹配后执行删除该条明细。
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              所属年月 <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={belongingMonth}
              onChange={(e) => setBelongingMonth(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              请选择本次导入更新所属的核算业务年月。
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-medium text-slate-700">
                  上传明细文件 <span className="text-red-500">*</span>
               </label>
               <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 cursor-pointer font-medium"
               >
                 <Download className="w-3.5 h-3.5" />
                 下载标准导入模板
               </button>
            </div>
            
            {!file ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-7 text-center transition-colors cursor-pointer ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:bg-slate-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-slate-700 mb-1">
                  点击或将文件拖拽至此上传
                </div>
                <div className="text-xs text-slate-400">
                  支持 .xlsx, .xls 格式文件
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 rounded text-blue-600">
                      <FileSpreadsheet className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="text-sm font-medium text-slate-800">{file.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">待解析</span>
                      </div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 cursor-pointer"
                   >
                     重新选择
                   </button>
                   <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      title="移除"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx, .xls"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>取消</Button>
          <Button variant="primary" onClick={handleExecuteImport} disabled={isProcessing} className="gap-2">
            {isProcessing ? "正在导入..." : "确定导入"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
