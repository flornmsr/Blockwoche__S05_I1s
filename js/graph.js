var relevantDates = [new Date("2020-09-18"),
new Date("2020-09-25"), new Date("2020-10-02"),
new Date("2020-10-09"), new Date("2020-10-16"),
new Date("2020-10-23"), new Date("2020-10-30"),
    // new Date("2020-11-06")
]

var maxValue = 0;
var filteredData;


function loadGraph() {
    var margin = { top: 20, right: 20, bottom: 100, left: 50 },
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    // parse the date / time
    // var parseTime = d3.timeParse("%d-%b-%y");

    // set the ranges
    var x = d3.scaleTime().range([0, width - 250]);
    var y = d3.scaleLinear().range([height, 0]);

    var valueline = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.stepPerMin); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").select(".canvas").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.json("xml/test.json", dataa => {
        data.forEach(function (d) {
            d.date = setSameDate(new Date(d.date))
            // d.date = new Date(d.date)
            d.stepPerMin = +d.stepPerMin;

        });

        // Scale the range of the data
        x.domain(d3.extent(data, function (d) { return d.date; }));
        if(!allDates){
            y.domain([0, d3.max(data, function (d) { return d.stepPerMin; })]);
        }else {
            relevantDates.forEach( date => {
                filteredData = getFilteredData(date);
                filteredData.forEach( value => {
                    filteredData.forEach(d => {
                        if (maxValue < value.stepPerMin) {
                            maxValue = value.stepPerMin;
                        }
                    })
                })
            })
            y.domain([0, maxValue])
        }

        // Add the valueline path.
        svg.append("path")
            .data([data])
            .attr("class", "line2")
            .attr("stroke", function (d) { return getColor(0) })
            .attr("d", valueline);

        // Add the X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%H:%M")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("dy", "-2.25em")
            .attr("transform", "rotate(-90)")
            .text("Schritte pro Minute");

        if (allDates) {
            stepSum = 0;
            relevantDates.forEach((element, index) => {
                filteredData = getFilteredData(element);
                filteredData.forEach(d => {
                    stepSum = stepSum + d.stepPerMin;
                    d.date = setSameDate(new Date(d.date));
                    d.stepPerMin = +d.stepPerMin;
                })
                svg.append("path")
                    .data([filteredData])
                    .attr("class", "line2")
                    .attr("stroke", function (d) { return getColor(index) })
                    .attr("d", valueline)


            });
            document.getElementById("steps").innerHTML = "∅" + Math.floor(stepSum / relevantDates.length);
            document.getElementById("detailInfo").style.display = "none"


            var lineLegend = svg.selectAll(".lineLegend").data(relevantDates)
                .enter().append("g")
                .attr("class", "lineLegend")
                .attr("transform", function (d, i) {
                    position = width - margin.right - 220
                    return "translate(" + position + "," + (i * 20) + ")";
                });
            lineLegend.append("text").text(function (d) { return `${d.toDateString()}`; })
                .attr("transform", "translate(15,9)"); //align texts with boxes
            lineLegend.append("rect")
                .attr("fill", function (d, i) { return getColor(relevantDates.indexOf(d)); })
                .attr("width", 10).attr("height", 10);
        }



    })

}

function setSameDate(date) {
    date = new Date(date.setFullYear(1998));
    date = new Date(date.setMonth(12));
    date = new Date(date.setDate(17));
    return date
}

function getColor(index) {
    colors = ["#CF4232", "#FAC023", "#068675", "#3EB2F0", "#5057BF", "#FFAAE4", "#402300"]
    return colors[index % 7]
}