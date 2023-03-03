#!/usr/bin/env bash

set -euo pipefail

# This script prepares a package to be published as a preview build
# to GitHub Packages.

if [[ $# -eq 0 ]]; then
  echo "Missing commit hash."
  exit 1
fi

# We use the short commit hash as the prerelease version. This ensures each
# preview build is unique and can be linked to a specific commit.
shorthash="$1"

# The prerelease version is overwritten, preserving the non-prerelease portion
# of the version. Technically we'd want to bump the non-prerelease portion as
# well if we wanted this to be SemVer-compliant, but it was simpler not to.
# This is just for testing, it doesn't need to strictly follow SemVer.
jq --raw-output ".version |= split(\"-\")[0] + \"-preview.${shorthash}\"" ./package.json > temp.json

# The registry is updated here because the manifest publish config always takes
# precedence, and cannot be overwritten from the command-line.
jq --raw-output ".publishConfig.registry = \"https://npm.pkg.github.com\"" ./temp.json > package.json

# jq does not support in-place modification of files, so a temporary file is
# used to store the result of the first operation.
rm temp.json
