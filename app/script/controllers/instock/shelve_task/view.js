/**
 * 查看上架任务
 * 
 * @date     2017-01-03
 * @author   wuting<reruin@gmail.com>
 */
define(['app'], function(app) {

    return app.controller('InstockShelveTaskViewCtrl', ['$scope', 'InstockShelveTaskService','InstockShelveRecordService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service,record_service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;

        var page = {

            loading: true,

            title: '查看上架任务',

            fields : {
                task : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "orderNo", "value": "入库单号", "display": true },
                        { "key": "ownerName", "value": "商家名称", "display": true },
                        { "key": "shopName", "value": "店铺名称", "display": true },
                        { "key": "lpn", "value": "容器编码", "display": true },
                        { "key": "skuCode", "value": "商品编码", "display": true },
                        { "key": "skuName", "value": "商品名称", "display": true },
                        // { "key": "uk0", "value": "单据类型", "display": true }, 
                        // { "key": "", "value": "业务类型", "display": true },
                        { "key": "quantity", "value": "应上数量", "display": true },
                        { "key": "shelvedQuantity", "value": "已上数量", "display": true },
                        { "key": "unitDesc", "value": "包装单位", "display": true },
                        { "key": "inventoryStatusName", "value": "商品状态", "display": true },
                        { "key": "customerLot", "value": "批次编码", "display": true },
                        { "key": "suggestLocCode", "value": "推荐库位", "display": true }
                    ]
                },
                record : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "taskCode", "value": "任务单号", "display": true }, 
                        { "key": "instorageBillCode", "value": "入库单号", "display": true },
                        { "key": "ownerName", "value": "商家名称", "display": true }, 
                        { "key": "shopName", "value": "店铺名称", "display": true },
                        { "key": "lpn", "value": "容器编码", "display": true },
                        { "key": "goodsCode", "value": "商品编码", "display": true },
                        { "key": "goodsCode", "value": "商品名称", "display": true },
                        { "key": "unit", "value": "包装单位", "display": true },
                        { "key": "inventoryStatus", "value": "商品状态", "display": true },
                        { "key": "lot", "value": "批次编码", "display": true },
                        { "key": "quantity", "value": "上架数量", "display": true },
                        { "key": "suggestLocCode", "value": "推荐库位", "display": true },
                        { "key": "toLocCode", "value": "实上库位", "display": true },
                        { "key": "operator", "value": "操作人", "display": true },
                        { "key": "operatedTime", "value": "操作时间", "display": true },
                    ]
                }
            },

            fields_def : {
                status : 1,
                shops:[]
            },

            deps:{
                //'record':'/instock/shelveRecord/page?recordId=' + id
            },

            taskStatus:'2'
        };


        sl.extend(vm , {
            page    : page, 
            data    : data
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            // var url = '/instock/shelveRecord/page?recordId=' + id;

            record_service.list({taskId:id}).then(function(resp){
                page.deps.record = resp.list || [];
                service.get(id).then(function(resp){
                    page.loading = false;
                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }
                    else{
                        setData(resp.returnVal);
                    }
                });
            })
        }



         /**
         * 处理并绑定数据
         */
        function setData(d){
            raw = d;
            vm.data = {};
            vm.data.task   = d;//sl.pick( d , page.fields.task);
            vm.data.record = page.deps.record;//sl.pick( page.deps.record , page.fields.record);
            vm.data.id = id;
            sl.format.index(vm.data.task , '@');
            sl.format.index(vm.data.record , '@');
            sl.format.timestamp(vm.data.record , ['operatedTime']);

            if(vm.data.task.length)
                page.taskStatus = vm.data.task[0].taskStatus;
        }

    }]);

})
