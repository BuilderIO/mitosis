#!/bin/bash

# Remove `stableVersion` before relreasing, as it's buggy.
# https://github.com/yarnpkg/berry/issues/3868
echo "$(jq 'del(.stableVersion)' package.json)" >package.json
