#!/usr/bin/env bash

set -e
set -u
set -o pipefail

# To get the latest version, see <https://www.ubuntuupdates.org/ppa/google_chrome?dist=stable>
CHROME_VERSION='114.0.5735.106-1'
CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"

# To retrieve this checksum, run the `wget` and `shasum` commands below
CHROME_BINARY_SHA512SUM='fb9c4cd882839f56013cca7535ca4b2e3779a3148654225515039d3d8ee0f21bdd1a0e1631918c4ec729041258b471a7b2acedb8027b5e55af1cc1c8cd642609'

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
