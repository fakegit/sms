define(['app', 'moment'], function(app, moment) {

    return app.controller('InstockReceiveRecordListCtrl', ['$scope', 'InstockReceiveService','InstockShelveTaskService', 'sl', '$timeout', function($scope, service,shelve_service ,sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;
        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '收货记录列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "orderNo", "value": "入库单号", "display": true },
                    { "key": "warehouseName", "value": "仓库名称", "display": true }, 
                    { "key": "receiveLpn", "value": "容器编码", "display": true },
                    
                    { "key": "ownerName", "value": "商家名称", "display": true }, 
                    { "key": "shopName", "value": "店铺名称", "display": true },
                    { "key": "skuCode", "value": "商品编码", "display": true },
                    { "key": "skuName", "value": "商品名称", "display": true },
                    { "key": "unitDesc", "value": "包装单位", "display": true },
                    { "key": "inventoryStatusName", "value": "商品状态", "display": true },
                    { "key": "customerLot", "value": "批次编码", "display": true },
                    { "key": "realPackQuantity", "value": "收货数量", "display": true },
                    { "key": "receiveTypeName", "value": "收货方式", "display": true },
                    { "key": "taskCode", "value": "任务单号", "display": true },
                    { "key": "taskStatusName", "value": "任务创建状态", "display": true },
                    { "key": "receiver", "value": "操作人", "display": true },
                    { "key": "receiveTime", "value": "操作时间", "display": true },
                    { "key": "createdTime", "value": "结束时间", "display": true }
                ]
            },
            
            deps:{
                //bizControl:"OWNER_BIZ_CONTROL"
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
                                {title:'容器编码',model:'receiveLpn',type:'input'},
                                {title:'商家名称',model:'ownerName',type:'input'},
                                {title:'店铺名称',model:'shopName',type:'input'},
                                {title:'商品名称',model:'skuName',type:'input'},
                                {title:'商品编码',model:'skuCode',type:'input'},
                                {title:'批次编码',model:'customerLot',type:'input'},
                                {title:'任务单号',model:'shelveWaveCode',type:'input'},
                                {title:'任务状态',model:'taskStatusName',type:'select',
                                    values:[{id:'',label:'不限'},{id:'已创建',label:'已创建'},{id:'未创建',label:'未创建'}]
                                }
                            ]
                        },
                        {
                            title: "操作",
                            group :[
                                {title:'操作人',model:'receiver',type:'input'},

                                {title:'操作时间',model:['startTime','endTime'],type:'datetime'}
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'入库单号',model:'orderNo'},
                        {title:'容器编码',model:'receiveLpn'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'商品名称',model:'skuName'},
                        {title:'商品编码',model:'skuCode'},
                        {title:'批次编码',model:'customerLot'},
                        {title:'任务单号',model:'shelveWaveCode'},
                        {title:'操作人',model:'receiver'}
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
            remove  : remove,
            puton  : puton,
            search  : search,
            searchByTable:searchByTable
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

        /**
         * 删除
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        function remove(items) {
            console.log(items)
            if(items.length){
                page.loading = true;
                service.remove(items).then(function(resp) {
                    if(!resp.returnCode){
                        sl.notify('操作完成');
                        list();
                    }else{
                        sl.alert(resp.returnMsg);
                    }
                    page.loading = false;
                }, function(resp) {
                    sl.notify('操作失败，请重试','error');
                    page.loading = false;
                })
            }else{
                sl.alert('请选择要删除的收货任务');
            }
        }

        function puton(items){
            if(items.length){
                sl.confirm({
                    content:'当前勾选 '+items.length+' 条收货记录，确定生成上架任务吗？',
                    buttons:[
                        {title:'确定生成',callback:function(){
                            page.loading = true;
                            shelve_service.create( items ).then(function(resp) {
                                if(!resp.returnCode){
                                    sl.confirm({
                                        content:'上架任务：'+resp.returnVal+' 创建成功，是否打印单据？',
                                        buttons:[
                                            {title:'打印',callback:function(){
                                                print(items);
                                            }},
                                            {title:'返回'}
                                        ]
                                    })
                                    //console.log(resp);
                                    list();
                                }else{
                                    sl.alert(resp.returnMsg);
                                }
                                page.loading = false;
                            }, function(resp) {
                                sl.log.error(resp);
                                page.loading = false;
                            })
                        }},
                        {title:'返回'}
                    ]
                })
                
            }else{
                sl.alert('请选择收货任务');
            }
            
        }

        function print(v){
            console.log(v);
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
            sl.pushIndex(data , '@');
            sl.dep.conv(data , page.deps);
            sl.timestamp(data,['receiveTime','createdTime']);
            return data;
        }

    }]);

})
