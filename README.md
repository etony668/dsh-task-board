# DSH 任务看板插件（dsh-task-board）

把 CodexFF 的项目任务看板移植为 **DeepSeek Harness（DSH）** 正式插件：会话内新增
`对话 → 轨迹 → 任务看板` 三个 tab，看板为画布式面板（拖拽 / 层级 / 折叠），配套
模型工具与同步技能，数据落在本地 JSON，无需任何外部服务。

## 功能特性

- **会话视图 tab**：`对话 → 轨迹 → 任务看板`（`conversation.view`，order 20）。
- **画布式看板**：每主任务一个子任务面板，面板可拖拽、磁吸对齐（25px 基准间距、
  顶部行对齐、纵向堆叠自动水平居中）、折叠/展开；临时任务与业务任务分色标记。
- **任务模型**：父子任务树、任务边界（目标/包含/不包含/验收）、勾选完成、
  子任务全部完成时自动收口父任务；新增未完成子任务会级联重开祖先任务。
- **模型工具**（与 CodexFF MCP 同名语义）：
  - `board_get` / `board_revision`：读看板与修订号
  - `board_sync`：批量创建/更新任务（一次调用内支持 `key` 引用）
  - `task_create` / `task_update` / `task_delete`：单任务操作
- **技能**：`dsh-task-board`（任务拆分与同步纪律），模型会自动加载。
- **存储**：`$DSH_HOME/taskboards/<sha256(项目路径)>.json`，格式与 CodexFF 一致，
  每个项目一个原子写入的 JSON 文件。

![会话视图：对话 → 轨迹 → 任务看板 tab](images/任务看板0.png)

![画布式看板：主任务与子任务面板布局](images/任务看板1.png)

## 安装

### 方式一：从 GitHub 克隆（推荐）

```bash
git clone https://github.com/<你的账号>/dsh-task-board.git
cd dsh-task-board
./install.sh
```

然后**刷新 DSH 页面**（或重启 DSH）即可看到「任务看板」tab。
页面无变化时重启一次 DSH —— 补丁在启动时必然生效。

### 方式二：手动安装

1. 把本仓库内容放到 `~/.dsh/plugins/dsh-task-board/`（或任意目录）。
2. 运行 `./reinstall.sh` —— 它会把包复制进当前运行时
   `node_modules/@deepseek-ai/dsh-task-board/` 并建立 profile 回退符号链接。
3. 确认 `~/.dsh/cordis.patch.yml` 包含（不存在则创建）：

   ```yaml
   - insert:
       - id: task-board
         name: '@deepseek-ai/dsh-task-board'
   ```

> `reinstall.sh` 会自动探测 macOS / Windows / Linux 常见 DSH 运行时目录；
> 探测不到时用 `DSH_TASK_BOARD_RUNTIME` 环境变量指定，例如：
> `DSH_TASK_BOARD_RUNTIME="/path/to/runtime" ./reinstall.sh`

## 使用

- 顶部 tab 切换到「任务看板」；看板内**无返回按钮**，返回对话用顶部「对话」tab，
  键盘 `Tab` / `Esc` 也可返回（输入框聚焦时不劫持）。
- 看板视图下底部消息框自动隐藏，避免遮挡。
- 模型完成任务变更后会给出可点击的「查看任务看板」链接，点击即切换 tab。

## 升级

DSH 升级会生成新的运行时版本目录，`node_modules` 与 profile 符号链接需要重建：

```bash
cd ~/.dsh/plugins/dsh-task-board && ./reinstall.sh
```

`cordis.patch.yml` 位于 `~/.dsh`，不受升级影响。

## 卸载

```bash
# 1) 从补丁中删除插件行（编辑 ~/.dsh/cordis.patch.yml，移除 - insert: 部分）
# 2) 删除源码与运行时副本
rm -rf ~/.dsh/plugins/dsh-task-board
rm -rf <runtime>/versions/*/node_modules/@deepseek-ai/dsh-task-board
rm -f  ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-task-board
# 3) 数据（可选）：~/.dsh/taskboards/*.json
```

## 目录结构

```
index.js        包根入口（loader 以 <pkg>/index.js 解析；re-export lib/index.js）
lib/index.js    host 插件（node ESM）：存储 + 工具 + 技能 + /api/task-board 路由
lib/client.js   web 插件 bundle（__ModuleLoader__ 手工构建，仅依赖 react）
package.json    dsh.client: { platform: web }，exports ./client
install.sh      一键安装（复制 + 安装 + patch 写入）
reinstall.sh    重装到当前运行时 node_modules + profile 回退符号链接
```

## 开发

插件遵循 DSH 双端插件结构：host 端（Node ESM）提供存储/工具/技能/路由，
client 端（浏览器 bundle）注册 `conversation.view` tab 并渲染看板。
修改后 `./install.sh` 重装并刷新页面即可；host 端改动需重启 DSH。

## 许可证

[MIT](./LICENSE)
