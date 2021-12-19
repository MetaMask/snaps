#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

# This script installs all dependencies, builds all packages, ensures that the
# git working tree remains cleans, then asks for an npm 2FA code and publishes
# all packages.

yarn setup
yarn build:clean
yarn lint

if ! git diff --exit-code; then
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
