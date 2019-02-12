$(document).ready(function () {
    var zoom = d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoomed);
    //var zoom = d3.zoom().on("zoom", zoomed);


    var margin = {top: 100, right: 50, bottom: 50, left: 100},
//        dim = Math.min(parseInt(d3.select("#chart").style("width")), parseInt(d3.select("#chart").style("height"))),
        dim = 600,
        width = dim - margin.left - margin.right,
        height = dim - margin.top - margin.bottom;
    //zoom function
    var transformArray = {k: 1, x: width / 2, y: height / 2};
    // Set color
    var color_range = colorbrewer.YlOrRd[9];
    var color = d3.scale.quantile().domain([0, 1]).range(color_range);

    var xScale = d3.scale.ordinal().rangeBands([0, width]);
    var yScale = d3.scale.ordinal().rangeBands([0, height]);
    var xAxis = d3.svg.axis().orient("top");
    var yAxis = d3.svg.axis().orient("left");

    var svg;
    var nodes = [];
    var links = [];
    var categories = 1;
    var vis = null;
    var g;


    $('#upload').click(function () {
        reset();

        // Read csv file and create url for d3.csv
        var csv = $('#filename');
        var csvFile = csv[0].files[0];
        var ext = csv.val().split(".").pop().toLowerCase();
        if ($.inArray(ext, ["csv"]) === -1) {
            alert('upload csv');
            return false;
        }
        var url = URL.createObjectURL(csvFile);


        /*
                svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height);

                var g = svg.append("g")
                    .attr("class", "everything")
                    .attr("transform", function (d) {
                        return "translate(" + d + ")";
                    });

                var simulation = d3.forceSimulation()
                    .force("link", d3.forceLink()
                        .id(function (d) {
                            return d.id;
                        })
                        .distance(function (d) {
                            return 300 * d.value;
                        })
                    )
                    .force("charge", d3.forceManyBody())
                    .force("center", d3.forceCenter(width / 2, height / 2))
                ;
        */

        // Modify the data set and calculate the correlation matrix
        d3.csv(url, function (error, csvdata) {
            var data = [];
            var cols = Object.keys(csvdata[0]);
            var nodes = []
            categories = cols.length;

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

            corr.forEach(ele => {
                var link1 = [];
                link1.source = ele.column_x;
                link1.target = ele.column_y;
                link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
                links.push(link1);   //{source: String1, target: String2, value: Number}
            });


        });


        //heatmap(cols.length,links);

        //bar(links);

        //forceDirectedGraph(nodes,links);

    });

    // Reset the data sources
    function reset() {
        nodes = [];
        links = [];
        categories = 1;
        $("svg").empty();
    }

    // Select visualization method
    d3.selectAll(".radioclass1")
        .on("click", function () {
            // Remove visualization method
            $("svg").empty();

            for (i = 0; i < form.visualization.length; i++) {
                if (form.visualization[0].checked) {
                    heatmap(categories, links);
                }
                if (form.visualization[1].checked) {
                    bar(links);
                    //forceDirectedGraph(nodes,links);
                }
                if (form.visualization[2].checked) {
                    //forceDirectedGraph(nodes,links);
                }
            }
        });

    // Create the Heatmap
    function heatmap(categories, links) {
        yScale = d3.scale.ordinal().rangeBands([0, height]);
        // Create the svg canvas
        svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Show up label for each block
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return "<div><span>Relationship:</span> <span style='color:white'>" + d.source + " and " + d.target + "</span></div>" +
                    "<div><span>Correlation:</span> <span style='color:white'>" + d3.round(d.value, 3) + "</span></div>";
            });

        svg.call(tip);
        var gridSize = width / categories;
        vis = svg.selectAll(".correlation")
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
                return color(d.value);
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

        svg.append("g")
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

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", "end");

    }

    // Create the Bar Graph
    function bar(links) {
        // Create the svg canvas
        svg = d3.select("#chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Correlation Value");

        vis = svg.selectAll("bar")
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
    }

    // Create the Force Directed Graph
    function forceDirectedGraph(nodes, links) {
        svg = d3.select("#chart")
            .call(zoom)
            ,
            width = svg.attr("width"),
            height = svg.attr("height")
        ;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height);

        //var color = d3.scaleOrdinal(d3.schemeCategory20);
/*
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .id(function (d) {
                    return d.id;
                })
                .distance(function (d) {
                    return 300 * d.value;
                })
            )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2))
        ;
*/

// center marker
        svg.append('circle')
            .attr('r', 15)
            .attr('cx', width / 2)
            .attr('cy', height / 2);
        /*
                var simulation = d3.layout.force()
                    .charge(-100)
                    .linkDistance(200)
                    .size([width / 2, height / 2]);

                g = svg.append("g")
                    .attr("class", "everything")
                    .attr("transform", function (d) {
                        return "translate(" + d + ")";
                    });

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return Math.sqrt(1 - d.value * d.value);
            })

        ;

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 15)
            .attr("fill", function (d) {
                return color(d.group);
            })
;

        node.append("title")
            .text(function (d) {
                return d.id;
            });

        node.append("text")
            .text(function (d) {
                return d.id;
            })
            .attr('x', 6)
            .attr('y', 3);
        /*
                var text = g.append("g")
                    .selectAll("text")
                    .data(nodes)
                    .enter().append("text")
                    .attr("x", 800)
                    .attr("y", ".31em")
                    .text(function (d) {
                        return d.id;
                    });
        */
        /*
        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation
            .links(links);

    node.call(simulation.drag());
        simulation.start();
    */
        var link = svg.selectAll()
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', 'black')
            .attr('stroke-width', function (d) {
                return Math.sqrt(1 - d.value * d.value);
            });

        var node = svg.selectAll()
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 15)
            .attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('stroke-width', function (d) {
                return Math.sqrt(1 - d.value * d.value);
            });

        var force = d3.layout.force()
            .nodes(nodes)
            .links(links)
            .charge(-100)
            .linkDistance(200)
            .size([width/2, height/2])
            .on('tick', ticked);

        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
/*
            text
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                });
*/
        }

        node.call(force.drag());
        force.start();

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }


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