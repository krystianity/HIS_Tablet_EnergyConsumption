﻿/*
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

function v_drawLiquids(data) {
    for (var i = 0; i < data.length; i++) {
        loadLiquidFillGauge(data[i].id, data[i].fill, data[i].config);
    }
};

function v_drawPie(color) {
    var svg = d3.select("#pie-body")
	.append("svg")
	.append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var width = $(window).width(),
        height = 450,
        radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function (d) { return d.data.label; };

    v_pie_Change(v_pie_RandomData(color), svg, pie, key, color, arc, outerArc, radius);
};

function v_pie_RandomData(color) {
    var labels = color.domain();
    return labels.map(function (label) {
        return { label: label, value: Math.random() }
    });
}

function v_pie_Change(data, svg, pie, key, color, arc, outerArc, radius) {

    /* ------- PIE SLICES -------*/
    var slice = svg.select(".slices").selectAll("path.slice")
		.data(pie(data), key);

    slice.enter()
		.insert("path")
		.style("fill", function (d) { return color(d.data.label); })
		.attr("class", "slice");

    slice
		.transition().duration(1000)
		.attrTween("d", function (d) {
		    this._current = this._current || d;
		    var interpolate = d3.interpolate(this._current, d);
		    this._current = interpolate(0);
		    return function (t) {
		        return arc(interpolate(t));
		    };
		})

    slice.exit()
		.remove();

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labels").selectAll("text")
		.data(pie(data), key);

    text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function (d) {
		    return d.data.label;
		});

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.transition().duration(1000)
		.attrTween("transform", function (d) {
		    this._current = this._current || d;
		    var interpolate = d3.interpolate(this._current, d);
		    this._current = interpolate(0);
		    return function (t) {
		        var d2 = interpolate(t);
		        var pos = outerArc.centroid(d2);
		        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
		        return "translate(" + pos + ")";
		    };
		})
		.styleTween("text-anchor", function (d) {
		    this._current = this._current || d;
		    var interpolate = d3.interpolate(this._current, d);
		    this._current = interpolate(0);
		    return function (t) {
		        var d2 = interpolate(t);
		        return midAngle(d2) < Math.PI ? "start" : "end";
		    };
		});

    text.exit()
		.remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(data), key);

    polyline.enter()
		.append("polyline");

    polyline.transition().duration(1000)
		.attrTween("points", function (d) {
		    this._current = this._current || d;
		    var interpolate = d3.interpolate(this._current, d);
		    this._current = interpolate(0);
		    return function (t) {
		        var d2 = interpolate(t);
		        var pos = outerArc.centroid(d2);
		        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
		        return [arc.centroid(d2), outerArc.centroid(d2), pos];
		    };
		});

    polyline.exit()
		.remove();
};

function v_drawBars(bar, data) {
    var margin = { top: 5, right: 40, bottom: 20, left: 120 },
    width = $(window).width() - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

    var chart = d3.bullet()
        .width(width)
        .height(height);

    var svg = d3.select(bar).selectAll("svg")
        .data(data)
        .enter().append("svg")
        .attr("class", "bullet")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(chart);

    var title = svg.append("g")
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + height / 2 + ")");

    title.append("text")
        .attr("class", "title")
        .text(function (d) { return d.title; });

    title.append("text")
        .attr("class", "subtitle")
        .attr("dy", "1em")
        .text(function (d) { return d.subtitle; });

    /* d3.selectAll("button").on("click", function () {
        svg.datum(randomize).call(chart.duration(1000)); // TODO automatic transition
    }); */
};

function v_drawWheel(json) {

    var width = $(window).width() - 160,
    height = width,
    radius = width / 2,
    x = d3.scale.linear().range([0, 2 * Math.PI]),
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
    padding = 5,
    duration = 1500;

    $("#wheel-body").css("width", width + "px");

    var div = d3.select("#wheel-body");

    //div.select("img").remove();

    var vis = div.append("svg")
        .attr("width", width + padding * 2)
        .attr("height", height + padding * 2)
        .append("g")
        .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

    /* div.append("p")
        .attr("id", "intro")
        .text("Click to zoom!"); */

    var partition = d3.layout.partition()
        .sort(null)
        .value(function (d) { return 5.8 - d.depth; });

    var arc = d3.svg.arc()
        .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function (d) { return Math.max(0, d.y ? y(d.y) : d.y); })
        .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)); });

    var nodes = partition.nodes({ children: json });

    var path = vis.selectAll("path").data(nodes);
    path.enter().append("path")
        .attr("id", function (d, i) { return "path-" + i; })
        .attr("class", function (d, i) { return "circle-" + d.depth; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", colour)
        .on("click", click);
        //.on("click", click2);

    var text = vis.selectAll("text").data(nodes);
    var textEnter = text.enter().append("text")
        .attr("class", function (d, i) { return "circlet-" + d.depth; })
        .style("fill-opacity", 1)
        .style("fill", function (d) {
            return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
        })
        .attr("text-anchor", function (d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        })
        .attr("dy", ".2em")
        .attr("transform", function (d) {
            var multiline = (d.name || "").split(" ").length > 1,
                angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        })
        .on("click", click);
    textEnter.append("tspan")
        .attr("x", 0)
        .text(function (d) { return d.depth ? d.name.split(" ")[0] : ""; });
    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function (d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });

   
    deactivateCircles([3, 4]);

    function deactivateCircles(a) {
        for (var i = 0; i < a.length; i++) {
            $(".circlet-" + a[i]).hide();
            $(".circle-" + a[i]).hide();
        }
    }

    function activateCircles(a) {
        for (var i = 0; i < a.length; i++) {
            $(".circlet-" + a[i]).show();
            $(".circle-" + a[i]).show();
        }
    }

    function click(d) {

        path.transition()
            .duration(duration)
            .attrTween("d", arcTween(d));

        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function (e) {
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
            .transition()
            .duration(duration)
            .attrTween("text-anchor", function (d) {
                return function () {
                    return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                };
            })
            .attrTween("transform", function (d) {
                var multiline = (d.name || "").split(" ").length > 1;
                return function () {
                    var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                        rotate = angle + (multiline ? -.5 : 0);
                    return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                };
            })
            .style("fill-opacity", function (e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function (e) {
                d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });

        if(d.depth == 0){
            deactivateCircles([3, 4]);
        } else if (d.depth == 1) {
		 deactivateCircles([4]);
		 $(".circlet-3").css("font", "9px sans-serif");
            setTimeout(function () {
                activateCircles([3]);
            }, duration - 100);
        } else {
            setTimeout(function () {
                activateCircles([3, 4]);
                $(".circlet-3").css("font", "14px sans-serif");
            }, duration - 100);
        }
    }

    function isParentOf(p, c) {
        if (p === c) return true;
        if (p.children) {
            return p.children.some(function (d) {
                return isParentOf(d, c);
            });
        }
        return false;
    }

    function colour(d) {
        if (d.children) {
            // There is a maximum of two children!
            var colours = d.children.map(colour),
                a = d3.hsl(colours[0]),
                b = d3.hsl(colours[1]);
            // L*a*b* might be better here...
            return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
        }
        return d.colour || "#fff";
    }

    // Interpolate the scales!
    function arcTween(d) {
        var my = maxY(d),
            xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, my]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function (d) {
            return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }

    function maxY(d) {
        return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    function brightness(rgb) {
        return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
    }
};