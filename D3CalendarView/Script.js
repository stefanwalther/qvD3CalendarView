// Support for Visual Studio Intellisense
/// <reference path="lib/js/QvExtensionFramework2.js" />

function D3CalendarView_Init() {
    Qva.AddExtension("D3CalendarView",
        function () {

            var _ExtensionName = 'D3CalendarView';
            var _LoadUrl = Qva.Remote + (Qva.Remote.indexOf('?') >= 0 ? '&' : '?') + 'public=only' + '&name=';
            var _t = this;


            // Define one or more styles sheets to be used within the extension
            var cssFiles = [];
            cssFiles.push('Extensions/' + _ExtensionName + '/lib/css/QvExtensionFramework.css');
            cssFiles.push('Extensions/' + _ExtensionName + '/lib/css/style.css');
            cssFiles.push('Extensions/' + _ExtensionName + '/lib/css/colorbrewer.css');
            for (var i = 0; i < cssFiles.length; i++) {
                Qva.LoadCSS(_LoadUrl + cssFiles[i]);
            }

            // Define one or more JavaScript files to be loaded within the extension
            var jsFiles = [];
            jsFiles.push('Extensions/' + _ExtensionName + '/lib/js/QvExtensionFramework2.js');
            jsFiles.push('Extensions/' + _ExtensionName + '/lib/js/d3.v3.min.js');
            jsFiles.push('Extensions/' + _ExtensionName + '/lib/js/calendar.js');
            Qv.LoadExtensionScripts(jsFiles, function () {

                var _extFW = new QvExtensionFramework2();
                _extFW.initialize(
                    {
                        doTraceOutput: false,
                        doPersistSettings: true,
                        doClearConsoleOnInit: false,
                        qvExtension: _t
                    });



                var qvData = getData();
                //console.log(qvData);

                if (qvData === null || qvData.length === 0) {
                    return;
                }

                var minYear = getMinYear(qvData);
                var maxYear = getMaxYear(qvData);
                //console.log('minYear: ' + minYear);
                //console.log('maxYear: ' + maxYear);

                if ((maxYear - minYear) > 10) {

                    $(_t.Element).empty();
                    _extFW.ValidationErrors.add('Only 10 years can be displayed at maximum');
                    _extFW.ValidationErrors.display();
                    return;
                }
                RenderContainer();


                RenderChart(qvData, minYear, maxYear);
                //_extFW.LoadingPanel.hide();

                function RenderContainer() {

                    $(_t.Element).empty();

                    // Container
                    var $container = $(document.createElement('div'));
                    _extFW.Settings.add('ContainerId', 'Container_' + _extFW.Settings.getUniqueId());
                    $container.attr('id', _extFW.Settings.get('ContainerId'));
                    $container.addClass('D3CV_Container');

                    // Chart
                    var $chart = $(document.createElement('div'));
                    _extFW.Settings.add('ChartId', 'Chart_' + _extFW.Settings.getUniqueId());
                    $chart.attr('id', _extFW.Settings.get('ChartId'));
                    $chart.addClass('D3CV_Chart');
                    $container.append($chart);

                    $(_t.Element).append($container);

                }

                function getData() {

                    var data = [];

                    var counter = -1;
                    for (var i = 0; i < _t.Data.Rows.length; i++) {
                        counter++;
                        var dateKey = _t.Data.Rows[i][0].text;
                        var val = parseFloat(_t.Data.Rows[i][1].data);
                        var valToolTip = (_extFW.Utils.nullOrEmpty(_t.Data.Rows[i][2].text) ? 'Value: ' + val : _t.Data.Rows[i][2].text);
                        data[counter] = { Date: dateKey, Measure: val, ToolTip: valToolTip };
                    }
                    //console.log(data);
                    return data;
                }

                //#region Helper Functions


                function getMinYear(data) {
                	/// <summary>
                	/// Returns the minimum year value.
                	/// </summary>
                	/// <param name="data"></param>
                	/// <returns type="">minimum year</returns>
                    var s = d3.values(data)
                        .sort(function (a, b) { return d3.ascending(a.Date, b.Date); })
                        [0];
                    return parseInt(s.Date.substr(0, 4));
                }

                function getMaxYear(data) {
                	/// <summary>
                	/// Returns the maximum year value.
                	/// </summary>
                	/// <param name="data"></param>
                	/// <returns type=""></returns>
                    var s = d3.values(data)
                        .sort(function (a, b) { return d3.descending(a.Date, b.Date); })
                        [0];
                    return parseInt(s.Date.substr(0, 4));
                }

                function getMinValue(data) {
                	/// <summary>
                	/// Return the absolute minimum value.
                	/// </summary>
                	/// <param name="data"></param>
                	/// <returns type=""></returns>
                    var s = d3.values(data)
                        .sort(function (a, b) { return d3.ascending(a.Measure, b.Measure); })
                        [0];
                    return parseFloat(s.Measure);
                }

                function getMaxValue(data) {
                	/// <summary>
                	/// Return the absolute maximum value.
                	/// </summary>
                	/// <param name="data"></param>
                	/// <returns type=""></returns>
                    var s = d3.values(data)
                        .sort(function (a, b) { return d3.descending(a.Measure, b.Measure); })
                        [0];
                    return parseFloat(s.Measure);
                }
                //#endregion

                function RenderChart(qvData, minYear, maxYear) {

                    var w = _extFW.config.qvExtension.GetWidth() - 25,
                        pw = 14,
                        z = ~~((w - pw * 2) / 53),
                        ph = z >> 1,
                        h = z * 7;

                    var vis = d3.select('#' + _extFW.Settings.get('ChartId'))
                      .selectAll("svg")
                        .data(d3.range(minYear, (maxYear + 1)))
                      .enter().append("svg:svg")
                        .attr("width", w)
                        .attr("height", h + ph * 2)
                        .attr("class", "RdYlGn")
                      .append("svg:g")
                        .attr("transform", "translate(" + pw + "," + ph + ")");

                    vis.append("svg:text")
                        .attr("transform", "translate(-6," + h / 2 + ")rotate(-90)")
                        .attr("text-anchor", "middle")
                        .text(function (d) { return d; });

                    vis.selectAll("rect.D3CV_day")
                        .data(calendar.dates)
                      .enter().append("svg:rect")
                        .attr("x", function (d) { return d.week * z; })
                        .attr("y", function (d) { return d.day * z; })
                        .attr("class", "D3CV_day")
                        .attr("width", z)
                        .attr("height", z);

                    vis.selectAll("path.D3CV_month")
                        .data(calendar.months)
                      .enter().append("svg:path")
                        .attr("class", "D3CV_month")
                        .attr("d", function (d) {
                            return "M" + (d.firstWeek + 1) * z + "," + d.firstDay * z
                                + "H" + d.firstWeek * z
                                + "V" + 7 * z
                                + "H" + d.lastWeek * z
                                + "V" + (d.lastDay + 1) * z
                                + "H" + (d.lastWeek + 1) * z
                                + "V" + 0
                                + "H" + (d.firstWeek + 1) * z
                                + "Z";
                        });


                    var data = d3.nest()
                        .key(function (d) { return d.Date; })
                        //.rollup(function (d) { return d[0].Measure; })
                        .rollup(function (d) { return { "Measure": d[0].Measure, "ToolTip": d[0].ToolTip }; })
                        .map(qvData);

                    var minValue = getMinValue(qvData);
                    var maxValue = getMaxValue(qvData);
                    //console.log('Min Value: ' + minValue);
                    //console.log('Max Value: ' + maxValue);

                    // If only a single value is displayed, we have to prevent that min and max value are equal.
                    if (minValue === maxValue) {
                        minValue = minValue * 2;
                        maxValue = maxValue * 2;
                    }

                    var divTooltip = d3.select('#' + _extFW.Settings.get('ChartId')).append('div')
                        .attr('class', 'D3CV_ToolTip')
                        .style('opacity', 0);

                    var divAction = d3.select('#' + _extFW.Settings.get('ChartId')).append('div')
                        .attr('class', 'D3CV_ToolTip')
                        .style('opacity', 0);

                    var color = d3.scale.quantize()
                            //.domain([-.05, .05])
                            .domain([minValue, maxValue])
                            .range(d3.range(9))
                    ;

                    var leftOffset = $('#' + _extFW.Settings.get('ChartId')).offset().left;
                    var topOffset = $('#' + _extFW.Settings.get('ChartId')).offset().top;

                    

                    vis.selectAll("rect.D3CV_day")
                        //.attr("class", function (d) { return "D3CV_day q" + ((d !== 'undefined' && d.Date !== 'undefined' && data[d.Date].Measure !== 'undefined') ? color(data[d.Date].Measure) : 'xx') + "-9"; })
                        .attr("class", function (d) {

                            // In case we have selected only a single date, if we have only 
                            // a single items, let's not choose one of the colors but gray instead
                            if (!_extFW.Utils.nullOrEmpty(data[d.Date])) {
                                if (Object.keys(data).length > 1) {
                                    return "D3CV_day q" + color(data[d.Date].Measure) + "-9";
                                } else {
                                    return "D3CV_day D3CV_day_single";
                                }
                            }
                            else {
                                return "D3CV_day";
                            }
                            
                        })
                        .on('click', function (d) {
                            //console.log('Select Texts in Column' + d.Date);
                            _t.Data.SelectTextsInColumn(0, true, d.Date);

                            //console.log('Check it ...');
                            //console.log(d);
                            //console.log(d.Date);
                            //console.log(data[d.Date]);

                            //Prototype code for adding a right-click context menu to the chart.
                            //divAction.transition()
                            //    .duration(200)
                            //    .style('opacity', .99)
                            //    .style('display', 'block');
                            //divAction.html('Select date <br/>Select week<br/>Select month')
                            //    .style('left', (d3.event.pageX) - leftOffset + 'px')
                            //    .style('top', ((d3.event.pageY) - divTooltip.attr('height') - topOffset + 5) + 'px');
                        })
                        .on('mouseover', function (d) {
                            //console.log(data[d.Date]);
                            divTooltip.transition()
                                .duration(200)
                                .style('opacity', .99)
                                .style('display', 'block');
                            divTooltip.html('Date: ' + d.Date + '<br/>' + data[d.Date].ToolTip) //data[d.Date].ToolTip
                                .style('left', (d3.event.pageX) - leftOffset + 'px')
                                .style('top', ((d3.event.pageY) - divTooltip.attr('height') - topOffset + 5) + 'px');
                        })
                        .on('mouseout', function (d) {
                            divTooltip.transition()
                                .duration(200)
                                .style('opacity', 0)
                                .style('display', 'none');
                        })

                    // Do not display the title anymore since we have the tooltip
                    //.append("svg:title")
                    //  .text(function (d) { return d.Date + ": " + (data[d.Date]); })

                    ;




                } // RenderChart

            });

        });
}

D3CalendarView_Init();