#!/usr/bin/env bash

set -u
set -o pipefail

mkdir -p dist
rm -rf dist/*
browserify src/pluginWorker.js -o dist/pluginWorker.js
