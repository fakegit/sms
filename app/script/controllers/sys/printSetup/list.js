/**
 * Created by hubo on 2017/1/12.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('SysPrintSetupListCtrl', ['$scope', 'PrintSetService', 'sl', '$timeout', function($scope, service, sl, $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,
            data = [];

        var page = {
            loading: false,

            title: '打印设置',

            //表头显示字段
            fields: {
                options: [
                    { "key": "@", "value": "序号", "display": true },
                    { "key": "buttonId", "value": "打印按键ID", "display": true },
                    { "key": "buttonName", "value": "打印按键名称", "display": true },
                    { "key": "templateTypeName", "value": "模板类型", "sort": 1, "display": true },
                    { "key": "templateName", "value": "模板名称", "display": true },
                    { "key": "logisticsName", "value": "快递公司", "display": true },
                    { "key": "warehouseName", "value": "仓库", "display": true },

                    { "key": "businesName", "value": "商家", "display": true },
                    { "key": "shopName", "value": "店铺", "display": true }, 
                    { 
                        "key": "state", "value": "状态", "display": true,
                        "link":"state","group":[
                            {"id":"-1" , "label":"全部"},
                            {"id":"1" , "label":"启用"},
                            {"id":"0" , "label":"禁用"}
                        ] 
                    }
                ],
                model: []
            },

            deps: {
                logisticId: 'LOGISTICS',
                warehouseId: 'WAREHOUSE',
                pickType:'PICK_TYPE'
            },

            //搜索字段
            params: {

                //必选字段请在此列出
                required: {},

                model: {},

                //初始化筛选字段，
                options: {
                    // 用于 sl-search 插件
                    base: [{
                        title: "打印膜版查询",
                        group: [
                            { title: '模板类型', model: 'templateTypeId', type: 'select', values:[]},
                            { title: '快递公司', model: 'logisticsCode', type: 'select', values:[]},
                            { title: '拣货方式', model: 'pickType', type: 'select', values:[]},
                            { title: '仓库', model: 'warehouseCode', type: 'select', values:[], 'change':'businesCode'},
                            { title: '商家', model: 'businesCode', type: 'select', values:[], 'change':'shopCode'},
                            { title: '店铺', model: 'shopCode', type: 'select', values:[]}
                        ]
                    }],

                    //用于快速搜索
                    quick: [
                        { title: '模板名称', model: 'templateName' },
                        { title: '打印按键名称', model: 'buttonName' }
                    ]
                },
                // 分页数据
                pag: {
                    // 分页状态
                    model: {
                        pageSize: 10, //每页显示数量
                        pageNum: 1, //当前页码
                        pageCount: 0, //总页数
                        itemCount: 0 // 总条目数
                    },
                    // 分页选项
                    options: {
                        size: [1, 5, 10, 20, 50],
                        display: 5
                    }
                }
            }

        };


        sl.extend(vm, {
            page: page,
            data: data,
            list: list,
            toggle: toggle,
            reset: reset,
            search: search,
            selectInSearch:selectInSearch,
            searchByTable: searchByTable,
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function() {
                page.params.options.base[0].group[3].values = page.deps.warehouseId;
                page.params.options.base[0].group[2].values = page.deps.pickType;
                for(var i in page.deps.logisticId) {
                    var obj = {id: page.deps.logisticId[i].id, label: page.deps.logisticId[i].logisticsName};
                    page.params.options.base[0].group[1].values.push(obj);
                }
                service.getTypes().then(function(resp) {
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);
                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        for(var i in resp.returnVal) {
                            var obj = {id: resp.returnVal[i].id, label: resp.returnVal[i].name}
                            page.params.options.base[0].group[0].values.push(obj);
                        }
                    }
                });
                list();
            })
        }

        /**
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row) {
            var id = row.id;
            var toggle_state = row.state == 1 ? 0 : 1;

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({ id: id, state: toggle_state }).then(function(resp) {
                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                } else {
                    row.state = toggle_state;
                }

                $timeout.cancel(loadingTimeout);
                page.loading = false;
            }, function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);
            })
        }

        /**
         * 分页查询
         */
        function list() {
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            //console.log()
            service.list(getParas()).then(function(resp) {
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                } else {
                    if (resp.returnVal.list && resp.returnVal.list.length) {
                        vm.data = afterList(resp.returnVal.list) || [];
                        //更新分页数据
                        page.params.pag.model.itemCount = resp.returnVal.total;
                    }
                    else {
                        vm.data = [];
                    }
                }

            }, function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;
            });
        }


        /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data) {
            page.params.model = data;
            // console.log(page.params.model);
            list();
        }

        /**
         * 由 table 插件触发的分页
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function searchByTable(tableState) {
            var getSorts = function(obj) {
                var ret = [],
                    value, state = ['', 'asc', 'desc'];
                for (var i in obj) {
                    value = obj[i];
                    if (value != 0) {
                        ret.push(i + ' ' + state[obj[i]]);
                    }

                }
                return ret.join(",");
            }

            //更新 search_extra
            var pag = tableState.pagination;
            page.params_extra.orders = getSorts(tableState.sort);

            list();
        }

        /**
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset() {

        }


        /**
         * 获取查询参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function getParas() {
            var obj = angular.copy(page.params.model),
                search_arr = [];

            sl.extend(obj, page.params.options.required);
            sl.extend(obj, {
                pageSize: page.params.pag.model.pageSize,
                pageNum: page.params.pag.model.pageNum
            });

            return obj;

            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            // 处理td序号
            sl.pushIndex(data, '@');
            /*sl.dep.conv(data, page.deps);
            for (v in data) {
                data[v].orderTime = sl.timestamp(data[v].orderTime);
                console.log(data[v].orderTime);
            }*/
            return data;
        }


        function selectInSearch(key , value , callback){
            if(key == 'warehouseCode'){
                service.getOwn(value).then(function(resp){
                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    }
                    else {
                        for(var i in resp.returnVal) {
                            var obj = {id: resp.returnVal[i].id, label: resp.returnVal[i].name}
                            page.params.options.base[0].group[4].values.push(obj);
                        }
                    }
                })
            }
            if(key == 'businesCode'){
                service.getShop(value).then(function(resp){
                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    }
                    else {
                        for(var i in resp.returnVal) {
                            var obj = {id: resp.returnVal[i].id, label: resp.returnVal[i].name}
                            page.params.options.base[0].group[5].values.push(obj);
                        }
                    }
                })
            }
        }
    }]);

})
