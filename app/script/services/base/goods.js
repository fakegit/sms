/**
 * Created by ting on 2016/8/8.
 * 商品 - 服务 goods
 */

define(['app'], function(app) {

    app.factory('BaseGoodsService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/base/goods/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            get : function(id){
                //return curd.get('local://base.goods.list', params);
                return curd.get('/base/goods/queryById' , {'goodsId':id})
            },

            toggle : function(params){
                return curd.get('/base/goods/updateStatus', params);
            },

            update : function(params){
                return curd.post('/base/goods/update' , params);
            },

            remove : function(){
                curd.get();
            }
        }
    }]);
})