#!/bin/bash

rm -rf dist
mkdir dist

./node_modules/.bin/webpack

# copy pages
cp src/pages/nip65-manager.html dist/nip65-manager.html
cp src/pages/nip65-manager.css dist/nip65-manager.css
