@echo off
mkdir %0\..\node_modules
npm install --prefix %0\..\ connect serve-static