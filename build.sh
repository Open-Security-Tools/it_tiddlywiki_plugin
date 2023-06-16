#!/bin/bash -x

# Sensible error handling
set -e

python3 inject_version.py
npm run release
open editions/release/output
