/**
 * Created by hubo on 2017/2/16.
 */
define(['app'], function(app) {

    app.factory('OutstockHandoverDetailService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/outstock/outExpressHandover/detailPage',params);
            },
            exportFile:function (params) {
                return curd.download('/outstock/outExpressHandover/exportFile',params);
            }



        }
    }]);
})