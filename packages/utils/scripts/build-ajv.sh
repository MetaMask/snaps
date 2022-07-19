#!/usr/bin/env bash

set -x
set -e
set -u
set -o pipefail

function ajv_compile() {
  yarn ajv compile --strict=true --all-errors -s "$1" -o "$2"
}

# This matches the final return statement of the compiled files, which is the
# return statement of the exported validation function.
# We replace the original boolean return value with the array of all errors
# encountered during validation.
SED_REGEX='s/return errors === 0;\}$/return vErrors;\}/'

FILE_1='src/json-schemas/validateSnapManifest.js'
FILE_2='src/json-schemas/validateNpmSnapPackageJson.js'

ajv_compile 'src/json-schemas/snap-manifest.schema.json' "$FILE_1"
ajv_compile 'src/json-schemas/npm-snap-package-json.schema.json' "$FILE_2"

# Modify the return value of the validation functions.
sed -i'' -e "$SED_REGEX" "$FILE_1" "$FILE_2"

# Remove sed backup files (created on macOS)
rm -f src/snaps/json-schemas/*.js-e
