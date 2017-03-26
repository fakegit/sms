/**
 *  拣货管理 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.outstock_outpick_list', {
            url: 'outstock/outpick',
            templateUrl: function($routeParams) {
                return 'view/outstock/outpick/list.html?' + Date.now();
            },
            controller: 'OutstockOutpickListCtrl'
        })
        .state('app.outstock_outpick_detail', {
            url: 'outstock/outpick/:id',
            templateUrl: function($routeParams) {
                return 'view/outstock/outpick/detail.html?' + Date.now();
            },
            controller: 'OutstockOutpickDetailCtrl'
        })
        .state('app.outstock_outpick_picking', {
            url: 'outstock/outpick/:id/picking',
            templateUrl: function($routeParams) {
                return 'view/outstock/outpick/picking.html?' + Date.now();
            },
            controller: 'OutstockOutpickPickingCtrl'
        })
    }])

})
