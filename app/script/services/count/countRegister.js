/**
 * Created by hubo on 2017/2/7.
 */
define(['app'], function(app) {

    app.factory('CheckRegisterService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/count/countRecord/query',params);
            },
            check:function (params) {
                return curd.post('/count/countRecord/count',params);
            },
            checkCount:function (params) {
                return curd.post('/count/countRecord/checkCount',params);
            },
            detail:function(id){
                return curd.post('/count/countRecord/page',{planId:id})
            }

        }
    }]);
})