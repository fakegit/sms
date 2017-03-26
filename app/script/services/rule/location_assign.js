/**
 * Created by ting on 2017/1/11.
 * 库位分配规则 - 服务
 */

define(['app'], function(app) {

    app.factory('RuleLocationAssignService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/rule/locationAssign/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            toggle : function(params){
                return curd.get('/rule/locationAssign/updateStatus' , params);
            },

            get : function(id){
                return curd.get('/rule/locationAssign/queryById' , {'bizRefRuleId':id})
            },

            update : function(params , isEdit){
                var url = isEdit ? '/rule/locationAssign/update' :
                    '/rule/locationAssign/create';
                return curd.post(url , params, 'json');
            },

            remove : function(){}
        }
    }]);
})