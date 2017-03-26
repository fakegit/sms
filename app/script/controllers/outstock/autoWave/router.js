/**
 *      //出库//自动创建波次管理
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.outstock_autowave_list', {
            url: 'outstock/autoWave',
            templateUrl: function($routeParams) {
                return 'view/outstock/autoWave/list.html?' + Date.now();
            },
            controller: 'OutstockautoWaveListCtrl'
        })

        .state('app.outstock_autowave_create', {
            url: 'outstock/autoWave/create',
            templateUrl: function($routeParams) {
                return 'view/outstock/autoWave/edit.html?' + Date.now();
            },
            controller: 'OutstockautoWaveEditCtrl'
        })
       
        .state('app.outstock_autowave_edit', {
            url: 'outstock/autoWave/:id/edit',
            templateUrl: function($routeParams) {
                return 'view/outstock/autoWave/edit.html?' + Date.now();
            },
            controller: 'OutstockautoWaveEditCtrl'
            
        })



    }])

})


 