/**
 * Created by hubo on 2017/1/17.
 */
/**
 *  路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.count_countAdjustBill_list', {
                url: 'count/countAdjustBill',
                templateUrl: function($routeParams) {
                    return 'view/count/countAdjustBill/list.html?' + Date.now();
                },
                controller: 'CheckReversalListCtrl'
            })
            .state('app.count_countAdjustBill_detail', {
                url: 'count/countAdjustBill/:id',
                templateUrl: function($routeParams) {
                    return 'view/count/countAdjustBill/detail.html?' + Date.now();
                },
                controller: 'CheckReversalDetailCtrl'
            })

            



    }])

})
