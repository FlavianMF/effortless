#!/usr/bin/env bash
set -euo pipefail

# install-agy.sh: Installs effortless plugin for Antigravity CLI (agy)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGY_PLUGIN_DIR="$HOME/.gemini/config/plugins"
SHARED_SKILLS_DIR="$HOME/.agents/skills"
HOOKS_CONFIG="$HOME/.gemini/config/hooks.json"

echo "Installing effortless for Antigravity CLI (agy)..."

# 1. Make hook scripts executable
chmod +x "$SCRIPT_DIR/agy/hooks/"*.sh "$SCRIPT_DIR/agy/hooks/"*.js

# 2. Register plugin in ~/.gemini/config/plugins/effortless
mkdir -p "$AGY_PLUGIN_DIR"
ln -sfn "$SCRIPT_DIR/agy" "$AGY_PLUGIN_DIR/effortless"
echo "✓ Plugin linked to $AGY_PLUGIN_DIR/effortless"

# 3. Register skill in ~/.agents/skills/effortless (shared across harnesses)
if [[ -d "$SHARED_SKILLS_DIR" ]]; then
  ln -sfn "$SCRIPT_DIR/agy/skills/effortless" "$SHARED_SKILLS_DIR/effortless"
  echo "✓ Skill linked to $SHARED_SKILLS_DIR/effortless"
fi

# 4. Merge effortless hooks into ~/.gemini/config/hooks.json
mkdir -p "$(dirname "$HOOKS_CONFIG")"
if command -v jq >/dev/null 2>&1; then
  TMP_HOOKS="$(mktemp)"
  if [[ -s "$HOOKS_CONFIG" ]]; then
    jq --arg script "$SCRIPT_DIR/agy/hooks" '. + {
      "effortless": {
        "SessionStart": [
          { "type": "command", "command": ("\"" + $script + "/session-start.sh\"") }
        ],
        "PreInvocation": [
          { "type": "command", "command": ("\"" + $script + "/pre-invocation.sh\""), "timeout": 5 }
        ],
        "Stop": [
          { "type": "command", "command": ("\"" + $script + "/stop.sh\"") }
        ]
      }
    }' "$HOOKS_CONFIG" > "$TMP_HOOKS" && mv "$TMP_HOOKS" "$HOOKS_CONFIG"
  else
    jq -n --arg script "$SCRIPT_DIR/agy/hooks" '{
      "effortless": {
        "SessionStart": [
          { "type": "command", "command": ("\"" + $script + "/session-start.sh\"") }
        ],
        "PreInvocation": [
          { "type": "command", "command": ("\"" + $script + "/pre-invocation.sh\""), "timeout": 5 }
        ],
        "Stop": [
          { "type": "command", "command": ("\"" + $script + "/stop.sh\"") }
        ]
      }
    }' > "$HOOKS_CONFIG"
  fi
  echo "✓ Hooks registered in $HOOKS_CONFIG"
else
  echo "warning: jq not found; could not auto-register hooks in $HOOKS_CONFIG" >&2
fi

echo ""
echo "Installation complete! Start a new 'agy' session to use effortless."
