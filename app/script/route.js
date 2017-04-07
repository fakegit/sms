/**
 * 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .when('/instock', '/instock/shelve_task')
            .when('/base', '/base/warehouse')
            .when('/sys', '/sys/lottpl')
            .when('/outstock', '/outstock/wave')
            .when('/rule', '/rule/picking')
            .when('/stockmgr','/stockmgr/detail')
            .when('/count','/count/countAdjustBill')
            .otherwise('/instock/shelve_task');

        $stateProvider
            .state('app', {
                // abstract: true,
                url: '/',
                templateUrl: function() {
                    return 'view/index.html';
                },
                // translations: function(translations, $stateParams){
                //      // Assume that getLang is a service method
                //      // that uses $http to fetch some translations.
                //      // Also assume our url was "/:lang/home".
                //      return translations.getLang($stateParams.lang);
                // },
                controller: 'IndexCtrl'
            })

        .state('signin', {
            url: '/signin',
            templateUrl: function() {
                return 'view/signin.html';
            },
            roles: '*',
            signin: true,
            controller: 'SigninCtrl'
        })

        .state('app.whin_order_list', {
            url: 'whin/order',
            templateUrl: function() {
                return 'view/whin/order/list.html';
            },
            controller: 'WhinOrderListCtrl'
        })

        .state('app.whin_notice_list', {
            url: 'whin/notice',
            templateUrl: function() {
                return 'view/whin/notice/list.html';
            },
            controller: 'WhinNoticeListCtrl'
        })


        //仓库管理
        .state('app.base_warehouse_list', {
            url: 'base/warehouse',
            templateUrl: function($routeParams) {
                return 'view/base/warehouse/list.html?' + Date.now();
            },
            controller: 'BaseWarehouseListCtrl'
        })

        .state('app.base_warehouse_create', {
            url: 'base/warehouse/:id',
            templateUrl: function($routeParams) {
                return 'view/base/warehouse/edit.html?' + Date.now();
            },
            controller: 'BaseWarehouseEditCtrl'
        })

        .state('app.base_warehouse_edit', {
            url: 'base/warehouse/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/warehouse/edit.html?' + Date.now();
            },
            controller: 'BaseWarehouseEditCtrl'
        })

        //s管理
        .state('app.base_goods_list', {
            url: 'base/goods',
            templateUrl: function($routeParams) {
                return 'view/base/goods/list.html?' + Date.now();
            },
            controller: 'BaseGoodsListCtrl'
        })

        .state('app.base_goods_create', {
            url: 'base/goods/:id',
            templateUrl: function($routeParams) {
                return 'view/base/goods/edit.html?' + Date.now();
            },
            controller: 'BaseGoodsEditCtrl'
        })

        .state('app.base_goods_edit', {
            url: 'base/goods/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/goods/edit.html?' + Date.now();
            },
            controller: 'BaseGoodsEditCtrl'
        })

        //商家
        .state('app.base_owner_list', {
            url: 'base/owner',
            templateUrl: function($routeParams) {
                return 'view/base/owner/list.html?' + Date.now();
            },
            controller: 'BaseOwnerListCtrl'
        })

        .state('app.base_owner_create', {
            url: 'base/owner/:id',
            templateUrl: function($routeParams) {
                return 'view/base/owner/edit.html?' + Date.now();
            },
            controller: 'BaseOwnerEditCtrl'
        })

        .state('app.base_owner_edit', {
            url: 'base/owner/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/owner/edit.html?' + Date.now();
            },
            controller: 'BaseOwnerEditCtrl'
        })

        //库区
        .state('app.base_zone_list', {
            url: 'base/zone',
            templateUrl: function($routeParams) {
                return 'view/base/zone/list.html?' + Date.now();
            },
            controller: 'BaseZoneListCtrl'
        })

        .state('app.base_zone_create', {
            url: 'base/zone/:id',
            templateUrl: function($routeParams) {
                return 'view/base/zone/edit.html?' + Date.now();
            },
            controller: 'BaseZoneEditCtrl'
        })

        .state('app.base_zone_edit', {
            url: 'base/zone/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/zone/edit.html?' + Date.now();
            },
            controller: 'BaseZoneEditCtrl'
        })

        //库位
        .state('app.base_location_list', {
            url: 'base/location',
            templateUrl: function($routeParams) {
                return 'view/base/location/list.html?' + Date.now();
            },
            controller: 'BaseLocationListCtrl'
        })

        .state('app.base_location_create', {
            url: 'base/location/:id',
            templateUrl: function($routeParams) {
                return 'view/base/location/edit.html?' + Date.now();
            },
            controller: 'BaseLocationEditCtrl'
        })

        .state('app.base_location_edit', {
            url: 'base/location/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/location/edit.html?' + Date.now();
            },
            controller: 'BaseLocationEditCtrl'
        })

        //承运商
        .state('app.base_logistics_list', {
            url: 'base/logistics',
            templateUrl: function($routeParams) {
                return 'view/base/logistics/list.html?' + Date.now();
            },
            controller: 'BaseLogisticsListCtrl'
        })

        .state('app.base_logistics_create', {
            url: 'base/logistics/:id',
            templateUrl: function($routeParams) {
                return 'view/base/logistics/edit.html?' + Date.now();
            },
            controller: 'BaseLogisticsEditCtrl'
        })

        .state('app.base_logistics_edit', {
            url: 'base/logistics/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/base/logistics/edit.html?' + Date.now();
            },
            controller: 'BaseLogisticsEditCtrl'
        })

        //批次模板
        .state('app.sys_lottpl_list', {
            url: 'sys/lottpl',
            templateUrl: function($routeParams) {
                return 'view/sys/lottpl/list.html?' + Date.now();
            },
            controller: 'SysLottplListCtrl'
        })

        .state('app.sys_lottpl_create', {
            url: 'sys/lottpl/:id',
            templateUrl: function($routeParams) {
                return 'view/sys/lottpl/edit.html?' + Date.now();
            },
            controller: 'SysLottplEditCtrl'
        })

        .state('app.sys_lottpl_edit', {
            url: 'sys/lottpl/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/sys/lottpl/edit.html?' + Date.now();
            },
            controller: 'SysLottplEditCtrl'
        })

        // //上架规则,已更改到对应的js文件下的routerjs文件下；
       /* .state('app.sys_putaway_list', {
            url: 'sys/putaway',
            templateUrl: function($routeParams) {
                return 'view/sys/putaway/list.html?' + Date.now();
            },
            controller: 'SysPutawayListCtrl'
        })

        .state('app.sys_putaway_create', {
            url: 'sys/putaway/:id',
            templateUrl: function($routeParams) {
                return 'view/sys/putaway/edit.html?' + Date.now();
            },
            controller: 'SysPutawayEditCtrl'
        })

        .state('app.sys_putaway_edit', {
            url: 'sys/putaway/:id/:act',
            templateUrl: function($routeParams) {
                return 'view/sys/putaway/edit.html?' + Date.now();
            },
            controller: 'SysPutawayEditCtrl'
        })
*/


        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    }])

})
