/**
 *  //收货记录查询 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.vps_list', {
            url: 'vps',
            templateUrl: function($routeParams) {
                return 'view/vps/owner/list.html?' + Date.now();
            },
            controller: 'VPSOwnerListCtrl'
        })

        // .state('app.vps_detail', {
        //     url: 'vps/{id:[0-9]+}',
        //     templateUrl: function($routeParams) {
        //         return 'view/vps/detail.html?' + Date.now();
        //     },
        //     controller: 'VPSDetailCtrl'
        // })
    }])

})
