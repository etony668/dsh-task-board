#!/usr/bin/env bash
# 把插件包安装到当前 DSH 运行时的 node_modules，并在 profile 回退目录建立符号链接。
# 用法：./reinstall.sh    （DSH 升级后重新运行一次）
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 探测 DSH 运行时根目录：优先 $DSH_TASK_BOARD_RUNTIME，其次常见安装位置。
detect_runtime() {
  if [ -n "${DSH_TASK_BOARD_RUNTIME:-}" ]; then
    echo "$DSH_TASK_BOARD_RUNTIME"
    return
  fi
  local candidates=(
    "$HOME/Library/Application Support/DeepSeek Harness Glass/runtime" # macOS
    "$HOME/.dsh/runtime"
    "$HOME/AppData/Local/DeepSeek Harness Glass/runtime"               # Windows
    "$HOME/.local/share/deepseek-harness/runtime"                      # Linux
  )
  local d
  for d in "${candidates[@]}"; do
    if [ -e "$d/current" ] || [ -d "$d/versions" ]; then
      echo "$d"
      return
    fi
  done
  echo ""
}

RUNTIME_ROOT="$(detect_runtime)"
if [ -z "$RUNTIME_ROOT" ]; then
  echo "未找到 DSH 运行时目录，请用 DSH_TASK_BOARD_RUNTIME 环境变量指定：" >&2
  echo "  DSH_TASK_BOARD_RUNTIME=\"/path/to/DeepSeek Harness Glass/runtime\" ./reinstall.sh" >&2
  exit 1
fi
CURRENT="$(readlink "$RUNTIME_ROOT/current" || true)"
if [ -z "$CURRENT" ]; then
  echo "未找到运行时 current 链接：$RUNTIME_ROOT/current" >&2
  exit 1
fi
VERSION="${CURRENT#versions/}"

# 1) 安装到当前运行时 node_modules（clientModules 扫描与 loader 的解析锚点）。
TARGET="$RUNTIME_ROOT/versions/$VERSION/node_modules/@deepseek-ai/dsh-task-board"
mkdir -p "$(dirname "$TARGET")"
rm -rf "$TARGET"
cp -R "$SOURCE_DIR" "$TARGET"
echo "已安装到 $TARGET"

# 2) profile 模块回退目录符号链接（loader 从 ~/.dsh/profiles/web 解析插件包，
#    回退目录按包名逐个链接到运行时 node_modules）。
PROFILES_NM="$HOME/.dsh/profiles/node_modules/@deepseek-ai"
mkdir -p "$PROFILES_NM"
ln -sfn "$TARGET" "$PROFILES_NM/dsh-task-board"
echo "已链接 $PROFILES_NM/dsh-task-board -> $TARGET"

if ! grep -q "dsh-task-board" "$HOME/.dsh/cordis.patch.yml" 2>/dev/null; then
  echo ""
  echo "请把以下行加入 ~/.dsh/cordis.patch.yml（或运行 ./install.sh 自动写入）："
  echo "  - insert:"
  echo "      - id: task-board"
  echo "        name: '@deepseek-ai/dsh-task-board'"
fi
echo ""
echo "完成：刷新 DSH 页面（或重启 DSH）后，「任务看板」tab 出现在 对话 → 轨迹 之后。"
