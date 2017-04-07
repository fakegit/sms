define(['app'], function(app) {

    app.factory('SVPS', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/vps/get', {id:id});
            },

            list : function(params){
                return curd.post('/vps/list', params);
            },

            update : function(params , isEdit){
                var url = isEdit ? '/vps/update' :
                    '/vps/create';
                return curd.post(url,params);
            }
        }
    }]);
})