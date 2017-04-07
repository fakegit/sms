define(['app'], function(app) {

    app.factory('SSystemRole', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/User/Role/getRoleDetail', {id:id});
            },

            list : function(params){
                return curd.post('/User/Role/getRoleList', params);
            },

            toggle : function(params , flag){
                var url = !flag ? '/User/Role/disableRole' :
                    '/User/Role/recoveryRole';
                return curd.post(url,params)
            },

            update : function(params , isEdit){
                var url = isEdit ? '/User/Role/editRole' :
                    '/User/Role/addRole';
                return curd.post(url,params);
            }
        }
    }]);
})