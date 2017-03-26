/**
 * Created by ting on 2016/8/8.
 * 库区 - 服务 zone
 */

define(['app'], function(app) {

    app.factory('BaseZoneService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            get : function(id){
                return curd.get('/base/warehousezone/query',{id:id});
            },

            update : function(params,isEdit){
                var url = isEdit ? '/base/warehousezone/update' :
                    '/base/warehousezone/create';
                return curd.post(url, params);
            },

            list : function(params){
                return curd.post('/base/warehousezone/page', params);
            },

            toggle : function(params){
                return curd.post('/base/warehousezone/updatestatus', params);
            }
        }
    }]);
})