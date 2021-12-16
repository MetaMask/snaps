#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

# This script publishes the package at the CWD if any of the following are true:
# - the package has yet to be published
# - the local version of the package is different from the most recently published version

yarn setup
yarn workspaces run clean
yarn workspaces run build:pre-tsc
yarn build:tsc
yarn workspaces run build:post-tsc
yarn lint

if [[ $(git diff --quiet) != '' ]]; then
  echo "Working tree dirty after building"
  exit 1
fi

echo 'Publishing preparations complete. Enter npm OTP:'
read -r OTP

if [[ -z $OTP ]]; then
  echo "Error: No OTP specified."
  exit 1
fi

yarn workspaces run publish "$OTP"
