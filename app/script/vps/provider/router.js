define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.vps_provider_list', {
            url: 'vps/provider',
            templateUrl: function($routeParams) {
                return 'script/vps/provider/list.html?' + Date.now();
            },
            controller: 'vps.provider.list'
        })

        .state('app.vps_provider_create', {
            url: 'vps/provider/:id',
            templateUrl: function($routeParams) {
                return 'script/vps/provider/update.html?' + Date.now();
            },
            controller: 'vps.provider.update'
        })

        .state('app.vps_provider_edit', {
            url: 'vps/provider/:id/edit',
            templateUrl: function($routeParams) {
                return 'script/vps/provider/update.html?' + Date.now();
            },
            controller: 'vps.provider.update'
        })
        
        .state('app.vps_provider_manager', {
            url: 'vps/provider/:id/manager',
            templateUrl: function($routeParams) {
                return 'script/vps/provider/manager.html?' + Date.now();
            },
            controller: 'vps.provider.manager'
        })
    }])
})
