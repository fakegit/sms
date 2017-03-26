/**
 * Created by ting on 2016/8/8.
 * 商品 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('BaseOwnerService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/base/owner/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            toggle : function(params){
                return curd.get('/base/owner/toggle', params);
            },

            get : function(id){
                //return curd.get('local://base.goods.list', params);
                return curd.get('/base/owner/query/',{id:id});
            },

            update : function(params , isEdit){
                var url = isEdit ? '/base/owner/update' :
                    '/base/owner/create';
                return curd.post(url,params);
            },

            remove : function(){
                curd.get();
            }
        }
    }]);
})