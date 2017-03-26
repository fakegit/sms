/**
 *      //出库//波次管理
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.outstock_wave_list', {
            url: 'outstock/wave',
            templateUrl: function($routeParams) {
                return 'view/outstock/wave/list.html?' + Date.now();
            },
            controller: 'OutstockWaveListCtrl'
        })

        .state('app.outstock_wave_view', {
            url: 'outstock/wave/:id',
            templateUrl: function($routeParams) {
                return 'view/outstock/wave/view.html?' + Date.now();
            },
            controller: 'OutstockWaveViewCtrl'
        })
       
        .state('app.outstock_wave_change', {
            url: 'outstock/wave/:id/change',
            templateUrl: function($routeParams) {
                return 'view/outstock/wave/change.html?' + Date.now();
            },
            controller: 'OutstockWavechangeCtrl'
        })



    }])

})


 