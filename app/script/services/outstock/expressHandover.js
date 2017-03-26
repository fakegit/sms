/**
 * Created by hubo on 2017/2/16.
 */
define(['app'], function(app) {

    app.factory('OutstockexpressHandoverService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            // 生成框号
            list : function(params){
                return curd.post('/outstock/outExpressHandover/generateCode',params);
            },
            // 扫描运单号
            search:function(params){
                return curd.post('/outstock/outExpressHandover/create',params)
            },
            // 删除
            del:function (params) {
                return curd.post('/outstock/outExpressHandover/delete',params);
            },
            printer:function(params){
                return curd.post('/print/printService/queryDataMuti',params)
            }



        }
    }]);
})