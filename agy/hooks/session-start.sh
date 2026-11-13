#!/usr/bin/env bash
echo "[$(date)] session-start.sh invoked with args: $*" >> /tmp/effortless-debug.log
exec node "$(dirname "$0")/session-start.js"
