/**
 *  拣货规则 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.outstock_package_check_list', {
            url: 'outstock/package',
            templateUrl: function($routeParams) {
                return 'view/outstock/package/list.html?' + Date.now();
            },
            controller: 'OutstockPackageListCtrl'
        })
    }])

})
