#!/usr/bin/env bash
# DSH 任务看板插件一键安装：
#   1. 把插件包复制到 ~/.dsh/plugins/dsh-task-board
#   2. 安装进当前运行时 node_modules + profile 回退符号链接（调用 reinstall.sh）
#   3. 自动把插件行写入 ~/.dsh/cordis.patch.yml（已有则跳过）
# 用法：./install.sh
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$HOME/.dsh/plugins/dsh-task-board"

# 1) 复制到 ~/.dsh/plugins/dsh-task-board（若已就地运行则跳过）。
if [ "$SOURCE_DIR" != "$PLUGIN_DIR" ]; then
  mkdir -p "$(dirname "$PLUGIN_DIR")"
  rm -rf "$PLUGIN_DIR"
  cp -R "$SOURCE_DIR" "$PLUGIN_DIR"
  echo "已复制插件到 $PLUGIN_DIR"
fi

# 2) 安装到当前运行时。
"$PLUGIN_DIR/reinstall.sh"

# 3) 写入 cordis.patch.yml。
PATCH="$HOME/.dsh/cordis.patch.yml"
if grep -q "name: '@etony668/dsh-task-board'" "$PATCH" 2>/dev/null; then
  echo "cordis.patch.yml 已包含插件条目，跳过。"
else
  TMP="$PATCH.tmp.$$"
  {
    if [ -f "$PATCH" ]; then
      cat "$PATCH"
    else
      echo "# DSH 用户级补丁层：\$DSH_HOME/cordis.patch.yml"
    fi
    echo "- insert:"
    echo "    - id: task-board"
    echo "      name: '@etony668/dsh-task-board'"
    echo ""
  } > "$TMP"
  mv "$TMP" "$PATCH"
  echo "已写入 $PATCH"
fi

echo ""
echo "完成：刷新 DSH 页面（或重启 DSH）后，「任务看板」tab 出现在 对话 → 轨迹 之后。"
