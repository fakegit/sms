define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockOutpickListCtrl', ['$scope', 'OutstockOutpickService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;
            console.log($scope)
        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '拣货任务列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "waveCode", "value": "波次号", "display": true }, 
                    { "key": "warehouseName", "value": "仓库名称", "display": true },
                    { "key": "ownerName", "value": "商家名称", "display": true }, 
                    { "key": "shopName", "value": "店铺名称", "display": true },
                    { "key": "logisticsName", "value": "承运商", "display": true },
                    { "key": "waybillTypeName", "value": "运单类型", "display": true },
                    { "key": "orderCount", "value": "订单数量", "display": true },
                    { "key": "wavePlanQuantity", "value": "商品总数", "display": true },
                    { "key": "taskPickedQuantity", "value": "已拣数量", "display": true },
                    { "key": "pickStatusName", "value": "拣货状态", "display": true },
                    { "key": "businessType", "value": "业务类型", "display": true },
                    { "key": "pickedTypeName", "value": "拣货方式", "display": true }
                ]
            },
            deps:{
                //bizControl:"OWNER_BIZ_CONTROL"
                'pickedType':'OUT_PICK_TASK_PICKED_TYPE',
                'pickStatus':'OUT_PICK_TASK_STATUS'
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
                                {title:'波次号',model:'waveCode',type:'input'},
                                {title:'仓库名称',model:'warehouseName',type:'input'},
                                {title:'商家名称',model:'ownerName',type:'input'},
                                {title:'店铺名称',model:'shopName',type:'input'},
                                {title:'承运商',model:'logisticsName',type:'input'},
                                
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'波次号',model:'waveCode'},
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'承运商',model:'logisticsName'}
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
            reset   : reset,
            search  : search
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
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            sl.dep.conv(data , page.deps);
            sl.format.index(data);
            sl.format.timestamp(data,['operatedTime','endTime']);
            //console.log(page.fields.model)
            return data;
        }

    }]);

})
