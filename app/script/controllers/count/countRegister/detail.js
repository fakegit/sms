/**
 * Created by hubo on 2017/2/7.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('CheckRegisterDetailCtrl', ['$scope', 'CheckRegisterService', 'sl', '$timeout', 'ModalService', '$stateParams', 'Session', function($scope, service, sl, $timeout, ModalService, $stateParams, Session) {


        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        id = $stateParams.id;
        var vm = $scope,
            data = [];


        var page = {
            loading: true,

            title: '盘点登记',

            //表头显示字段
            fields: {
                options: [
                    { "key": "@", "value": "序号", "display": true },
                    { "key": "locationCode", "value": "库位", "display": true },
                    { "key": "ownName", "value": "商家", "display": true },
                    { "key": "shopName", "value": "店铺", "display": true },
                    { "key": "skuName", "value": "商品名称", "display": true },
                    { "key": "skuCode", "value": "商品编码", "display": true },
                    { "key": "customerLot", "value": "商家批号", "display": true },
                    { "key": "produceDate", "value": "生产日期", "display": true },
                    { "key": "expiryDate", "value": "失效日期", "display": true },
                    { "key": "storageDate", "value": "入库日期", "display": true },
                    { "key": "quantity", "value": "库存数量", "display": true },
                    { "key": "countQuantity", "value": "实盘数量", "display": true },
                    { "key": "diffQuantity", "value": "盈亏数量", "display": true }
                ],

                picker: {
                    warehouseId: '',
                    ownerId: '',
                    shopId: '',
                    type: '',
                    planId: '',
                    planDetailId: '',
                    goodsId: '',
                    lotId: '',
                    countQuantity: '',
                    countTime: '',
                    operatorId: '',
                    operator: ''
                },

                model: []
            },

            deps: {
                bizControl: "OWNER_BIZ_CONTROL"
            },

            //搜索字段
            params: {

                //必选字段请在此列出
                required: {
                    hgCode: ''
                },

                model: {},

                // 初始化筛选字段，
                options: {
                    // 用于 sl-search 插件
                },
                // 分页数据
                pag: {

                }
            },

            lots: [],

            data: {

            }

        };

        sl.extend(vm, {
            page: page,
            data: data,
            checkBe: checkBe,
            changeValue: changeValue,
            //list    : list,
            // toggle  : toggle,
            //reset   : reset,
            //search  : search,
            //searchByTable:searchByTable,

        })


        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function() {
                list();
            })
        }

        /**
         * 获取数据
         */
        function list() {
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = false;
            }, loadingLatency);
            service.list({ planId: id }).then(function(resp) {
                $timeout.cancel(loadingTimeout);
                page.loading = false;
                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                } else {
                    setData(resp.returnVal || []);
                }
            })
            listDetail();
        }

        function setData(data) {
            sl.format.index(data, '@');
            sl.format.timestamp(data, ['beginTime', 'endTime', 'createdTime', 'modifiedTime']);
            sl.format.timestamp(data.detailList, ['countTime']);
            vm.data = data;

            setDetail()
        }

        function setDetail() {
            var data = vm.data.detailList;
            for (var i = 0; i < data.length; i++) {
                if (data[i].statusName == "N") {
                    vm.paramsCopy = data[i];
                    vm.params = angular.copy(vm.paramsCopy);
                    changeLot();
                    return;
                }
            }
            
        }


        /**
         * 暂时无法获取到盘点人id，暂时用1替代
         * 下面方法用以引入登陆者信息
         *Session.get().id || Session.getAccount()
         */
        function getParams() {
            var obj = angular.copy(vm.params);
            sl.extend(obj, {
                warehouseId: vm.data.plan.warehouseId,
                ownerId: vm.data.plan.ownerId,
                shopId: vm.data.plan.shopId,
                type: vm.data.plan.type,
                planId: id,
                planDetailId: vm.params.id,
                operator: Session.getAccount(),
                operatorId: 1,
                countTime: sl.now()
            });
            obj = sl.pick(obj, page.fields.picker);
            return obj;

        }

        function listDetail(){
            service.detail(id).then(function(resp){
                var obj = resp.list || [];
                sl.format.timestamp(obj, ['produceDate', 'expiryDate', 'storageDate']);
                vm.page.fields.model = obj;
            })
        }

        /**
         * 执行盘点
         */
        function doCheck() {
            service.check(getParams()).then(function(resp) {
                if (!resp.returnCode) {
                    sl.alert("盘点成功");
                    listDetail();
                    /*
                    添加一行盘点数据
                     */
                    /*var obj = {};
                    sl.extend(obj, vm.params);
                    sl.extend(obj, getParams());
                    sl.extend(obj, { ownName: vm.data.plan.ownerName });
                    sl.timestamp(obj, ['produceDate', 'expiryDate', 'storageDate']);
                    vm.page.fields.model.unshift(obj);
                    for (var i = 0; i < vm.data.detailList.length; i++) {
                        // console.log(vm.data.detailList[0].id,vm.paramsCopy.id)
                        if (vm.data.detailList[i].id == vm.paramsCopy.id) {
                            vm.data.detailList[i].statusName = "Y";
                            sl.extend(vm.data.detailList[i], vm.params);
                            sl.extend(vm.data.detailList[i], getParams());
                            //setParams();
                            break;
                        }
                    }*/

                } else {
                    sl.alert(resp.returnMsg);
                }
            })

        }

        /**
         * 检验库位与商品是否存在
         */
        function checkBe() {
            var detail = valid();
            if (detail) {
                /*
                  检测是否该数据是否被盘点过
                 */
                if (vm.params.statusName == "Y") {
                    ModalService.open('countRegister.html', {
                        // alert:false,
                        // content:"该盘点任务明细已被盘点登记：盘点人："+vm.paramsCopy.operator+";盘点时间："+vm.paramsCopy.countTime+';盘点数量：'+vm.paramsCopy.countQuantity+";是否覆盖重盘",
                        data: vm.paramsCopy,
                        unload: function(modal) {
                            if (modal.result) {
                                doCheck();
                            }
                        }
                    })
                } else {
                    doCheck();
                }
            }

        }

        /**
         * 校验库位与商品信息
         */
        function valid(){
            var findLocationCode = 0,
                findSkuCode = 0;
            var detail = vm.data.detailList;
            var params = vm.params;
            for (var i = 0; i < detail.length; i++) {
                if (detail[i].locationCode == params.locationCode) {
                    findLocationCode = 1;
                    if (detail[i].skuCode == params.skuCode) {
                        findSkuCode = 1;
                        return detail[i];
                        break;
                    }
                }
            }

            if (findLocationCode == 0) {
                sl.alert("库位：" + vm.params.locationCode + "在当前计划中不存在");
                return false;
            }
            if (findLocationCode == 1 && findSkuCode == 0) {
                sl.alert("库位：" + vm.params.locationCode + "不包含商品" + vm.params.skuCode);
                return false;
            }

        }

        /**
         * 校验库位与商品信息，若相符合则自动填入信息
         */
        function changeValue() {
            var detail = valid();
            if(detail){
                vm.paramsCopy = detail;
                vm.params = angular.copy(vm.paramsCopy);
                changeLot();
            }
        }

        /*
         * 更新批号信息
         */
        function changeLot() {
            var lots = vm.data.detailList;
            var params = vm.params;
            var ret = [];
            for (var i in lots) {
                if (
                    lots[i].skuCode == params.skuCode && lots[i].locationCode == params.locationCode
                ) {
                    ret.push(lots[i]);
                }
            }
            vm.page.lots = ret;
        }

    }])
})
