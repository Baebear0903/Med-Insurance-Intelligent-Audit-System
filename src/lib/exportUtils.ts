import JSZip from "jszip";
import * as XLSX from "xlsx";

/**
 * 导出压缩包加上 Excel.xlsx
 * @param zipFilename 导出的 zip 文件名
 * @param excelFilename 导出的表格文件名 (应为 .xlsx 结尾)
 * @param headers 表格首行标题数组
 * @param rows 表格行数据二维数组
 * @param attachments 附件列表，格式为: { name: string, recordInfo?: string }[]
 */
export async function downloadZipWithExcel(
  zipFilename: string,
  excelFilename: string,
  headers: string[],
  rows: any[][],
  attachments: { name: string; recordInfo?: string }[]
) {
  const zip = new JSZip();

  // 1. 生成 .xlsx 表格二进制数据
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "明细表数据");
  
  // 生成 Excel 二进制 ArrayBuffer
  const xlsxBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  zip.file(excelFilename, xlsxBuffer);

  // 2. 将附近打包进“附件内容”文件夹
  const folder = zip.folder("附件内容");
  if (folder) {
    attachments.forEach(att => {
      if (att.name) {
        // 多附件处理
        const names = att.name.split(", ");
        names.forEach(name => {
          const trimmed = name.trim();
          if (trimmed) {
            const content = `[演示佐证附件]\n文件名: ${trimmed}\n归属患者/信息: ${att.recordInfo || "未知"}\n\n该说明文件属于医保真实申报批量附件包`;
            folder.file(trimmed, content);
          }
        });
      }
    });
  }

  // 3. 压缩并下载
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipFilename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToExcel(data: any[], filename: string) {
  if (data.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "数据明细");
  
  const xlsxBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const finalFilename = filename.endsWith(".xlsx") ? filename : filename.replace(/\.csv$/, "") + ".xlsx";
  link.setAttribute("download", finalFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 核心：解析导入文件（电子表格或含有表格+附件附件内容文件夹的 ZIP）
 */
export async function parseUploadFile(
  file: File,
  templateFields: any[],
  existingRecords: any[]
): Promise<{
  success: boolean;
  message: string;
  list: any[];
  attachmentMatchedCount?: number;
}> {
  const isZip = file.name.endsWith(".zip");
  let headers: string[] = [];
  let rows: any[][] = [];
  let fileNamesInZip: string[] = [];

  if (isZip) {
    try {
      const zip = await JSZip.loadAsync(file);
      // 找到 xlsx 文件
      const xlsxFile = Object.values(zip.files).find(f => f.name.endsWith(".xlsx") && !f.dir);
      if (!xlsxFile) {
        return {
          success: false,
          message: "压缩包内未找到明细表格数据（.xlsx 格式的 Excel 文件）",
          list: []
        };
      }
      const xlsxBuffer = await xlsxFile.async("arraybuffer");
      const workbook = XLSX.read(xlsxBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const aoa = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
      
      if (aoa.length > 0) {
        headers = aoa[0].map(h => String(h || "").trim());
        rows = aoa.slice(1);
      }
      
      // 读取“附件内容”文件夹下的所有文件列表
      const filesInFolder = Object.values(zip.files).filter(f => !f.dir && f.name.startsWith("附件内容/"));
      fileNamesInZip = filesInFolder.map(f => {
        const parts = f.name.split("/");
        return parts[parts.length - 1]; // 例如 "张三_2024-03-10_血常规_出院小结.pdf"
      }).filter(Boolean);
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "解析 ZIP 压缩包或配套 Excel 失败，文件可能损坏",
        list: []
      };
    }
  } else if (file.name.endsWith(".xlsx")) {
    try {
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const aoa = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
      
      if (aoa.length > 0) {
        headers = aoa[0].map(h => String(h || "").trim());
        rows = aoa.slice(1);
      }
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "读取 Excel .xlsx 电子表格失败",
        list: []
      };
    }
  } else {
    return {
      success: false,
      message: "不支持的文件类型！请上传明细表格（.xlsx 格式的 Excel 文件）或者打包好的 `.zip` 压缩包",
      list: []
    };
  }

  if (headers.length === 0) {
    return {
      success: false,
      message: "电子表格结构或表头解析为空，无法匹配字段",
      list: []
    };
  }

  // 中文标题与字段映射
  const titleToNameMap = new Map<string, string>();
  templateFields.forEach(f => {
    if (f.displayName) titleToNameMap.set(f.displayName, f.name);
    if (f.comment) titleToNameMap.set(f.comment, f.name);
    titleToNameMap.set(f.name, f.name);
  });

  const updatedList: any[] = [];
  let attachmentMatchedCount = 0;

  rows.forEach(rowCells => {
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      const fieldName = titleToNameMap.get(h);
      if (fieldName) {
        const val = rowCells[idx];
        rowObj[fieldName] = val !== undefined && val !== null ? String(val).trim() : "";
      }
    });

    const rowPatientName = (rowObj.PATIENT_NAME || "").trim();
    const rowDischargeDate = (rowObj.DISCHARGE_DATE || rowObj.ADMIT_DATE || "").trim();
    const rowProjectName = (rowObj.PROJECT_NAME || "").trim();

    if (!rowPatientName) return;

    // 比对已有记录
    const foundRecord = existingRecords.find(rec => {
      const dbName = (rec.data?.PATIENT_NAME || "").trim();
      const dbDate = (rec.data?.DISCHARGE_DATE || rec.data?.ADMIT_DATE || "").trim();
      const dbProj = (rec.data?.PROJECT_NAME || "").trim();
      
      const normalize = (s: string) => s.replace(/[-/]/g, "").replace(/\s+/g, "");
      return normalize(dbName) === normalize(rowPatientName) && 
             normalize(dbDate) === normalize(rowDischargeDate) &&
             normalize(dbProj) === normalize(rowProjectName);
    });

    if (foundRecord) {
      let matchedEvidence: string[] = [];

      if (isZip && fileNamesInZip.length > 0) {
        // “姓名+出院时间+项目名称” 作为匹配锚点对附件搜寻
        const searchKey = `${rowPatientName}_${rowDischargeDate}_${rowProjectName}`.replace(/[-/]/g, "").replace(/\s+/g, "");
        fileNamesInZip.forEach(zipFileName => {
          const zipFileNameNorm = zipFileName.replace(/[-/]/g, "").replace(/\s+/g, "");
          if (zipFileNameNorm.includes(searchKey)) {
            matchedEvidence.push(zipFileName);
          }
        });
      }

      const mergedEvidence = matchedEvidence.length > 0 ? matchedEvidence : (foundRecord.evidence || []);
      if (matchedEvidence.length > 0) {
        attachmentMatchedCount += matchedEvidence.length;
      }

      updatedList.push({
        ...foundRecord,
        fillStatus: "FILLED",
        auditStatus: 8,
        evidence: mergedEvidence,
        submitter: "当前用户",
        data: {
          ...foundRecord.data,
          ...rowObj, // 表格中可能包含在外部修改后的各个字段
          IS_APPEAL: "是",
          APPEAL_ATTACHMENT: mergedEvidence.join(", "),
          APPEAL_REASON: rowObj.APPEAL_REASON || rowObj.APPEAL_COMMENT || foundRecord.data.APPEAL_REASON || "批量导入申诉：数据符合规范要求，请审核。"
        }
      });
    }
  });

  if (updatedList.length === 0) {
    return {
      success: false,
      message: "未匹配到任何匹配的底层患者明细数据，请确保电子表格中至少有一行有效的“姓名”、“出院/入院日期”和“项目名称”。",
      list: []
    };
  }

  return {
    success: true,
    message: isZip 
      ? `解析并匹配成功 ${updatedList.length} 条数据，并在「附件内容/」下成功识别并关联 ${attachmentMatchedCount} 个佐证附件。`
      : `解析并匹配成功 ${updatedList.length} 条表格明细数据。`,
    list: updatedList,
    attachmentMatchedCount
  };
}
