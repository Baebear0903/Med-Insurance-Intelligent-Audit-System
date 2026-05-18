import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function HistoricalData() {
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center text-slate-800">
           historical data
        </h2>
        <Link to="/data-review/index" className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
          返回
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 p-5 flex items-center justify-center text-slate-400">
        历史记录展示区域
      </div>
    </div>
  );
}
