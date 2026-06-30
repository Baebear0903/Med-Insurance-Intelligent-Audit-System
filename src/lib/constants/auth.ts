export const ROLES = {
  ADMIN: "管理员",
  DEP_SURGERY: "外科专管员",
  DEP_INTERNAL: "内科专管员",
} as const;

export type Role = keyof typeof ROLES;
