/**
 * Created by ting on 2016/12/15.
 * 上架任务 - 服务
 */

define(['app'], function(app) {

    app.factory('InstockShelveTaskService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/instock/inShelveTask/page', params);
            },

            /*toggle : function(params){
                return curd.get('/base/owner/toggle', params);
            },*/

            get : function(id){
                return curd.get('/instock/inShelveTask/query',{id:id});
            },

            create : function(params){

                return curd.post('/instock/inShelveTask/create',{'recordIds':params.join(',')});
            },

            getByCode:function(code){
                return curd.get('/instock/inShelveTask/query', {code:code});
            },

            getByOrder:function(code){
                return curd.get('/instock/inShelveTask/query', {orderNo:code});
            },

            puton : function(params){
                return curd.post('/instock/inShelveTask/shelve',params);
            },

            remove : function(id){
                return curd.post('/instock/inShelveTask/delete/'+id);
            }
        }
    }]);
})