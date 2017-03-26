/**
 * Created by ly on 2017/1/14.
 * 包装复核 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('OutstockWeightService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            checkorder : function(params){
                return curd.get('/outstock/outstorageBill/weight/queryByCondition', params);
                // return curd.get('local://base.goods.list', params);
            },

            checkWeight : function(params){
                //return curd.get('local://base.goods.list', params);
                return curd.get('/outstock/outstorageBill/weight/check' , params)
            },

            finish : function(params){
                return curd.get('/outstock/outstorageBill/weight/finish', params);
            }
        }
    }]);
})