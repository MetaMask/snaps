#!/usr/bin/env bash

set -e
set -u
set -o pipefail

if [ -z "${1:-}" ]
then
  echo "Error: Missing required positional argument: patch|minor|major"
  exit 1
fi

lerna version "$1" --no-git-tag-version
