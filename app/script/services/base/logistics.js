/**
 * Created by ting on 2016/8/8.
 * 仓库 - 服务 warehouse
 */

define(['app'], function(app) {

    app.factory('BaseLogisticsService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            get : function(id){
                return curd.get('/base/logistics/queryById', {id:id});
            },

            list : function(params){
                return curd.post('/base/logistics/page', params);
            },

            toggle : function(params){
                return curd.post('/base/logistics/updateStatus',params)
            },

            update : function(params , isEdit){
                var url = '/base/logistics/' + (isEdit ? 'update' : 'create');
                return curd.post( url ,params)
            }
        }
    }]);
})