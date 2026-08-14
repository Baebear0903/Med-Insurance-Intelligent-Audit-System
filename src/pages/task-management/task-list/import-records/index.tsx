import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ImportRecordsView } from "@/src/components/ImportRecordsView";

export default function TaskImportRecords() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("id") || searchParams.get("taskId");
  const taskName = searchParams.get("name") || searchParams.get("taskName");
  const navigate = useNavigate();

  return (
    <ImportRecordsView
      title="导入记录"
      taskId={taskId}
      taskName={taskName}
      storageKey="task_import_records_v1"
      onBack={() => navigate("/task-management/task-list/index")}
    />
  );
}
