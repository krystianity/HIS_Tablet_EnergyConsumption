/* this is a simple nodejs server,
    used to serve the angularjs requests on
    outsourced views while debugging the
    app in a browser.

    - install nodejs from https://nodejs.org/
    - make sure to install server dependencies with:
        "npm install connect serve-static"
    - run with "node simple_server.js"
    - and open the url http://localhost:8088/index.html
    - and debug the app..

    Christian Fröhlingsdorf, 13.03.2015
*/

var con = require("connect");
var serv = require("serve-static");

var dir = __dirname + "\\..\\";
var port = 8088;

console.log("Launching Static File Server on 'http://localhost:" + port + "/'");
console.log("Serving directory: " + dir);
console.log("Christian Fröhlingsdorf, 13.03.2015 - krystijan@live.de");
con().use(serv(dir)).listen(port);
console.log("..");