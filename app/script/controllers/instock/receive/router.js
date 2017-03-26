/**
 *  //收货记录查询 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.instock_receive_record_list', {
            url: 'instock/receive_record',
            templateUrl: function($routeParams) {
                return 'view/instock/receive/list.html?' + Date.now();
            },
            controller: 'InstockReceiveRecordListCtrl'
        })

        //执行收货
        .state('app.instock_receive_exec', {
            url: 'instock/receive/{id:[0-9]+}',
            templateUrl: function($routeParams) {
                return 'view/instock/receive/exec.html?' + Date.now();
            },
            controller: 'InstockReceiveExecCtrl'
        })
    }])

})
