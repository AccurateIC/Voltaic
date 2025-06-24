#!/usr/bin/env bash

# exit when any command fails
set -e

# check if mermaid cli is installed
if ! command -v mmdc >/dev/null 2>&1; then
    echo "Error: Mermaid CLI (mmdc) is not installed."
    echo "Please install it with: npm install -g @mermaid-js/mermaid-cli"
    echo "If using Arch Linux, you may install it easily via pacman"
    echo "Read More: https://github.com/mermaid-js/mermaid-cli"
    exit 1
fi


CWD="$(cd "$(dirname "$0")" && pwd)"
# echo "Script is located in: $CWD"

mkdir -p $CWD/generated-diagrams

# generate erd diagram
echo "generating entity relationship diagram"
mmdc -i $CWD/erd.mmd -t dark -b '#181818' -o $CWD/generated-diagrams/erd.svg # open svg file using browser


# generate architecture diagram
echo "generating system architecture diagram"
mmdc -i $CWD/arch.mmd -t dark -b '#181818' -o $CWD/generated-diagrams/arch.svg # open svg file using browser