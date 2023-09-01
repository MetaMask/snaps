#!/usr/bin/env bash

set -e
set -o pipefail

if [[ ${RUNNER_DEBUG:-0} == 1 ]]; then
  set -x
fi

PACKAGE_JSON="${1}"
BEFORE="${2}"
OUTPUT="${3}"

if [[ -z $PACKAGE_JSON ]]; then
  echo "Error: Path to package.json not specified."
  exit 1
fi

if [[ -z $BEFORE ]]; then
  echo "Error: Before commit hash not specified."
  exit 1
fi

if [[ -z $OUTPUT ]]; then
  echo "Error: Output variable not specified."
  exit 1
fi

VERSION_BEFORE="$(git show "$BEFORE":"$PACKAGE_JSON" | jq --raw-output .version)"
VERSION_AFTER="$(jq --raw-output .version "$PACKAGE_JSON")"

if [[ "$VERSION_BEFORE" == "$VERSION_AFTER" ]]; then
  echo "$OUTPUT=false" >> "$GITHUB_OUTPUT"
else
  echo "$OUTPUT=true" >> "$GITHUB_OUTPUT"
fi
