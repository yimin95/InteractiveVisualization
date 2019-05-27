importScripts('https://unpkg.com/jeezy@1.12.11/lib/jeezy.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js');

onmessage = function (e) {
    var data = e.data;
    var results = [];
    var temp0 = (data[0] - 1) * data[2] / 50;
    var temp1 = data[0] * data[2] / 50;

    for (var i = parseInt(temp0); i < parseInt(temp1); i++) {
        var result = calculateCorrelation(i, data[1], data[2], data[3], data[4], data[5]);
        results.push(result);
    }
    postMessage(results);
};

function calculateCorrelation(i, value, maxWindow, data, cols, fdgNodes) {
    var arrayLinks = [];
    var arrayBarLinks = [];
    var arrayFdgLinks = [];
    var l = 0;

    var corr = i + value > maxWindow ? jz.arr.correlationMatrix(data.slice(i), cols) :
        jz.arr.correlationMatrix(data.slice(i, i + value), cols);
    corr.forEach(function (ele) {
        // Modify minimal and maximal value
        var link1 = [];
        link1.source = ele.column_x;
        link1.target = ele.column_y;
        link1.value = isNaN(ele.correlation) ? 0 : Math.abs(ele.correlation);
        link1.value = d3.round(link1.value, 3);
        arrayLinks.push(link1);   //{source: String1, target: String2, value: Number}

        if (link1.source === link1.target) {
            l = l + cols.length;
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

    return [arrayLinks, arrayBarLinks, arrayFdgLinks];
}