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
    var barLinks = [];
    var fdgNodes = [];
    var fdgLinks = [];
    var categories = 1;
    var maxWindow = 1;

    var links_to_draw = [];
    var barlinks_to_draw = [];
    var fdglinks_to_draw = [];

    var finalResult = [];
    var finalResults = [];

    var svg;
    var g1;
    var g2;
    var g3;
    var zoom;
    var modified = false;
    var firstUpload = true;


    var rangeslider = document.getElementById("sliderRange");
    var current = document.getElementById("currentPoint");
    var style = document.querySelector('[data="test"]');
    var min = document.getElementById("minimum");
    var max = document.getElementById("maximum");
    var windowSize = document.getElementById("windowSize");
    var stepSize = document.getElementById("stepSize");

    // CurrentPoint update after sliding
    rangeslider.oninput = function () {
        current.value = this.value;
        setTimeout(function () {
            if (!firstUpload) {
                links_to_draw = finalResult[parseFloat(current.value) - 1][0];
                barlinks_to_draw = finalResult[parseFloat(current.value) - 1][1];
                fdglinks_to_draw = finalResult[parseFloat(current.value) - 1][2];

                // remove current visualization
                $("svg").empty();
                forceDirectedGraph(fdgNodes, fdglinks_to_draw);
            }
        }, 1000)

    };

    // Slider update after typing currentPoint
    current.oninput = function () {
        if (this.value < 1) return;
        rangeslider.value = this.value;
        setTimeout(function () {
            if (!firstUpload) {
                links_to_draw = finalResult[parseFloat(current.value) - 1][0];
                barlinks_to_draw = finalResult[parseFloat(current.value) - 1][1];
                fdglinks_to_draw = finalResult[parseFloat(current.value) - 1][2];
// remove current visualization
                $("svg").empty();
                forceDirectedGraph(fdgNodes, fdglinks_to_draw);
            }
        }, 500)
    };

    setData(maxWindow);

    function setData(x) {
        current.innerHTML = x;
        style.innerHTML = ".myslider::-webkit-slider-thumb { width: " + 100 * windowSize.value / maxWindow + "% !important;}";
        if (!firstUpload) {
            links_to_draw = finalResult[parseFloat(current.value) - 1][0];
            barlinks_to_draw = finalResult[parseFloat(current.value) - 1][1];
            fdglinks_to_draw = finalResult[parseFloat(current.value) - 1][2];
            // remove current visualization
            $("svg").empty();
            forceDirectedGraph(fdgNodes, fdglinks_to_draw);
        }
    }

    // Modify user settings
    min.onchange = function () {
        modified = true;
    };
    max.onchange = function () {
        modified = true;
    };
    windowSize.onchange = function () {
        modified = true;
    };
    stepSize.onchange = function () {
        modified = true;
    };
    current.onchange = function () {
        if (current.value > maxWindow) {
            alert("The maximum window size is " + maxWindow + "!");
        }
        modified = true;
    };

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
            maxWindow = csvdata.length;
            rangeslider.max = maxWindow;
            windowSize.value = maxWindow;
            stepSize.value = 1;
            setData(maxWindow);

            for (var i = 0; i < categories; i++) {
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

            var l = 0;

            corr.forEach(function (ele) {
                var link1 = [];
                link1.source = ele.column_x;
                link1.target = ele.column_y;
                link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
                link1.value = d3.round(link1.value, 3);
                links.push(link1);   //{source: String1, target: String2, value: Number}

                if (link1.source === link1.target) {
                    l = l + categories;
                }
                if (l > 0) {
                    barLinks.push(link1);

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
                    link2.value = d3.round(link2.value, 3);
                    fdgLinks.push(link2);
                }
                l--;
            });
            forceDirectedGraph(fdgNodes, fdgLinks);
            confirm("The max window size is " + maxWindow + " !");
        });
    });

    d3.selectAll(".updateclass")
        .on("click", function () {
            if (modified) {
                firstUpload = false;
                update();
            }
        });

    // Reset the data sources
    function reset() {
        data = [];
        cols = [];
        fdgNodes = [];
        links = [];
        barLinks = [];
        fdgLinks = [];
        links_to_draw = [];
        barlinks_to_draw = [];
        fdglinks_to_draw = [];
        categories = 1;
        maxWindow = 0;
        modified = false;
        firstUpload = true;
        finalResult = [];
        finalResults = [];
        $("svg").empty();
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
                return d.value > max.value || d.value < min.value ? 0 : 200 * Math.sqrt(1 - d.value * d.value);
            })
            .charge(-15000)
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
                            } else {
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
            });

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
                } else {
                    return 'rotate(0)';
                }
            });
            node_text.attr('transform', transform1);
        }

        function transform1(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }
    }

    function calculateCorrelation(start, range) {
        //{column_x: String1, column_y: String2, correlation: Number}
        var corr = start + range > maxWindow ? jz.arr.correlationMatrix(data.slice(start), cols) :
            jz.arr.correlationMatrix(data.slice(start, start + range), cols);
        var arrayLinks = [];
        var arrayBarLinks = [];
        var arrayFdgLinks = [];
        var l = 0;

        corr.forEach(function (ele) {
            // Modify minimal and maximal value
            var link1 = [];
            link1.source = ele.column_x;
            link1.target = ele.column_y;
            link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
            link1.value = d3.round(link1.value, 3);
            arrayLinks.push(link1);   //{source: String1, target: String2, value: Number}

            if (link1.source === link1.target) {
                l = l + categories;
            }
            if (l > 0) {
                arrayBarLinks.push(link1);

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
                link2.value = d3.round(link2.value, 3);
                arrayFdgLinks.push(link2);
            }
            l--;
        });

        finalResult[start] = [arrayLinks, arrayBarLinks, arrayFdgLinks];
        return [arrayLinks, arrayBarLinks, arrayFdgLinks];
    }

    // calculate the correlations based on different startpoint in parallel
    async function parallelcalculation() {
        var jobs = [];

        var j1 = current.value;
        var j2 = stepSize.value;
        var j = parseFloat(j1) + parseFloat(j2);

        while (j < maxWindow) {
            jobs.push(j - 1);
            j = j + parseFloat(stepSize.value);
        }

        var k = parseFloat(j1) - parseFloat(j2);
        while (k > 0) {
            jobs.push(k - 1);
            k = k - parseFloat(stepSize.value);
        }

        for (var i = 0; i < maxWindow; i++) {
            jobs.push(i);
        }

        let results = jobs.map(async (job) => await calculateCorrelation(job, windowSize.value));
        /*        for (const result of results) {
                    finalResults.push(await result);
                }*/
    }

    // Update the graph after user settings
    function update() {
        // check values of user settings
        if (min.value < 0) {
            alert("Minimum cannot be smaller than 0!");
            return;
        }
        if (max.value > 1) {
            alert("Maximum cannot be bigger than 1!");
            return;
        }
        if (min.value > max.value) {
            alert("Minimum cannot be bigger than Maximum!");
            return;
        }
        if (windowSize.value > maxWindow) {
            alert("Window size cannot be bigger than the whole window!");
            return;
        }
        if (stepSize.value > maxWindow) {
            alert("Step size cannot be bigger than the whole window!");
            return;
        }

        // remove current visualization
        $("svg").empty();
        [links_to_draw, barlinks_to_draw, fdglinks_to_draw] = calculateCorrelation(parseFloat(current.value) - 1, windowSize.value);
        forceDirectedGraph(fdgNodes, fdglinks_to_draw);

        rangeslider.step = stepSize.value;
        style.innerHTML = ".myslider::-webkit-slider-thumb { width: " + 100 * windowSize.value / maxWindow + "% !important;}";
        modified = false;

        finalResult.length = 0;

        parallelcalculation();
    }

    // Initialize transformArray and zoom function for each visualization method
    var transformArray3 = {k: 1, x: width / 2, y: height / 2};

    function zoomed3() {
        transformArray3 = {k: d3.event.scale, x: d3.event.translate[0], y: d3.event.translate[1]};
        g3.attr("transform", "translate(" + transformArray3.x + "," + transformArray3.y + ")scale(" + transformArray3.k + ")");
    }

    function zoomClick() {
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
    }

    d3.selectAll(".zoombutton").on('click', zoomClick);

});