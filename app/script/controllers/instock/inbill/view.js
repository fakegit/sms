define(['app'], function(app) {

    return app.controller('InstockInbillViewCtrl', ['$scope', 'InstockInbillService','InstockReceiveService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service,IRService, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;

        var page = {

            loading: true,

            puton : false,

            title: '入库单详情',

            fields : {
                detail : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "baseGoods.skuCode", "value": "商品编码", "display": true },
                        
                        { "key": "baseGoods.skuName", "value": "商品名称", "display": true },
                        { "key": "quantity", "value": "应收商品数量", "display": true },
                        { "key": "receivedQty", "value": "实收数量", "display": true },
                        { "key": "unShelvedQty", "value": "待上架数量", "display": true },
                        { "key": "shelvedQty", "value": "已上架数量", "display": true },
                        { "key": "packUnitDesc", "value": "包装单位", "display": true },
                        // { "key": "unit", "value": "商品状态", "display": true },
                        { "key": "produceDate", "value": "生产日期", "display": true },
                        { "key": "expiryDate", "value": "过期时间", "display": true },
                        { "key": "customerLot", "value": "批次编码", "display": true }

                    ]
                },
                task : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "receiveLpn", "value": "容器编码", "display": true },
                        { "key": "skuCode", "value": "商品编码", "display": true },
                        { "key": "skuName", "value": "商品名称", "display": true },
                        { "key": "realPackQuantity", "value": "待上架数量", "display": true }, 
                        { "key": "unitDesc", "value": "包装单位", "display": true },
                        { "key": "inventoryStatusName", "value": "商品状态", "display": true },
                        { "key": "produceDate", "value": "生产日期", "display": true },
                        { "key": "expiryDate", "value": "过期日期", "display": true },
                        { "key": "customerLot", "value": "批次编码", "display": true },
                        { "key": "createdBy", "value": "操作人", "display": true },
                        { "key": "receiveTime", "value": "收货开始时间", "display": true },
                        { "key": "createdTime", "value": "收货完成时间", "display": true }
                    ]
                }
            },

            fields_def : {
               
            },

            deps:{
                //TODO 待上架明细 依赖
                //task : '/instock/inShelveTask/query?id='+
            }

        };


        sl.extend(vm , {
            page    : page, 
            remove  : remove,
            data    : data
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            service.get(id).then(function(resp){
                if(resp.returnCode){
                    page.loading = false;
                    sl.alert(resp.returnMsg);
                }
                else{
                    var d = resp.returnVal;
                    service.tasks( id ).then(function(resp){
                        page.loading = false;
                        d.taskList = resp.returnVal
                        setData(d);

                    })
                }
            });
        }

         /**
         * 处理并绑定数据
         */
        function setData(d){


            sl.format.grab(d.detailList , ['baseGoods.skuCode','baseGoods.skuName']);
            sl.format.timestamp(d.detailList , ['produceDate','expiryDate']);
            sl.format.timestamp(d.inInstorageBillVO , ['createdTime','planArrivalDate']);
            sl.format.timestamp(d.taskList , ['produceDate','expiryDate','receiveTime','createdTime']);

            sl.format.index(d.detailList,'@');
            sl.format.index(d.taskList,'@');

            page.id = id;
            page.puton = d.taskList.length > 0;
            vm.data = d;
        }

        /**
         * 删除待上架任务
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        function remove(row) {
            page.loading = true;
            IRService.remove([row.id]).then(function(resp) {
                if(!resp.returnCode){
                    sl.notify('操作完成');
                    init();
                }else{
                    sl.alert(resp.returnMsg);
                }
                page.loading = false;
            }, function(resp) {
                sl.alert('操作失败，请重试');
                page.loading = false;
            })
        }
    }]);

})
