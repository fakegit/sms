/**
 * Created by hubo on 2017/1/16.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('StockmgrGoodsStockListCtrl', ['$scope', 'StockmgrGoodsStockService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '商品库存汇总查询',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "warehouseName", "value": "仓库名称", "display": true},
                    { "key": "ownerName", "value": "商家名称", "display": true },
                    { "key": "skuName", "value": "商品名称", "display": false },//有问题
                    { "key": "skuCode", "value": "商品编码", "display": true },
                    { "key": "inventoryStatusName", "value": "库存类型", "display": true },
                    { "key": "quantity", "value": "库存总量", "display": false },//暂时放上去
                    { "key": "availableQty", "value": "可用库存", "display": true },
                    { "key": "allocateQty", "value": "占用库存", "display": true },
                    { "key": "frozenQty", "value": "冻结库存", "display": true },
                    { "key": "volume", "value": "体积（立方米）", "display": true },
                    { "key": "weight", "value": "重量（千克）", "display": true },
                ],

                model : []
            },

            deps:{
                bizControl:"OWNER_BIZ_CONTROL"
            },

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    hgCode: ''
                },

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [{
                        title: "高级筛选",
                        group: [
                            {title:'仓库名称',model:'warehouseName',type:'input'},
                            {title:'商家名称',model:'ownerName',type:'input'},
                            {title:'商家编码',model:'ownerCode',type:'input'},
                            {title:'商品名称',model:'skuName',type:'input'},
                            {title:'商品编码',model:'skuCode',type:'input'},
                            {title:'库位',model:'locationCode',type:'input'},
                            {title:'库存状态',model:'invStatus',type:'input'},
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'商家编码',model:'ownerCode'},
                        {title:'商品名称',model:'skuName'},
                        {title:'商品编码',model:'skuCode'},
                        {title:'库位',model:'locationCode'},
                        {title:'库存状态',model:'invStatus'},
                    ]
                }
                ,
                // 分页数据
                pag:{
                    // 分页状态
                    model:{
                        pageSize: 10,//每页显示数量
                        pageNum: 1, //当前页码
                        pageCount:0,//总页数
                        itemCount:0 // 总条目数
                    },
                    // 分页选项
                    options:{
                        size:[1, 5, 10, 20, 50],
                        display:5
                    }
                }
            }

        };


        sl.extend(vm , {
            page    : page ,
            data    : data,
            list    : list,
            // toggle  : toggle,
            reset   : reset,
            search  : search,
            searchByTable:searchByTable,

        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(){
                list();
            })
        }

        /**
         * 分页查询
         */
        function list(){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            //console.log()
            service.list(getParas()).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    vm.data = afterList(resp.list||[]);
                   // console.log(resp.list);
                    //更新分页数据
                    page.params.pag.model.itemCount = resp.total;
                }

            });
        }


        /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data){
            page.params.model = data;
            // console.log(page.params.model);
            list();
        }

        /**
         * 由 table 插件触发的分页
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function searchByTable(tableState){
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
            var obj = angular.copy( page.params.model ) , search_arr = [];

            sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum
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
            sl.pushIndex(data , '@');
            sl.dep.conv(data , page.deps);
            // for(v in data) {
            //     data[v].orderTime=sl.timestamp(data[v].orderTime);
            //     console.log(data[v].orderTime);
            // }
            return data;
        }



    }]);

})