/**
 * Created by hubo on 2017/2/6.
 */
define(['app'], function(app) {

    app.factory('CheckDetailListService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/count/countPlanDetail/page',params);
            },


        }
    }]);
})