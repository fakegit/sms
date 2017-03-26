/**
 * Created by hubo on 2017/2/4.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.count_countRecord_list', {
                url: 'count/countRecord',
                templateUrl: function($routeParams) {
                    return 'view/count/countRecord/list.html?' + Date.now();
                },
                controller: 'CheckRecordsListCtrl'
            })

    }])

})
