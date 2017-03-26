/**
 * Created by hubo on 2017/2/16.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.outstock_expressHandover_list', {
                url: 'outstock/expressHandover',
                templateUrl: function($routeParams) {
                    return 'view/outstock/expressHandover/list.html?' + Date.now();
                },
                controller: 'OutstockexpressHandoverListCtrl'
            })



    }])

})
