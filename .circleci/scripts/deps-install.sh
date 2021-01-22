#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

yarn --frozen-lockfile --ignore-scripts --har
