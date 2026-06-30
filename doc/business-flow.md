# 系统业务流程图

本文档梳理了该项目系统的主要业务流程，包含**管理员**和**科室专管员**两个角色的交互。根据模板类型的不同，分为“医保明细下发”和“医保审核反馈”两个主要流程。

## 1. 医保明细下发类型业务流程

本流程主要涉及管理员将医保明细数据下发给各科室，由科室专管员进行接收并确认已读，管理员通过数据审核菜单查看任务情况及进行后续管理。

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 管理员
    actor Dept as 科室专管员

    Admin->>Admin: 映射配置 (Mapping Config)
    Admin->>Admin: 任务管理：导入并处理医保明细数据
    Admin->>Dept: 任务下发：将数据明细下发到对应科室 (Issue Data)
    
    Dept->>Dept: 任务填报管理：接收并查看下发的明细数据
    Dept->>Admin: 科室确认已读

    Admin->>Admin: 数据审核：仅查看任务情况及科室确认状态，不存在驳回 (Data Review)
    Admin->>Admin: 归档至历史数据 (Historical Data)
    Admin->>Admin: 扣款管理：进行扣款汇总与统计分析 (Deduction Management)
```

## 2. 医保审核反馈类型业务流程

本流程主要涉及管理员针对医保局的审核结果创建模板与任务，经过“匹配就诊”对数据清洗更新后，下发给科室，科室专管员进行核对、申诉或确认扣款反馈。

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 管理员
    actor Dept as 科室专管员

    Admin->>Admin: 审核模板管理：创建审核反馈模板 (Review Template)
    Admin->>Admin: 任务管理：根据模板导入数据并创建审核任务
    Admin->>Admin: 匹配就诊：根据院内数据字典对导入数据进行清洗更新
    Admin->>Dept: 任务下发：将审核扣款/疑点结果下发至对应科室
    
    Dept->>Dept: 任务填报管理：查看医保审核反馈明细
    alt 存在异议
        Dept->>Dept: 填写申诉理由并上传证明材料
    else 无异议
        Dept->>Dept: 确认扣款及责任人
    end
    Dept->>Admin: 提交反馈/申诉结果

    Admin->>Admin: 数据审核：审核科室的申诉或确认信息 (Audit)
    alt 申诉材料不全或不合规
        Admin-->>Dept: 打回重新补充
        Dept->>Admin: 重新提交申诉
    else 审核完成
        Admin->>Admin: 导出申诉结果用于上报医保局
        Admin->>Admin: 扣款管理：跟进最终扣款情况 (Deduction Management)
    end
```
