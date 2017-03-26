/**
 *  拣货规则 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.rule_location_assign_list', {
            url: 'rule/location_assign',
            templateUrl: function($routeParams) {
                return 'view/rule/location_assign/list.html?' + Date.now();
            },
            controller: 'RuleLocationAssignListCtrl'
        })

        .state('app.rule_location_assign_create', {
            url: 'rule/location_assign/:id',
            templateUrl: function($routeParams) {
                return 'view/rule/location_assign/edit.html?' + Date.now();
            },
            controller: 'RuleLocationAssignEditCtrl'
        })

        .state('app.rule_location_assign_edit', {
            url: 'rule/location_assign/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/rule/location_assign/edit.html?' + Date.now();
            },
            controller: 'RuleLocationAssignEditCtrl'
        })
    }])

})
