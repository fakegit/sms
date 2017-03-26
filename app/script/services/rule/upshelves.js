/**
 * Created by ting on 2016/12/15.
 *  系统配置，上架规则
 */

define(['app'], function(app) {

    app.factory('RuleUpshelvesService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            
            get : function(id){
                return curd.get('/rule/upShelves/queryById',{bizRefRuleId:id});
            },

            // 编辑或新增规则
            update : function(params,isEdit){
                var url = isEdit ? '/rule/upShelves/update' :
                    '/rule/upShelves/create';
                return curd.post(url, params,'json');
            },

            list : function(params){
                return curd.post('/rule/upShelves/page', params);
            },

            toggle : function(params){
                console.log(params)
                return curd.post('/rule/upShelves/updateStatus', params);
            },
            // 根据页面选择的商家和仓库获取当前端的库区
            getZone:function(params){
                return curd.post('/base/warehousezone/page',params)
            },
            // 模态框中根据所选的库区请求库位
            getLocation:function(params){
                return curd.post('/base/warehouseLocation/page',params)
            }



        }
    }]);
})