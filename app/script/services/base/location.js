/**
 * Created by ting on 2016/8/8.
 * 库位 - 服务 Location
 */

define(['app'], function(app) {

    app.factory('BaseLocationService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/base/warehouseLocation/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            toggle : function(params){
                return curd.get('/base/warehouseLocation/updateStatus' , params);
            },

            get : function(id){
                //return curd.get('local://base.goods.list', params);
                return curd.get('/base/warehouseLocation/query' , {'id':id})
            },

            update : function(params , isEdit){
                var url = isEdit ? '/base/warehouseLocation/update' :
                    '/base/warehouseLocation/create';
                return curd.post(url , params);
            },

            download : function(params){
                var url = '/base/warehouseLocation/exportFile';
                return curd.download(url,params);
            },

            remove : function(){}
        }
    }]);
})