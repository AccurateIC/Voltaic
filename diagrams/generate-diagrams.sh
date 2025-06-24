#!/usr/bin/env bash

CWD="$(cd "$(dirname "$0")" && pwd)"
# echo "Script is located in: $CWD"


mkdir -p $CWD/generated-diagrams

# generate erd diagram
echo "generating entity relationship diagram"
mmdc -i $CWD/erd.mmd -t dark -b '#181818' -o $CWD/generated-diagrams/erd.svg # open svg file using browser


# generate architecture diagram
echo "generating system architecture diagram"
mmdc -i $CWD/arch.mmd -t dark -b '#181818' -o $CWD/generated-diagrams/arch.svg # open svg file using browser