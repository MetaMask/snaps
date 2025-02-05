#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# To get the latest version, run `yarn update-chrome`
CHROME_VERSION='133.0.6943.53-1'
CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"

# To retrieve this checksum, run the `wget` and `shasum` commands below
CHROME_BINARY_SHA512SUM='5e071dacaa0e7c5c1c858d2389c872c4d45f1568436a9d1a30dbbd34ecbd69f71119154360edfb03682a50704d41202db051b40e6afcb47ea249a558c0c9eb08'

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
