/**
 * Created by hubo on 2017/2/4.
 */
define(['app'], function(app) {

    app.factory('CheckRecordsListService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/count/countRecord/page',params);
            },


        }
    }]);
})