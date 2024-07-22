#!/usr/bin/env bash

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Missing package name."
  exit 1
fi

package_name="$1"
shift  # remove package name from arguments

if [[ "${GITHUB_REF:-}" =~ '^release/' ]]; then
  yarn auto-changelog validate --prettier --tag-prefix "${package_name}@" --rc "$@"
else
  yarn auto-changelog validate --prettier --tag-prefix "${package_name}@" "$@"
fi
