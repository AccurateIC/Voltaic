#!/bin/env bash

mkdir -p generated-diagrams

# generate erd diagram
echo "generating entity relationship diagram"
mmdc -i erd.mmd -t dark -b '#181818' -o generated-diagrams/erd.svg # open svg file using browser


# generate architecture diagram
echo "generating system architecture diagram"
mmdc -i arch.mmd -t dark -b '#181818' -o generated-diagrams/arch.svg # open svg file using browser