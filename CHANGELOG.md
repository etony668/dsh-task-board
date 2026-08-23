# Changelog

## 0.2.0 (2026-08-23)

- 首个公开发布版本。
- 会话视图新增 `对话 → 轨迹 → 任务看板` tab：画布式看板（面板拖拽、25px 磁吸
  对齐、层级/折叠、临时任务标记、任务边界）。
- 6 个模型工具：`board_get` / `board_revision` / `board_sync` /
  `task_create` / `task_update` / `task_delete`。
- `dsh-task-board` 同步技能：任务变更后输出可点击的看板跳转链接。
- 本地 JSON 存储：`$DSH_HOME/taskboards/<sha256(项目路径)>.json`，CodexFF 同款格式。
- 安装脚本：`install.sh` / `install.ps1`（macOS / Linux / Windows），自动探测
  DSH 运行时并写入 `cordis.patch.yml`。
- 看板体验：视图内隐藏底部消息框；键盘 `Tab` / `Esc` 返回对话；返回入口统一为
  顶部 tab 点击。
