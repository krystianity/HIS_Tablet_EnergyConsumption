/*
   Copyright 2015 Dennis Stodko, Christian Fröhlingsdorf

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* globas js file */

 function loadJsonData(file, callback) {
        $.getJSON(file, function (jdata) {
            console.log("got json data!");
            callback(true, jdata);
        }).fail(function (err) {
            console.log("failed to load " + file);
            console.log(err);
            callback(false, null);
        });
    };
