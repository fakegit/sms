/**
 * Created by hubo on 2017/1/16.
 */
/**
 *  路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.stockmgr_goodsStock_list', {
                url: 'stockmgr/goodsStock',
                templateUrl: function($routeParams) {
                    return 'view/stockmgr/goodsStock/list.html?' + Date.now();
                },
                controller: 'StockmgrGoodsStockListCtrl'

            })

    }])

})