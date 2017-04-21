/**
 * 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .otherwise('/vps/provider');

        $stateProvider
            .state('app', {
                // abstract: true,
                url: '/',
                templateUrl: function() {
                    return 'script/index/index.html';
                },
                // translations: function(translations, $stateParams){
                //      // Assume that getLang is a service method
                //      // that uses $http to fetch some translations.
                //      // Also assume our url was "/:lang/home".
                //      return translations.getLang($stateParams.lang);
                // },
                controller: 'index'
            })

        .state('signin', {
            url: '/signin',
            templateUrl: function() {
                return 'script/index/signin.html';
            },
            roles: '*',
            signin: true,
            controller: 'signin'
        })

        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    }])

})
