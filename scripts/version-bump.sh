#!/usr/bin/env bash

set -e
set -u
set -o pipefail

if [ -z "${1:-}" ]
then
  echo "Error: Missing required positional argument: patch|minor|major"
  exit 1
fi

# bump version of all packages
lerna version "$1" --no-git-tag-version

# get new version, create and push release branch
MM_SNAP_VERSION=$(node -p 'require("./lerna.json").version')

git checkout -b "${MM_SNAP_VERSION}"
git add .
git commit -m "${MM_SNAP_VERSION}" || true
git push -u origin "${MM_SNAP_VERSION}"

unset MM_SNAP_VERSION
