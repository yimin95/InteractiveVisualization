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
                bar(barlinks_to_draw);

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
                bar(barlinks_to_draw);

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
            bar(barlinks_to_draw);
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
                }
                l--;
            });
            bar(barLinks);
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
                var st = d.value > max.value || d.value < min.value ? "Filtered" : d3.round(d.value, 3);
                return "<div><span>Relationship:</span> <span style='color:white'>" + d.source + " and " + d.target + "</span></div>" +
                    "<div><span>Correlation:</span> <span style='color:white'>" + st + "</span></div>";
            });

        svg.call(tip);

        g2.selectAll("rect")
            .data(links)
            .enter()
            .append("rect")
            .style("fill", function (d) {
                if (d.value === 0) return "red";
                return d.value > max.value || d.value < min.value ? "black" : "steelblue";
            })
            .attr("x", function (d, i) {
                return i * (width / links.length);  //Bar width of 20 plus 1 for padding
            })
            .attr("y", function (d) {
                return d.value > max.value || d.value < min.value || d.value === 0 ? yScale(1) : yScale(d.value);
            })
            .attr("width", width / links.length)
            .attr("height", function (d) {
                return d.value > max.value || d.value < min.value || d.value === 0 ? height - yScale(1) : height - yScale(d.value);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
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
        bar(barlinks_to_draw,);

        rangeslider.step = stepSize.value;
        style.innerHTML = ".myslider::-webkit-slider-thumb { width: " + 100 * windowSize.value / maxWindow + "% !important;}";
        modified = false;

        finalResult.length = 0;

        parallelcalculation();
    }

    // Initialize transformArray and zoom function for each visualization method
    var transformArray2 = {k: 1, x: width / 2, y: height / 2};

    function zoomed2() {
        transformArray2 = {k: d3.event.scale, x: d3.event.translate[0], y: d3.event.translate[1]};
        g2.attr("transform", "translate(" + transformArray2.x + "," + transformArray2.y + ")scale(" + transformArray2.k + ")");
    }

    function zoomClick() {
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
    }

    d3.selectAll(".zoombutton").on('click', zoomClick);

});