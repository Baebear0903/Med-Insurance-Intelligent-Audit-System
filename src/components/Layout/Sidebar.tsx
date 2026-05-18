import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { visibleMenuItems, activeMenuMap } from "@/src/lib/constants";
import { cn } from "@/src/lib/utils";
import * as Icons from "lucide-react";
import { useUser } from "@/src/lib/userContext";

function MenuItem({ item, activePath, isCollapsed, role }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = Icons[item.icon as keyof typeof Icons] as React.ElementType;

  const hasChildren = item.children && item.children.length > 0;
  const accessibleChildren = hasChildren ? item.children.filter((c: any) => c.roles.includes(role)) : [];
  
  const isChildActive = hasChildren && accessibleChildren.some((c: any) => activePath === c.path);
  const isActive = activePath === item.path || isChildActive;

  useEffect(() => {
    if (isChildActive && !isCollapsed) {
      setIsOpen(true);
    }
  }, [isChildActive, isCollapsed]);

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren && !isCollapsed) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const content = (
    <div
      onClick={toggleOpen}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
        isActive && !hasChildren
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        isCollapsed && "justify-center px-0"
      )}
    >
      {Icon && <Icon className={cn("w-5 h-5 shrink-0", item.iconColor)} />}
      <span className={cn(
        "transition-all duration-300 opacity-100 flex-1 flex justify-between items-center overflow-hidden",
        isCollapsed && "opacity-0 w-0 hidden"
      )}>
        {item.label}
        {hasChildren && !isCollapsed && (
          <Icons.ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        )}
      </span>
    </div>
  );

  return (
    <li className="relative group">
      {item.path && !hasChildren ? (
        <Link to={item.path} title={isCollapsed ? item.label : ""}>
          {content}
        </Link>
      ) : (
        <div title={isCollapsed ? item.label : ""}>{content}</div>
      )}

      {/* Inline expansion for full sidebar */}
      {hasChildren && !isCollapsed && isOpen && (
        <ul className="pl-9 pr-2 py-1 space-y-1">
          {accessibleChildren.map((child: any) => {
            const isChildItemActive = activePath === child.path;
            return (
              <li key={child.path}>
                <Link
                  to={child.path}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-md transition-colors",
                    isChildItemActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Absolute flyout for collapsed sidebar */}
      {hasChildren && isCollapsed && (
        <div className="absolute left-full top-0 ml-2 hidden group-hover:block z-50">
          <div className="bg-white border border-slate-100 rounded-md shadow-lg py-2 w-48 relative">
            {/* Invisible expanded hover bridge */}
            <div className="absolute -left-4 top-0 w-4 h-full bg-transparent" />
            
            <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-50 mb-1">
              {item.label}
            </div>
            {accessibleChildren.map((child: any) => {
              const isChildItemActive = activePath === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  className={cn(
                    "block px-4 py-2 text-sm transition-colors",
                    isChildItemActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { role } = useUser();
  
  const activePath = activeMenuMap[currentPath] || currentPath;
  const accessibleMenus = visibleMenuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={cn(
      "bg-white shrink-0 h-full flex flex-col border-r border-slate-100 shadow-sm z-50 transition-all duration-300 ease-in-out rounded-l-lg",
      isCollapsed ? "w-16" : "w-56"
    )}>
      <nav className={cn("flex-1 pt-4 no-scrollbar", !isCollapsed && "overflow-y-auto")}>
        <ul className="px-2 space-y-1 relative">
          {accessibleMenus.map((item) => (
            <MenuItem key={item.label} item={item} activePath={activePath} isCollapsed={isCollapsed} role={role} />
          ))}
        </ul>
      </nav>
      
      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isCollapsed ? (
            <Icons.ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <Icons.ChevronLeft className="w-5 h-5" />
              <span className="text-xs transition-opacity duration-300">收起菜单</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
