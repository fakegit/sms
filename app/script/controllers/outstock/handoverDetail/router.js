/**
 * Created by hubo on 2017/2/16.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.outstock_handoverDetail_list', {
                url: 'outstock/handoverDetail',
                templateUrl: function($routeParams) {
                    return 'view/outstock/handoverDetail/list.html?' + Date.now();
                },
                controller: 'OutstockHandoverDetailListCtrl'
            })



    }])

})
