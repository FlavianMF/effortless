#!/usr/bin/env node
/**
 * PreInvocation hook for Antigravity CLI (agy)
 * Analyzes lastUserInput, picks dynamic reasoning effort, and emits the effortless HUD + directive.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadConfig, classifyPrompt, getSystemDirective, renderHUD } = require('./judge');

const CHUNK_SIZE = 256 * 1024;

function getContextWindow(modelName, config) {
  const configured = Number(config && config.contextWindow);
  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }
  if (String(modelName || '').toLowerCase().includes('claude')) {
    return 200_000;
  }
  return 1_000_000;
}

/**
 * Reads the latest PLANNER_RESPONSE token total from the tail of transcript.jsonl.
 * Returns 0 if a CHECKPOINT appears after the last PLANNER_RESPONSE (compaction reset).
 */
function readLatestTranscriptTokens(transcriptPath) {
  if (!transcriptPath || typeof transcriptPath !== 'string') return 0;
  const resolved = transcriptPath.startsWith('~/')
    ? path.join(os.homedir(), transcriptPath.slice(2))
    : transcriptPath;

  let fd;
  try {
    const stat = fs.statSync(resolved);
    if (!stat.isFile() || stat.size === 0) return 0;

    fd = fs.openSync(resolved, 'r');
    let pos = stat.size;
    let carryBuf = Buffer.alloc(0);

    while (pos > 0) {
      const readStart = Math.max(0, pos - CHUNK_SIZE);
      const len = pos - readStart;
      const chunk = Buffer.allocUnsafe(len);
      fs.readSync(fd, chunk, 0, len, readStart);
      const combined = carryBuf.length > 0 ? Buffer.concat([chunk, carryBuf]) : chunk;

      let sliceStart = 0;
      if (readStart > 0) {
        const firstNl = combined.indexOf(0x0a);
        if (firstNl === -1) {
          carryBuf = combined;
          pos = readStart;
          continue;
        }
        carryBuf = combined.subarray(0, firstNl);
        sliceStart = firstNl + 1;
      } else {
        carryBuf = Buffer.alloc(0);
      }

      const lines = combined.subarray(sliceStart).toString('utf8').split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (!line) continue;
        let entry;
        try {
          entry = JSON.parse(line);
        } catch {
          continue;
        }
        if (entry.type === 'CHECKPOINT') {
          return 0;
        }
        if (entry.type === 'PLANNER_RESPONSE') {
          const total =
            (Number(entry.input_tokens) || 0) +
            (Number(entry.cache_read_tokens) || 0) +
            (Number(entry.output_tokens) || 0);
          return total > 0 ? total : 0;
        }
      }

      pos = readStart;
    }
  } catch {
    return 0;
  } finally {
    if (fd !== undefined) {
      try { fs.closeSync(fd); } catch {}
    }
  }
  return 0;
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    raw += chunk;
  });

  process.stdin.on('end', () => {
    let payload = {};
    try {
      if (raw.trim()) {
        payload = JSON.parse(raw);
      }
    } catch (e) {
      // payload parse fallback
    }

    const config = loadConfig();
    const userInput = payload.lastUserInput || '';
    const modelName = payload.modelName || 'auto';
    const effort = classifyPrompt(userInput, config);

    const tokens = readLatestTranscriptTokens(payload.transcriptPath);
    const contextWindow = getContextWindow(modelName, config);
    const estContextPct = tokens > 0
      ? Math.min(100, Math.round((tokens / contextWindow) * 100))
      : 0;

    const invocationNum = Number(payload.invocationNum) || 0;
    const swampAt = Number.isFinite(Number(config.swampAt)) ? Number(config.swampAt) : 70;
    const swampNotice = swampAt > 0 && estContextPct >= swampAt
      ? `\n[effortless] Context is at ${estContextPct}% (swamp threshold: ${swampAt}%). Advise the user to run /compact before continuing.`
      : '';

    const directive = getSystemDirective(effort);
    const hud = renderHUD(effort, estContextPct, modelName);
    const includeHud = Boolean(config.showHud) && invocationNum <= 1;
    const hudInstruction = includeHud
      ? `Begin your visible response to the user (once per turn) with this exact HUD banner:\n${hud}\n\n`
      : '';
    const fullMessage = `${hudInstruction}${directive}${swampNotice}`;

    const result = {
      injectSteps: [
        {
          systemMessage: {
            systemMessage: fullMessage
          }
        }
      ]
    };

    process.stdout.write(JSON.stringify(result));
  });
}

main();
