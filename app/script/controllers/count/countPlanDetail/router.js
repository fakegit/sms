/**
 * Created by hubo on 2017/2/6.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.count_countPlanDetail_list', {
                url: 'count/countPlanDetail',
                templateUrl: function($routeParams) {
                    return 'view/count/countPlanDetail/list.html?' + Date.now();
                },
                controller: 'CheckDetailListCtrl'
            })

    }])

})