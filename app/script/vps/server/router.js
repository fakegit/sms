define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.vps_server_list', {
            url: 'vps/server/list/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'script/vps/server/list.html?' + Date.now();
            },
            controller: 'vps.server.list'
        })

        .state('app.vps_server_view', {
            url: 'vps/server/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'script/vps/server/update.html?' + Date.now();
            },
            controller: 'vps.server.update'
        })

        .state('app.vps_server_create', {
            url: 'vps/server/create',
            templateUrl: function($routeParams) {
                return 'script/vps/server/update.html?' + Date.now();
            },
            controller: 'vps.server.update'
        })

        .state('app.vps_server_edit', {
            url: 'vps/server/:id/edit',
            templateUrl: function($routeParams) {
                return 'script/vps/server/update.html?' + Date.now();
            },
            controller: 'vps.server.update'
        })
        
        .state('app.vps_server_manager', {
            url: 'vps/server/:id/manager',
            templateUrl: function($routeParams) {
                return 'script/vps/server/manager.html?' + Date.now();
            },
            controller: 'vps.server.manager'
        })
    }])
})
