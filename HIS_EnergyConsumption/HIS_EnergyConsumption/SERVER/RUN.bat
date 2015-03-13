@echo off
start "" http://localhost:8088/index.html
node %0\..\simple_server.js
pause