#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# To get the latest version, run `yarn update-chrome`
CHROME_VERSION='134.0.6998.165-1'
CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"

# To retrieve this checksum, run the `wget` and `shasum` commands below
CHROME_BINARY_SHA512SUM='90c004b793f223d104d8f5744fcd3b16993d6f1c562f8a2f7f6171d66fdd066ff660f9d3fc5aefeea6a126039e268496452f35a73958d7bed64903e30d2c33b8'

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
