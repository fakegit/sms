define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.vps_list', {
            url: 'vps',
            templateUrl: function($routeParams) {
                return 'script/vps/list.html?' + Date.now();
            },
            controller: 'vps.list'
        })
    }])
})
