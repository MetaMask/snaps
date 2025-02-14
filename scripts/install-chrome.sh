#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# To get the latest version, run `yarn update-chrome`
CHROME_VERSION='133.0.6943.98-1'
CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"

# To retrieve this checksum, run the `wget` and `shasum` commands below
CHROME_BINARY_SHA512SUM='51475f9b22e1cb0a1411398b437523a80bafb1d22033806ddc51e2f2c2e289a193995f5a1ff6c15a47c9738aff403261f25b50480c58b8dfb290c8e8df4ddc9b'

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
