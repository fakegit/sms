/**
 *  拣货规则 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.rule_wave_list', {
            url: 'rule/wave',
            templateUrl: function($routeParams) {
                return 'view/rule/wave/list.html?' + Date.now();
            },
            controller: 'RuleWaveListCtrl'
        })

        .state('app.rule_wave_create', {
            url: 'rule/wave/:id',
            templateUrl: function($routeParams) {
                return 'view/rule/wave/edit.html?' + Date.now();
            },
            controller: 'RuleWaveEditCtrl'
        })

        .state('app.rule_wave_edit', {
            url: 'rule/wave/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/rule/wave/edit.html?' + Date.now();
            },
            controller: 'RuleWaveEditCtrl'
        })
    }])

})
