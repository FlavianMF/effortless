#!/usr/bin/env bash
set -euo pipefail

# install-agy.sh: Installs effortless plugin for Antigravity CLI (agy)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGY_PLUGIN_DIR="$HOME/.gemini/config/plugins"
SHARED_SKILLS_DIR="$HOME/.agents/skills"

echo "Installing effortless for Antigravity CLI (agy)..."

# 1. Register plugin in ~/.gemini/config/plugins/effortless
mkdir -p "$AGY_PLUGIN_DIR"
ln -sfn "$SCRIPT_DIR/agy" "$AGY_PLUGIN_DIR/effortless"
echo "✓ Plugin linked to $AGY_PLUGIN_DIR/effortless"

# 2. Register skill in ~/.agents/skills/effortless (shared across harnesses)
if [[ -d "$SHARED_SKILLS_DIR" ]]; then
  ln -sfn "$SCRIPT_DIR/agy/skills/effortless" "$SHARED_SKILLS_DIR/effortless"
  echo "✓ Skill linked to $SHARED_SKILLS_DIR/effortless"
fi

# Ensure hook scripts are executable
chmod +x "$SCRIPT_DIR/agy/hooks/"*.js

echo ""
echo "Installation complete! Start a new 'agy' session to use effortless."
