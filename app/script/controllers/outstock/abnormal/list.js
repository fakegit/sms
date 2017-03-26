/**
 * Created by yhx on 2017/1/11.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockAbnormalListCtrl', ['$scope', 'OutstockAbnormalService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '异常订单分配',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "orderNo", "value": "出库单号", "display": true},
                    { "key": "customerNo", "value": "客户单号", "display": true },
                    { "key": "warehouseName", "value": "仓库名称", "sort": 1, "display": true },
                    { "key": "customerName", "value": "商家名称", "display": true },
                    { "key": "shopName", "value": "店铺名称", "display": true },
                    { "key": "businessType", "value": "业务类型", "display": true },

                    { "key": "billType", "value": "出库类型", "display": true },
                    { "key": "skuQuantity", "value": "sku数量", "display": true },
                    { "key": "logisticsName", "value": "物流公司", "display": true },
                    { "key": "waybillNo", "value": "运单号", "display": true },
                    { "key": "waybillTypeName", "value": "面单类型", "display": true },
                    { "key": "orderTime", "value": "接单时间", "display": true },
                    { "key": "receiver", "value": "收货人", "display": true },
                    { "key": "address", "value": "收货详细地址", "display": true },
                    { "key": "statusDesc", "value": "订单状态", "display": true },



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
                        title: "异常单查询",
                        group: [
                            {title:'出库单号',model:'orderNo',type:'input'},
                            {title:'客户单号',model:'customerNo',type:'input'},
                            {title:'仓库名称',model:'warehouseName',type:'input'},
                            {title:'商家名称',model:'customerName',type:'input'},
                            {title:'店铺名称',model:'shopName',type:'input'},
                            {title:'业务类型',model:'businessType',type:'input'},
                            {title:'出库类型',model:'billType',type:'input'},
                            {title:'物流公司',model:'logisticsName',type:'input'},
                            {title:'sku数量区间下界',model:'beginSkuQuantity',type:'input'},
                            {title:'sku数量区间上界',model:'endSkuQuantity',type:'input'},
                            {title:'运单号',model:'waybillNo',type:'input'},
                            {title:'面单类型',model:'waybillType',type:'input'},
                            {title:'接单时间区间',model:['beginOrderTime','endOrderTime'],type:'datetime'},
                            {title:'收货人',model:'receiver',type:'input'},
                            {title:'收货详细地址',model:'address',type:'input'},
                            {title:'接单时间',model:'barCode',type:'input'},
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'出库单号',model:'orderNo'},
                        {title:'客户单号',model:'customerNo'},
                        {title:'商家名称',model:'customerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'运单号',model:'waybillNo'},
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
            allocation:allocation
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
         * 启用/禁用
         * @return {[type]} [description]
         */
        // function toggle(row){
        //     var id = row.id;
        //     var toggle_state = row.status == 1 ? 0 : 1;
        //
        //
        //     loadingTimeout = $timeout(function() {
        //         page.loading = true;
        //     }, loadingLatency);
        //
        //     service.toggle({id:id , status:toggle_state}).then(function(resp){
        //         if(resp.returnCode){
        //             sl.alert(resp.returnMsg);
        //         }else{
        //             row.status = toggle_state;
        //         }
        //         sl.dep.update('OWNER');
        //
        //         $timeout.cancel(loadingTimeout);
        //         page.loading = false;
        //     })
        // }

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
                 console.log(resp);
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    vm.data = afterList(resp.list||[]);
                    console.log(resp.list);
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
            if(obj.waybillType) {
                if (obj.waybillType == '普通面单') {
                    obj.waybillType = 1;
                }
                else if (obj.waybillType == '电子面单') {
                    obj.waybillType = 2;
                }
                else if (obj.waybillType = '菜鸟面单') {
                    obj.waybillType = 3;
                }
            }

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
            for(v in data) {
              data[v].orderTime=sl.timestamp(data[v].orderTime);
                console.log(data[v].orderTime);
            }
            return data;
        }
     
        
        //手动分配回调函数
        function allocation(items) {
            if(!items.length){
                sl.alert('请先选择异常订单')
            }
            else {
                var ids=items.join(",");
                service.reAllocation(ids).then(function (resp) {
                    console.log('tt:'+ resp);
                    if(!resp.returnCode){
                        sl.alert(resp.returnMsg);
                        list();
                    }
                    else{
                        sl.alert(resp.returnMsg);
                        list();
                    }
                })
            }
        }

    }]);

})