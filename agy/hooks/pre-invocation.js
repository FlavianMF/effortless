#!/usr/bin/env node
/**
 * PreInvocation hook for Antigravity CLI (agy)
 * Analyzes lastUserInput, picks dynamic reasoning effort, and emits the effortless HUD + directive.
 */

const fs = require('fs');
const { loadConfig, classifyPrompt, getSystemDirective, renderHUD } = require('./judge');

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

    // Calculate approximate context saturation from step count
    const steps = payload.initialNumSteps || 0;
    const estContextPct = Math.min(95, Math.round((steps / 80) * 100));

    const directive = getSystemDirective(effort);
    const hud = renderHUD(effort, estContextPct, modelName);
    const fullMessage = config.showHud ? `${hud}\n\n${directive}` : directive;

    const result = {
      injectSteps: [
        {
          systemMessage: {
            systemMessage: fullMessage,
            metadata: {
              user_markdown: config.showHud ? hud : ''
            }
          }
        }
      ]
    };

    process.stdout.write(JSON.stringify(result));
  });
}

main();
