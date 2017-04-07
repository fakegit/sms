define(['app','menu'], function(app , menu) {

    //授权认证
    app.factory('AuthService', ['$rootScope', '$q', 'sl', 'Session', 'AUTH_EVENTS', function($rootScope, $q, sl, Session, AUTH_EVENTS) {

        /**
         * 登录
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function signin(data , debug) {
            if(debug){
                var deferred = $q.defer();
                var resp = {"returnCode":0,"returnMsg":"success.","returnVal":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ3dCIsImlhdCI6MTQ3NzQ2ODUzMiwiaXNzIjoiTlJ5dW5jYW5nIE9NUyIsImF1ZCI6Im9tcy5ucnl1bmNhbmcuY29tIiwiZXhwIjoxNDc4MzMyNTMyfQ.PLP3tux10nCrKJwlDJoFj2AJB5-4RB3lPicsBhSDpR_2fRKAYrO9NlI5TgREf-foyxg2nBUxy3bZMQ-_VemOtw"};
                Session.create(data.account, resp);
                deferred.resolve(resp);
                return deferred.promise;
            }
            
            var url = 'signin' ;
            return sl.post(url, data).then(function(resp) {
                if (resp.data && !resp.data.status) {
                    Session.create(data.username, resp.data.result);
                }
                return resp.data;
            }, function(errResponse) {
                return $q.reject(errResponse);
            });
        }

        /**
         * 登出
         * @param  {[boolean]} miss [不向服务器发送登出操作，直接登出]
         */
        function signout(miss) {
            if (miss) {
                Session.destory();
                $rootScope.$broadcast(AUTH_EVENTS.signoutSuccess);
            } else {
                sl.get('/Pub/Admin/doLogout').then(function(resp) {
                    if (resp.data && !resp.data.status) {
                        Session.destory();
                        $rootScope.$broadcast(AUTH_EVENTS.signoutSuccess);
                    }
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            }
        }

        /**
         * 判断是否在会话状态
         * @return {Boolean} [description]
         */
        function isAuthenticated() {
            return !!Session.getAccount();
        }

        /**
         * 判断当前角色是否拥有权限
         * @param  {[type]}  authorizedRoles [description]
         * @return {Boolean}                 [description]
         */
        function isAuthorized(authorizedRoles) {
            var session = Session.get();
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (isAuthenticated() &&
                authorizedRoles.indexOf(session.role) !== -1);
        }

        function init(){
            var deferred = $q.defer();
            deferred.resolve(menu);
            Session.setPermissions(menu);
            return deferred.promise;
        }

        function init2(){
            return sl.get('menu/query').then(function(resp){
                if(resp.status == '200'){
                    if(!resp.data.returnCode){
                        Session.setPermissions(resp.data.returnVal);
                    }
                    //异常token 会导致 common error : 2
                    else{
                        signout(true);
                    }
                }else{
                    signout(true);
                }
                return resp.data;
            },function(err){
                signout(true);
                return $q.reject(err);
            })
        }

        return {

            signin: signin,

            signout: signout,

            isAuthenticated: isAuthenticated,

            isAuthorized: isAuthorized,

            init : init

        }
    }]);

    //放 AuthService 会造成循环依赖
    app.service('Session', function() {
        var data = {
            account: null,
            id: null,
            role: '',
            permissions: [],
            token: '',
            data: null
        }

        this.create = function(account, d) {
            this.destory();
            data.account = account,
            data.data = d;
            window.localStorage['session'] = JSON.stringify(data);
        }

        this.destory = function() {
            data = {
                account: null,
                id: null,
                role: '',
                permissions: [],
                token: '',
                data: null
            }

            window.localStorage.removeItem('session');
        }

        this.get = function() {
            return data;
        }

        this.getToken = function() {
            return data.token;
        }

        this.getAccount = function() {
            return data.account;
        }

        this.setPermissions = function(d) {
            data.permissions = d;
        }

        this.getPermissions = function() {
            return data.permissions;
        }
        if (window.localStorage['session']) {
            try {
                var obj = JSON.parse(window.localStorage['session']);
                this.create(obj.account, obj.data);
            } catch (e) {
                console.log(e)
            }
        }
        return this;
    })

    //枚举
    app.constant('AUTH_EVENTS', {
        signinSuccess: 'auth-signin-success', //登录成功
        signinFailed: 'auth-signin-failed',//登录失败
        signoutSuccess: 'auth-signout-success',//登出成功
        sessionTimeout: 'auth-session-timeout',//会话超时
        notAuthenticated: 'auth-not-authenticated',//access forbidden 
        unauthorized : 'auth-not-authorized',//未登录
        locked : 'user-locked', // 用户锁定
    });

    //角色枚举
    app.constant('USER_ROLES', {
        all: '*',
        admin: 'admin',
        guest: 'guest'
    });

    //使用拦截器对请求注入 token 并判断状态

    app.config(function($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    })

    .factory('AuthInterceptor', function($rootScope, $q,
        AUTH_EVENTS, Session) {

        var status = {
            //'-1': AUTH_EVENTS.signinFailed,
            1001: AUTH_EVENTS.unauthorized , //未登录
            1002: AUTH_EVENTS.signinFailed, //登陆失败
            1003: AUTH_EVENTS.locked, //用户锁定
            1004: AUTH_EVENTS.sessionTimeout, //用户超时
            1005: AUTH_EVENTS.sessionTimeout, //会话过期
        }

        return {
            request: function(config) {
                var token = Session.getToken();
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config || $q.when(config);
            },
            response: function(resp) {
                if (resp.data) {
                    if (resp.data.returnCode) {
                        var code = status[resp.data.returnCode];
                        if (code) {
                            $rootScope.$broadcast(code, resp);
                        }
                    }
                }
                return resp;
            },

            //返回code = 1001 时，未登陆
            responseError: function(response) {
                if (response.status) {
                    var code = status[response.status];
                    if (code) {
                        $rootScope.$broadcast(code);
                    }
                }
                /*$rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout,
                    1001:AUTH_EVENTS.sessionTimeout
                }[response.status], response);*/
                return $q.reject(response);
            }
        };
    })
})
