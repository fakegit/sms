/**
 * Created by hubo on 2017/2/7.
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.count_countRegister_detail', {
                url: 'count/countRegister/:id',
                templateUrl: function($routeParams) {
                    return 'view/count/countRegister/detail.html?' + Date.now();
                },
                controller: 'CheckRegisterDetailCtrl'
            })

    }])

})