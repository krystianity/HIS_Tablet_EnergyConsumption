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

/* data preparation! */

///check if an array exists and contains members
///
function vc_ca(_a) {
    if (!_a || !_a.length || _a.length <= 0)
        return false;
    else
        return true;
}

///gets the device out of the categorie's device array using its id
///
function vc_get_device_from_id(id, devices) {
    id = id + "";
    for(var i = 0; i < devices.length; i++){
        for (var x = 0; x < devices[i].devices.length; x++) {
            //console.log(devices[i].devices[x].id + " - " + id);
            if (devices[i].devices[x].id == id) {
                return devices[i].devices[x];
            }
        }
    }

    return {};
}

///generates a random hex that it was not generated in this runtime before
///
var _rhcl = [];
function vc_getUnusedRandomHex() {
    var c = "";
    while (true) {
        c = '#' + Math.floor(Math.random() * 16777215).toString(16);

        if (_rhcl.indexOf(c) == -1) {
            _rhcl.push(c);
            break;
        }
    }

    return c;
};


///calculates a hex color for a give size
///
function vc_getColorFromSize(size, max) {

    var p = 100 - perc(size, max);
    var prgb = numberToColorHsl(p);
    return rgbToHex(prgb[0], prgb[1], prgb[2]);

    function numberToColorHsl(i) {
        // as the function expects a value between 0 and 1, and green = 0° and red = 100°
        // we convert the input to the appropriate hue value
        var hue = i * 1.0 / 360; //changed from 1.2 and 120°
        
        // we convert hsl to rgb (saturation 100%, lightness 50%)
        var rgb = hslToRgb(hue, 1, .5);
        // we format to css value and return
        return rgb;
    }

    function rgbToHex(R, G, B) { return '#' + toHex(R) + toHex(G) + toHex(B) }
    function toHex(n) {
        n = parseInt(n, 10);
        if (isNaN(n)) return "00";
        n = Math.max(0, Math.min(n, 255));
        return "0123456789ABCDEF".charAt((n - n % 16) / 16)
             + "0123456789ABCDEF".charAt(n % 16);
    }

    function perc(x, f) {
        return x / f * 100; //dreisatz
    }
};

///calculate array for v_drawWheel using the devices and stored day-data
///
function vc_getWheelData(devices, days) {
    
    if(!vc_ca(devices) || !vc_ca(days))
        return [];

    var weeks = [];

    //get the highest wattage value, because that is the full red color
    var max = 0;
    var pm = 0;
    var usage = {};
    for (var d = 0; d < days.length; d++)
        for (var u = 0; u < days[d].usage.length; u++) {
            usage = days[d].usage[u];
            pm = (usage.hours * usage.watt);
            if (pm > max)
                max = pm;
        }
    
    //build an array of a week/child/day/child/devices structure to feed the color wheel
    var day = {};
    usage = {};
    var device = {};
    var weekcounter = 1;
    var daycounter = 1;
    var cc = "#";
    var ds = [];
    for (var d = 0; d < days.length; d++) {
        day = days[d];

        //day.id
        //day.date
        //day.usage

        if (d % 7 == 0) {
            weeks.push({ "name": "Week" + weekcounter, "children": [] });
            weekcounter++;
            daycounter = 1;
        }

        ds = day.date.split("-");
        weeks[weekcounter - 2].children.push({ "name": ds[0] + "/" + ds[1] + "/" + ds[2][2] + ds[2][3], "children": [] });
        daycounter++;

        for (var u = 0; u < day.usage.length; u++) {
            usage = day.usage[u];

            //usage.item_id == device.id
            //usage.hours
            //usage.watt

            device = vc_get_device_from_id(usage.item_id, devices);
            cc = vc_getColorFromSize((usage.hours * usage.watt), max);
            weeks[weekcounter - 2].children[daycounter - 2].children.push(
                {
                    "name": device.name, "children":
                    [
                        { "name": (usage.watt * usage.hours) + "w.", "colour": cc },
                        { "name": usage.hours + "h.", "colour": cc }
                    ]
                });
        }
    }

    console.log(JSON.stringify(weeks));

    return weeks;
};

///calculate array for v_drawPie using the items of the scope
///
function vc_getPieData(items) {

    var color = d3.scale.ordinal()
       .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
       .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    return color;
};

///calculate array for v_drawPie using the items of the scope
///
function vc_getLiquidsData(items) {

    var liquids = [];

    var config1 = liquidFillGaugeDefaultSettings();
    config1.circleColor = "#FF7777";
    config1.textColor = "#FF4444";
    config1.waveTextColor = "#FFAAAA";
    config1.waveColor = "#FFDDDD";
    config1.circleThickness = 0.2;
    config1.textVertPosition = 0.2;
    config1.waveAnimateTime = 1000;

    var config4 = liquidFillGaugeDefaultSettings();
    config4.circleThickness = 0.15;
    config4.circleColor = "#808015";
    config4.textColor = "#555500";
    config4.waveTextColor = "#FFFFAA";
    config4.waveColor = "#AAAA39";
    config4.textVertPosition = 0.8;
    config4.waveAnimateTime = 1000;
    config4.waveHeight = 0.05;
    config4.waveAnimate = true;
    config4.waveRise = false;
    config4.waveOffset = 0.25;
    config4.textSize = 0.75;
    config4.waveCount = 3;

    liquids.push({ "id": "fillgauge1", "fill": 55, "config": config1 });
    liquids.push({ "id": "fillgauge2", "fill": 60.44, "config": config4 });

    return liquids;
};

///calculate array for v_drawPie using the items of the scope
///
function vc_getBarData(items) {

    var bul = [
     { "title": "Revenue", "subtitle": "US$, in thousands", "ranges": [150, 225, 300], "measures": [220, 270], "markers": [250] },
     { "title": "Profit", "subtitle": "%", "ranges": [20, 25, 30], "measures": [21, 23], "markers": [26] },
     { "title": "Order Size", "subtitle": "US$, average", "ranges": [350, 500, 600], "measures": [100, 320], "markers": [550] },
     { "title": "New Customers", "subtitle": "count", "ranges": [1400, 2000, 2500], "measures": [1000, 1650], "markers": [2100] },
     { "title": "Satisfaction", "subtitle": "out of 5", "ranges": [3.5, 4.25, 5], "measures": [3.2, 4.7], "markers": [4.4] }
    ];

    return bul;
};