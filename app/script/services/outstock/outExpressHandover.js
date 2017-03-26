/**
 * Created by hubo on 2017/2/14.
 */
define(['app'], function(app) {

    app.factory('OutstockOutExpressHandoverService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/outstock/outExpressHandover/page',params);
            },
            print:function (params) {
                return curd.post('/print/printService/queryDataMuti',params);
            }


        }
    }]);
})