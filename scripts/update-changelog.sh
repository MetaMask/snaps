#!/usr/bin/env bash

set -euo pipefail

# Get the current package name
if [[ $# -eq 0 ]]; then
  echo "Missing package name."
  exit 1
fi

package_name="$1"
shift # remove package name from arguments

# Get the current git branch
branch=$(git rev-parse --abbrev-ref HEAD)

if [[ $branch =~ ^release/ ]]; then
  yarn auto-changelog update --prettier --tag-prefix "${package_name}@" --rc "$@"
else
  yarn auto-changelog update --prettier --tag-prefix "${package_name}@" "$@"
fi
