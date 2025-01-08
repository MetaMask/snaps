#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# To get the latest version, run `yarn update-chrome`
CHROME_VERSION='131.0.6778.264-1'
CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"

# To retrieve this checksum, run the `wget` and `shasum` commands below
CHROME_BINARY_SHA512SUM='95123e9d86b2e84be8b4964d4e5d16ab987f2e2854ca90d192f3c88e4b5bbb2f6a1aae46adb408b3538d6277a0083bb1da4d35d3b9806ef7788f3bdac40020f8'

wget -O "${CHROME_BINARY}" -t 5 "${CHROME_BINARY_URL}"

if [[ $(shasum -a 512 "${CHROME_BINARY}" | cut '--delimiter= ' -f1) != "${CHROME_BINARY_SHA512SUM}" ]]
then
  echo "Google Chrome binary checksum did not match."
  exit 1
else
  echo "Google Chrome binary checksum verified."
fi

(sudo dpkg -i "${CHROME_BINARY}" || sudo apt-get -fy install)

rm -rf "${CHROME_BINARY}"

printf '%s\n' "Chrome ${CHROME_VERSION} configured"
