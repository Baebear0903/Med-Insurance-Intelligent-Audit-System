import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/src/components/Layout/index";
import { ToastContainer } from "@/src/components/ui/Toast";
import { UserProvider } from "@/src/lib/userContext";

// Visible
import { TaskList } from "@/src/pages/task-management/task-list/index";
import { TaskFillReport } from "@/src/pages/task-fill-report/departments/index";
import { DataReview } from "@/src/pages/data-review/index";
import { ReviewTemplate } from "@/src/pages/review-template/index";
import { IntelligentFill } from "@/src/pages/intelligent-fill/index";
import { OperateIns } from "@/src/pages/operateIns/index";
import { MappingConfig } from "@/src/pages/mapping-config/index";
import DeductionManagement from "@/src/pages/deduction-management/index";

// Hidden
import { AddReviewTemplate } from "@/src/pages/review-template/add-review-template/index";
import { FillReportDetail } from "@/src/pages/task-fill-report/departments/fill-report/index";
import IssueData from "@/src/pages/task-management/task-list/issue-data/index";
import DataQuery from "@/src/pages/task-management/task-list/data-query/index";
import { Audit } from "@/src/pages/data-review/audit/index";
import { HistoricalData } from "@/src/pages/data-review/historical-data/index";
import DeductionTaskDetails from "@/src/pages/deduction-management/task-details/index";

export default function App() {
  return (
    <HashRouter>
      <UserProvider>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/task-management/task-list/index" replace />} />
            
            {/* Visible Routes */}
            <Route path="task-management/task-list/index" element={<TaskList />} />
            <Route path="task-fill-report/departments/index" element={<TaskFillReport />} />
            <Route path="data-review/index" element={<DataReview />} />
            <Route path="review-template/index" element={<ReviewTemplate />} />
            <Route path="intelligent-fill/index" element={<IntelligentFill />} />
            <Route path="mapping-config/index" element={<MappingConfig />} />
            <Route path="operateIns/index" element={<OperateIns />} />
            <Route path="deduction-management/index" element={<DeductionManagement />} />

            {/* Hidden Routes */}
            <Route path="task-management/task-list/issue-data/index" element={<IssueData />} />
            <Route path="task-management/task-list/data-query/index" element={<DataQuery />} />
            <Route path="task-fill-report/departments/fill-report/index" element={<FillReportDetail />} />
            <Route path="data-review/audit/index" element={<Audit />} />
            <Route path="data-review/historical-data/index" element={<HistoricalData />} />
            <Route path="review-template/add-review-template/index" element={<AddReviewTemplate />} />
            <Route path="deduction-management/task-details/index" element={<DeductionTaskDetails />} />
          </Route>
        </Routes>
      </UserProvider>
    </HashRouter>
  );
}

