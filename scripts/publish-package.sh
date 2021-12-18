#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

# This script publishes the package at the CWD if any of the following are true:
# - the package has yet to be published
# - the local version of the package is different from the most recently published version

# We need an OTP for npm in order to publish the package
OTP="${1}"

if [[ -z $OTP ]]; then
  echo "Error: No OTP specified."
  exit 1
fi

if ! git diff --exit-code; then
  echo "Working tree dirty"
  exit 1
fi

# Get the published version
# If the package is not published, set the published version to "NULL"
NPM_VERSION=$(npm show . version || echo "NULL")

# Get the local version of the package, from package.json
# The jq "r" flag gives us the raw, unquoted output
LOCAL_VERSION=$(jq -r .version < package.json)

# Publish the package if either condition is met
if [[ $NPM_VERSION == "NULL" || $LOCAL_VERSION != "$NPM_VERSION" ]]; then
  npm publish "--otp=$OTP"
fi
