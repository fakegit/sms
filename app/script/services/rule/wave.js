/**
 * Created by ting on 2017/1/11.
 * 波次规则 - 服务
 */

define(['app'], function(app) {

    app.factory('RuleWaveService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/rule/waveRule/page', params);
                // return curd.get('local://base.goods.list', params);
            },

            toggle : function(params){
                return curd.get('/rule/waveRule/toggle' , params);
            },

            get : function(id){
                return curd.get('/rule/waveRule/query' , {'bizRefRuleId':id})
            },

            update : function(params , isEdit){
                var url = isEdit ? '/rule/waveRule/update' :
                    '/rule/waveRule/create';
                return curd.post(url , params, 'json');
            },

            remove : function(){}
        }
    }]);
})