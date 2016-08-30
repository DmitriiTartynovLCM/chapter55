angular.module('fentViz', []).
directive('d3LocationTrendChart', ['$parse', function($parse) {
    return {
        restrict: 'AE',
        scope: {
            groupChartData: '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('groupChartData', function(newVal, oldVal) {
                var canvasId = scope.canvasId;
                var chartTitle = scope.chartTitle;
                var chartData = scope.groupChartData;
                var chartDataCount = chartData.length - 1;

                var monthformat = d3.time.format("%B");
                var yearformat = d3.time.format("%Y");

                var quarter = function(date, i) {
                    var i = 0
                    if (i >= 0) {
                        var date2 = new Date();
                        date2.setMonth(date.getMonth() - 10);
                        q = Math.ceil((date2.getMonth()) / 3);
                        return "Q" + q;
                    }
                }

                var seriesColors = ["#b71c1c", "#0071bc", "#ffffff", "#ffffff"];
                var seriesLineStrokes = ["3.5px", "3.5px", "1.5px", "1.5px"];
                var seriesLineDash = ["0,0,0,0", "0,0,0,0", "2,2,2,2", "1,1,1,1"]
                var seriesPointShapes = ["circle", "circle", "circle", "circle"];
                var seriesPointWidth = ["1.5px", "1px", "1px", "1px"];
                var seriesPointFill = ["#a50f15", "#08519c", "#636363", "#636363"];
                var xLabel = "date";

                var margin = {
                    top: 30,
                    right: 200,
                    bottom: 50,
                    left: 30
                };

                var width = 500;
                var height = 300;

                var canvasWidth = d3.select(element[0]).attr("width");
                var canvasHeight = d3.select(element[0]).attr("height");
                var width = canvasWidth - margin.left - margin.right;
                var height = canvasHeight - margin.top - margin.bottom;
                var yearformat = d3.time.format("%Y");

                var parseDate = d3.time.format("%Y%m%d").parse;

                var bisectDate = d3.bisector(function(d) {
                    return d.date;
                }).left;

                var end = parseDate("20160101");

                var x = d3.scale.ordinal().rangePoints([0, width]);
                var x2 = d3.scale.ordinal().rangePoints([0, width]);

                //var x = d3.time.scale()
                //         .domain([chartData[0].date, chartData[chartDataCount].date])
                //    .range([0, 91]);

                //var x2 = d3.time.scale()
                //         .domain([chartData[0].date, chartData[chartDataCount].date])
                //    .range([0, 91]);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var color = d3.scale.ordinal()
                    .range(seriesColors);

                var lineStroke = d3.scale.ordinal()
                    .range(seriesLineStrokes);

                var lineDash = d3.scale.ordinal()
                    .range(seriesLineDash);

                var pointShape = d3.scale.ordinal()
                    .range(seriesPointShapes);

                var pointWidth = d3.scale.ordinal()
                    .range(seriesPointWidth);

                var pointFill = d3.scale.ordinal()
                    .range(seriesPointFill);

                var xAxis_fent = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(d3.time.months, 3)
                    //.tickSize(5, 0)
                    .tickFormat(quarter);


                var xAxis2_fent = d3.svg.axis()
                    .scale(x)
                    .ticks(d3.time.years, 1)
                    .tickFormat(yearformat)
                    .tickSize(5, 0)
                    .orient("bottom");

                var yAxis_fent = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(4)
                    .tickSize(5, 0)
                    .tickPadding(3);

                //create tooltipFent

                // add a tooltipFent to the page - not to the svg itself!
                var tooltipFent = d3.select("body")
                    .append("div")
                    .attr("class", "tooltipFent");

                var line = d3.svg.line()
                    //.interpolate("monotone")
                    .x(function(d) {
                        return x(d.label);
                    })
                    .y(function(d) {
                        return y(d.value);
                    });


                var $lines_fent = d3.select(element[0]).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                /*  var benchMark = svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("fill", "#C2EBC9")
                    .attr("height", 120);

                var threshold = svg.append("rect")
                    .attr("x", 0)
                    .attr("y", 120)
                    .attr("width", width)
                    .attr("fill", "#FFE97F")
                    .attr("height", 50);
		*/
                var varSeries = d3.keys(chartData[0]).filter(function(key) {
                    return key !== xLabel;
                });

                color.domain(varSeries);
                lineStroke.domain(varSeries);
                lineDash.domain(varSeries);
                pointShape.domain(varSeries);
                pointWidth.domain(varSeries);
                pointFill.domain(varSeries);

                var seriesData = varSeries.map(function(name) {
                    return {
                        name: name,
                        values: chartData.map(function(d) {
                            return {
                                name: name,
                                label: d[xLabel],
                                value: +d[name]
                            };
                        })
                    };
                });


                x.domain(chartData.map(function(d) {
                    return d.date;
                }));

                x2.domain(chartData.map(function(d) {
                    return d.date;
                }));

                y.domain([
                    d3.min(seriesData, function(c) {
                        return d3.min(c.values, function(d) {
                            return d.value - 4;
                        });
                    }),
                    d3.max(seriesData, function(c) {
                        return d3.max(c.values, function(d) {
                            return d.value + 2;
                        });
                    })
                ]);

                $lines_fent.append("g")
                    .attr("class", "x axis_fent")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis_fent)
                    .append("path")
                    .attr("class", "line")
                    .style("stroke-width", "1.5px")
                    .call(xAxis_fent);

                $lines_fent.append("g")
                    .attr("class", "x axis2_fent")
                    .attr("transform", "translate(0," + (height + 15) + ")")
                    .call(xAxis2_fent);

                //         svg.append("g")
                // .attr("class", "x axis").append("path")
		//          .attr("class","line")

                $lines_fent.append("g")
                    .attr("class", "y axis_fent")
                    .call(yAxis_fent);

                var series = $lines_fent.selectAll(".series")
                    .data(seriesData)
                    .enter().append("g")
                    .attr("class", "seriesData");

		//console.log(series);

                series.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) {
                        return line(d.values);
                    })
                    .style("stroke", function(d) {
                        return color(d.name);
                    })
                    .style("stroke-width", function(d) {
                        return lineStroke(d.name);
                    })
                    .style("stroke-dasharray", function(d) {
                        return lineDash(d.name);
                    })
                    .style("fill", "none");



                $lines_fent.append("text")
                    .attr("class", "aside-note")
                    .attr("x", width + 10)
                    .attr("y", y(chartData[8].Cocaine) - 7)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .text("Cocaine")
                    .style("fill", "$color-white")
                    .style("font-weight", "normal");

                $lines_fent.append("text")
                    .attr("class", "aside-note")
                    .attr("x", width + 10)
                    .attr("y", y(chartData[8].Benzodiazepine) - 7)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .text("Benzodiazepine")
                    .style("fill", "$color-white")
                    .style("font-weight", "normal");

                $lines_fent.append("text")
                    .attr("class", "aside-note")
                    .attr("x", width + 10)
                    .attr("y", y(chartData[8].Heroin) - 7)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .text("Heroin")
                    //.style("fill", "#08519c")
                    .style("fill", "#fff")
                    .style("font-size", "15px")
                   // .style("font-weight", "bold");

                $lines_fent.append("text")
                    .attr("class", "aside-note")
                    .attr("x", width + 10)
                    .attr("y", y(chartData[8].Fentanyl) - 7)
                    .attr("dy", "1em")
                    .style("text-anchor", "start")
                    .text("Fentanyl")
                    .style("font-size", "15px")
                    //.style("fill", "#f44336")
                    .style("fill", "#fff")
                   // .style("font-weight", "bold");



                //add point to line
                // series.selectAll(".point")
                //     .data(function(d) {
                //         return d.values;
                //         console.log(d.values);
                //     })
                //     .enter().append("path")
                //     .attr("transform", function(d) {
                //         return "translate(" + x(d.label) + "," + y(d.value) + ")";
                //     })
                //     .attr("d", d3.svg.symbol().type("circle").size(15))
                //  .attr("class", "point")
                //     .style("fill", function(d) {
                //         return pointFill(d.name);
                //     })
                //     .style("stroke", function(d) {
                //         return color(d.name);
                //     })
                //     .style("stroke-width", function(d) {
                //         return lineStroke(d.name);
                //     });

                /*======================================================================
                 Mouse Functions
                ======================================================================*/
                var focus = $lines_fent.append("g")
                    .attr("class", "focus")
                    .style("display", "none");

                focus.append("circle")
                    .attr("r", 6)
                    .style("stroke-width", 1);
                //.transition()
                //.duration(500)
                //.attr("r", 50)
                //.transition(500)
                //.attr("r",500);

                d3.selectAll("g.seriesData")
                    .on("mouseover", mouseoverFunc)
                    .on("mouseout", mouseoutFunc)
                    .on("mousemove", mousemoveFunc);

                function mouseoutFunc() {

                    d3.selectAll("path.line").classed("unfocused", false).classed("focused", false);
                    d3.selectAll("path.point").classed("unfocused", false).classed("focused", false).attr("d", d3.svg.symbol().type("circle").size(15)).style("fill-opacity", "1");
                    tooltipFent.style("display", "none"); // this sets it to invisible!
                    focus.style("display", "none");
                }

                function mouseoverFunc(d, i) {

                    d3.selectAll("path.line").classed("unfocused", true);
                    d3.selectAll("path.point").classed("unfocused", true).attr("d", d3.svg.symbol().type("circle").size(10)).style("fill-opacity", "0");
                    // below code sets the sub set of data even more - they only go "unfocused" if a certain line is selected. Otherwise, they remain at the regular opacity. .
                    //         if(!d3.select(this).select("path.line").classed("ssAfrica")) {
                    //             d3.selectAll("path.ssAfrica").classed("unfocused", false);
                    //         }

                    d3.select(this).select("path.line").classed("unfocused", false).classed("focused", true);
                    //d3.select(this).select("path.point").classed("unfocused", false).classed("focused", true).attr("d", d3.svg.symbol().type("circle").size(0));
                    var x0 = d3.mouse(this)[0];
                    var y0 = d3.mouse(this)[1]
                    var y1 = Math.round((y.invert(y0) * 10) / 10);
                    var percentVal = d3.format(".0%")(y1 / 100)
                        //console.log(y1)
                    tooltipFent
                        .style("display", null) // this removes the display none setting from it
                        .html(
                            "<p><span class='tooltipFentHeader sans'>" + percentVal + "</span></p>"
                        );
                    //console.log(d.rates[i]);
                    //console.log(d3.select(this).select("path.point"));
                    focus.style("display", null);
                }

                function mousemoveFunc(d) {



                    //console.log("events", window.event, d3.event);
                    var x0 = d3.mouse(this)[0];
                    var y0 = d3.mouse(this)[1]
                    var y1 = Math.round((y.invert(y0) * 10) / 10);
                    var percentVal = d3.format(".0%")(y1 / 100);

                    focus.attr("transform", "translate(" + x0 + "," + y0 + ")");



                    tooltipFent
                        .style("top", (d3.event.pageY - 45) + "px")
                        .style("left", (d3.event.pageX + 5) + "px")
                        .html(
                            "<p><span class='tooltipFentHeader sans'>" + percentVal + "</span></p>"
                        );
                }
            });
        }
    }
}])
.controller('Ctrl', ['$scope', function($scope) {
    //var date = new Date(2014, 7, 1);
    var date = new Date("01/01/2014");
    //var date2 = new Date(2014, 10, 1);
    var date2 = new Date("04/01/2014");
    //var date3 = new Date(2015, 1, 1);
    var date3 = new Date("07/01/2014");
    //var date4 = new Date(2015, 4, 1);
    var date4 = new Date("10/01/2014");
    //var date5 = new Date
    var date5 = new Date("01/01/2015");
    //var date6 = new Date(2014, 10, 1);
    var date6 = new Date("04/01/2015");
    //var date7 = new Date(2015, 1, 1);
    var date7 = new Date("07/01/2015");
    //var date8 = new Date(2015, 4, 1);
    var date8 = new Date("10/01/2015");
    //var date = new Date(2014, 7, 1);
    var date9 = new Date("01/01/2016");

    //alert(date);
    var chartData = [{
        "date": date,
        "Fentanyl": "42",
        "Heroin": "59",
        "Benzodiazepine": "62",
        "Cocaine": "30"
    }, {
        "date": date2,
        "Fentanyl": "38",
        "Heroin": "69",
        "Benzodiazepine": "60",
        "Cocaine": "40"
    }, {
        "date": date3,
        "Fentanyl": "30",
        "Heroin": "68",
        "Benzodiazepine": "58",
        "Cocaine": "28"
    }, {
        "date": date4,
        "Fentanyl": "55",
        "Heroin": "58",
        "Benzodiazepine": "50",
        "Cocaine": "24"
    }, {
        "date": date5,
        "Fentanyl": "61",
        "Heroin": "53",
        "Benzodiazepine": "51",
        "Cocaine": "27"
    }, {
        "date": date6,
        "Fentanyl": "63",
        "Heroin": "56",
        "Benzodiazepine": "55",
        "Cocaine": "28"
    }, {
        "date": date7,
        "Fentanyl": "58",
        "Heroin": "50",
        "Benzodiazepine": "53",
        "Cocaine": "38"
    }, {
        "date": date8,
        "Fentanyl": "65",
        "Heroin": "48",
        "Benzodiazepine": "52",
        "Cocaine": "28"
    }, {
        "date": date9,
        "Fentanyl": "67",
        "Heroin": "42",
        "Benzodiazepine": "51",
        "Cocaine": "28"
    }];

    $scope.myData = chartData;
}]);
