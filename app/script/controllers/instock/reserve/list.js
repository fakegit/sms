define(['app', 'moment'], function(app, moment) {

    return app.controller('InstockReserveListCtrl', ['$scope', 'InstockReserveService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title : '入库预约单管理',

            loading: true,

            raw:'',

            //表头显示字段
            fields : {
                // 表头显示字段
                options : [
                    { "key": "@", "value": "序号", "display": true, 'sort': 1 }, 
                  
                    { "key": "orderNo", "value": "入库预约单号", "sort": 1, "display": true },
                    // { "key": "orderNo", "value": "入库单号", "display": true }, 
                    { "key": "baseOwner.name", "value": "商家名称", "display": true }, 
                    { "key": "baseShop.name", "value": "店铺名称", "display": true }, 
                    { "key": "businessTypeName", "value": "业务类型", "display": true }, 
                    { "key": "baseWarehouse.warehouseName", "value": "仓库名称", "display": true },              
                    { "key": "goodsQty", "value": "SKU数量", "display": true },              
                    { "key": "quantity", "value": "商品数量", "display": true },              
                    { "key": "createdTime", "value": "创建时间", "display": true },                           
                    { 
                        "key": "statusName", "value": "状态", "display": true,
                        "link":"status","group":[
                            {"id":"" , "label":"全部"},
                            {"id":"1" , "label":"已创建"},
                            {"id":"2" , "label":"收货中"},
                            {"id":"3" , "label":"上架中"},
                            {"id":"4" , "label":"上架完成"},
                            {"id":"5" , "label":"已收货"},
                            {"id":"6" , "label":"已取消"}
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
                                {title:'入库预约单号',model:'orderNo',type:'input'},
                                {title:'商家名称',model:'baseOwner.name',type:'input'},
                                {title:'店铺名称',model:'baseShop.name',type:'input'},
                                {title:'业务类型',model:'businessType',type:'select',
                                    values:[{id:"CGRK",label:"采购入库"},{id:"THRK",label:"采购入库"},
                                            {id:"B2BRK",label:"B2B入库"},{id:"QTRK",label:"其他入库"}]
                                    },
                                {title:'仓库名称',model:'baseWarehouse.warehouseName',type:'input'},
                                {title:'SKU数量',model:'quantity',type:'input'},
                                {title:'商品数量',model:'goodsQty',type:'input'},
                                {title:'创建时间',model:['createdTimeStart','createdTimeEnd'],type:'datetime'}
                                // {title:'状态',model:'shelveStatus',type:'select',
                                //     values:[{id:'',label:'不限'},{id:'1',label:'已创建'},{id:'2',label:'收货中'},{id:'3',label:'上架中'},{id:'4',label:'上架完成'},
                                //     {id:'5',label:'已收货'},{id:'6',label:'已取消'},]
                                // }
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'入库预约单号',model:'orderNo'},
                        {title:'商家名称',model:'baseOwner.name'},
                        {title:'店铺名称',model:'baseShop.name'},
                        // {title:'业务类型',model:'businessTypeName'},
                        {title:'仓库名称',model:'baseWarehouse.warehouseName'},
                        {title:'SKU数量',model:'quantity'},
                        {title:'商品数量',model:'goodsQty'}
                        // {title:'创建时间',model:'createdTimeStart'},
                        // {title:'状态',model:'status'}
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
            toggle  : toggle,
            reset   : reset,
            search  : search,
            ensure : ensure,
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
        

        // list页面的确认按钮
        function ensure(row){
            // page.raw = row;
            service.found(row.id).then(function(resp){
                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                }
                else {
                    sl.notify('生成入库单号成功');
                }
            })
        }

        /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data){
            page.params.model = data;
            console.log(page.params.model)
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
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row){
            var id = row.id;
            var toggle_status = row.status == 1 ? 0 : 1;


            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({id:id , status:toggle_status}).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    row.status = toggle_status;
                }

                sl.dep.update(['ZONE_PUT','ZONE_PICK']);

                $timeout.cancel(loadingTimeout);
                page.loading = false;
            })
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
            console.log(page.params.model)
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
            // 序号列;
            sl.pushIndex(data , '@');

            // 对多级数据处理·
            sl.format.grab(data,['baseWarehouse.warehouseName','baseShop.name','baseOwner.name']);

            for (var i = 0; i < data.length; i++) {
              
               if (data[i].createdTime) {
                    data[i].createdTime = sl.format_time(data[i].createdTime)
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
