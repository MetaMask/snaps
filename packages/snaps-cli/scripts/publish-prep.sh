#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

yarn build:clean

if [[ ! $(git diff --quiet) ]]; then
  echo "Working tree dirty after building"
  exit 1
fi

yarn lint
yarn test
