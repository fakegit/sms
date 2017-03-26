/**
 *  //上架任务 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', function($stateProvider) {

        $stateProvider
        
        .state('app.instock_shelveRecord_list', {
            url: 'instock/shelve_record',
            templateUrl: function($routeParams) {
                return 'view/instock/shelve_record/list.html?' + Date.now();
            },
            controller: 'InstockShelveRecordListCtrl'
        })
    }])

})
