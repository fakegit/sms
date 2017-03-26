/**
 * Created by ting on 2016/8/8.
 * 批次模板 - 服务 Lottpl
 */

define(['app'], function(app) {

    app.factory('SysLottplService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            get : function(id){
                return curd.get('/base/lotTemplate/query',{id:id} );
            },

            list : function(params){
                return curd.post('/base/lotTemplate/page', params);
            },

            toggle : function(params){
                return curd.post('/base/logistics/updateStatus',params)
            },
            update : function(params , isEdit){
                var url = '/base/lotTemplate/' + (isEdit ? 'update' : 'create');
                return curd.post( url ,params)
            },
           
        }
    }]);
})