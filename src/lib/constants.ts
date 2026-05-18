// Global built-in state dictionaries

export const ROLES = {
  ADMIN: "管理员",
  DEP_SURGERY: "外科专管员",
  DEP_INTERNAL: "内科专管员",
} as const;

export type Role = keyof typeof ROLES;

export const TASK_STATUS = {
  CREATE: "待下发",
  PUBLISH: "填报中",
  SUBMITTED: "已提交",
  WITHDRAWN: "已驳回",
  COMPLETE: "审核完成",
  CANCELLATION: "已撤回",
  BACK: "已取消",
  END: "已结束",
} as const;

export const AUDIT_STATUS = {
  0: "编辑待审核",
  1: "审批通过",
  2: "已驳回",
  3: "编辑待提交",
  7: "填报中",
  8: "填报待审核",
} as const;

export const FILL_STATUS = {
  UNFILLED: "未填报",
  SUBMITTED: "已提交",
  APPROVED: "审核通过",
  REJECTED: "驳回",
  REVOKED: "撤销",
} as const;

export const DEPARTMENTS = {
  1: "医保办",
  3: "外科",
  4: "内科",
} as const;

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
        label: "审核模板",
        roles: ["ADMIN"],
      },
      {
        path: "/intelligent-fill/index",
        label: "智能填写",
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
];

// Mapping hidden routes to their parent active menu
export const activeMenuMap: Record<string, string> = {
  "/task-management/task-list/issue-data/index": "/task-management/task-list/index",
  "/task-management/task-list/data-query/index": "/task-management/task-list/index",
  "/task-fill-report/departments/fill-report/index": "/task-fill-report/departments/index",
  "/data-review/audit/index": "/data-review/index",
  "/data-review/historical-data/index": "/data-review/index",
  "/review-template/add-review-template/index": "/review-template/index",
};
