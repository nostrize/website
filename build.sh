#!/bin/bash

rm -rf pages
mkdir pages

./node_modules/.bin/webpack

# copy pages
cp src/pages/nip65-manager.html pages/nip65-manager.html
cp src/pages/nip65-manager.css pages/nip65-manager.css

cp src/pages/nip07-relays-manager.html pages/nip07-relays-manager.html
cp src/pages/nip07-relays-manager.css pages/nip07-relays-manager.css

cp src/pages/nip07-metadata-manager.html pages/nip07-metadata-manager.html
cp src/pages/nip07-metadata-manager.css pages/nip07-metadata-manager.css
