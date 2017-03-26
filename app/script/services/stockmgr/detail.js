/* 明细管理 */
define(['app'], function(app) {

    app.factory('StockmgrDetailService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {

            list : function(params){
                return curd.post('/inventory/inv/details/page',params);
            },

            get:function (id) {
                return curd.get('/outstock/outstorageBill/query',{id:id});
            },
            // 调整页面查询
            change:function(id){
                return curd.post('/inventory/inv/adjust/query',{id:id})
            },
             // 移入库位预查询接口
            queryCode : function(params){
                return curd.post('/base/warehouseLocation/queryStorageLocByWarehouseId', params);
                
            },

            // (批号调整)模态框查询请求按钮
            modal :function(params){
                return curd.post('/inv/lot/page',params)
            },

            // 调整保存总接口
            update:function(params){
                return curd.post('/inventory/inv/adjust/submit',params,'json')
            }



        }
    }]);
})