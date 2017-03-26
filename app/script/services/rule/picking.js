/**
 * Created by ting on 2017/1/11.
 * 拣货规则 - 服务
 */

define(['app'], function(app) {

    app.factory('RulePickingService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/rule/picking/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            toggle : function(params){
                return curd.get('/rule/picking/updateStatus' , params);
            },

            get : function(id){
                return curd.get('/rule/picking/queryById' , {'bizRefRuleId':id})
            },

            update : function(params , isEdit){
                var url = isEdit ? '/rule/picking/update' :
                    '/rule/picking/create';
                return curd.post(url , params, 'json');
            },

            remove : function(){}
        }
    }]);
})