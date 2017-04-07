define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.system_role_list', {
            url: 'system/role',
            templateUrl: function($routeParams) {
                return 'script/system/role/list.html?' + Date.now();
            },
            controller: 'system.role.list'
        })
        
        .state('app.system_role_create', {
            url: 'system/role/:id',
            templateUrl: function($routeParams) {
                return 'script/system/role/edit.html?' + Date.now();
            },
            controller: 'system.role.edit'
        })

        .state('app.system_role_edit', {
            url: 'system/role/:id/:act',
            templateUrl: function($routeParams) {
                return 'script/system/role/edit.html?' + Date.now();
            },
            controller: 'system.role.edit'
        })
    }])
})
