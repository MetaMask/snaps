#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

cd ./packages

# ref: https://github.com/koalaman/shellcheck/wiki/SC2044
# We swallow the output of "yarn unlink" because we don't care if it fails
find . -mindepth 1 -maxdepth 1 -type d -exec sh -c '
    cd "$1"
    ! yarn unlink &> /dev/null
    yarn link
  ' sh {} \;
