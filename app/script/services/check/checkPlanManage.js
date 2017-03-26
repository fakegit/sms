/* 明细管理 */
define(['app'], function(app) {

    app.factory('checkPlanManageService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {

            list : function(params){
                return curd.post('/inventory/inv/details/page',params);
            }

           

        }
    }]);
})