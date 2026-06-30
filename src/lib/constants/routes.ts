// Visible top-level menus (only 6 allowed)
export const visibleMenuItems = [
  {
    path: "/task-management/task-list/index",
    label: "任务列表",
    icon: "ClipboardList",
    iconColor: "text-blue-500",
    roles: ["ADMIN"],
  },
  {
    path: "/task-fill-report/departments/index",
    label: "任务填报",
    icon: "FileEdit",
    iconColor: "text-orange-500",
    roles: ["ADMIN", "DEP_SURGERY", "DEP_INTERNAL"],
  },
  {
    path: "/data-review/index",
    label: "数据审核",
    icon: "CheckSquare",
    iconColor: "text-indigo-500",
    roles: ["ADMIN"],
  },
  {
    path: "/deduction-management/index",
    label: "院内扣减管理",
    icon: "Calculator",
    iconColor: "text-red-500",
    roles: ["ADMIN"],
  },
  {
    path: "/operateIns/index",
    label: "操作指引",
    icon: "BookOpen",
    iconColor: "text-green-500",
    roles: ["ADMIN", "DEP_SURGERY", "DEP_INTERNAL"],
  },
  {
    label: "配置中心",
    icon: "Settings",
    iconColor: "text-slate-500",
    roles: ["ADMIN"],
    children: [
      {
        path: "/review-template/index",
        label: "模板配置",
        roles: ["ADMIN"],
      },
      {
        path: "/intelligent-fill/index",
        label: "策略中心",
        roles: ["ADMIN"],
      },
      {
        path: "/mapping-config/index",
        label: "映射配置",
        roles: ["ADMIN"],
      },
    ],
  },
];

// Hidden routes
export const hiddenRoutes = [
  "/task-management/task-list/issue-data/index",
  "/task-management/task-list/data-query/index",
  "/task-fill-report/departments/fill-report/index",
  "/data-review/audit/index",
  "/data-review/historical-data/index",
  "/review-template/add-review-template/index",
  "/deduction-management/task-details/index",
];

// Mapping hidden routes to their parent active menu
export const activeMenuMap: Record<string, string> = {
  "/task-management/task-list/issue-data/index": "/task-management/task-list/index",
  "/task-management/task-list/data-query/index": "/task-management/task-list/index",
  "/task-fill-report/departments/fill-report/index": "/task-fill-report/departments/index",
  "/data-review/audit/index": "/data-review/index",
  "/data-review/historical-data/index": "/data-review/index",
  "/review-template/add-review-template/index": "/review-template/index",
  "/deduction-management/task-details/index": "/deduction-management/index",
};
