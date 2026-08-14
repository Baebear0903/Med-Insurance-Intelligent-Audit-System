import React from "react";
import { ImportRecordsView, getStoredImportRecords, addImportRecord, ImportRecordItem } from "@/src/components/ImportRecordsView";

export { getStoredImportRecords, addImportRecord };
export type { ImportRecordItem };

export default function DeductionImportRecords() {
  return (
    <ImportRecordsView
      title="导入记录"
      storageKey="deduction_import_records_v1"
    />
  );
}
