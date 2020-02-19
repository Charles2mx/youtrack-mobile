#!/bin/bash
set -e

echo "=========== 🧰 Install modules ==========="
rm -rf node_modules/
yarn install

echo "=========== 🏁 Start YouTrack Server ==========="
./script/server.sh start

set +e
echo "=========== 📱 Run Functional Tests ==========="

yarn run e2e:ios
exitCode=$?

echo "=========== 🛑 Stop YouTrack Server ==========="
./script/server.sh stop

if [ $exitCode -ne 0 ]; then
  echo "❌ Error: Tests Failed 🔥🔥🔥"
  exit 1
fi

xcrun simctl shutdown all
