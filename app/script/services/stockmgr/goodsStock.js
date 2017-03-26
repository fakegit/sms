/**
 * Created by hubo on 2017/1/16.
 */
define(['app'], function(app) {

    app.factory('StockmgrGoodsStockService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/inventory/inv/page/sku',params);
            },

        }
    }]);
})