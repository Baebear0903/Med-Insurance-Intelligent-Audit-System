import React, { useState } from "react";
import DeductionDetails from "./details";
import DeductionSummary from "./summary";
import DeductionCalendar from "./calendar";

export default function DeductionManagement() {
  const [activeTab, setActiveTab] = useState("details");

  const tabs = [
    { id: "details", label: "扣减明细" },
    { id: "summary", label: "扣减总览" },
    { id: "calendar", label: "院内扣减台历" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 pt-4">
        <h1 className="text-xl font-bold text-slate-800 mb-4">院内扣减管理</h1>
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 relative">
        {activeTab === "details" && <DeductionDetails />}
        {activeTab === "summary" && <DeductionSummary />}
        {activeTab === "calendar" && <DeductionCalendar />}
      </div>
    </div>
  );
}
