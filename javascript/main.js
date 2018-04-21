/**
 * Created by shengliu on 2018-04-09.
 */
(function (win, $) {
    // option
    var workerChartOption = {}; // 务工人员

    // series
    var workerChartSeries = { // 务工人员统计表数据
        month: '',
        workerCardCount: '',
        workerCount: ''
    },
        projectBaseData = { // 项目信息数据
            accInAmount: '',
            projectCount: '',
            wagesAmount: '',
            workerCount: ''
        },
        warningImgUrls = { // 视频监控图片来源
            imgAddress: ''
        },
        kqRecordData = { // 实时考勤统计数据
            projectPresentCount: '',
            workerGroupPresentCount: '',
            workerPresentCount: ''
        },
        presentRecordData = [{ // 实时项目考勤统计
            proName: '',
            warningCount: '',
            workerGroupPresentCount: '',
            workerPresentCount: ''
        }],
        accInfoData = { // 专户交易数据
            name: ['当前账户余额', '累计发放金额', '累计入账金额'],
            accBalance: '',
            accCount: '',
            accInAmount: '',
            wagesAmount: '',
            wagesCount: ''
        },
        accDetailData = { // 专户详情数据
            name: ['新增专户数量', '专户收缴总额', '工资发放总额'],
            monthData: [],
            dayData: []
        },
        projectMapData = { // 获取项目信息数据,用于地图展示
            latitude: '',
            longitude: '',
            name: '',
            proId: '',
            warningStatus: ''
        },
        projectMapInfoData = { // 项目地图上项目详细信息
            jsOrgan: '',
            zcOrgan: '',
            jlOrgan: '',
            name: '',
            workerNumber: ''
        },
        recordListLength = 0; // 项目考勤列表获取可容纳条目数

    // 文字翻滚定时器
    var dataInterval;

    // init Dom
    var $workerChart = echarts.init(document.getElementById('workerEchart')), // 务工人员统计表的dom
        $projectCount = $("#projectCount"),  // 项目总数
        $workerCount = $("#workerCount"),    // 务工人员
        $totalPayMoney = $("#totalPayMoney"),    // 代发工资
        $accInAmount = $("#accInAmount");    // 账户缴存
    $imgBig = $("#img-big"), // 预警图片dom
        $imgSmt = $("#img-sm-t"), // 预警图片dom
        $imgSmb = $("#img-sm-b"), // 预警图片dom
        $projectPresentCount = $("#projectPresentCount"), // 考勤统计在建项目
        $workerGroupPresentCount = $("#workerGroupPresentCount"), // 考勤统计班组
        $workerPresentCount = $("#workerPresentCount"), // 考勤统计工人数量
        $wagesWrap = $(".wages-wrap"), // 项目考勤列表标题
        $accInfoChart = echarts.init(document.getElementById('accInfoEchart')), //专户列表图表
        $accCount = $("#accCount"), // 专户个数
        $wagesCount = $("#wagesCount"), // 工资笔数
        $accDetailchart = echarts.init(document.getElementById('accDetailEchart')), //专户详情图表
        $centerContainer = $(".centerContainer"), // 地图区域DOM
        $projectDataPanel = $(".projectDataPanel"),
        $projectMapPanel = $(".projectMapPanel"),
        $topTime = $("#topTime");

    var chartsController = {
        getTime: function () { // 时间
            var timeInterval = setInterval(function () {
                $topTime.text(format.getTimeStr(new Date));
            }, 1000);
        },
        getWorkerSeries: function () { // 务工人员series获取
            $.get("getWorkerListData", function (result) {
                if (result[0].errNo === 0) {
                    var data = result[0].obj;
                    workerChartSeries.month = data.map(function (d) { return d.month });
                    workerChartSeries.workerCardCount = data.map(function (d) { return d.workerCardCount });
                    workerChartSeries.workerCount = data.map(function (d) { return d.workerCount });
                    $workerChart.setOption({
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
                } else {
                    alert(result[0].errMsg);
                }
            });
        },
        getProjectBaseData: function () { // 获取中间展示数据
            $.get("getProjectBaseData", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    projectBaseData.projectCount = data.projectCount;
                    projectBaseData.workerCount = data.workerCount;
                    projectBaseData.wagesAmount = data.wagesAmount;
                    projectBaseData.accInAmount = data.accInAmount;
                    $projectCount.text(projectBaseData.projectCount);
                    $workerCount.text(projectBaseData.workerCount);
                    $totalPayMoney.text(format.numChange(projectBaseData.wagesAmount));
                    $accInAmount.text(format.numChange(projectBaseData.accInAmount));
                } else {
                    alert(result.errMsg);
                }
            });
        },
        getWarningImgResource: function () { // 视频监控图片信息获取
            $.get("getWarningImgAddressListData", function (result) {
                if (result[0].errNo === 0) {
                    var data = result[0].obj;
                    warningImgUrls.imgAddress = data.map(function (d) { return d.imgAddress });
                    $imgBig.attr('src', warningImgUrls.imgAddress[0]);
                    $imgSmt.attr('src', warningImgUrls.imgAddress[0]);
                    $imgSmb.attr('src', warningImgUrls.imgAddress[0]);
                } else {
                    alert(result[0].errMsg);
                }
            });
        },
        getKqRecordData: function () { // 实时考勤统计表数据获取
            $.get("getKqRecordPresentData", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    kqRecordData.projectPresentCount = data.projectPresentCount;
                    kqRecordData.workerGroupPresentCount = data.workerGroupPresentCount;
                    kqRecordData.workerPresentCount = data.workerPresentCount;
                    $projectPresentCount.text(kqRecordData.projectPresentCount);
                    $workerGroupPresentCount.text(kqRecordData.workerGroupPresentCount);
                    $workerPresentCount.text(kqRecordData.workerPresentCount);
                } else {
                    alert(result.errMsg);
                }
            });
        },
        getPresentRecordData: function () { // 实时项目考勤统计接口
            $.get("getProjectKqRecordPresentListData", function (result) {
                if (result[0].errNo === 0) {
                    var data = result[0].obj;
                    for (var i = 0; i < data.length; i++) {
                        presentRecordData[i].proName = data[i].proName;
                        presentRecordData[i].warningCount = data[i].warningCount;
                        presentRecordData[i].workerGroupPresentCount = data[i].workerGroupPresentCount;
                        presentRecordData[i].workerPresentCount = data[i].workerPresentCount;
                    };
                    presentRecordData.push({
                        proName: "测试项目1",
                        warningCount: "8",
                        workerGroupPresentCount: "3",
                        workerPresentCount: "8"
                    }, {
                        proName: "测试项目2",
                        warningCount: "13",
                        workerGroupPresentCount: "1",
                        workerPresentCount: "8"
                    }, {
                        proName: "测试项目3",
                        warningCount: "14",
                        workerGroupPresentCount: "5",
                        workerPresentCount: "8"
                    }, {
                        proName: "测试项目4",
                        warningCount: "0",
                        workerGroupPresentCount: "1",
                        workerPresentCount: "8"
                    }, {
                        proName: "测试项目5",
                        warningCount: "24",
                        workerGroupPresentCount: "2",
                        workerPresentCount: "8"
                    }, {
                        proName: "测试项目6",
                        warningCount: "0",
                        workerGroupPresentCount: "1",
                        workerPresentCount: "8"
                    });
                    $wagesWrap.empty();
                    for (var index = 0; index < presentRecordData.length; index++) {
                        var badgeClassName = '';
                        switch (true) {
                            case presentRecordData[index].warningCount == 0:
                                badgeClassName = 'levelA'
                                break;
                            case presentRecordData[index].warningCount > 0 && presentRecordData[index].warningCount <= 20:
                                badgeClassName = 'levelB'
                                break;
                            case presentRecordData[index].warningCount > 20:
                                badgeClassName = 'levelC'
                                break;
                            default:
                                badgeClassName = 'levelA'
                        }
                        var listHtml = '<div class="wages-list"><div class="wages-item wages-name">'
                            + presentRecordData[index].proName + '</div ><div class="wages-item wages-worker fc-g">'
                            + presentRecordData[index].workerPresentCount + '</div><div class="wages-item wages-group fc-g">'
                            + presentRecordData[index].workerGroupPresentCount + '</div><div class="wages-item wages-count fc-g"><span class=' + badgeClassName +'>'
                            + presentRecordData[index].warningCount + '</span></div></div >';
                        $wagesWrap.append(listHtml);
                    };
                    // 文字翻滚效果
                    clearInterval(dataInterval);
                    dataInterval = {};
                    listAnimate();
                    
                } else {
                    alert(result[0].errMsg);
                }
            });
        },
        getAccInfoData: function () { // 专户交易数据获取接口
            $.get("getAccInfoData", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    accInfoData.accBalance = data.accBalance;
                    accInfoData.accCount = data.accCount;
                    accInfoData.accInAmount = data.accInAmount;
                    accInfoData.wagesAmount = data.wagesAmount;
                    accInfoData.wagesCount = data.wagesCount;
                    var accInfoOption = {
                        tooltip: {
                            trigger: 'item',
                            // formatter: "{b} : {c}"
                            formatter: function (params) {
                                return params.name + ':' + format.numFormat(params.value);
                            }
                        },
                        legend: {
                            orient: 'vertical',
                            left: '45%',
                            top: '20%',
                            itemWidth: 15,
                            itemHeight: 7,
                            textStyle: {
                                color: '#1694f4',
                                fontSize: 12
                            },
                            data: accInfoData.name,
                            formatter: function (name) {
                                switch (name) {
                                    case '当前账户余额':
                                        name = name + format.numFormat(accInfoData.accBalance);
                                        break;
                                    case '累计发放金额':
                                        name = name + format.numFormat(accInfoData.wagesAmount);
                                        break;
                                    case '累计入账金额':
                                        name = name + format.numFormat(accInfoData.accInAmount);
                                        break;
                                    default:
                                        name = name
                                }
                                return name;
                            }
                        },
                        series: [
                            {
                                name: '专户统计',
                                type: 'pie',
                                radius: '55%',
                                center: ['30%', '50%'],
                                // data: [
                                //     { value: accInfoData.accBalance, name: accInfoData.name[0] },
                                //     { value: accInfoData.accInAmount, name: accInfoData.name[1] },
                                //     { value: accInfoData.wagesAmount, name: accInfoData.name[2] }
                                // ].sort(function (a, b) { return a.value - b.value; }),
                                data: [{
                                    value: accInfoData.accInAmount,
                                    name: accInfoData.name[1],
                                    itemStyle: {
                                        normal: {
                                            color: '#40a260'
                                        }
                                    }
                                }, {
                                    value: accInfoData.accBalance,
                                    name: accInfoData.name[0],
                                    itemStyle: {
                                        normal: {
                                            color: '#1790cf'
                                        }
                                    }
                                }, {
                                    value: accInfoData.wagesAmount,
                                    name: accInfoData.name[2],
                                    itemStyle: {
                                        normal: {
                                            color: '#1ab2d8'
                                        }
                                    }
                                }],
                                roseType: 'radius',
                                label: {
                                    normal: {
                                        show: false,
                                        textStyle: {
                                            color: 'rgba(255, 255, 255, 0.3)'
                                        }
                                    }
                                },
                                labelLine: {
                                    normal: {
                                        lineStyle: {
                                            color: 'rgba(255, 255, 255, 0.3)'
                                        },
                                        smooth: 0.2,
                                        length: 10,
                                        length2: 20
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#40a260',
                                        shadowBlur: 200,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                },
                                animationType: 'scale',
                                animationEasing: 'elasticOut',
                                animationDelay: function (idx) {
                                    return Math.random() * 200;
                                }
                            }
                        ]
                    };
                    $accInfoChart.setOption(accInfoOption);
                    $accCount.text(accInfoData.accCount);
                    $wagesCount.text(format.numFormat(accInfoData.wagesCount));
                } else {
                    alert(result.errMsg);
                }
            });
        },
        getAccDetailData: function () { // 专户详情数据获取
            $.get("getAccDetailData", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    accDetailData.monthData = [
                        data.monthAccWagesAmount,
                        data.monthAccInAmount,
                        data.monthAccCount
                    ];
                    accDetailData.dayData = [
                        data.dayAccWagesAmount,
                        data.dayAccInAmount,
                        data.dayAccCount
                    ];
                    var accDetailChartOption = {
                        baseOption: {
                            timeline: {
                                show: false,
                                top: 0,
                                data: []
                            },
                            legend: {
                                show: false
                            },
                            tooltip: {
                                show: true,
                                trigger: 'axis',
                                formatter: '{b}<br/>{a}: {c}人',
                                axisPointer: {
                                    type: 'shadow'
                                }
                            },
                            grid: [{
                                show: false,
                                left: '5',
                                top: 0,
                                bottom: 0,
                                containLabel: true,
                                width: '50%'
                            }, {
                                show: false,
                                left: '51%',
                                top: 20,
                                bottom: 0,
                                width: '0%'
                            }, {
                                show: false,
                                right: '5',
                                top: 0,
                                bottom: 0,
                                containLabel: true,
                                width: '50%'
                            }],
                            xAxis: [{
                                type: 'value',
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                position: 'top',
                                axisLabel: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                }
                            }, {
                                gridIndex: 1,
                                show: false
                            }, {
                                gridIndex: 2,
                                nameTextStyle: {
                                    color: '#50afff',
                                    fontSize: 14
                                },
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                position: 'top',
                                axisLabel: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                type: 'category',
                                inverse: true,
                                position: 'right',
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                },
                                data: accDetailData.name
                            }, {
                                gridIndex: 1,
                                type: 'category',
                                inverse: true,
                                position: 'left',
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true,
                                    textStyle: {
                                        color: '#1694f4',
                                        fontSize: 14
                                    }

                                },
                                data: accDetailData.name.map(function (value) {
                                    return {
                                        value: value,
                                        textStyle: {
                                            align: 'center'
                                        }
                                    }
                                })
                            }, {
                                gridIndex: 2,
                                type: 'category',
                                inverse: true,
                                position: 'left',
                                axisLine: {
                                    show: false
                                },
                                axisTick: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false

                                },
                                data: accDetailData.name
                            }],
                            series: []
                        },
                        options: []
                    };
                    accDetailChartOption.options.push({
                        tooltip: {
                            trigger: 'axis',
                            // formatter: '{b}<br/>{c} {a}'
                            formatter: function (params) {
                                return params[0].name + ':' + format.numFormat(params[0].value);
                            }
                        },
                        series: [{
                            name: '元',
                            type: 'bar',
                            barWidth: 10,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'insideRight',
                                    offset: [0, 0],
                                    textStyle: {
                                        color: '#fff',
                                        fontSize: 12
                                    },
                                    formatter: function(params) {
                                        return format.numFormat(params.value);
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#059da6'
                                }
                            },
                            data: accDetailData.monthData,
                            
                        }, {
                            name: '元',
                            type: 'bar',
                            barWidth: 10,
                            xAxisIndex: 2,
                            yAxisIndex: 2,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'insideLeft',
                                    offset: [0, 0],
                                    textStyle: {
                                        color: '#fff',
                                        fontSize: 12
                                    },
                                    formatter: function(params) {
                                        return format.numFormat(params.value);
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#259873'
                                }
                            },
                            data: accDetailData.dayData
                        }]
                    })
                    var accDetailChart = echarts.init(document.getElementById('accDetailEchart'));
                    accDetailChart.setOption(accDetailChartOption);
                } else {
                    alert(result.errMsg);
                }
            });
        },
        workerOptions: function () { // 务工人员option设置
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
                        formatter: function (value, index) {
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
            $workerChart.setOption(workerChartOption);
        },
        projectMapInfoDatas: function () { // 地图详细信息展示数据
            $.get("getProjectInfoByLongAndLat", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    projectMapInfoData = {
                        jsOrgan: data.jsOrgan.name,
                        zcOrgan: data.zcOrgan.name,
                        jlOrgan: data.jlOrgan.name,
                        name: data.name,
                        workerNumber: data.workerNumber
                    };
                } else {
                    alert(result.errMsg);
                }
            });
        },
        projectMapOptions: function () { // 项目信息地图展示
            var containerHeight = $centerContainer.height(),
                dataHeight = $projectDataPanel.height();
            $projectMapPanel.height(containerHeight - dataHeight - 50);
            $.get("getProjectListData", function (result) {
                if (result.errNo === 0) {
                    var data = result.obj;
                    projectMapData = {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        name: data.name,
                        proId: data.proId,
                        warningStatus: data.warningStatus
                    }
                    // 中心地图
                    var myChart = echarts.init(document.getElementById('bmapCharts'));
                    myChart.setOption({
                        bmap: {
                            center: [projectMapData.longitude, projectMapData.latitude],
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
                        tooltip: {
                            trigger: 'item',
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            formatter: function (params) {
                                var str = '<span style="color:#0169a9;font-size:1rem;border-bottom:1px solid #003e64;">' + projectMapInfoData.name +
                                    '</span></br>建设单位：' + '<span style="color:#6bc3ef;font-size:0.9rem;">' + projectMapInfoData.jsOrgan +
                                    '</span></br>总承包企业：' + '<span style="color:#6bc3ef;font-size:0.9rem;">' + projectMapInfoData.zcOrgan +
                                    '</span></br>监理公司：' + '<span style="color:#6bc3ef;font-size:0.9rem;">' + projectMapInfoData.jlOrgan +
                                    '</span></br>工人数量：' + '<span style="color:#6bc3ef;font-size:0.9rem;">' + projectMapInfoData.workerNumber +
                                    '</span>'
                                return str;
                            }
                        },
                        series: [{
                            type: 'effectScatter',
                            coordinateSystem: 'bmap',
                            data: [{
                                name: projectMapData.name,
                                value: [projectMapData.longitude, projectMapData.latitude, 1]
                            }],
                            showEffectOn: 'render',
                            rippleEffect: {
                                brushType: 'stroke'
                            },
                            hoverAnimation: true,
                            label: {
                                normal: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#f02511',
                                    shadowBlur: 10,
                                    shadowColor: '#333'
                                }
                            }
                        }]


                    });
                    var bmap = myChart.getModel().getComponent('bmap').getBMap();
                    bmap.addControl(new BMap.MapTypeControl());
                } else {
                    alert(result.errMsg);
                }
            });
        }
    };

    // 事件绑定
    var events = function () {
        $(document)
            .on("mouseover mouseout", ".wages-wrap", function (event) {
                if (event.type == "mouseover") {
                    //鼠标悬浮
                    if (presentRecordData.length > recordListLength) {
                        clearInterval(dataInterval);
                    }
                } else if (event.type == "mouseout") {
                    //鼠标离开
                    function anim() {
                        $(".wages-list:first").animate({ "margin-top": -23 }, 1000, function () {
                            $(this).css("margin-top", 0).appendTo(".wages-wrap");
                        })
                    }
                    if (presentRecordData.length > recordListLength) {
                        dataInterval = setInterval(anim, 2000);
                    }
                }
            })
    };

    // 实时项目考勤的列表可展示几条
    function getPresentRecordListLength() {
        var wagesHeight = $(".wages").height(),
            titleHeight = $(".wages-title").height(),
            listHeight,
            itemNum;
        listHeight = wagesHeight - titleHeight;
        return itemNum = parseInt(listHeight / titleHeight);
    }

    // 实时项目考勤文字翻滚
    function listAnimate() {
        if (presentRecordData.length > recordListLength) {
            dataInterval = {};
            function anim() {
                $(".wages-list:first").animate({ "margin-top": -23 }, 500, function () {
                    $(this).css("margin-top", 0).appendTo(".wages-wrap");
                })
            }
            dataInterval = setInterval(anim, 2000);
        }
    }

    // 格式化
    var format = {
        numFormat: function (value) { //Y轴大于1W的格式化
            var val;
            if (value >= 10000) {
                val = (value / 10000) + 'W';
            } else {
                val = value;
            }
            return val;
        },
        numChange: function (value) { //Y轴大于1W的格式化
            var val;
            if (value >= 0) {
                val = (value / 10000).toFixed(2);
            } else {
                val = value;
            }
            return val;
        },
        getTimeStr: function (date) { // 根据传入的日期 返回yyyy-mm-dd  hh-mm-ss格式的字符串
            return date.getFullYear() + '-' + format.preZero(date.getMonth() + 1) + '-' + format.preZero(date.getDate()) + '  ' + format.preZero(date.getHours()) + ':' + format.preZero(date.getMinutes()) + ':' + format.preZero(date.getSeconds());
        },
        preZero: function (num) { // 传入数字小于10的时候，返回01格式的字符串
            return num >= 10 ? num : '0' + num.toString();
        }
    }

    // 初始化
    function init() {
        // 时间
        chartsController.getTime();
        // 务工人员柱状图
        chartsController.workerOptions();
        chartsController.getWorkerSeries();
        // 中间项目信息
        chartsController.getProjectBaseData();
        // 监控图片获取
        chartsController.getWarningImgResource();
        // 实时考勤统计表数据
        chartsController.getKqRecordData();
        // 实时项目考勤统计
        chartsController.getPresentRecordData();
        // 专户信息表
        chartsController.getAccInfoData();
        // 专户详情表
        chartsController.getAccDetailData();
        // 项目所在地地图展示
        chartsController.projectMapInfoDatas();
        chartsController.projectMapOptions();
    }

    // 定时器
    function timer() {
        // 务工人员柱状图
        chartsController.getWorkerSeries();
        // 中间项目信息
        chartsController.getProjectBaseData();
        // 监控图片获取
        chartsController.getWarningImgResource();
        // 实时考勤统计表数据
        chartsController.getKqRecordData();
        // 实时项目考勤统计
        chartsController.getPresentRecordData();
        // 专户信息表
        chartsController.getAccInfoData();
        // 专户详情表
        chartsController.getAccDetailData();
        // 项目所在地地图展示
        chartsController.projectMapInfoDatas();
        chartsController.projectMapOptions();
    }

    $(function () {
        // 初始化
        init();
        // 项目考勤列表获取可容纳条目数
        recordListLength = getPresentRecordListLength();
        events();
        // 定时数据获取
        setInterval(timer, 10000);
        // 窗口变化图表自适应
        $(window).resize(function () {
            // 项目考勤列表获取可容纳条目数
            recordListLength = getPresentRecordListLength();
            $workerChart.resize();
            $accInfoChart.resize();
            $accDetailchart.resize();
        });


    })

})(window, jQuery);