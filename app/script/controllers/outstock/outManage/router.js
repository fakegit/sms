/**
 *      //出库//出库单管理
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.outstock_outmanage_list', {
            url: 'outstock/outManage',
            templateUrl: function($routeParams) {
                return 'view/outstock/outManage/list.html?' + Date.now();
            },
            controller: 'OutstockOutmanageListCtrl'
        })

        .state('app.outstock_outmanage_view', {
            url: 'outstock/outManage/:id',
            templateUrl: function($routeParams) {
                return 'view/outstock/outManage/view.html?' + Date.now();
            },
            controller: 'OutstockOutmanageViewCtrl'
        })


    }])

})


 