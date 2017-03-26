/**
 *  //上架任务 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.instock_shelveTask_list', {
            url: 'instock/shelve_task',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_task/list.html?' + Date.now();
            },
            controller: 'InstockShelveTaskListCtrl'
        })

        .state('app.instock_shelveTask_view', {
            url: 'instock/shelve_task/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_task/view.html?' + Date.now();
            },
            controller: 'InstockShelveTaskViewCtrl'
        })

        .state('app.instock_shelveTask_puton_byidcode', {
            url: 'instock/puton/:id/:code',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_task/edit.html?' + Date.now();
            },
            controller: 'InstockShelveTaskEditCtrl'
        })

        .state('app.instock_shelveTask_puton_byid', {
            url: 'instock/puton/:id',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_task/edit.html?' + Date.now();
            },
            controller: 'InstockShelveTaskEditCtrl'
        })

        .state('app.instock_shelveTask_puton', {
            url: 'instock/puton',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_task/edit.html?' + Date.now();
            },
            controller: 'InstockShelveTaskEditCtrl'
        })
    }])

})
