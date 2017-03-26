/**
 * Created by hubo on 2017/1/17.
 */
/**
 *  路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider

            .state('app.check_checkPlanManage_list', {
                url: 'check/checkPlanManage',
                templateUrl: function($routeParams) {
                    return 'view/check/checkPlanManage/list.html?' + Date.now();
                },
                controller: 'CheckPlanManageListCtrl'
            })
            

            



    }])

})
