#!/usr/bin/env bash
echo "[$(date)] pre-invocation.sh invoked with args: $*" >> /tmp/effortless-debug.log
exec node "$(dirname "$0")/pre-invocation.js"
