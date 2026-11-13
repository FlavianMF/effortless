#!/usr/bin/env node
/**
 * SessionStart hook for Antigravity CLI (agy)
 * Welcomes user and initializes session tracking.
 */

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    raw += chunk;
  });

  process.stdin.on('end', () => {
    const banner = '✨ effortless (agy) is active · Dynamic reasoning effort & context monitoring enabled';
    const result = {
      injectSteps: [
        {
          systemMessage: {
            systemMessage: banner,
            metadata: {
              user_markdown: `✨ **effortless** (agy) is active · Dynamic reasoning effort & context monitoring enabled`
            }
          }
        }
      ]
    };

    process.stdout.write(JSON.stringify(result));
  });
}

main();
