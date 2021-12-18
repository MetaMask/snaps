#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

yarn build:init-template
yarn build:chmod

if [[ ! $(git diff --exit-code --quiet) ]]; then
  echo "Working tree dirty after building"
  exit 1
fi
