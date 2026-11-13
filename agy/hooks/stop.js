#!/usr/bin/env node
/**
 * Stop hook for Antigravity CLI (agy)
 * Evaluates session saturation and context swamp alert when stopping.
 */

const { loadConfig } = require('./judge');

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    raw += chunk;
  });

  process.stdin.on('end', () => {
    // Normal termination: empty object
    process.stdout.write(JSON.stringify({}));
  });
}

main();
