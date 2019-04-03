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

        // var zoom = d3.behavior.zoom().scaleExtent([1, 10]).on("zoom", zoomed);
        var zoom = d3.zoom().on("zoom", zoomed);

        var svg = d3.select("svg")
        .call(zoom)
            ,
            width = +svg.attr("width"),
            height = +svg.attr("height")
        ;

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height);

        var color = d3.scaleOrdinal(d3.schemeCategory20);

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

        var url = URL.createObjectURL(csvFile);

        // var link, node, text;
        var g = svg.append("g")
            .attr("class", "everything")
            .attr("transform", function (d) {
                return "translate(" + d + ")";
            });
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

            corr.forEach(ele => {
                var link1 = [];
                link1.source = ele.column_x;
                link1.target = ele.column_y;
                link1.value = isNaN(ele.correlation) ? 0 : (1 - Math.abs(ele.correlation) * Math.abs(ele.correlation));
                links.push(link1);   //{source: String1, target: String2, value: Number}
            });

            var graph = [];
            graph.nodes = nodes;
            graph.links = links;

            var link = g.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graph.links)
                .enter().append("line")
                .attr("stroke-width", function (d) {
                    return Math.sqrt(d.value);
                })
                
                ;

            var node = g.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("r", 15)
                .attr("fill", function (d) {
                    return color(d.group);
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                // .attr("transform", function (d) {
                //     return "translate(" + d + ")";
                // })
                ;

            node.append("title")
                .text(function (d) {
                    return d.id;
                });

            var text = g.append("g")
                .selectAll("text")
                .data(graph.nodes)
                .enter().append("text")
                .attr("x", 800)
                .attr("y", ".31em")
                .text(function (d) {
                    return d.id;
                })
                // .attr("transform", function (d) {
                //     return "translate(" + d + ")";
                // })
                ;

            simulation
                .nodes(graph.nodes)
                .on("tick", ticked);

            simulation.force("link")
                .links(graph.links);

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

                text
                    .attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y;
                    });
            }
        });

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
        var  transformArray = {k:1,x:width/2,y:height/2};
        function zoomed() {
            transformArray = d3.event.transform;
            console.log(transformArray);
            g.attr("transform",d3.event.transform);
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
            g.attr("transform",transformArray);
            // interpolateZoominterpolateZoom([view.x, view.y], view.k);
        }

        d3.selectAll('button').on('click', zoomClick);

    });
});


// Create the svg canvas
svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(zoom)
    .append("svg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//        svg = d3.select("#chart")
//            .call(zoom)
//            ,
//            width = svg.attr("width"),
//            height = svg.attr("height")
//        ;

//        svg.append("rect")
//            .attr("class", "overlay")
//          .attr("width", width)
//        .attr("height", height);

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
/*
        svg.append('circle')
            .attr('r', 15)
            .attr('cx', width / 2)
            .attr('cy', height / 2);
*/
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

//Set up the force layout
var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

//Creates the graph data structure out of the json data
force.nodes(nodes)
    .links(links)
    .start();

//Create all the line svgs but without locations yet
var link = svg.selectAll(".link")
    .data(links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) {
        return Math.sqrt(10*d.value);
    });

//Do the same with the circles for the nodes - no
var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .style("fill", "red")
    .call(force.drag);


force.on("tick", function () {
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
});

//       node.call(force.drag());
//        force.start();

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
