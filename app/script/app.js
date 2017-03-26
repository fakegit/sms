/**
 * 建立angular.module
 */
define(['angular'], function(angular) {
    return angular.module('sms', [
            'ngAnimate','ngSanitize', 'ui.router',

            //upload组件
            'ngFileUpload','ngNotify',
            'angular-loading-bar', 'smart-table', 'daterangepicker', 
            //'ui.bootstrap','ui.select'
        ])
        
        /*.config(function(massAutocompleteConfigProvider) {
            massAutocompleteConfigProvider.position_autocomplete = function(container, target) { };
        })*/
        .run(function($rootScope, $location, $state, AuthService , sl , AUTH_EVENTS,ngNotify, utils) {
            ngNotify.config({
                theme: 'pure',
                position: 'top',
                duration: 2000,
                type: 'success',
                sticky: false,
                button: true,
                html: false
            });

            //console.log('running');
            $rootScope.$on('$stateChangeStart', function(event, state , params) {
                var name = state.name;

                //判断是否有切换页面拦截
                if( 
                    $rootScope.history && 
                    sl.unload.has( $rootScope.history.name ) 
                ){
                    sl.unload.emit($rootScope.history.name , {'name':name , 'params':params});
                    event.preventDefault();
                    return;
                }


                if(!state.signin && !state.abstract){
                    $rootScope.history = {'name':name , 'params':params};
                    $rootScope.url = utils.getFullUrl(name);
                }

                //判断角色是否拥有权限
                if (state.roles !== '*') {
                    if (!AuthService.isAuthenticated()) {
                        event.preventDefault();
                        $state.go('signin');
                    }
                }

                //无角色限制的页面
                else{
                    //是登录页则跳转
                    if(state.signin === true && AuthService.isAuthenticated())
                    {
                        event.preventDefault();
                        $state.go('app');
                    }
                }
            });

            //未登录
            $rootScope.$on(AUTH_EVENTS.unauthorized, function() {
                //$state.go('signin');
            });

            //登录失败
            $rootScope.$on(AUTH_EVENTS.signinFailed, function() {
                //AuthService.signout();
            });

            //退出成功
            $rootScope.$on(AUTH_EVENTS.signoutSuccess, function() {
                $state.go('signin');
            });
            
            //
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
                AuthService.signout( true )
            });
            //http://192.168.1.234:81/
        })


    /*.run(function($rootScope, AUTH_EVENTS, AuthService) {
        $rootScope.$on('$stateChangeStart', function(event, next) {
            var authorizedRoles = next.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                console.log('ok')
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    location.href = '#/signin'
                } else {
                    // user is not logged in
                    //$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        });
    })*/

});
