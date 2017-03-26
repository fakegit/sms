define(['app', 'moment'], function(app, moment) {

    return app.controller('InstockInbillListCtrl', ['$scope', 'InstockInbillService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;
        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '入库单列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "orderNo", "value": "入库单号", "display": true },
                    { "key": "relatedNo1", "value": "入库预约单号", "display": true },
                    { "key": "baseOwner.name", "value": "商家名称", "display": true }, 
                    { "key": "baseShop.name", "value": "店铺名称", "display": true },
                    { "key": "businessTypeName", "value": "业务类型", "display": true },
                    { "key": "baseWarehouse.warehouseName", "value": "仓库名称", "display": true }, 
                    { "key": "goodsQty", "value": "SKU数量", "display": true },
                    { "key": "quantity", "value": "商品数量", "display": true },
                    
                    { "key": "createdTime", "value": "创建时间", "display": true },
                    { "key": "createdBy", "value": "创建人", "display": true },
                    { "key": "statusName", "value": "单据状态", "display": true , "link":'status',"group":[]},
                    { "key": "receiveStatusName", "value": "收货状态", "display": true ,"link":'recieveStatus',"group":[]},
                    { "key": "shelveStatusName", "value": "上架状态", "display": true ,"link":'shelveStatus',"group":[]}

                    
                ]
            },
            
            deps:{
                businessType:"IN_BUSINESS_TYPE",
                status:"INSTORAGE_BILL_STATUS",
                receive:"RECEIVE_STATUS",
                shelveStatus:"SHELVE_STATUS"
            },

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    
                },

                model: {},
                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [
                        {
                            title: "基础",
                            group: [
                                {title:'入库单号',model:'orderNo',type:'input'},
                                {title:'入库预约单号',model:'relatedNo1',type:'input'},
                                {title:'商家名称',model:'baseOwner.name',type:'input'},
                                {title:'店铺名称',model:'baseShop.name',type:'input'},
                                {title:'业务类型',model:'businessType',type:'select',values:[]},
                                {title:'仓库名称',model:'baseWarehouse.warehouseName',type:'input'},
                                {title:'SKU数量',model:'goodsQty',type:'input'},
                                {title:'商品数量',model:'quantity',type:'input'},
                                {title:'创建时间',model:['createdTimeStart','createdTimeEnd'],type:'datetime'},
                                {title:'创建人',model:'createdBy',type:'input'},
                                {title:'单据状态',model:'status',type:'select',
                                    values:[{id:'',label:'不限'},{id:'0',label:'打开'},{id:'1',label:'作业中'},{id:'2',label:'关闭'}]
                                },
                                {title:'收货状态',model:'recieveStatus',type:'select',
                                    values:[{id:'',label:'不限'},{id:'0',label:'待收货'},{id:'1',label:'收货中'},{id:'2',label:'收货完成'}]
                                },
                                {title:'上架状态',model:'shelveStatus',type:'select',
                                    values:[{id:'',label:'不限'},{id:'0',label:'待上架'},{id:'1',label:'上架中'},{id:'2',label:'上架完成'}]
                                }
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'入库单号',model:'orderNo'},
                        {title:'入库预约单号',model:'relatedNo1'},
                        {title:'商家名称',model:'baseOwner.name'},
                        {title:'店铺名称',model:'baseShop.name'},
                        {title:'仓库名称',model:'baseWarehouse.warehouseName'},
                        {title:'单据状态',model:'status',type:'select',values:[]},
                        {title:'收货状态',model:'receiveStatus',type:'select',values:[]},
                        {title:'上架状态',model:'shelveStatus',type:'select',values:[]},

                        {title:'创建人',model:'createdBy'}
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
            toggle  : toggle,
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
            sl.dep(page.deps).then(function(){
                var businessType = sl.pick(page.deps.businessType,{'id':'' , 'label':''});
                businessType.unshift({'id':'','label':'不限'});
                page.deps.status.unshift({'id':'','label':'不限'});
                page.deps.receive.unshift({'id':'','label':'不限'});
                page.deps.shelveStatus.unshift({'id':'','label':'不限'});
                
                page.params.options.base[0].group[4].values = businessType;

                page.params.options.quick[5].values = page.deps.status;
                page.params.options.quick[6].values = page.deps.receive;
                page.params.options.quick[7].values = page.deps.shelveStatus;
                //page.fields.options[11].group[0].label = 'haha'
                Array.prototype.push.apply(page.fields.options[11].group, page.deps.status);
                Array.prototype.push.apply(page.fields.options[12].group, page.deps.receive);
                Array.prototype.push.apply(page.fields.options[13].group, page.deps.shelveStatus);

                list();
            })
        }

        /**
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row){
            var id = row.id;
            var toggle_state = row.status == 1 ? 0 : 1;


            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({id:id , status:toggle_state}).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    row.status = toggle_state;
                }
                sl.dep.update('OWNER');
                
                $timeout.cancel(loadingTimeout);
                page.loading = false;
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
                    console.log(resp);
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
            //将结果置入 查询参数中，会替换 原先已有的参数（例如 快速搜索）
            page.params.model = data;

            //console.log( data);
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

        function close(row){

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
            sl.pushIndex(data , '@');
            sl.dep.conv(data , page.deps);

            sl.format.grab(data,['baseWarehouse.warehouseName','baseShop.name','baseOwner.name']);

            sl.format.timestamp(data,['receiveTime','createdTime']);
            return data;
        }

    }]);

})
