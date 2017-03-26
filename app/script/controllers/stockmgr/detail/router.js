/**
 *  路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

        .state('app.stockmgr_detail_list', {
            url: 'stockmgr/detail',
            templateUrl: function($routeParams) {
                return 'view/stockmgr/detail/list.html?' + Date.now();
            },
            controller: 'StockmgrDetailListCtrl'
        })
        .state('app.stockmgr_detail_edit', {
            url: 'stockmgr/detail/:id',
            templateUrl: function($routeParams) {
                return 'view/stockmgr/detail/edit.html?' + Date.now();
            },
            controller: 'StockmgrDetailEditCtrl'
        })
        .state('app.stockmgr_detail_change', {
            url: 'stockmgr/detail/:id/change',
            templateUrl: function($routeParams) {
                return 'view/stockmgr/detail/change.html?' + Date.now();
            },
            controller: 'StockmgrDetailChangeCtrl'
        })


    }])

})
