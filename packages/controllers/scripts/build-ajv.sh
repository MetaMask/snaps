#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

function ajv_compile() {
  yarn ajv compile --strict=true --all-errors -s "$1" -o "$2"
}

SED_REGEX='s/return errors === 0;\}$/return vErrors;\}/'
FILE_1='src/snaps/json-schemas/validateSnapManifest.js'
FILE_2='src/snaps/json-schemas/validateNpmSnapPackageJson.js'

ajv_compile 'src/snaps/json-schemas/snap-manifest.schema.json' "$FILE_1"
ajv_compile 'src/snaps/json-schemas/npm-snap-package-json.schema.json' "$FILE_2"

sed -i'' -e "$SED_REGEX" "$FILE_1" "$FILE_2"

# Remove sed backup files (created on macOS)
rm -f src/snaps/json-schemas/*.js-e
