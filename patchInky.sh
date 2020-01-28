#!/bin/bash
#set -x
sed -i -e "s/, 'id'//g" "./node_modules/inky/lib/util/getAttrs.js"
