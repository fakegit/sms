/**
 * 盘点计划 服务
 * 
 * @date     2017-02-10
 * @author   wuting<reruin@gmail.com>
 */

define(['app'], function(app) {

    app.factory('CountPlanService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            // 盘点计划列表接口
            list : function(params){
                return curd.post('/count/countPlan/page', params);
                // return curd.get('local://base.goods.list', params);
            },
            
            // 视图view页面的
            get : function(id){
                return curd.post('/count/countPlan/queryById' , {id:id})
            },
            
            // get1 : function(id){
            //     return curd.post('/count/countPlan/queryById',{id:id})
            // },

            toggle : function(params){
                return curd.get('/base/warehouseLocation/updateStatus' , params);
            },

            
            update : function(params , isEdit){
                var url = isEdit ? '/count/countPlan/update' : '/count/countPlan/create';
                return curd.post(url,params,'json')
            },

            remove : function(){},


            // 商家名称预查询接口
            queryOwnName : function(params){
                return curd.post('/base/owner/page', params);  
            },

            // 店铺名称预查询接口
            queryShopName : function(params){
                return curd.post('/base/shop/page', params);   
            },
            // 商品名称预查询接口
            queryGoodName : function(params){
                return curd.post('/base/goods/page', params);
            },

            //点击添加按钮执行搜索
            search :function(params){
                return curd.post('/count/countPlan/queryCountIvnDetail',params)
            },
            searchList:function(params){
                return curd.post('/count/countPlan/queryCountIvnDetailIds',params)
            },

            detail_list:function(params){
                return curd.post('/count/countPlan/queryPlanDetailPageById',params)
            },

            detail_remove:function(id){
                return curd.post('/count/countPlan/delete',{id:id})
            }

        }
    }]);
})