#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

# https://stackoverflow.com/questions/6393551/what-is-the-meaning-of-0-in-a-bash-script
cd "${0%/*}"

# Cleanup
rm -f ../test/fixtures/metamask-example-snap-*.tgz

cd ../../example-snap
# We have to invoke the binary directly for CI compatibility
node ../snaps-cli/dist/main.js build
npm pack
mv ./metamask-example-snap-*.tgz ../controllers/test/fixtures
