/**
 * 
 * 出库 - 创建批次服务Lottpl
 */

define(['app'], function(app) {

    app.factory('OutstockcreateWavelService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            //点击搜索按钮;
            search : function(params){
                return curd.post('/outstock/outWave/createWavePage',params)
            },
            // SKU预查询
            // 'suggestSKU' : function(key,customCode){
            //     return oms.get('base/goods/queryBySkuCode',{code:key , customCode:customCode}).then(function(resp){
            //         return resp.data;
            //     })
            // },

            //点击创建波次按钮
            create : function(params){

                return curd.post('/outstock/outWave/createOutWave',params , 'json')

            },
           
            //规则接口查询；   暂时处理没有传参数
            ruleList:function(params){
                return curd.post('/rule/waveRule/page',params)            
            },

            // SKU预查询接口
            queryBySkuCode : function(params){
                return curd.post('/base/goods/queryBySkuCode' , params);
                
            },



            

            list : function(params){
                return curd.post('/outstock/outWave/page',params);
            },

            // 波次管理列表删除
            del : function(id){
                return curd.post('/outstock/outWave/delOutWave',{id:id})
            },

            //修改波次保存
            // update : function(id,pickType,billlist){
            //     return curd.post('/outstock/outWave/updateOutWave',{id:id,pickType:pickType,billIdList:billlist})
            // }
           update : function(params){
                return curd.post('/outstock/outWave/updateOutWave',params)
            }
        }
    }]);
})