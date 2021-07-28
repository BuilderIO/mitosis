#!/bin/bash

set -euo pipefail

script_dir="$(cd "$(dirname "$(readlink -e "${BASH_SOURCE[0]}")")" && pwd)"

# At the package dir
cd ../

PATH="$(pwd)/bin:$PATH"

tempdir=$(mktemp -d)

cd "$tempdir"

set -x

mitosis new

echo "exit-code: $?"

ls -la
