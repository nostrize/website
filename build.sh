#!/bin/bash

rm -rf pages
mkdir pages

./node_modules/.bin/webpack

# copy pages
cp src/pages/nip65-manager.html pages/nip65-manager.html
cp src/pages/nip65-manager.css pages/nip65-manager.css
