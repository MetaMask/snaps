#!/usr/bin/env bash

set -euo pipefail

# This script prepares a package to be published as a Flask build.

# The name is overwritten, adding the `-flask` suffix to the organization name.
jq --raw-output ".name |= split(\"/\")[0] + \"-flask/\" + split(\"/\")[1]" ./package.json > package.json
