# Changelog

## 1.1.0 (2026-09-18)

- 看板数据迁移到**项目目录**：主存 `<项目>/.dsh-taskboard/board.json`（随项目走，可提交进版本库）。
- **灾备**：每次变更前轮转快照（保留最近 10 份，自动生成 `.gitignore` 忽略备份目录）；
  同时写入全局镜像 `$DSH_HOME/taskboards/<sha256>.json`。
- 读取链：项目主文件 → 最新轮转备份 → 全局镜像 → 空看板；走兜底时自动回写主文件（自愈）；
  项目目录只读时自动退化为仅写全局镜像。
- 兼容 DSH 官方桌面版：改用 `plugin_manager` 安装到当前 profile（desktop）。

## 1.0.2 (2026-09-18)

- 语言改走 DSH 官方 locale 服务（`inject: ['locale']` + `ctx.locale` 读取 + 订阅语言切换），
  修复官方桌面版里界面为中文却显示英文的问题。
- 修复切进看板后未读点不转绿：`markSeen` 改用 DSH timer 服务（客户端沙箱不执行窗口定时器）。

## 1.0.1 (2026-08-24)

- 任务看板 tab 未读点提示（数据更新红点 / 查看后绿点，本地记忆已看修订）。
- 画布间距统一 20px（默认/磁吸横向与纵向）；支持左对齐磁吸；布局持久化到本地存储（重启保留）。
- 面板与任务卡片不透明化（运行时底色兜底，兼容桌面壳与浏览器）。
- 包名改为 `@etony668/dsh-task-board`（不再占用官方 scope）。

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
