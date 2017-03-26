define(['app'], function(app) {

    return app.controller('SigninCtrl', ['$scope','$rootScope', '$http', 'AuthService','sl','$state', function($scope,$rootScope, $http, service,sl,$state) {

        var credentials = {
            account : '' , 
            password: ''
        };

        var page = {
            error : '' , 
            saveFlag : false
        }

        $rootScope.isSigned ='';

        function saveData(){
            console.log(page.saveFlag)
            if(page.saveFlag){
                sl.store.local.set('USER.ACCOUNT',credentials.account);
                sl.store.local.set('USER.PASSWORD',credentials.password);
                sl.store.local.set('USER.RECORD',1);
            }
            else{
                sl.store.local.remove('USER.ACCOUNT');
                sl.store.local.remove('USER.PASSWORD');
                sl.store.local.remove('USER.RECORD');
            }
        }

        var vm = sl.extend($scope , {

            page : page,

            data : credentials,

            init : function(){
                document.title = "欢迎登录 WMS";
                if( sl.store.local.get('USER.RECORD') ){
                    credentials.account = sl.store.local.get('USER.ACCOUNT');
                    credentials.password = sl.store.local.get('USER.PASSWORD');
                    page.saveFlag = !!sl.store.local.get('USER.RECORD');
                }
            },

            signin : function(){
                saveData();
                // return;
                service.signin(credentials).then(function(resp) {
                if (!resp.returnCode) {
                        $state.go('app');
                    }else{
                        page.error = resp.returnMsg;
                        // alert(resp.returnMsg);
                    }
                }, function() {
                    alert('登录失败');
                });
            }
        })

        vm.init();
        
    }]);
})