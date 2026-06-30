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
  7: "填报中",
  8: "待审核",
  2: "已驳回",
  1: "审核通过",
  9: "审核变更",
} as const;

export const FILL_STATUS = {
  0: "未填报",
  5: "AI填报",
  1: "已填报",
  8: "待审核",
  2: "审核通过",
  6: "审核变更",
  3: "已驳回",
} as const;

export const DEPARTMENT_TASK_STATUS = {
  0: "未填报",
  1: "已提交",
  2: "审核完成",
  3: "驳回",
  4: "撤销",
} as const;
