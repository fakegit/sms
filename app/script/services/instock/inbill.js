/**
 * Created by ting on 2016/12/22.
 * 入库单管理 - 服务
 */

define(['app'], function(app) {

    app.factory('InstockInbillService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/instock/inbill/page', params);
            },

            get : function(id){
                return curd.get('/instock/inbill/query', {billId:id});
            },
            //待上架明细
            tasks: function(id){
                return curd.post('/instock/inbill/queryUnShelveReceiveRecord',{billId:id})
            }
        }
    }]);
})