/**
 * Created by ting on 2016/12/15.
 *  入库，入库预约单；
 */

define(['app'], function(app) {

    app.factory('InstockReserveService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            get : function(id){
                return curd.get('/instock/inasn/query',{asnId:id});
            },

            //创建入库单
            found:function(id){
                 return curd.post('/instock/inasn/createbill', {asnId:id});
            },


            // 编辑或新增规则
            update : function(params,isEdit){
                var url = isEdit ? '/rule/upShelves/update' :
                    '/rule/upShelves/create';
                return curd.post(url, params,'json');
            },

            list : function(params){
                return curd.post('/instock/inasn/page', params);
            },

            toggle : function(params){
                console.log(params)
                return curd.post('/rule/upShelves/updateStatus', params);
            }
        }
    }]);
})