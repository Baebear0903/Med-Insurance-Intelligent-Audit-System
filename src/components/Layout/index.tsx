import { Outlet } from "react-router-dom";
import { Header } from "@/src/components/Layout/Header";
import { Sidebar } from "@/src/components/Layout/Sidebar";

export function Layout() {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-100 overflow-hidden text-slate-800">
      {/* 蓝底包裹层 & 顶部Header */}
      <Header />
      
      {/* 外层蓝色边框背景，内部圆角白色业务容器 */}
      <div className="flex-1 p-3 bg-blue-50/50 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden rounded-xl shadow-lg bg-slate-50 border border-slate-200/60 ring-1 ring-blue-500/5">
          <Sidebar />
          
          <main className="flex-1 relative overflow-hidden bg-slate-50 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
