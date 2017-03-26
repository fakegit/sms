/**
 *      //入库//入库预约单管理界面
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.instock_reserve_list', {
            url: 'instock/reserve',
            templateUrl: function($routeParams) {
                return 'view/instock/reserve/list.html?' + Date.now();
            },
            controller: 'InstockReserveListCtrl'
        })

        .state('app.instock_reserve_create', {
            url: 'instock/reserve/:id',
            templateUrl: function($routeParams) {
                return 'view/instock/reserve/edit.html?' + Date.now();
            },
            controller: 'InstockReserveEditCtrl'
        })

        .state('app.instock_reserve_edit', {
            url: 'instock/reserve/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/instock/reserve/edit.html?' + Date.now();
            },
            controller: 'InstockReserveEditCtrl'
        })



    }])

})


 