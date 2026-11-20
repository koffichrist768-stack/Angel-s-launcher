#!/usr/bin/env bash
# lancer.sh — Démarre Angel's Launcher (Linux / macOS).
cd "$(dirname "$0")" || exit 1
if [ ! -d node_modules/electron ]; then
  echo "Angel's Launcher n'est pas installé. Lancez d'abord ./install.sh"; exit 1
fi
# --no-sandbox : nécessaire sur certaines distributions Linux sans sandbox SUID configurée
if [ "$(uname)" = "Linux" ]; then
  exec npx --no-install electron . --no-sandbox "$@"
else
  exec npx --no-install electron . "$@"
fi
