/**
 * Created by ly on 2017/1/14.
 * 包装复核 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('OutstockPackageService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            checkDocumentNo : function(params){
                return curd.get('/outstock/outPkg/query', {documentNo: params});
                // return curd.get('local://base.goods.list', params);
            },

            checkSku : function(params){
                //return curd.get('local://base.goods.list', params);
                return curd.post('/outstock/outPkg/checkSku' , params)
            },

            check : function(params){
                return curd.post('/outstock/outPkg/pkg', params);
            }
        }
    }]);
})