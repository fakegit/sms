/**
 * Created by hubo on 2017/1/14.
 */
define(['app'], function(app) {

    app.factory('StockmgrOwnerStockService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/inventory/inv/page/cus',params);
            },

        }
    }]);
})