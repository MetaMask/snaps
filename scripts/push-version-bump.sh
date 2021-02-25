#!/usr/bin/env bash

set -e
set -u
set -o pipefail

MM_SNAP_VERSION=$(node -p 'require("./lerna.json").version')

git checkout -b "${MM_SNAP_VERSION}"
git add .
git commit -m "${MM_SNAP_VERSION}" || true
git push -u origin "${MM_SNAP_VERSION}"

unset MM_SNAP_VERSION
