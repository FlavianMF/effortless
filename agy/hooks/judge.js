/**
 * effortless judge engine for Antigravity CLI (agy)
 * Evaluates prompt complexity, calculates optimal reasoning effort,
 * renders the effortless HUD, and generates system reasoning directives.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];

const DEFAULT_CONFIG = {
  effortFloor: 'low',
  effortCeiling: 'max',
  effortBias: 0,
  theme: 'violet',
  swampAt: 70,
  showHud: true
};

function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config.json');
  try {
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (e) {
    // fallback to defaults
  }
  return DEFAULT_CONFIG;
}

/**
 * Heuristic scoring to classify prompt into effort levels:
 * low, medium, high, xhigh, max
 */
function classifyPrompt(prompt, config) {
  if (!prompt || typeof prompt !== 'string') {
    return clampEffort('medium', config);
  }

  const text = prompt.trim().toLowerCase();
  let score = 2; // Default: medium (index 1 in 0-based: low=0, medium=1, high=2, xhigh=3, max=4)

  // Quick / low-effort indicators
  const lowPatterns = [
    /^(what|where|who|when|how do i|why)\b/i,
    /^(explain|describe|show me|find|search|grep|list|read)\b/i,
    /^(git status|git diff|git commit|commit|push|pull)\b/i,
    /^(syntax|type of|definition of)\b/i,
    /^(hi|hello|hey|ok|yes|no|thanks|thank you)\b/i
  ];

  // High-effort indicators
  const highPatterns = [
    /\b(refactor|redesign|architect|architecture|restructure|migration|migrate)\b/i,
    /\b(debug|investigate|race condition|deadlock|concurrency|memory leak)\b/i,
    /\b(benchmark|optimize|performance regression|latency)\b/i,
    /\b(security|vulnerability|audit|auth|token|credential)\b/i,
    /\b(integration test|e2e|end-to-end|test suite|coverage)\b/i,
    /\b(multiple files|across codebase|everywhere|all files)\b/i
  ];

  // Extreme / Max indicators
  const maxPatterns = [
    /\b(complete rewrite|from scratch|multi-system|distributed|overhaul)\b/i,
    /\b(deep analysis|exhaustive|formal verification|fail-safe)\b/i
  ];

  if (lowPatterns.some(p => p.test(text)) && text.length < 120) {
    score = 0; // low
  } else if (maxPatterns.some(p => p.test(text))) {
    score = 4; // max
  } else if (highPatterns.some(p => p.test(text))) {
    score = 2; // high
    if (text.length > 250) score = 3; // xhigh
  } else {
    // Base heuristic based on prompt length and structural cues
    if (text.length < 50) score = 0; // low
    else if (text.length < 200) score = 1; // medium
    else if (text.length < 500) score = 2; // high
    else score = 3; // xhigh
  }

  // Apply effort bias (-2 to +2)
  const bias = parseInt(config.effortBias, 10) || 0;
  score = Math.max(0, Math.min(EFFORTS.length - 1, score + bias));

  return clampEffort(EFFORTS[score], config);
}

function clampEffort(effort, config) {
  const floorIdx = EFFORTS.indexOf(config.effortFloor || 'low');
  const ceilIdx = EFFORTS.indexOf(config.effortCeiling || 'max');
  let curIdx = EFFORTS.indexOf(effort);

  if (curIdx < floorIdx) curIdx = floorIdx;
  if (curIdx > ceilIdx) curIdx = ceilIdx;

  return EFFORTS[curIdx] || 'medium';
}

function getSystemDirective(effort) {
  switch (effort) {
    case 'low':
      return '[effortless] Reasoning Effort: LOW. Give a direct, concise response. Avoid extensive multi-file searches or unnecessary tool calls.';
    case 'medium':
      return '[effortless] Reasoning Effort: MEDIUM. Work thoroughly and test code changes before concluding.';
    case 'high':
      return '[effortless] Reasoning Effort: HIGH. Engage deep step-by-step reasoning. Plan structural changes, consider edge cases, and run verification loops.';
    case 'xhigh':
    case 'max':
      return '[effortless] Reasoning Effort: MAX. Perform exhaustive analysis. Formulate a rigorous plan, review dependencies, verify invariants, and test thoroughly.';
    default:
      return '[effortless] Reasoning Effort: MEDIUM.';
  }
}

function renderHUD(effort, contextPct = 0, modelName = 'gemini') {
  const effortBadge = effort.toUpperCase();
  const pctStr = contextPct > 0 ? `${contextPct}%` : 'warm';
  
  return [
    '```text',
    `┌─ effortless (agy) ────────────────────────────────────────────────────────┐`,
    `│ Effort: ${effortBadge.padEnd(6)} · Context: ${pctStr.padEnd(6)} · Model: ${modelName.padEnd(20)} │`,
    `└───────────────────────────────────────────────────────────────────────────┘`,
    '```'
  ].join('\n');
}

module.exports = {
  EFFORTS,
  loadConfig,
  classifyPrompt,
  getSystemDirective,
  renderHUD
};
