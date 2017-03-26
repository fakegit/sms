/**
 * Created by hubo on 2017/1/12.
 * 拣货任务明细
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockOutpickDetailCtrl', ['$scope', 'OutstockOutpickService','InstockShelveTaskService', 'sl', '$timeout','$stateParams', function($scope, service,shelve_service ,sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;
        var vm = $scope, data = [];
        id = $stateParams.id;

        var page = {
            loading: false,

            title : '拣货明细',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号"},
                    { "key": "customerNo", "value": "客户单号"},
                    { "key": "orderNo", "value": "出库单号"},
                    { "key": "shopName", "value": "店铺" },
                    { "key": "skuCode", "value": "SKU"},
                    { "key": "lotCode", "value": "批次号" },
                    { "key": "produceDate", "value": "生产日期"},
                    { "key": "expiryDate", "value": "有效期至"},
                    { "key": "storageDate", "value": "入库日期"},
                    { "key": "recomLocCode", "value":"推荐库位"},
                    { "key": "realLocCode", "value": "拣货库位" },
                    { "key": "planQuantity", "value": "SKU数量" },
                    { "key": "pickedQuantity", "value": "已拣数量" },
                    { "key": "skuName", "value": "名称" },
                    { "key": "modifiedTime", "value": "拣货时间" },
                    { "key": "modifiedBy", "value": "拣货人"},

                ]
            },

            deps:{
                //bizControl:"OWNER_BIZ_CONTROL".
                'businessType':'BUSINESS_TYPE'
            },

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                  waveId:id
                },
                model: {},

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
         * 分页查询
         */
        function list(){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            //console.log()
            service.get(getParas()).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{

                    setData(resp);

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
         * 获取查询参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function getParas() {
            var obj = angular.copy( page.params.model ) , search_arr = [];

            sl.extend( obj , page.params.required );
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

        function setData(resp){
            //更新分页数据
            vm.data = resp.returnVal || {};
            vm.data.details = resp.list || [];

            sl.format.index(vm.data.details , '@');
            sl.format.timestamp(vm.data,['receiveTime','createdTime','produceDate','expiryDate','storageDate','modifiedTime']);

            sl.dep.conv(vm.data,page.deps);
            console.log(vm.data)
            page.params.pag.model.itemCount = resp.total;
        }


    }]);

})