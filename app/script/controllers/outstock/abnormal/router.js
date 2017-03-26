/**
 * Created by hubo on 2017/1/11.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.outstock_abnormal_list', {
                url: 'outstock/abnormal',
                templateUrl: function($routeParams) {
                    return 'view/outstock/abnormal/list.html?' + Date.now();
                },
                controller: 'OutstockAbnormalListCtrl'
            })
            .state('app.outstock_abnormal_view', {
                url: 'outstock/abnormal/:id',
                templateUrl: function($routeParams) {
                    return 'view/outstock/abnormal/edit.html?' + Date.now();
                },
                controller: 'OutstockAbnormalEditCtrl'
            })



    }])

})