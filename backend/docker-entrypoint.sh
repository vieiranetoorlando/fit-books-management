#!/bin/sh
set -eu

mkdir -p /app/uploads/seed

if [ -d /app/seed-uploads ]; then
  for file in /app/seed-uploads/*; do
    [ -f "$file" ] || continue
    target="/app/uploads/seed/$(basename "$file")"
    if [ ! -f "$target" ]; then
      cp "$file" "$target"
    fi
  done
fi

npx prisma migrate deploy
node dist/server.js
