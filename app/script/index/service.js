define(['app'], function(app) {

    app.factory('IndexService', ['$http', '$q','sl','AuthService' ,function($http, $q , sl , auth) {

        //配置信息
        var config = {};
        var curd = sl.curd;
        
        return {
            signout : function(){
            	return auth.signout();
            },
            menu : function(){
            	return curd.get('/Admin/Admin/getMenuTree');
            }
        }
    }]);
})