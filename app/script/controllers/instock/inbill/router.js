/**
 *  //入库单管理 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.instock_inbill_list', {
            url: 'instock/inbill',
            templateUrl: function($routeParams) {
                return 'view/instock/inbill/list.html?' + Date.now();
            },
            controller: 'InstockInbillListCtrl'
        })
        .state('app.instock_inbill_view', {
            url: 'instock/inbill/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'view/instock/inbill/view.html?' + Date.now();
            },
            controller: 'InstockInbillViewCtrl'
        })
    }])

})
