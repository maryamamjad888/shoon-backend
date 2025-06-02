#!/bin/bash
# Build the admin
medusa build

# Create directories and copy admin files
mkdir -p ./admin ./public/admin ./build/admin ./dist/admin
cp -r ./.medusa/server/public/admin/* ./admin/
cp -r ./.medusa/server/public/admin/* ./public/admin/
cp -r ./.medusa/server/public/admin/* ./build/admin/
cp -r ./.medusa/server/public/admin/* ./dist/admin/

# Start the server
medusa start