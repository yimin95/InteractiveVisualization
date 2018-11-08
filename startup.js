$(document).ready(function () {
    $('#upload').click(function () {
        $("svg").empty();

        var csv = $('#filename');
        var csvFile = csv[0].files[0];
        var ext = csv.val().split(".").pop().toLowerCase();

        if ($.inArray(ext, ["csv"]) === -1) {
            alert('upload csv');
            return false;
        }

        d3.select("body").append("div").attr("class", "tip").style("display", "none");

        var zoom = d3.zoom().on("zoom", zoomed);

        var margin = {top: 20, bottom: 1, left: 20, right: 1};

        var dim = d3.min([window.innerWidth * .9, window.innerHeight * .9]);

        var width = dim - margin.left - margin.right, height = dim - margin.top - margin.bottom;

        var svg = d3.select("#grid").call(zoom).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        var padding = .1;

        var g = svg.append("g")
            .attr("class", "everything")
            .attr("transform", function (d) {
                return "translate(" + d + ")";
            });

        var url = URL.createObjectURL(csvFile);

        d3.csv(url, function (csvdata) {
            var data = [];
            // get id of each node
            var cols = Object.keys(csvdata[0]);
            var nodes = [];
            var links = [];

            for (var i = 0; i < cols.length; i++) {
                // get each column as key value pair
                var elements = csvdata[i];  //{key1: "12490", key2: "341235", key3: "652405", key4: "83.9"}
                var obj = {index: i};
                cols.forEach(col => {
                    obj[col] = +elements[col];
                });
                data.push(obj);

                var node1 = [];
                node1.id = cols[i];
                node1.group = i;
                nodes.push(node1);   //{id:"key1", group:i}
            }

            var corr = jz.arr.correlationMatrix(data, cols);    //{column_x: String1, column_y: String2, correlation: Number}

            var extent = d3.extent(corr.map(function (d) {
                return d.correlation;
            }).filter(function (d) {
                return d !== 1;
            }));

            var grid = data2grid.grid(corr);
            var rows = d3.max(grid, function (d) {
                return d.row;
            });

            var x = d3.scaleBand()
                .range([0, width])
                .paddingInner(padding)
                .domain(d3.range(1, rows + 1));

            var y = d3.scaleBand()
                .range([0, height])
                .paddingInner(padding)
                .domain(d3.range(1, rows + 1));

            var c = chroma.scale(["tomato", "white", "steelblue"])
                .domain([extent[0], 0, extent[1]]);

            var x_axis = d3.axisTop(y).tickFormat(function (d, i) {
                return cols[i];
            });
            var y_axis = d3.axisLeft(x).tickFormat(function (d, i) {
                return cols[i];
            });

            svg.append("g")
                .attr("class", "x axis")
                .call(x_axis);

            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis);

            svg.selectAll("rect")
                .data(grid, function (d) {
                    return d.column_a + d.column_b;
                })
                .enter().append("rect")
                .attr("x", function (d) {
                    return x(d.column);
                })
                .attr("y", function (d) {
                    return y(d.row);
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    return c(d.correlation);
                })
                .style("opacity", 1e-6)
                .transition()
                .style("opacity", 1);

            svg.selectAll("rect")

            d3.selectAll("rect")
                .on("mouseover", function (d) {

                    d3.select(this).classed("selected", true);

                    d3.select(".tip")
                        .style("display", "block")
                        .html(d.column_x + ", " + d.column_y + ": " + d.correlation.toFixed(2));

                    var row_pos = y(d.row);
                    var col_pos = x(d.column);
                    var tip_pos = d3.select(".tip").node().getBoundingClientRect();
                    var tip_width = tip_pos.width;
                    var tip_height = tip_pos.height;
                    var grid_pos = d3.select("#grid").node().getBoundingClientRect();
                    var grid_left = grid_pos.left;
                    var grid_top = grid_pos.top;

                    var left = grid_left + col_pos + margin.left + (x.bandwidth() / 2) - (tip_width / 2);
                    var top = grid_top + row_pos + margin.top - tip_height - 5;

                    d3.select(".tip")
                        .style("left", left + "px")
                        .style("top", top + "px");

                    d3.select(".x.axis .tick:nth-of-type(" + d.column + ") text").classed("selected", true);
                    d3.select(".y.axis .tick:nth-of-type(" + d.row + ") text").classed("selected", true);
                    d3.select(".x.axis .tick:nth-of-type(" + d.column + ") line").classed("selected", true);
                    d3.select(".y.axis .tick:nth-of-type(" + d.row + ") line").classed("selected", true);

                })
                .on("mouseout", function () {
                    d3.selectAll("rect").classed("selected", false);
                    d3.select(".tip").style("display", "none");
                    d3.selectAll(".axis .tick text").classed("selected", false);
                    d3.selectAll(".axis .tick line").classed("selected", false);
                });

            // legend scale
            var legend_top = 15;
            var legend_height = 15;

            var legend_svg = d3.select("#legend").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", legend_height + legend_top)
                .append("g")
                .attr("transform", "translate(" + margin.left + ", " + legend_top + ")");

            var defs = legend_svg.append("defs");

            var gradient = defs.append("linearGradient")
                .attr("id", "linear-gradient");

            var stops = [{offset: 0, color: "tomato", value: extent[0]}, {
                offset: .5,
                color: "white",
                value: 0
            }, {offset: 1, color: "steelblue", value: extent[1]}];

            gradient.selectAll("stop")
                .data(stops)
                .enter().append("stop")
                .attr("offset", function (d) {
                    return (100 * d.offset) + "%";
                })
                .attr("stop-color", function (d) {
                    return d.color;
                });

            legend_svg.append("rect")
                .attr("width", width)
                .attr("height", legend_height)
                .style("fill", "url(#linear-gradient)");

            legend_svg.selectAll("text")
                .data(stops)
                .enter().append("text")
                .attr("x", function (d) {
                    return width * d.offset;
                })
                .attr("dy", -3)
                .style("text-anchor", function (d, i) {
                    return i == 0 ? "start" : i == 1 ? "middle" : "end";
                })
                .text(function (d, i) {
                    return d.value.toFixed(2) + (i == 2 ? ">" : "");
                })
        });

        var transformArray = {k: 1, x: width / 2, y: height / 2};

        function zoomed() {
            transformArray = d3.event.transform;
            console.log(transformArray);
            g.attr("transform", d3.event.transform);
        }


        function interpolateZoom(translate, scale) {
            var self = this;
            return d3.transition().duration(350).tween("zoom", function () {
                var iTranslate = d3.interpolate(zoom.translate(), translate),
                    iScale = d3.interpolate(zoom.scale(), scale);
                return function (t) {
                    zoom
                        .scale(iScale(t))
                        .translate(iTranslate(t));
                    zoomed();
                };
            });
        }

        function zoomClick() {
            // console.log(transformArray);
            var clicked = d3.event.target,
                factor = 0.189207,
                center = [width / 2, height / 2],
                // extent = zoom.extentScale,
                // translate = [d3.event.transform.x,d3.event.transform.y],
                translate0 = [],
                l = [],
                view = transformArray;


            d3.event.preventDefault();
            direction = (this.id === 'zoom_in') ? 1 : -1;
            target_zoom = view.k * (1 + factor * direction);

            // if (target_zoom < extent[0] || target_zoom > extent[1]) {
            //     return false;
            // }

            translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
            view.k = target_zoom;
            l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

            view.x += center[0] - l[0];
            view.y += center[1] - l[1];

            transformArray = view;
            g.attr("transform", transformArray);
            // interpolateZoominterpolateZoom([view.x, view.y], view.k);
        }

        d3.selectAll('button').on('click', zoomClick);

    });
});