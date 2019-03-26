$(document).ready(function () {
    var margin = {top: 100, right: 50, bottom: 50, left: 100},
        dim = Math.min(parseInt(d3.select("#chart").style("width")), parseInt(d3.select("#chart").style("height"))),
        width = dim - margin.left - margin.right,
        height = dim - margin.top - margin.bottom;

    var xScale = d3.scale.ordinal().rangeBands([0, width]);
    var yScale = d3.scale.ordinal().rangeBands([0, height]);
    var xAxis = d3.svg.axis().orient("top");
    var yAxis = d3.svg.axis().orient("left");

    var data = [];
    var cols = [];
    var links = [];
    var fdgNodes = [];
    var fdgLinks = [];
    var categories = 1;

    var svg;
    var g1;
    var g2;
    var g3;
    var zoom;

    $('#upload').click(function () {
        reset();

        // read csv file and create url for d3.csv
        var csv = $('#filename');
        var csvFile = csv[0].files[0];
        var ext = csv.val().split(".").pop().toLowerCase();
        if ($.inArray(ext, ["csv"]) === -1) {
            alert('upload csv');
            return false;
        }
        var url = URL.createObjectURL(csvFile);

        // modify the data set and calculate the correlation matrix
        d3.csv(url, function (error, csvdata) {
            csvdata = (typeof csvdata === "string") ? csv.parse(csvdata) : csvdata;
            cols = Object.keys(csvdata[0]);
            categories = cols.length;

            for (var i = 0; i < cols.length; i++) {
                // get each column as key value pair
                var elements = csvdata[i];  //{key1: "12490", key2: "341235", key3: "652405", key4: "83.9"}
                var obj = {index: i};
                cols.forEach(function (col) {
                    obj[col] = +elements[col];
                });
                data.push(obj);

                // node data of Force-Directed-Graph
                var node1 = [];
                node1.name = cols[i];
                node1.group = i;
                fdgNodes.push(node1);   //{name:"key1", group:i}
            }

            var corr = jz.arr.correlationMatrix(data, cols);    //{column_x: String1, column_y: String2, correlation: Number}

            corr.forEach(function (ele) {
                var link1 = [];
                link1.source = ele.column_x;
                link1.target = ele.column_y;
                link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
                links.push(link1);   //{source: String1, target: String2, value: Number}

                // link data of Force-Directed-Graph
                var link2 = [];
                for (j = 0; j < fdgNodes.length; j++) {
                    if (link1.source === fdgNodes[j].name) {
                        link2.source = j;
                        break;
                    }
                }
                for (j = 0; j < fdgNodes.length; j++) {
                    if (link1.target === fdgNodes[j].name) {
                        link2.target = j;
                        break;
                    }
                }
                link2.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
                fdgLinks.push(link2);
            });
        });
    });

    // Select visualization method
    d3.selectAll(".radioclass1")
        .on("click", update);

    // Reset the data sources
    function reset() {
        data = [];
        cols = [];
        fdgNodes = [];
        links = [];
        fdgLinks = [];
        categories = 1;
        $("svg").empty();
    }

    // Create the Heatmap
    function heatmap(categories, links) {
        transformArray1 = {k: 1, x: width / 2, y: height / 2};
        zoom = d3.behavior.zoom().on("zoom", zoomed1);
        svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        g1 = svg.append("g")
            .attr("class", "everything")
            .attr("transform", function (d) {
                return "translate(1,1)";
            });

        // Set color
        var color_range = colorbrewer.YlOrRd[9];
        var color = d3.scale.quantile().domain([0, 1]).range(color_range);

        yScale = d3.scale.ordinal().rangeBands([0, height]);

        // Show up label for each block
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                var st = d.value == 0 ? "Filtered" : d3.round(d.value, 3);
                return "<div><span>Relationship:</span> <span style='color:white'>" + d.source + " and " + d.target + "</span></div>" +
                    "<div><span>Correlation:</span> <span style='color:white'>" + st + "</span></div>";
            });

        svg.call(tip);
        var gridSize = width / categories;
        g1.selectAll(".correlation")
            .data(links)
            .enter().append("rect")
            .attr("class", "correlation")
            .attr("x", function (d, i) {
                return gridSize * Math.floor(i / categories);
            })
            .attr("y", function (d, i) {
                return gridSize * (i % categories);
            })
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function (d) {
                return d.value == 0 ? "white" : color(d.value);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        var names = [];
        links.forEach(function (d) {
            names.push(d.source);
        });

        // Add the horizontal labels
        xScale.domain(names);
        xAxis.scale(xScale);

        g1.append("g")
            .attr("class", "x axis")
            .call(xAxis)
            .selectAll("text")
            .attr("y", -10)
            .attr("dy", ".5em")
            .attr("x", 0)
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start")
            .style("font-weight", "bold");

        // Add the vertical labels
        yScale.domain(names);

        yAxis.scale(yScale);

        g1.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", "end");

    }

    // Create the Bar Graph
    function bar(links) {
        transformArray2 = {k: 1, x: width / 2, y: height / 2};
        zoom = d3.behavior.zoom().on("zoom", zoomed2);
        svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        g2 = svg.append("g")
            .attr("class", "everything")
            .attr("transform", function (d) {
                return "translate(1,1)";
            });

        yScale = d3.scale.linear().range([height, 0]);

        var names = [];
        links.forEach(function (d) {
            names.push(d.source + " and " + d.target);
        });

        // Add the horizontal labels
        xScale.domain(names);

        xAxis.scale(xScale);

        // Add the vertical labels
        yScale.domain([0, 1]);

        yAxis.scale(yScale);
        /*
                g2.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", "-.55em")
                    .attr("transform", "rotate(-90)");
        */
        g2.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            //.attr("transform", "rotate(-90)")
            .attr("y", -26)
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .text("Correlation");
        /*
                g2.selectAll("bar")
                    .data(links)
                    .enter().append("rect")
                    .style("fill", "steelblue")
                    .attr("x", function (d) {
                        return xScale(d.source + " and " + d.target);
                    })
                    .attr("width", xScale.rangeBand())
                    .attr("y", function (d) {
                        return yScale(d.value);
                    })
                    .attr("height", function (d) {
                        return height - yScale(d.value);
                    });
        */

        // Show up label for each bar
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                var st = d.value == 0 ? "Filtered" : d3.round(d.value, 3);
                return "<div><span>Relationship:</span> <span style='color:white'>" + d.source + " and " + d.target + "</span></div>" +
                    "<div><span>Correlation:</span> <span style='color:white'>" + st + "</span></div>";
            });

        svg.call(tip);

        var barPadding = 1;
        g2.selectAll("rect")
            .data(links)
            .enter()
            .append("rect")
            .style("fill", "steelblue")
            .attr("x", function (d, i) {
                return i * (width / links.length);  //Bar width of 20 plus 1 for padding
            })
            .attr("y", function (d) {
                return yScale(d.value);
            })
            .attr("width", width / links.length - barPadding)
            .attr("height", function (d) {
                return height - yScale(d.value);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }

    // Create the Force Directed Graph
    function forceDirectedGraph(fdgnodes, fdglinks) {
        transformArray3 = {k: 1, x: width / 2, y: height / 2};
        zoom = d3.behavior.zoom().on("zoom", zoomed3);
        svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        g3 = svg.append("g")
            .attr("class", "everything")
            .attr("transform", function (d) {
                return "translate(1,1)";
            });

        var force = d3.layout.force()
            .nodes(d3.values(fdgnodes))
            .links(fdglinks)
            .size([width + margin.left + margin.right, height + margin.top + margin.bottom])
            .linkDistance(function (d) {
                return 400 * Math.sqrt(1 - d.value * d.value);
            })
            .charge(-1500)
            .on("tick", tick)
            .start();

        var edges_line = g3.append('g').selectAll('.edges-line')
            .data(force.links())
            .enter()
            .append('path')
            .attr({
                'class': 'edges-line',
                'id': function (d, i) {
                    return 'edgepath' + i;
                },
            })
            .style({
                'pointer-events': 'none',
                'stroke': "black",
                'stroke-width': '2'
            })

        var edges_text = g3.append("g").selectAll(".edgelabel")
            .data(force.links())
            .enter()
            .append("text")
            .style("pointer-events", "none")
            .attr({
                'class': 'edgelabel',
                'dx': 80,
                'dy': -5
            });

        edges_text.append('textPath')
            .attr('xlink:href', function (d, i) {
                return '#edgepath' + i
            })
            .style("pointer-events", "none")
            .text(function (d) {
                return d.relation;
            });

        var colour = d3.scale.category20();

        var circles = g3.append('g').selectAll('circle')
            .data(force.nodes())
            .enter()
            .append('circle')
            .attr({
                'class': 'circle-node',
                'r': 15,
                'fill': function (d) {
                    return colour(d.group);
                },
                'stroke-width': '4'
            })
            .on('click', function (node) {
                edges_line.style({
                        'stroke-width': function (link) {
                            if (link.source.name === node.name || link.target.name === node.name) {
                                return '4';
                            }
                            else {
                                return '2';
                            }
                        }
                    }
                )
            })
            .call(force.drag);

        var node_text = g3.append('g').selectAll('text')
            .data(force.nodes())
            .enter()
            .append('text')
            .attr({
                'id': function (d, i) {
                    return 'nodetext' + i;
                },
                'class': 'node-text',
                'text-anchor': 'middle',
                'dy': 42
            })
            .text(function (node) {
                return node.name
            })

        function tick() {
            circles.attr("transform", transform1);
            edges_line.attr('d', function (d) {
                var path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
                return path;
            });

            edges_text.attr('transform', function (d, i) {
                if (d.target.x < d.source.x) {
                    bbox = this.getBBox();
                    rx = bbox.x + bbox.width / 2;
                    ry = bbox.y + bbox.height / 2;
                    return 'rotate(180 ' + rx + ' ' + ry + ')';
                }
                else {
                    return 'rotate(0)';
                }
            });
            node_text.attr('transform', transform1);
        }

        function transform1(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }
    }

    // TODO Calculate the correlations after filtering
    function calculateCorrelation(startpoint, sizepoint) {
        var corr = jz.arr.correlationMatrix(data.slice(startpoint, sizepoint), cols);    //{column_x: String1, column_y: String2, correlation: Number}

        corr.forEach(function (ele) {
            var link1 = [];
            link1.source = ele.column_x;
            link1.target = ele.column_y;
            link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
            links.push(link1);   //{source: String1, target: String2, value: Number}

            // link data of Force-Directed-Graph
            var link2 = [];
            for (j = 0; j < fdgNodes.length; j++) {
                if (link1.source === fdgNodes[j].name) {
                    link2.source = j;
                    break;
                }
            }
            for (j = 0; j < fdgNodes.length; j++) {
                if (link1.target === fdgNodes[j].name) {
                    link2.target = j;
                    break;
                }
            }
            link2.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
            fdgLinks.push(link2);
        });
    }

    // Update the graph after user settings
    function update() {
        // remove current visualization
        $("svg").empty();

        var start = 0;
        var size = links.length;

        // check Minimum and Maximum
        if (settings.minimum.value < 0) {
            alert("Minimum cannot be smaller than 0!");
            return;
        }
        if (settings.maximum.value > 1) {
            alert("Maximum cannot be bigger than 1!");
            return;
        }
        if (settings.minimum.value > settings.maximum.value) {
            alert("Minimum cannot be bigger than Maximum!");
            return;
        }
        var min = settings.minimum.value;
        var max = settings.maximum.value;

        //TODO Modify window size

        var links_to_draw = [];
        var fdglinks_to_draw = fdgLinks;

        // Modify minimal and maximal value
        links.forEach(function (l) {
            var temp = [];
            temp.source = l.source;
            temp.target = l.target;
            if (l.value < min) {
                temp.value = 0;
            } else if (l.value > max) {
                temp.value = 0;
            } else {
                temp.value = l.value;
            }
            links_to_draw.push(temp);
        });

        fdglinks_to_draw.forEach(function (l) {
            var temp = [];
            temp.source = l.source;
            temp.target = l.target;
            if (l.value < min) {
                temp.value = 0;
            } else if (l.value > max) {
                temp.value = 0;
            } else {
                temp.value = l.value;
            }
            fdglinks_to_draw.push(temp);
        });

        // Select visualization method
        if (form.visualization[0].checked) {
            heatmap(categories, links_to_draw);
            return;
        }
        if (form.visualization[1].checked) {
            bar(links_to_draw);
            return;
        }
        if (form.visualization[2].checked) {
            forceDirectedGraph(fdgNodes, fdglinks_to_draw);
            return;
        }
    }

    //d3.selectAll(".settings").on('click', update);

    /*
            function resize() {
                //var dim = Math.min(parseInt(d3.select("#chart").style("width")), parseInt(d3.select("#chart").style("height"))),
                var dim = 600,
                    width = dim - margin.left - margin.right,
                    height = dim - margin.top - margin.bottom;
                gridSize = width / categories;
                // Update the range of the scale with new width/height
                xScale.rangeBands([0, width]);
                yScale.rangeBands([0, height]);
                // Update the axis and text with the new scale
                svg.select('.x.axis')
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", -10)
                    .attr("dy", ".5em")
                    .attr("x", 0)
                    .attr("transform", "rotate(-45)")
                    .style("text-anchor", "start");
                svg.select('.y.axis')
                    .call(yAxis);
                svg.selectAll('.correlation')
                    .attr("x", function (d, i) {
                        return gridSize * Math.floor(i / categories);
                    })
                    .attr("y", function (d, i) {
                        return gridSize * (i % categories);
                    })
                    .attr("width", gridSize)
                    .attr("height", gridSize);
            }
            d3.select(window).on('resize', resize);
            resize();
    */

    // Initialize transformArray and zoom function for each visualization method
    var transformArray1 = {k: 1, x: width / 2, y: height / 2};
    var transformArray2 = {k: 1, x: width / 2, y: height / 2};
    var transformArray3 = {k: 1, x: width / 2, y: height / 2};

    function zoomed1() {
        transformArray1 = {k: d3.event.scale, x: d3.event.translate[0], y: d3.event.translate[1]};
        g1.attr("transform", "translate(" + transformArray1.x + "," + transformArray1.y + ")scale(" + transformArray1.k + ")");
    }

    function zoomed2() {
        transformArray2 = {k: d3.event.scale, x: d3.event.translate[0], y: d3.event.translate[1]};
        g2.attr("transform", "translate(" + transformArray2.x + "," + transformArray2.y + ")scale(" + transformArray2.k + ")");
    }

    function zoomed3() {
        transformArray3 = {k: d3.event.scale, x: d3.event.translate[0], y: d3.event.translate[1]};
        g3.attr("transform", "translate(" + transformArray3.x + "," + transformArray3.y + ")scale(" + transformArray3.k + ")");
    }

    function zoomClick() {
        if (form.visualization[0].checked) {
            var clicked = d3.event.target,
                factor = 0.189207,
                center = [width / 2, height / 2],
                translate0 = [],
                l = [],
                view = transformArray1;

            d3.event.preventDefault();
            direction = (this.id === 'zoom_in') ? 1 : -1;
            target_zoom = view.k * (1 + factor * direction);

            translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
            view.k = target_zoom;
            l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

            view.x += center[0] - l[0];
            view.y += center[1] - l[1];

            transformArray1 = view;

            g1.attr("transform", "translate(" + transformArray1.x + "," + transformArray1.y + ")scale(" + transformArray1.k + ")");
            return;
        }

        if (form.visualization[1].checked) {
            var clicked = d3.event.target,
                factor = 0.189207,
                center = [width / 2, height / 2],
                translate0 = [],
                l = [],
                view = transformArray2;

            d3.event.preventDefault();
            direction = (this.id === 'zoom_in') ? 1 : -1;
            target_zoom = view.k * (1 + factor * direction);

            translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
            view.k = target_zoom;
            l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

            view.x += center[0] - l[0];
            view.y += center[1] - l[1];

            transformArray2 = view;

            g2.attr("transform", "translate(" + transformArray2.x + "," + transformArray2.y + ")scale(" + transformArray2.k + ")");
            return;
        }

        if (form.visualization[2].checked) {
            var clicked = d3.event.target,
                factor = 0.189207,
                center = [width / 2, height / 2],
                translate0 = [],
                l = [],
                view = transformArray3;

            d3.event.preventDefault();
            direction = (this.id === 'zoom_in') ? 1 : -1;
            target_zoom = view.k * (1 + factor * direction);

            translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
            view.k = target_zoom;
            l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

            view.x += center[0] - l[0];
            view.y += center[1] - l[1];

            transformArray3 = view;

            g3.attr("transform", "translate(" + transformArray3.x + "," + transformArray3.y + ")scale(" + transformArray3.k + ")");
            return;
        }
    }

    d3.selectAll(".zoombutton").on('click', zoomClick);

});