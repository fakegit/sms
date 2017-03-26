/**
 * Created by ting on 2016/12/22.
 * 上架记录 - 服务
 */

define(['app'], function(app) {

    app.factory('InstockShelveRecordService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/instock/shelveRecord/page', params);
            },
            query : function(id){
            	return curd.post('/instock/shelveRecord/page?recordId='+id);
            }
        }
    }]);
})