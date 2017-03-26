define(['app'], function(app) {

    app.factory('IndexService', ['$http', '$q','sl','AuthService' ,function($http, $q , sl , auth) {

        //配置信息
        var config = {};
        
        return {
            signout : function(){
            	auth.signout();
            }
        }
    }]);
})