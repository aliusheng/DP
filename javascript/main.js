/**
 * Created by shengliu on 2018-04-09.
 */
(function(win, $) {
    // option
    var workerChartOption = {};

    // series
    var workerChartSeries = {
        month: '',
        workerCardCount: '',
        workerCount: ''
    };

    // init Dom
    var workerChart = echarts.init(document.getElementById('workerEchart')), // 务工人员统计表的dom
        projectCount = $("#projectCount"),  // 项目总数
        workerCount = $("#workerCount"),    // 务工人员
        totalPayMoney = $("#totalPayMoney"),    // 代发工资
        accInAmount = $("#accInAmount");    // 账户缴存

    var chartsController = {
        workerSeries: function() { // 务工人员series获取
            $.get("getWorkerListData", function(result) {
                var data = result[0].obj;
                workerChartSeries.month = data.map(function(d) { return d.month });
                workerChartSeries.workerCardCount = data.map(function(d) { return d.workerCardCount });
                workerChartSeries.workerCount = data.map(function(d) { return d.workerCount });
                workerChart.setOption({
                    xAxis: {
                        data: workerChartSeries.month
                    },
                    series: [{
                        name: '登记人员',
                        data: workerChartSeries.workerCount
                    }, {
                        name: '开卡人数',
                        data: workerChartSeries.workerCardCount
                    }]
                });
            });
        },
        projectBaseData: function () { // 获取中间展示数据
            $.get("getProjectBaseData", function (result) {
                var data = result.obj;
                projectCount.text(data.projectCount);
                workerCount.text(data.workerCount);
                totalPayMoney.text(format.numChange(data.totalPayMoney));
                accInAmount.text(format.numChange(data.accInAmount));
            });
        },
        workerOptions: function() { // 务工人员option设置
            workerChartOption = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line',
                        label: {
                            backgroundColor: '#283b56'
                        }
                    }
                },
                legend: {
                    top: 25,
                    right: 0,
                    orient: 'horizontal',
                    itemWidth: 20,
                    itemHeight: 7,
                    data: [{
                        name: '登记人员',
                        textStyle: { color: '#45ab8c' }
                    }, {
                        name: '开卡人数',
                        textStyle: { color: '#00baff' }
                    }]
                },
                grid: {
                    top: '30%',
                    bottom: '12%',
                    left: '12%',
                    right: '12%'
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: true,
                    name: '月份',
                    nameTextStyle: {
                        color: '#2b98ed'
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#60abfc'
                        }
                    },
                    data: []
                },
                yAxis: {
                    type: 'value',
                    scale: true,
                    name: '人数',
                    nameTextStyle: {
                        color: '#2b98ed'
                    },
                    min: 0,
                    minInterval: 1, // 间隔为整数
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: ['#0c2e5b']
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#60abfc'
                        },
                        formatter: function(value, index) {
                            return format.numFormat(value);
                        }
                    },
                    boundaryGap: [0.2, 0.2]
                },
                series: [{
                    name: '登记人员',
                    type: 'bar',
                    barMaxWidth: '20',
                    itemStyle: {
                        normal: {
                            color: 'rgba(69, 171, 140, .73)',
                            borderColor: 'rgba(69, 171, 140, .28)',
                            borderWidth: 3
                        }
                    },
                    data: [100, 101]
                }, {
                    name: '开卡人数',
                    type: 'bar',
                    barMaxWidth: '20',
                    itemStyle: {
                        normal: {
                            color: 'rgba(0, 186, 255, .73)',
                            borderColor: 'rgba(69, 171, 140, .28)',
                            borderWidth: 3
                        }
                    },
                    data: [80, 81]
                }]
            };
            workerChart.setOption(workerChartOption);
        }
    };

    var format = {
        numFormat: function (value) { //Y轴大于1W的格式化
            let val;
            if (value >= 10000) {
                val = (value / 10000) + 'W';
            } else {
                val = value;
            }
            return val;
        },
        numChange: function (value) { //Y轴大于1W的格式化
            let val;
            if (value >= 0) {
                val = (value / 10000);
            } else {
                val = value;
            }
            return val;
        }
    }

    // 初始化
    function init() {
        // 务工人员柱状图
        chartsController.workerOptions();
        chartsController.workerSeries();
        // 中间项目信息
        chartsController.projectBaseData();
    }

    // 定时器
    function timer() {
        // 务工人员柱状图
        chartsController.workerSeries();
    }

    $(function() {
        // 初始化
        init();
        // 定时数据获取
        setInterval(() => {
                timer();
            }, 5000)
            // 窗口变化图表自适应
        $(window).resize(function() {
            workerChart.resize();
        });




        // 中心地图
        var myChart = echarts.init(document.getElementById('echarts'));
        myChart.setOption({
            bmap: {
                center: [120.13066322374, 30.240018034923],
                zoom: 14,
                roam: true,
                mapStyle: {
                    styleJson: [{
                            'featureType': 'land', //调整土地颜色
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#081734'
                            }
                        },
                        {
                            'featureType': 'building', //调整建筑物颜色
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#04406F'
                            }
                        },
                        {
                            'featureType': 'building', //调整建筑物标签是否可视
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'highway', //调整高速道路颜色
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#015B99'
                            }
                        },
                        {
                            'featureType': 'highway', //调整高速名字是否可视
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'arterial', //调整一些干道颜色
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#003051'
                            }
                        },
                        {
                            'featureType': 'arterial',
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'green',
                            'elementType': 'geometry',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'water',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#044161'
                            }
                        },
                        {
                            'featureType': 'subway', //调整地铁颜色
                            'elementType': 'geometry.stroke',
                            'stylers': {
                                'color': '#003051'
                            }
                        },
                        {
                            'featureType': 'subway',
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'railway',
                            'elementType': 'geometry',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'railway',
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'all', //调整所有的标签的边缘颜色
                            'elementType': 'labels.text.stroke',
                            'stylers': {
                                'color': '#313131'
                            }
                        },
                        {
                            'featureType': 'all', //调整所有标签的填充颜色
                            'elementType': 'labels.text.fill',
                            'stylers': {
                                'color': '#FFFFFF'
                            }
                        },
                        {
                            'featureType': 'manmade',
                            'elementType': 'geometry',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'manmade',
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'local',
                            'elementType': 'geometry',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'local',
                            'elementType': 'labels',
                            'stylers': {
                                'visibility': 'off'
                            }
                        },
                        {
                            'featureType': 'subway',
                            'elementType': 'geometry',
                            'stylers': {
                                'lightness': -65
                            }
                        },
                        {
                            'featureType': 'railway',
                            'elementType': 'all',
                            'stylers': {
                                'lightness': -40
                            }
                        },
                        {
                            'featureType': 'boundary',
                            'elementType': 'geometry',
                            'stylers': {
                                'color': '#8b8787',
                                'weight': '1',
                                'lightness': -29
                            }
                        }
                    ]
                }
            },
            series: [{
                type: 'scatter',
                coordinateSystem: 'bmap',
                data: [
                    [120, 30, 1]
                ]
            }]


        });
        var bmap = myChart.getModel().getComponent('bmap').getBMap();
        bmap.addControl(new BMap.MapTypeControl());


    })

})(window, jQuery);