define(['app'], function(app) {

    app.factory('CheckReversalService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/count/countAdjustBill/page',params);
            },
            check : function(params){
                return curd.get('/count/countAdjustBill/audit',params);
            },
            delete: function (params) {
                return curd.get('/count/countAdjustBill/delete',params);
            },
            detail:function (params) {
                return curd.post('/count/countAdjustBillDetail/page',params);
            }



        }
    }]);
})