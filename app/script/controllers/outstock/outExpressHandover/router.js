/**
 * Created by hubo on 2017/2/14.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.outstock_outExpressHandover_list', {
                url: 'outstock/outExpressHandover',
                templateUrl: function($routeParams) {
                    return 'view/outstock/outExpressHandover/list.html?' + Date.now();
                },
                controller: 'OutstockOutExpressHandoverListCtrl'
            })

    }])

})