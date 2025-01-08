#!/usr/bin/env bash

set -e
set -u
set -o pipefail

#!/bin/bash

yarn add -D chromedriver

CHROME_VERSION=$(curl -s https://dl.google.com/linux/chrome/deb/dists/stable/main/binary-amd64/Packages.gz | \
    gunzip -c | \
    grep -A 1 "Package: google-chrome-stable" | grep "Version:" | awk '{print $2}')

if [ -z "$CHROME_VERSION" ]; then
    echo "Failed to fetch the version of google-chrome-stable."
    exit 1
fi

CHROME_BINARY="google-chrome-stable_${CHROME_VERSION}_amd64.deb"
CHROME_BINARY_URL="https://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${CHROME_BINARY}"
SCRIPT_PATH="./scripts/install-chrome.sh"

wget -O "${CHROME_BINARY}" -t 5 "${CHROME_BINARY_URL}"
CHROME_BINARY_SHA512SUM=$(shasum -a 512 "${CHROME_BINARY}" | awk '{print $1}')

sed -i '' "s/^CHROME_VERSION='.*'/CHROME_VERSION='${CHROME_VERSION}'/" "${SCRIPT_PATH}"
sed -i '' "s/^CHROME_BINARY_SHA512SUM='.*'/CHROME_BINARY_SHA512SUM='${CHROME_BINARY_SHA512SUM}'/" "${SCRIPT_PATH}"

rm -rf "${CHROME_BINARY}"
