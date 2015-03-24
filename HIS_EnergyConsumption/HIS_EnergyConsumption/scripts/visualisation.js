function v_drawLiquids() {
    loadLiquidFillGauge("fillgauge1", 55);
    var config1 = liquidFillGaugeDefaultSettings();
    config1.circleColor = "#FF7777";
    config1.textColor = "#FF4444";
    config1.waveTextColor = "#FFAAAA";
    config1.waveColor = "#FFDDDD";
    config1.circleThickness = 0.2;
    config1.textVertPosition = 0.2;
    config1.waveAnimateTime = 1000;
    loadLiquidFillGauge("fillgauge2", 28, config1);
    var config2 = liquidFillGaugeDefaultSettings();
    config2.circleColor = "#D4AB6A";
    config2.textColor = "#553300";
    config2.waveTextColor = "#805615";
    config2.waveColor = "#AA7D39";
    config2.circleThickness = 0.1;
    config2.circleFillGap = 0.2;
    config2.textVertPosition = 0.8;
    config2.waveAnimateTime = 2000;
    config2.waveHeight = 0.3;
    config2.waveCount = 1;
    loadLiquidFillGauge("fillgauge3", 60.1, config2);
    var config3 = liquidFillGaugeDefaultSettings();
    config3.textVertPosition = 0.8;
    config3.waveAnimateTime = 5000;
    config3.waveHeight = 0.15;
    config3.waveAnimate = false;
    config3.waveOffset = 0.25;
    config3.valueCountUp = false;
    config3.displayPercent = false;
    loadLiquidFillGauge("fillgauge4", 50, config3);
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
    loadLiquidFillGauge("fillgauge5", 60.44, config4);
    var config5 = liquidFillGaugeDefaultSettings();
    config5.circleThickness = 0.4;
    config5.circleColor = "#6DA398";
    config5.textColor = "#0E5144";
    config5.waveTextColor = "#6DA398";
    config5.waveColor = "#246D5F";
    config5.textVertPosition = 0.52;
    config5.waveAnimateTime = 5000;
    config5.waveHeight = 0;
    config5.waveAnimate = false;
    config5.waveCount = 2;
    config5.waveOffset = 0.25;
    config5.textSize = 1.2;
    config5.minValue = 30;
    config5.maxValue = 150
    config5.displayPercent = false;
    loadLiquidFillGauge("fillgauge6", 120, config5);
};

function v_drawPie() {
    var svg = d3.select("#pie-body")
	.append("svg")
	.append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var width = 960,
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

    var color = d3.scale.ordinal()
       .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
       .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

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
    width = 960 - margin.left - margin.right,
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

    d3.selectAll("button").on("click", function () {
        svg.datum(randomize).call(chart.duration(1000)); // TODO automatic transition
    });
};