import React from "react";
import { Construction } from "lucide-react";

export function IntelligentFill() {
  return (
    <div className="p-6 h-full">
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm border border-slate-200 text-slate-500">
        <Construction className="w-12 h-12 mb-4 text-slate-300" />
        <h2 className="text-lg font-medium text-slate-700">模块开发中</h2>
        <p className="text-sm text-slate-400 mt-2">该功能正在加紧开发中，敬请期待</p>
      </div>
    </div>
  );
}
