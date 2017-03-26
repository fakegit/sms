define(['app', 'moment'], function(app, moment) {

    app.directive('setFocus', function() {
        return function(scope, element) {
            element[0].focus();
        };
    });

    return app.controller('OutstockWeightListCtrl', ['$scope', 'OutstockWeightService', 'sl', '$timeout', 'ModalService', '$state', function($scope, service, sl, $timeout, modalService, $state) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,
            data = {};

        var page = {
            loading: true,
            tip: {
                documentNo: '',
                weight: '',
                result: ''
            }
        };



        sl.extend(vm, {
            page: page,
            data: data,

            checkWeight: checkWeight,
            checkDocumentNo: checkDocumentNo
        })

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
                    var paras = {
                        orderNo: documentNo
                    }
                    service.checkorder(paras).then(function(resp) {
                        $timeout.cancel(loadingTimeout);
                        page.loading = false;

                        if (resp.returnCode) {
                            // 返回复核提示信息
                            sl.speek(resp.returnMsg);
                            page.tip.documentNo = resp.returnMsg;
                            document.getElementById('documentNo').select();
                        } else {
                            vm.data = resp.returnVal;
                            page.billId = resp.returnVal.id;
                            // 输入焦点到sku之后可用指令代替
                            document.getElementById('weight').focus();
                            document.getElementById('weight').select();
                        }
                    });
                } else {
                    sl.alert("请输入订单号或运单号");
                }
            }
        }

        /**
         * weight
         */
        function checkWeight(e) {
            page.tip.weight = '';
            var keycode = window.event ? e.keyCode : e.which;
            var reg = /^\d+\.?\d{0,3}$/;
            if (keycode == 13) {
                var weight = page.weight;
                if (reg.test(weight)) {
                    if (!page.billId) {
                        sl.speek("请先扫描或输入有效的未称重单号");
                        page.tip.weight = '请先扫描或输入有效的未称重单号';
                        // page.weight = '';
                        document.getElementById('documentNo').focus();
                        document.getElementById('documentNo').select();
                        return false;
                    }
                    if (weight) {
                        var skuParas = {
                            'id': page.billId,
                            'weight': weight
                        };
                        $timeout.cancel(loadingTimeout);

                        loadingTimeout = $timeout(function() {
                            page.loading = true;
                        }, loadingLatency);

                        service.checkWeight(skuParas).then(function(resp) {
                            $timeout.cancel(loadingTimeout);
                            page.loading = false;

                            if (resp.returnCode) {
                                sl.speek(resp.returnMsg);
                                page.tip.weight = resp.returnMsg;
                            } else {
                                sl.speek("称重完成");
                                page.tip.result = "称重完成！";
                                /*$timeout({
                                    finish();
                                }, 1000);*/
                                finish();
                            }
                        });
                    } else {
                        sl.alert("请输入重量");
                        sl.speek("请输入重量");
                    }
                }
                
            }
        }

        function finish() {
            $timeout.cancel(loadingTimeout);
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            var paras = {
                'id': page.billId,
                'weight': page.weight
            };
            service.finish(paras).then(function(resp) {
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if (resp.returnCode) {
                    sl.speek(resp.returnMsg);
                    page.tip.weight = resp.returnMsg;
                    page.tip.result = "发货失败";
                } else {
                    sl.speek("发货成功");
                    page.tip.result = "发货成功！";
                    page.weight = '';
                    document.getElementById('documentNo').focus();
                    document.getElementById('documentNo').select();
                }
            });
        }
    }]);
})
