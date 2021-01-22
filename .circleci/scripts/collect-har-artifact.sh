#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

mkdir -p build-artifacts/yarn-install-har
mv ./*.har build-artifacts/yarn-install-har/
