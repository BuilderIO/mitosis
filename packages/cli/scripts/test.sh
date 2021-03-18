#!/bin/bash
set -euo pipefail

dir="$(cd "$(dirname "$(readlink -e "${BASH_SOURCE[0]}")")" && pwd)"
root="$dir/.."

pushd "$root"

script="$root/bin/jsx-lite"

set -x

npm run build

"$script" compile --compiled-build --to react ../core/src/__tests__/data/basic.raw.tsx
