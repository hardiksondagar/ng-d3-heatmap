(function() {
    'use strict';


    app
        .directive('d3Heatmap', ['d3Service', function(d3Service) {
            return {
                restrict: 'EA',
                scope: {
                    data: "="
                },
                link: function(scope, iElement, iAttrs) {

                        d3Service.d3().then(function(d3) {
                            //UI configuration
                            var width = iElement.parent().width(),
                                itemSize = (width - 45) / 48,
                                cellSize = itemSize - 0.1,
                                height = 400,
                                margin = {
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 25
                                };

                            //formats
                            var minuteFormat = d3.time.format('%M'),
                                hourFormat = d3.time.format('%H'),
                                dayFormat = d3.time.format('%j'),
                                timeFormat = d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ'),
                                monthDayFormat = d3.time.format('%d'),
                                blockFormat = d3.time.format('%Y-%m-%d %H:%M');

                            //data vars for rendering
                            var dateExtent = null,
                                data = null,
                                dayOffset = 0,
                                colorCalibration = [
                                    '#1a9850',
                                    '#66bd63',
                                    '#a6d96a',
                                    '#d9ef8b',
                                    '#ffffbf',
                                    '#fee08b',
                                    '#fdae61',
                                    '#f46d43',
                                    '#d73027',

                                ],
                                dailyValueExtent = {};

                            //axises and scales
                            var axisWidth = itemSize * 48,
                                axisHeight = 0;

                            var xAxisScale = d3.scale.linear()
                                .range([0, axisWidth])
                                .domain([0, 24]);

                            var xAxis = d3.svg.axis()
                                .ticks(12)
                                .tickFormat(d3.format('3d'))
                                .scale(xAxisScale)
                                .orient('top');

                            var yAxisScale = d3.time.scale();


                            var yAxis = d3.svg.axis()
                                .orient('left')
                                .ticks(d3.time.days, 3)
                                .tickFormat(monthDayFormat);




                            initCalibration();
                            var svg = d3.select(iElement[0]).append('svg');
                            var heatmap = svg
                                .attr('width', width)
                                .attr('height', height)
                                .append('g')
                                .attr('width', width - margin.left - margin.right)
                                .attr('height', height - margin.top - margin.bottom)
                                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                            var rect = null;

                            function initCalibration() {
                                d3.select('[role="calibration"] [role="example"]').select('svg')
                                    .selectAll('rect').data(colorCalibration).enter()
                                    .append('rect')
                                    .attr('width', cellSize / 2)
                                    .attr('height', cellSize / 2)
                                    .attr('x', function(d, i) {
                                        return i * itemSize / 2;
                                    })
                                    .attr('fill', function(d) {
                                        return d;
                                    });
                            }

                            function renderColor() {
                                var renderByCount = false;
                                var max, min;
                                min = d3.min(scope.data, function(d) {
                                    if (d.value >= 0) {
                                        return d.value;
                                    } else {
                                        return null;
                                    }
                                });

                                max = d3.max(scope.data, function(d) {
                                    return d.value;
                                });

                                rect
                                    .filter(function(d) {
                                        return (d.value >= 0);
                                    })
                                    .transition()
                                    .delay(function(d) {
                                        return (dayFormat(d.date) - dayOffset) * 15;
                                    })
                                    .duration(500)
                                    .attrTween('fill', function(d, i, a) {
                                        //choose color dynamicly
                                        var colorIndex = d3.scale.quantile()
                                            .range(d3.range(colorCalibration.length))
                                            // .domain((renderByCount ? [0, 1200] : dailyValueExtent[d.day]));
                                            .domain((renderByCount ? [min, max] : dailyValueExtent[d.day]));
                                        return d3.interpolate(a, colorCalibration[colorIndex(d.value)]);
                                    });
                            }


                            // on window resize, re-render d3 canvas
                            window.onresize = function() {
                                return scope.$apply();
                            };
                            scope.$watch(function() {
                                return angular.element(window)[0].innerWidth;
                            }, function() {
                                return scope.render(scope.data);
                            });

                            // watch for data changes and re-render
                            scope.$watch('data', function(newVals, oldVals) {
                                return scope.render(newVals);
                            }, true);

                            // define render function
                            scope.render = function(heatmapData) {
                                // remove all previous items before render
                                svg.selectAll("*").remove();

                                if (!heatmapData) {
                                    return;
                                }

                                width = iElement.parent().width();
                                itemSize = width / 51.5;

                                var max, min;
                                min = d3.min(scope.data, function(d) {
                                    return d.timeStamp;
                                });

                                max = d3.max(scope.data, function(d) {
                                    return d.timeStamp;
                                });

                                var days = Math.ceil((max - min) / 86400);

                                height = (days + 6) * itemSize / 2;
                                cellSize = itemSize - 0.1;
                                axisWidth = itemSize * 48;

                                var xAxisScale = d3.scale.linear()
                                    .range([0, axisWidth])
                                    .domain([0, 24]);

                                var xAxis = d3.svg.axis()
                                    .ticks(12)
                                    .tickFormat(d3.format('3d'))
                                    .scale(xAxisScale)
                                    .orient('top');

                                var heatmap = svg
                                    .attr('width', width)
                                    .attr('height', height)
                                    .append('g')
                                    .attr('width', width - margin.left - margin.right)
                                    .attr('height', height - margin.top - margin.bottom)
                                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                                // var rect = null;

                                data = heatmapData;

                                data.forEach(function(valueObj) {

                                    var date = new Date(valueObj.timeStamp * 1000);
                                    valueObj['date'] = timeFormat.parse(date.toISOString());
                                    var day = valueObj['day'] = monthDayFormat(valueObj['date']);

                                    var dayData = dailyValueExtent[day] = (dailyValueExtent[day] || [1000, -1]);
                                    var pmValue = valueObj['value'];
                                    dayData[0] = d3.min([dayData[0], pmValue]);
                                    dayData[1] = d3.max([dayData[1], pmValue]);

                                });

                                dateExtent = d3.extent(data, function(d) {
                                    return d.date;
                                });

                                axisHeight = itemSize * (dayFormat(dateExtent[1]) - dayFormat(dateExtent[0]) + 1) / 2;

                                //render axises
                                yAxis.scale(yAxisScale.range([0, axisHeight]).domain([dateExtent[0], dateExtent[1]]));

                                var TimeTextTransform = parseInt(axisWidth) + parseInt(cellSize);
                                var DateTextTransform = parseInt(axisHeight) + parseInt(cellSize);

                                svg.append('g')
                                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                                    .attr('class', 'x axis')
                                    .call(xAxis)
                                    .append('text')
                                    .text('Time')
                                    .attr('transform', 'translate(' + TimeTextTransform + ',-10)');

                                svg.append('g')
                                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                                    .attr('class', 'y axis')
                                    .call(yAxis)
                                    .append('text')
                                    .text('Date')
                                    .attr('transform', 'translate(-10,' + DateTextTransform + ') rotate(-90)');

                                //render heatmap rects
                                dayOffset = dayFormat(dateExtent[0]);

                                /* scale day into 15 minutes slot */
                                var dateScale = d3.scale.linear()
                                    .range([95, 0])
                                    .domain([1439, 0]);

                                rect = heatmap.selectAll('rect')
                                    .data(data)
                                    .enter().append('rect')
                                    .attr('width', cellSize / 2)
                                    .attr('height', cellSize / 2)
                                    .attr('y', function(d) {
                                        return itemSize * (dayFormat(d.date) - dayOffset) / 2;
                                    })
                                    .attr('x', function(d) {
                                        var minutes = (hourFormat(d.date) * 60) + parseInt(minuteFormat(d.date));
                                        return (dateScale(minutes) * itemSize / 2);
                                    })
                                    .attr('fill', '#fefefe');

                                rect.filter(function(d) {
                                        return true;
                                    })
                                    .append('title')
                                    .html(function(d) {
                                        return '<b>Date    :  ' + blockFormat(d.date) + '<br>Value   :  ' + d.value + '</b>';
                                    });

                                renderColor();

                            };
                        });

                    } // link function ends

            };
        }]);


}());
