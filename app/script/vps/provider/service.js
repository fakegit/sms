define(['app'], function(app) {

    app.factory('SVPSProvider', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/vps/provider/get', {id:id});
            },

            list : function(params){
                return curd.post('/vps/provider/list', params);
            },
            remove : function(id){
                return curd.get('/vps/provider/remove', {id:id});
            },

            update : function(params , isEdit){
                var url = isEdit ? '/vps/provider/update' :
                    '/vps/provider/create';
                return curd.post(url,params);
            }
        }
    }]);
})