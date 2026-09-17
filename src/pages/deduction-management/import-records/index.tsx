import React from "react";
import {
  DeductionImportRecordsView,
  getStoredDeductionImportRecords,
  addDeductionImportRecord,
  DeductionImportRecordItem,
} from "./DeductionImportRecordsView";

export {
  getStoredDeductionImportRecords,
  addDeductionImportRecord,
  // 兼容别名
  getStoredDeductionImportRecords as getStoredImportRecords,
  addDeductionImportRecord as addImportRecord
};
export type { DeductionImportRecordItem, DeductionImportRecordItem as ImportRecordItem };

export default function DeductionImportRecords() {
  return <DeductionImportRecordsView />;
}

