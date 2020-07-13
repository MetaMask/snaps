#!/usr/bin/env bash

set -u
set -o pipefail

mkdir -p dist
rm -rf dist/*

browserify -g uglifyify --standalone postMessageStreams index.js -o dist/postMessageStreams.js
