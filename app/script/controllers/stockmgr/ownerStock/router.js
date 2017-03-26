/**
 * Created by hubo on 2017/1/14.
 */
/**
 *  路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.stockmgr_ownerStock_list', {
                url: 'stockmgr/ownerStock',
                templateUrl: function($routeParams) {
                    return 'view/stockmgr/ownerStock/list.html?' + Date.now();
                },
                controller: 'StockmgrOwnerStockListCtrl'
            })


    }])

})