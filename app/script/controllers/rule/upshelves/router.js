/**
 *      //系统配置管理//上架规则
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.rule_upshelves_list', {
            url: 'rule/upshelves',
            templateUrl: function($routeParams) {
                return 'view/rule/upshelves/list.html?' + Date.now();
            },
            controller: 'RuleUpshelvesListCtrl'
        })

        .state('app.rule_upshelves_create', {
            url: 'rule/upshelves/:id',
            templateUrl: function($routeParams) {
                return 'view/rule/upshelves/edit.html?' + Date.now();
            },
            controller: 'RuleUpshelvesEditCtrl'
        })

        .state('app.rule_upshelves_edit', {
            url: 'rule/upshelves/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/rule/upshelves/edit.html?' + Date.now();
            },
            controller: 'RuleUpshelvesEditCtrl'
        })



    }])

})


 