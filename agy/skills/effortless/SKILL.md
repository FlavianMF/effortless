---
name: effortless
description: Dynamic reasoning effort control, context window monitoring, and handoff advisor for Antigravity CLI.
---

# effortless (Antigravity Edition)

`effortless` dynamically calculates and injects the optimal reasoning effort level for every prompt sent to the Antigravity CLI, preventing token waste on simple tasks while ensuring deep reasoning on complex architectural challenges.

## How it works

1. **PreInvocation Judge**:
   - Evaluates each user prompt against complexity heuristics and optional judge backends.
   - Assigns reasoning effort: `LOW`, `MEDIUM`, `HIGH`, or `MAX`.
   - Injects runtime directives into the model context while displaying an inline HUD to the user.

2. **Context & Saturation Monitoring**:
   - Tracks session steps and estimated context usage.
   - Advises running `/compact` when context crosses the swamp threshold (default: 70%).

## Configuration

Settings are maintained in `agy/config.json`:

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

- **`effortFloor`**: Minimum effort level (`low`, `medium`, `high`, `xhigh`, `max`).
- **`effortCeiling`**: Maximum effort level.
- **`effortBias`**: Shifts effort score up (`+1`, `+2`) or down (`-1`, `-2`).
- **`swampAt`**: Percent context saturation before alerting.
- **`showHud`**: Toggle display of the inline HUD banner.
