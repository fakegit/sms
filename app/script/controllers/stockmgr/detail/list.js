define(['app', 'moment'], function(app, moment) {

    return app.controller('StockmgrDetailListCtrl', ['$scope', 'StockmgrDetailService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '库存明细查询',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "warehouseName", "value": "仓库名称", "display": true},
                    { "key": "ownerName", "value": "商家名称", "display": true },
                    { "key": "shopName", "value": "店铺名称","display": true },
                    { "key": "goodsCode", "value": "商品编码", "display": true },
                    { "key": "goodsName", "value": "商品名称", "display": true },
                    { "key": "locationCode", "value": "库位编码", "display": true },
                    { "key": "lotCode", "value": "系统批号", "display": false },
                    { "key": "customerLot", "value": "商家批号", "display": true },
                    { "key": "statusDesc", "value": "库存状态", "display": true },
                    {"key":"quantity","value":"现有库存","display":true},
                    { "key": "produceDate", "value": "生产日期", "display": true },
                    { "key": "storageDate", "value": "入库日期", "display": true },
                    { "key": "expiryDate", "value": "失效日期", "display": true },
                    { "key": "lotExtendProp1", "value": "批次属性1", "display": false },
                    { "key": "lotExtendProp2", "value": "批次属性2", "display": false },
                    { "key": "lotExtendProp3", "value": "批次属性3", "display": false },
                    { "key": "lotExtendProp4", "value": "批次属性4", "display": false },
                    { "key": "lotExtendProp5", "value": "批次属性5", "display": false },
                    { "key": "modifiedTime", "value": "更新时间", "display": false },
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
                            {title:'店铺名称',model:'shopName',type:'input'},
                            {title:'商品编码',model:'goodsCode',type:'input'},
                            {title:'商品名称',model:'goodsName',type:'input'},
                            {title:'库位编码',model:'locationCode',type:'input'},
                            {title:'系统批号',model:'lotCode',type:'input'},
                            {title:'商家批号',model:'customerLot',type:'input'},
                            {title:'库存状态',model:'status',type:'input'},
                            {title:'批次属性1',model:'lotExtendProp1',type:'input'},
                            {title:'批次属性2',model:'lotExtendProp2',type:'input'},
                            {title:'批次属性3',model:'lotExtendProp3',type:'input'},
                            {title:'批次属性4',model:'lotExtendProp4',type:'input'},
                            {title:'批次属性5',model:'lotExtendProp5',type:'input'},
                            {title:'生产日期',model:['beginProduceDate','endProduceDate'],type:'datetime'},
                            {title:'入库日期',model:['beginStorageDate','endStorageDate'],type:'datetime'},
                            {title:'失效日期',model:['beginExpiryDate','endExpiryDate'],type:'datetime'}
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'商品编码',model:'goodsCode'},
                        {title:'商品名称',model:'goodsName'},
                        {title:'库位编码',model:'locationCode'},
                        {title:'系统批号',model:'lotCode'},
                        {title:'商家批号',model:'customerLot'},
                        {title:'库存状态',model:'status'},
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

            console.log(obj)
            
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
              sl.timestamp(data,['produceDate','storageDate','expiryDate']);

            // }
            return data;
        }




    }]);

})