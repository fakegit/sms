/**
 * Created by hubo on 2017/1/12.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.sys_printSetup_list', {
                url: 'sys/printSetup',
                templateUrl: function($routeParams) {
                    return 'view/sys/printSetup/list.html?' + Date.now();
                },
                controller: 'SysPrintSetupListCtrl'
            })

            .state('app.sys_printSetup_create', {
                url: 'sys/printSetup/:id',
                templateUrl: function($routeParams) {
                    return 'view/sys/printSetup/edit.html?' + Date.now();
                },
                controller: 'SysPrintSetupEditCtrl'
            })

            .state('app.sys_printSetup_edit', {
                url: 'sys/printSetup/:id/:act',
                templateUrl: function($routeParams) {
                    return 'view/sys/printSetup/edit.html?' + Date.now();
                },
                controller: 'SysPrintSetupEditCtrl'
            })
    }])

})