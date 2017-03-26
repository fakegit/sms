/**
 * Created by hubo on 2017/1/11.
 */
define(['app'], function(app) {

    app.factory('OutstockAbnormalService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/outstock/outstorageBill/abnormal/page',params);
            },
            get:function (id) {
                return curd.get('/outstock/outstorageBill/query',{id:id});
            },
            reAllocation:function (params) {
                return curd.get('/outstock/outstorageBill/abnormal/reAllocation',{ids:params})
            }

        }
    }]);
})