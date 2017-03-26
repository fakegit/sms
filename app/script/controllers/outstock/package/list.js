define(['app', 'moment'], function(app, moment) {

    app.directive('setFocus', function() {
        return function(scope, element) {
            element[0].focus();
        };
    });

    return app.controller('OutstockPackageListCtrl', ['$scope', 'OutstockPackageService', 'sl', '$timeout', 'ModalService', '$state', function($scope, service, sl, $timeout, modalService, $state) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,
            data = {};

        var page = {
            loading: true,

            //表头显示字段
            fields: {
                options: [
                    { "key": "@", "value": "序号", "display": true },
                    { "key": "customerName", "value": "商家名称", "display": true },
                    { "key": "shopName", "value": "店铺名称", "sort": 1, "display": true },
                    { "key": "goodsSkuName", "value": "商品名称", "display": true },

                    { "key": "goodsSkuCode", "value": "商品编码", "display": true },
                    { "key": "quantity", "value": "商品数量", "display": true },

                    { "key": "checkedQuantity", "value": "已复核", "display": true },
                    { "key": "unCheckedQuantity", "value": "待复核", "display": true },
                    { "key": "packUnitDesc", "value": "包装单位", "display": true },
                    { "key": "inventoryStatusName", "value": "商品状态", "display": true }
                ]
            },

            // 复核信息
            checkInfo: {
                goodsSkuName: '',
                checkedQuantity: '',
                unCheckedQuantity: ''
            },

            // 单号提示字段
            tip: {
                documentNo: '',
                sku: '',
                result: ''
            },
            // 请求参数 
            interface: {
                billId: '',
                    billDetailId: ''
            },

            deps:{
                'inventoryStatus':'INVENTORY_STATUS'
            }
        };



        sl.extend(vm, {
            page: page,
            data: data,

            checkChange: checkChange,
            checkSkuNo: checkSkuNo,
            checkDocumentNo: checkDocumentNo,
            lock: lock,
            checkAll: checkAll
        })

        // 关闭页面的提示
        sl.unload.on($state.current.name, function(mode) {
            if (mode == 1) {
                return '当前任务没有提交....'
            }
            else {
                return function(resp) {
                    // 未复核则不提醒
                    if (curNo == 1) {
                        modalService.open({
                            alert: false,
                            content: '复核未完成，是否退出？',
                            title: '提示'
                        }).then(function(modal) {
                            if (!modal.result) {
                                resp(false);
                            }
                            else {
                                resp(true);
                            }
                        });
                    }
                    else {
                        resp(true);
                    }
                }
            }
        })

        /*window.onbeforeunload = function (e) {
            e = e || window.event;

            // 兼容IE8和Firefox 4之前的版本
            if (e) {
                e.returnValue = '关闭提示';
            }

            // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
            return '关闭提示';
        };*/

        // 面单
        var curNo = 0,
            curNos = '';

        function checkDocumentNo(e) {
            page.tip.documentNo = '';
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                var documentNo = page.documentNo;
                if (documentNo) {
                    $timeout.cancel(loadingTimeout);

                    loadingTimeout = $timeout(function() {
                        page.loading = true;
                    }, loadingLatency);

                    service.checkDocumentNo(documentNo).then(function(resp) {
                        $timeout.cancel(loadingTimeout);
                        page.loading = false;

                        if (resp.returnCode) {
                            // 返回复核提示信息
                            sl.speek(resp.returnMsg);
                            page.tip.documentNo = resp.returnMsg;
                            document.getElementById('documentNo').select();
                        } else {
                            curNos = documentNo;
                            vm.data = afterList(resp.returnVal);
                            page.interface.billId = resp.returnVal.billVo.id;
                            // 输入焦点到sku之后可用指令代替
                            document.getElementById('sku').focus();
                            document.getElementById('sku').select();
                        }
                    });
                } else {
                    sl.alert("请输入订单号或运单号");
                    sl.speek("请输入订单号或运单号");
                }
            }
        }

        function checkChange() {
            if (curNo == 1 && curNos != page.documentNo) {
                sl.speek("当前订单复核未完成");
                modalService.open({
                    alert: false,
                    content: '当前订单复核未完成，是否要换单复核？',
                    title: '提示'
                }).then(function(modal) {
                    if (modal.result) {
                        curNo = 0;
                    }
                });
            }
        }


        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            var obj = data.details;
            for (var i in obj) {
                obj[i].customerName = data.billVo.customerName;
                obj[i].shopName = data.billVo.shopName;
            }
            sl.pushIndex(obj, '@');
            sl.dep.conv(obj,page.deps);
            return obj;
        }

        /**
         * sku
         */
        function checkSkuNo(e) {
            page.tip.sku = '';
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                var sku = page.sku;
                if (!page.documentNo) {
                    sl.speek("请先扫描或输入单号");
                    page.tip.sku = '请先扫描或输入单号';
                    document.getElementById('documentNo').focus();
                    document.getElementById('documentNo').select();
                    return false;
                }
                if (!page.interface.billId) {
                    sl.speek("请先扫描或输入有效单号");
                    sl.alert("请先扫描或输入有效单号");
                    document.getElementById('documentNo').focus();
                    document.getElementById('documentNo').select();
                    return false;
                }
                if (sku) {
                    var skuParas = {
                        'billId': page.interface.billId,
                        'sku': sku
                    };
                    $timeout.cancel(loadingTimeout);

                    loadingTimeout = $timeout(function() {
                        page.loading = true;
                    }, loadingLatency);

                    service.checkSku(skuParas).then(function(resp) {
                        $timeout.cancel(loadingTimeout);
                        page.loading = false;

                        if (resp.returnCode) {
                            // 返回复核提示信息
                            vm.date = [];
                            sl.speek(resp.returnMsg);
                            page.tip.sku = resp.returnMsg;
                            if (resp.returnCode == 1907) {
                                curNo = 0;
                            }
                            document.getElementById('sku').focus();
                            document.getElementById('sku').select();
                        } else {
                            page.tip.sku = '';
                            page.checkInfo.goodsSkuName = resp.returnVal.goodsSkuName;
                            page.checkInfo.checkedQuantity = resp.returnVal.checkedQuantity;
                            page.checkInfo.unCheckedQuantity = resp.returnVal.unCheckedQuantity;
                            page.interface.billDetailId = resp.returnVal.id;
                            // check if num is locked
                            if (page.isNum) {
                                if (page.skuNum && page.skuNum > 0) {
                                    // 执行复核
                                    checkAll();
                                } else {
                                    sl.speek('请检查商品数量数量');
                                    document.getElementById('skuNum').focus();
                                    document.getElementById('skuNum').select();
                                }
                            } else {
                                document.getElementById('skuNum').focus();
                                document.getElementById('skuNum').select();
                            }
                        }
                    });
                } else {
                    sl.alert("请输入编码/条码");
                    sl.speek("请输入编码/条码");
                }
            }
        }

        function checkAll(e) {
            if (e) {
                var keycode = window.event ? e.keyCode : e.which;
                if (keycode == 13) {
                    var skuNum = page.skuNum;
                    if (skuNum && skuNum > 0) {
                        check();
                    } else {
                        sl.speek('请检查商品数量数量');
                        document.getElementById('skuNum').focus();
                        document.getElementById('skuNum').select();
                    }
                }
            } else {
                check();
            }
        }

        function check() {
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            var paras = {
                billId: page.interface.billId,
                billDetailId: page.interface.billDetailId,
                qty: page.skuNum
            };
            service.check(paras).then(function(resp) {
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if (resp.returnCode) {
                    page.checkInfo.result = resp.returnMsg;
                    sl.speek(resp.returnMsg);
                    if (page.checkInfo.result == '数量超出') {
                        curNo = 0;
                    }
                } else {
                    curNo = 1;
                    page.checkInfo.result = "成功！";
                    page.checkInfo.unCheckedQuantity--;
                    page.checkInfo.checkedQuantity++;
                    //选中当前列
                    active(page.sku);
                    sl.speek('成功');
                    // check if num is locked
                    if (!page.isNum) {
                        page.skuNum = '';
                    }
                    document.getElementById('sku').focus();
                    document.getElementById('sku').select();
                }
            });
        }

        function active(now) {
            var all = 0, allLen = vm.data.length;
            for (var i in vm.data) {
                if (vm.data[i].goodsSkuCode == now) {
                    vm.data[i].isActive = true;
                    if (vm.data[i].checkedQuantity < vm.data[i].quantity) {
                        vm.data[i].checkedQuantity++;
                    }
                    if (vm.data[i].unCheckedQuantity > 0) {
                        vm.data[i].unCheckedQuantity = vm.data[i].quantity - vm.data[i].checkedQuantity;
                    }
                    if (vm.data[i].unCheckedQuantity + vm.data[i].checkedQuantity == vm.data[i].quantity) {
                        all++ ;
                    }
                    if (all == allLen) {
                        curNo = 0;
                        sl.speek("复核完成");
                    }
                    break;
                }
            }
        }

        // lock num
        function lock(e) {
            if (page.isNum) {
                if (!page.skuNum) {
                    page.isNum = false;
                    page.ifLock = false;
                    sl.alert("请输入锁定的数量");
                    document.getElementById('skuNum').focus();
                    document.getElementById('skuNum').select();
                } else {
                    page.ifLock = true;
                }
            } else {
                page.ifLock = false;
            }
        }
    }]);
})
