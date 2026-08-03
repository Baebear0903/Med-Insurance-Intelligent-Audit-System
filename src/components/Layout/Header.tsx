import { Bell, Settings, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ROLES, Role } from "@/src/lib/constants";
import { useUser } from "@/src/lib/userContext";

export function Header() {
  const { role, setRole } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setShowConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-gradient-to-r from-blue-700 to-blue-500 text-white flex items-center justify-between px-6 shadow-md z-20 relative">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center backdrop-blur-sm">
          <span className="font-bold text-lg leading-none">医</span>
        </div>
        <h1 className="text-lg font-semibold tracking-wide">医保智能审核系统</h1>
      </div>

      <div className="flex items-center gap-5">
        <button className="hover:bg-white/10 p-1.5 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border border-blue-600"></span>
        </button>
        <div className="relative" ref={confirmRef}>
          <button 
            className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
            title="清空缓存并重置数据"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {showConfirm && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 text-slate-800 text-sm">
              <p className="mb-3 font-medium text-slate-700">确定要清空本地缓存并重置所有演示数据吗？</p>
              <div className="flex justify-end gap-2">
                <button 
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                  onClick={() => setShowConfirm(false)}
                >
                  取消
                </button>
                <button 
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  确定清空
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-2 ml-2 pl-4 border-l border-white/20 cursor-pointer hover:bg-white/10 py-1 px-2 rounded transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{ROLES[role]}</span>
            <ChevronDown className="w-4 h-4 opacity-70" />
          </div>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-slate-200 text-slate-800 z-50">
              {(Object.keys(ROLES) as Role[]).map((r) => (
                <button
                  key={r}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${role === r ? 'text-blue-600 bg-blue-50/50 font-medium' : ''}`}
                  onClick={() => {
                    setRole(r);
                    setDropdownOpen(false);
                  }}
                >
                  {ROLES[r]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
