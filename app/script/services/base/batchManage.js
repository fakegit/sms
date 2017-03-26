/**
 * Created by ting on 2016/8/8.
 * 商品 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('BaseBatchManageService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/inv/lot/page', params);  
            },
            get : function(id){
                return curd.post('/inv/lot/queryInvLotById',{id:id})
            },
            update:function(params){
                return curd.post('/inv/lot/update',params)
            }
           
        }
    }]);
})