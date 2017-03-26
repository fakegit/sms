define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.count_plan_list', {
            url: 'count/plan',
            templateUrl: function($routeParams) {
                return 'view/count/plan/list.html?' + Date.now();
            },
            controller: 'CountPlanListCtrl'
        })

        .state('app.count_plan_create', {
            url: 'count/plan/:id',
            templateUrl: function($routeParams) {
                return 'view/count/plan/edit.html?' + Date.now();
            },
            controller: 'CountPlanEditCtrl'
        })

/*        .state('app.count_plan_view', {
            url: 'count/plan/:id/view',
            templateUrl: function($routeParams) {
                return 'view/count/plan/view.html?' + Date.now();
            },
            controller: 'CountPlanViewCtrl'
        })*/

        .state('app.count_plan_edit', {
            url: 'count/plan/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/count/plan/edit.html?' + Date.now();
            },
            controller: 'CountPlanEditCtrl'
        })




    }])

})


 