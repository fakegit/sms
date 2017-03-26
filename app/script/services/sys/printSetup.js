/**
 * Created by ying on 2017/2/13.
 * 商品 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('PrintSetService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.get('/sys/buttonSetting/queryList', params);
                // return curd.get('local://base.goods.list', params);
            },

            get : function(id){
                return curd.get('/sys/buttonSetting/query' , {'id':id})
            },

            toggle : function(params){
                return curd.post('/sys/buttonSetting/updateState', params);
            },

            getTypes : function(){
                return curd.get('/sys/buttonSetting/queryTypeList');
            },

            getType : function(params){
                return curd.get('/sys/buttonSetting/queryTemplateType', {'buttonId': params});
            },

            getModal : function(params){
                return curd.get('/sys/buttonSetting/queryTemplateByType', {'type': params});
            },

            getOwn : function(id){
                return curd.get('/base/owner/queryByWareid/' + id);
            },

            getShop : function(id){
                return curd.get('/base/shop/queryByOwner/' + id);
            },

            update : function(params, isEdit){
                var url = isEdit ? '/sys/buttonSetting/update' :
                    '/sys/buttonSetting/create';
                return curd.post(url , params);
            },

            remove : function(){
                curd.get();
            }
        }
    }]);
})