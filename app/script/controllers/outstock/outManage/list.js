define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockOutmanageListCtrl', ['$scope', 'OutstockOutmanageService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title : '出库单查询',

            loading: true,

            raw:'',

            //表头显示字段
            fields : {
                // 表头显示字段
                options : [

                    { "key": "@", "value": "序号", "display": true, 'sort': 1 },               
                    { "key": "orderNo", "value": "出库单号", "sort": 1, "display": true },
                    { "key": "customerNo", "value": "客户单号", "display": true }, 
                    { "key": "waveCode", "value": "波次号", "display": true }, 
                    { "key": "warehouseName", "value": "仓库名称", "display": true }, 
                    { "key": "customerName", "value": "商家名称", "display": true },              
                    { "key": "shopName", "value": "店铺名称", "display": true }, 
                    { "key": "businessType", "value": "业务类型", "display": true }, 
                    { "key": "skuQuantity", "value": "SKU数量", "display": true },
                    { "key": "quantity", "value": "商品总量", "display": true }, 
                    { "key": "deliveryType", "value": "配送方式", "display": true },   
                    { "key": "logisticsName", "value": "物流公司", "display": true }, 
                    { "key": "waybillNo", "value": "运单号", "display": true },              
                    { "key": "waybillTypeName", "value": "面单类型", "display": true },              
                    { "key": "orderTime", "value": "接单时间", "display": true },                                                             
                    { 
                        "key": "statusDesc", "value": "订单状态", "display": true,
                        "link":"status","group":[
                            {"id":"0" , "label":"订单创建"},
                            {"id":"10" , "label":"分配成功"},
                            {"id":"11" , "label":"分配失败"},
                            {"id":"20" , "label":"波次创建"},
                            {"id":"30" , "label":"拣货中"},
                            {"id":"40" , "label":"待复核"},
                            {"id":"50" , "label":"待发货"},
                            {"id":"90" , "label":"订单取消"},
                            {"id":"99" , "label":"订单完成"}, 
                            {"id":"100" , "label":"异常单据"},  

                        ] 
                    }
                ],

                model : []
            },
           

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    // hgCode: ''
                },

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [
                        {
                            title: "基础",
                            group: [
                                {title:'出库单号',model:'orderNo',type:'input'},
                                {title:'客户单号',model:'customerNo',type:'input'},
                                {title:'波次号',model:'waveCode',type:'input'},
                                {title:'仓库名称',model:'warehouseName',type:'input'},
                                {title:'商家名称',model:'customerName',type:'input'},
                                {title:'店铺名称',model:'shopName',type:'input'},
                                {title:'业务类型',model:'businessType',type:'input'},
                                {title:'出库类型',model:'billType',type:'input'},
                                {title:'SKU数量',model:['beginSkuQuantity','endSkuQuantity'],type:'range'},
                                // {title:'最大SKU数量',model:'endSkuQuantity',type:'input'},
                                {title:'物流公司',model:'logisticsName',type:'input'},
                                {title:'运单号',model:'waybillNo',type:'input'},
                                {title:'面单类型',model:'waybillType',type:'input'},                              
                                {title:'接单时间区间',model:['beginOrderTime','endOrderTime'],type:'datetime'},
                                {title:'收货人',model:'receiver',type:'input'},
                                {title:'收货详细地址',model:'address',type:'input'}
                               
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'出库单号',model:'orderNo'},
                        {title:'客户单号',model:'customerNo'},
                        {title:'波次号',model:'waveCode'},
                        {title:'商家名称',model:'customerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'运单号',model:'waybillNo'}
                       
                    ]
                },
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
            close   : close,
            searchByTable:searchByTable
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            list();
        }

        
        /**
         * 分页查询
         */
        function list(){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.list(getParas()).then(function(resp){

                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{

                    vm.data = afterList(resp.list || []);

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

        // /**
        //  * 启用/禁用
        //  * @return {[type]} [description]
        //  */
        // function toggle(row){
        //     var id = row.id;
        //     var toggle_status = row.status == 1 ? 0 : 1;


        //     loadingTimeout = $timeout(function() {
        //         page.loading = true;
        //     }, loadingLatency);

        //     service.toggle({id:id , status:toggle_status}).then(function(resp){
        //         if(resp.returnCode){
        //             sl.alert(resp.returnMsg);
        //         }else{
        //             row.status = toggle_status;
        //         }

        //         sl.dep.update(['ZONE_PUT','ZONE_PICK']);

        //         $timeout.cancel(loadingTimeout);
        //         page.loading = false;
        //     })
        // }

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
            console.log(page.params.model)
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
            // 序号列;
            sl.pushIndex(data , '@');

            // 对多级数据处理·
            sl.format.grab(data,['baseWarehouse.warehouseName','baseShop.name','baseOwner.name']);

            for (var i = 0; i < data.length; i++) {
              
               if (data[i].orderTime) {
                    data[i].orderTime = sl.format_time(data[i].orderTime)
               }
            }

            for (var i in data) {
                // console.log(data[i].baseWar ehouse)
                // data[i].ownerName = data[i].baseOwner;
                // data[i].warehouseName = data[i].baseWarehouse;
            }
            return data;
        }

    }]);

})
