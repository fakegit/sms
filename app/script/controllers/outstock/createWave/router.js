/**
 *      //出库//波次创建
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
    
        .state('app.outstock_createWave_list', {
            url: 'outstock/createWave',
            templateUrl: function($routeParams) {
                return 'view/outstock/createWave/list.html?' + Date.now();
            },
            controller: 'OutstockCreateWaveListCtrl'
        })



    }])

})


 