define(['app'], function(app) {

    app.factory('SSystemUser', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/base/warehouse/query', {id:id});
            },

            list : function(params){
                return curd.post('/User/Admin/getUserList', params);
            },

            toggle : function(params){
                return curd.post('/base/warehouse/updatestatus',params)
            },

            update : function(params , isEdit){
                var url = isEdit ? '/base/warehouse/update' :
                    '/base/warehouse/create';
                return curd.post(url,params);
            }
        }
    }]);
})