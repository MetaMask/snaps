#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

# https://stackoverflow.com/questions/6393551/what-is-the-meaning-of-0-in-a-bash-script
cd "${0%/*}"

# Cleanup
cd ../test/fixtures
rm -f ./*.tgz
# Download template-snap package tarball
npm pack @metamask/template-snap
