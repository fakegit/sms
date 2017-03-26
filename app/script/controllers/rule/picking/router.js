/**
 *  拣货规则 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.rule_picking_list', {
            url: 'rule/picking',
            templateUrl: function($routeParams) {
                return 'view/rule/picking/list.html?' + Date.now();
            },
            controller: 'RulePickingListCtrl'
        })

        .state('app.rule_picking_create', {
            url: 'rule/picking/:id',
            templateUrl: function($routeParams) {
                return 'view/rule/picking/edit.html?' + Date.now();
            },
            controller: 'RulePickingEditCtrl'
        })

        .state('app.rule_picking_edit', {
            url: 'rule/picking/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/rule/picking/edit.html?' + Date.now();
            },
            controller: 'RulePickingEditCtrl'
        })
    }])

})
