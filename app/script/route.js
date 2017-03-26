/**
 * 路由
 */
define(['app'], function(app) {

    return app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .when('/', '/vps')
            

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
        });


        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');
    }])

})
