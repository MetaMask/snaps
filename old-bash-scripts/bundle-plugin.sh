#!/usr/bin/env bash

set -e
set -u
set -o pipefail

export PATH="$PATH:./node_modules/.bin"

script=$(browserify $1 -t [ babelify --presets [ @babel/preset-env ] --plugins [ @babel/plugin-transform-modules-umd ] ] -g uglifyify \
  | tr -d '\n' \
  | sed "s/eval(\"\(require('[A-Za-z0-9-]*')\.*[A-Za-z0-9]*\)\")/\1/g" \
  | sed "s/eval(/console.log(/g" \
  | sed 's/\([A-Za-z0-9]\).import(/\1["import"](/g' \
  | sed 's/\x1b/\\/g' \
  | sed 's/\x19//g' \
  | sed 's/\x01/SOH/g' \
  | sed 's/\\/\\\\/g' \
  | sed 's/\//\\\//g' \
  | sed 's/\"/\\\"/g')
pluginAPIs=$(grep -oP "pluginAPIs.\K([a-zA-Z0-9]+)" $1 || echo "")
if [ "${#pluginAPIs}" -gt 0 ]
then
  permissions=$(echo "$pluginAPIs" | sort --unique | sed 's/^\|$/"/g'| paste -sd, -)
else
  permissions=""
fi
echo "{\"source\":\"$script\",\"requestedAPIs\":[$permissions]}" | json | cat > bundle.json
