# effortless for Antigravity CLI (agy)

This fork adds first-class support for **Google Antigravity CLI (`agy`)**, bringing effortless dynamic reasoning effort control and context monitoring into Antigravity sessions.

## Features

- **Dynamic Reasoning Effort**: The `PreInvocation` hook evaluates the complexity of every prompt before the model runs, assigning `LOW`, `MEDIUM`, `HIGH`, or `MAX` effort.
- **Inline HUD**: Renders a clean terminal HUD directly in the Antigravity UI via `metadata.user_markdown`.
- **System Directives**: Injects guidance telling the model whether to be concise or engage in deep verification.
- **Context & Saturation Alerts**: Monitored across session steps.
- **Cross-Harness Skill**: Registers into `~/.agents/skills/effortless`.

## Quick Install for `agy`

Clone the fork and run:

```bash
git clone https://github.com/FlavianMF/effortless.git ~/projetos_claude/effortless
cd ~/projetos_claude/effortless
./install-agy.sh
```

## Configuration

Edit `agy/config.json`:

```json
{
  "effortFloor": "low",
  "effortCeiling": "max",
  "effortBias": 0,
  "theme": "violet",
  "swampAt": 70,
  "showHud": true
}
```
