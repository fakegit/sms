define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.system_user_list', {
            url: 'system/user',
            templateUrl: function($routeParams) {
                return 'script/system/user/list.html?' + Date.now();
            },
            controller: 'system.user.list'
        })
        .state('app.system_user_view', {
            url: 'system/user/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'script/system/user/view.html?' + Date.now();
            },
            controller: 'system.user.view'
        })
    }])
})
