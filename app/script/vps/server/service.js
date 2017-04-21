define(['app'], function(app) {

    app.factory('SVPS', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/vps/server/get', {id:id});
            },

            list : function(params){
                return curd.post('/vps/server/list', params);
            },

            list_provider : function(params){
                return curd.get('/common/vps/provider/list', params);
            },

            remove : function(id){
                return curd.get('/vps/server/remove', {id:id});
            },

            update : function(params , isEdit){
                var url = isEdit ? '/vps/server/update' :
                    '/vps/server/create';
                return curd.post(url,params);
            },
            shutdown:function(id){
                return curd.get('/vps/server/shutdown' ,{id:id})
            },
            boot:function(id){
                return curd.get('/vps/server/boot' ,{id:id})
            },
            reboot:function(id){
                return curd.get('/vps/server/reboot' ,{id:id})
            },
            status : function(id){
                return curd.get('/vps/server/status',{id:id});
            }
        }
    }]);
})