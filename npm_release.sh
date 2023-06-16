
#!/bin/bash -x

# Sensible error handling
set -e

npm install
npm run release

echo "drag twit.tid to deploy"
open editions/release/output
