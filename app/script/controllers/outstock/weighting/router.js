/**
 *  拣货规则 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.outstock_weight_list', {
            url: 'outstock/weight',
            templateUrl: function($routeParams) {
                return 'view/outstock/weighting/list.html?' + Date.now();
            },
            controller: 'OutstockWeightListCtrl'
        })
    }])

})
