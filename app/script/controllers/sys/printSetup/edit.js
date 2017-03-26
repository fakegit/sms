define(['app', 'moment'], function(app, moment) {

    return app.controller('SysPrintSetupEditCtrl', ['$scope', 'PrintSetService', 'sl', '$timeout', '$stateParams', 'ModalService', function($scope, service, sl, $timeout, $stateParams, modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit'),

            isView = !isEdit && !isCreate;

        var page = {

            loading: true,

            edit: isEdit,

            view: isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '打印设置',

            fields: { "templateName": "", "templateTypeName": "", "warehouseCode": "", "businesCode": "", "shopCode": "", "pickType": "", "logisticsId": "", "id": "" },

            deps: {
                'logisticId': 'LOGISTICS',
                'warehouseId': 'WAREHOUSE',
                'pickType':'PICK_TYPE',
                'buttonId': 'PRINT_BUTTON'
            }
        };


        sl.extend(vm, {
            page: page,
            data: data,
            save: save,
            reset: reset,

            // 所属获取
            getModalType: getModalType,
            getModal: getModal,
            getOwner: getOwner,
            getShop: getShop
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(deps) {

                service.getTypes().then(function(resp) {
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);
                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        page.deps.modalTypes = resp.returnVal;
                        page.deps.modalTypes_hash = sl.hash(page.deps.modalTypes, 'id', 'name');
                        page.deps.checkType = [];
                        for(var i in page.deps.modalTypes) {
                            page.deps.checkType[page.deps.modalTypes[i].id] = page.deps.modalTypes[i];
                        }
                        if (!isCreate) {
                            service.get(id).then(function(resp) {
                                page.loading = false;
                                if (resp.returnCode) {
                                    sl.alert(resp.returnMsg);
                                } else {
                                    setData(resp.returnVal);
                                    if (vm.data.buttonId) {
                                        getModalType();
                                    }
                                    if (vm.data.warehouseCode) {
                                        getOwner();
                                    }
                                }
                            });
                        } else {
                            page.loading = false;
                        }
                    }
                });
            })
        }

        function getModalType() {
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            service.getType(vm.data.buttonId).then(function(resp) {
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                } else {
                    // 筛选当前button模板类型
                    page.deps.modalType = [];
                    for(var i in resp.returnVal) {
                        var obj = page.deps.checkType[resp.returnVal[i]];
                        page.deps.modalType.push(obj);
                    }
                    if (vm.data.templateTypeId) {
                        getModal();
                    }
                }
            });
        }

        function getModal() {
            if (vm.data.templateTypeId) {
                loadingTimeout = $timeout(function() {
                    page.loading = true;
                }, loadingLatency);
                service.getModal(vm.data.templateTypeId).then(function(resp) {
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        // 筛选当前button模板类型
                        page.deps.modal = resp.returnVal;
                        page.deps.modal_hash = sl.hash(resp.returnVal, 'id', 'name');
                    }
                });
            }
        }

        function getOwner() {
            if (vm.data.warehouseCode) {
                loadingTimeout = $timeout(function() {
                    page.loading = true;
                }, loadingLatency);
                service.getOwn(vm.data.warehouseCode).then(function(resp) {
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        if (resp.returnVal) {
                            page.deps.ownerId = resp.returnVal;
                        }
                        if (vm.data.businesCode) {
                            getShop();
                        }
                    }
                });
            }
        }

        function getShop() {
            if (vm.data.businesCode) {
                loadingTimeout = $timeout(function() {
                    page.loading = true;
                }, loadingLatency);
                service.getShop(vm.data.businesCode).then(function(resp) {
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if (resp.returnCode) {
                        sl.alert(resp.returnMsg);
                    } else {
                        page.deps.shopId = resp.returnVal;
                    }
                });
            }
        }

        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save() {
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.update(getData(), isEdit).then(function(resp) {
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if (resp.returnCode) {
                    sl.alert(resp.returnMsg);
                } else {
                    sl.notify('保存成功');
                }
            });
        }


        /**
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {
            setData(raw);
        }

        /**
         * 处理并绑定数据
         */
        function setData(d) {
            raw = d;
            vm.data = d;
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData() {
            var params = angular.copy(vm.data);
            if (params.templateTypeId) {
                params.templateTypeName = page.deps.modalTypes_hash[params.templateTypeId];
            }
            if (params.templateId) {
                params.templateName = page.deps.modal_hash[params.templateId];
            }
            if (isEdit) {
                params = sl.pick(params, page.fields);
            }
            return params;
        }

    }]);

})
