/**
 * desc: 入口文件
 * date: 2016-07-08
 */
require.config({
    baseUrl: 'script/',

    urlArgs: "?" + Date.now(),

    waitSeconds: 0,

    packages: [
        {
            name: 'moment',
            // This location is relative to baseUrl. Choose bower_components
            // or node_modules, depending on how moment was installed.
            location: '../lib/moment',
            main: 'moment'
        }
    ],

    //配置文件路径
    paths: {
        'jquery': '../lib/jquery/dist/jquery.min',
        'datepicker':'../lib/bootstrap-datepicker/dist/js/bootstrap-datepicker.min',
        'angular': '../lib/angular/angular.min',
        'ui_router': '../lib/angular-ui-router/release/angular-ui-router.min',
        'angular_sanitize': '../lib/angular-sanitize/angular-sanitize.min',
        'angular_animate': '../lib/angular-animate/angular-animate.min',
        'angular_loading_bar':'../lib/angular-loading-bar/build/loading-bar',
        'angular_smart_table':'../lib/angular-smart-table/dist/smart-table',
        'angular_touch': '../lib/angular-touch/angular-touch.min',
        //'bootstrap_ui': '../lib/bootstrap-bower/ui-bootstrap-tpls',
        // 'angular_strap':'../lib/angular-strap/dist/angular-strap.min',
        'daterangepicker':'../lib/bootstrap-daterangepicker/daterangepicker',
        'angular_daterangepicker':'../lib/angular-daterangepicker/js/angular-daterangepicker.min',
        'ng_file_upload':'../lib/ng-file-upload/ng-file-upload',

        'ng_notify':'../lib/ng-notify/dist/ng-notify.min',
        //'lowdb':'../lib/lowdb/lowdb.min',
        //'lodash':'../lib/lodash/lodash.min',
        //'ui_select':'../lib/angular-ui-select/dist/select.min'

    },
    //引入依赖时候的包名
    shim: {
        'jquery':{
            exports:'jquery'
        },
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'ui_router':{
            deps: ['angular'],
            exports: 'ui_router'
        },
        'angular_sanitize': {
            deps: ['angular'],
            exports: 'angular_sanitize'
        },
        'angular_animate': {
            deps : ['angular'],
            exports : 'angular_animate'
        },
        'angular_loading_bar':{
            deps : ['angular','angular_animate'],
            exports : 'angular_loading_bar'
        },
        'angular_smart_table':{
            deps : ['angular'],
            exports : 'angular_smart_table'
        },
        'admin_lte': {
            deps: ['jquery'],
            exports: 'admin_lte'
        },
        'angular_touch': {
            deps: ['angular'],
            exports: 'angular_touch'
        },
        /*'bootstrap_ui': {
            deps: ['angular'],
            exports: 'bootstrap_ui'
        },*/
/*        'angular_strap':{
            deps: ['angular'],
            exports: 'angular_strap'
        },*/
        'angular_daterangepicker':{
            deps:['jquery','angular','moment','daterangepicker'],
            exports:'angular_daterangepicker'
        },
        'ng_file_upload':{
            deps: ['angular'],
            exports: 'ng_file_upload'
        },
        'ng_notify':{
            deps: ['angular'],
            exports: 'ng_notify'
        },
        /*'lowdb':{
            deps:['lodash'],
            exports:'lowdb'
        },
        'lodash':{
            exports:'lodash'
        }*/
        /*'ui_select':{
            deps:['angular'],
            exports:'ui_select'
        }*/
    }
});


require([
    //基础
    
    'jquery','angular', 'moment','moment/locale/zh-cn',
    'ui_router', 'angular_sanitize','angular_animate','angular_loading_bar' ,'angular_smart_table','angular_daterangepicker',
    'angular_touch', 'datepicker' ,'ng_file_upload','ng_notify',
    // 'ui_select','bootstrap_ui',

    // 'admin_lte',
    'app','db', 'layout','menu','config',//'lodash','lowdb',
    'common/filter/common',
    'common/services/sl',
    'common/services/core',
    'common/services/store',
    'common/services/modal',
    'common/services/auth',
    'common/services/i18n',
    'common/services/utils',
    'common/services/httpx',
    'common/services/intercept',
    'common/services/ui',
    'common/services/debug',
    'common/services/l10n',
    'common/services/print',
    'common/services/hello',
    'common/services/api',

    'common/provider/common',
    'common/provider/solusvm',
    'common/provider/vultr',

    //指令
    'common/directives/common',
    'common/directives/autoComplete',
    'common/directives/sl.tree',
    'common/directives/sl.fields', 
    'common/directives/sl.search',
    'common/directives/sl.table',
    'common/directives/sl.data',
    'common/directives/sl.tab',
    'common/directives/sl.area',
    'common/directives/sl.datetime',


    'index/service',
    'index/router',
    'index/index',
    'index/signin',

    'vps/server/service',
    'vps/server/router',
    'vps/server/list',
    'vps/server/update',
    'vps/server/manager',

    'vps/provider/service',
    'vps/provider/router',
    'vps/provider/list',
    'vps/provider/update'

], function($, angular, moment) {

    $(function() {
        moment.locale('zh-cn');
        angular.element(document.body).removeClass('loading');
        angular.bootstrap(document, ['sl']);
    })

});
