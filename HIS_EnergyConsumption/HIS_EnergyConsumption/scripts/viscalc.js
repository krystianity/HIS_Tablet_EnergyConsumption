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

///3s (size, max)
///
function vc_perc(x, f) {
    return x / f * 100; //dreisatz
}

///calculates a hex color for a give size
///
function vc_getColorFromSize(size, max) {

    var p = 100 - vc_perc(size, max);
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

    //console.log(JSON.stringify(weeks));

    return weeks;
};

///calculate array for v_drawPie using the items of the scope
///
function vc_getLiquidsData(items) {

    if (!vc_ca(items))
        return [];

    var config1 = liquidFillGaugeDefaultSettings();
    config1.circleColor = "#FF7777";
    config1.textColor = "#FF4444";
    config1.waveTextColor = "#FFAAAA";
    config1.waveColor = "#FFDDDD";
    config1.textVertPosition = 0.8;
    config1.waveAnimateTime = 1000;
    config1.waveHeight = 0.05;
    config1.waveAnimate = true;
    config1.waveRise = true;
    config1.waveOffset = 0.25;
    config1.textSize = 0.75;
    config1.waveCount = 3;
    config1.circleThickness = 0.15;

    var config2 = liquidFillGaugeDefaultSettings();
    config2.circleThickness = 0.15;
    config2.circleColor = "#808015";
    config2.textColor = "#555500";
    config2.waveTextColor = "#FFFFAA";
    config2.waveColor = "#AAAA39";
    config2.textVertPosition = 0.8;
    config2.waveAnimateTime = 1000;
    config2.waveHeight = 0.05;
    config2.waveAnimate = true;
    config2.waveRise = true;
    config2.waveOffset = 0.25;
    config2.textSize = 0.75;
    config2.waveCount = 3;

    var liquids = [];

    var runt_h = 0;
    var cons_h = 0;
    for (var i = 0; i < items.length; i++) {

        runt_h = vc_perc(items[i].hours, 24);

        de_max = items[i].device.wattage[0];
        de_cur = items[i].device.wattage[items[i].age_num - 1];
        cons_h = vc_perc(de_cur, de_max);

        liquids.push({
            "id": "fillgauge_" + items[i].id + "_1",
            "fill": runt_h,
            "config": config2
        });

        liquids.push({
            "id": "fillgauge_" + items[i].id + "_2",
            "fill": cons_h,
            "config": config1
        });
    }

    return liquids;
};

///calculate array for v_drawPie using the items of the scope
///
function vc_getBarData(items) {

    if(!vc_ca(items))
        return [];

    var bars = []; //current consumption
    var bars2 = []; //saving potential

    var v = 0;
    var p = 0;
    var pot = 0;
    var wattages = [];
    for (var i = 0; i < items.length; i++) {

        if (!items[i].device.id)
            continue;

        v = items[i].hours * items[i].device.wattage[parseInt(items[i].age_num) - 1]; //current real consumption
        p = items[i].hours * items[i].device.wattage[6]; //lowest consumption A+++ device
        pot = v - p;
       
        wattages = items[i].device.wattage.slice(); //create a copy of the array
        wattages.reverse(); //reverse copy

        bars.push({
            "title": items[i].device.name,
            "subtitle": items[i].description,
            "ranges": wattages,
            "measures": [items[i].device.wattage[parseInt(items[i].age_num) - 1]],
            "markers": [0],
            "potential": pot
        });
    }

    //sort for view
    bars = _.sortBy(bars, function (dev) { return dev.measures[0]; });
    bars.reverse();

    var max = 0;
    for (var i = 0; i < items.length; i++) {

        if (!items[i].device.id)
            continue;

        v = items[i].hours * items[i].device.wattage[parseInt(items[i].age_num) - 1]; //current real consumption
        p = items[i].hours * items[i].device.wattage[6]; //lowest consumption A+++ device
        pot = v - p;

        if (pot < 0) {
            console.log(items[i].device.wattage);
            console.log(parseInt(items[i].age_num) - 1);
            console.log(pot);
        }

        if(v > max)
            max = v;

        bars2.push({
            "title": items[i].device.name,
            "subtitle": items[i].description,
            "ranges": [v],
            "measures": [pot],
            "markers": [0],
            "potential": pot
        });
    }

    //add max pot
    for (var i = 0; i < bars2.length; i++)
        bars2[i].ranges[0] = max;

    //sort for view
    bars2 = _.sortBy(bars2, function (dev) { return dev.potential; });
    bars2.reverse();

    return [bars, bars2];
};