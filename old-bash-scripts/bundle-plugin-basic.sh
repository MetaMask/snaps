#!/usr/bin/env bash

set -e
set -u
set -o pipefail

export PATH="$PATH:./node_modules/.bin"

script=$(terser $1 \
  | sed 's/\"/\\\"/g')
pluginAPIs=$(grep -oP "pluginAPIs.\K([a-zA-Z0-9]+)" $1 || echo "")
if [ "${#pluginAPIs}" -gt 0 ]
then
  permissions=$(echo "$pluginAPIs" | sort --unique | sed 's/^\|$/"/g'| paste -sd, -)
else
  permissions=""
fi
echo "{\"source\":\"$script\",\"requestedAPIs\":[$permissions]}" | json | cat > basic-bundle.json
