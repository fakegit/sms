/**
 * 
 * 出库 - 创建批次服务Lottpl
 */

define(['app'], function(app) {

    app.factory('OutstockautoWavelService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
           
            // 自动创建波次查询
            list : function(params){
                return curd.post('/outstock/outWaveAutoConfig/page',params);
            },
            // 自动创建波次查询状态修改
            toggle : function(params){
                console.log(params)
                if (params.status == '0') {
                    return curd.post('/outstock/outWaveAutoConfig/open',params)
                }else{
                    return curd.post('/outstock/outWaveAutoConfig/stop',params)
                }    
            },
    
               
             //波次规则接口查询；   暂时处理没有传参数
            ruleList:function(params){
                return curd.post('/rule/waveRule/page',params)            
            },
            //新增自动创建波次
            create:function(params){
                return curd.post('/outstock/outWaveAutoConfig/create',params)
            },

            //修改查询
            get:function(id){
                return curd.post('/outstock/outWaveAutoConfig/query',{id:id})
            },
            // SKU预查询接口
            queryBySkuCode : function(params){
                return curd.post('/base/goods/queryBySkuCode' , params);
                
            },


            

            //修改波次保存(传参错误 )
            // update : function(id,pickType,billlist){
            //     return curd.post('/outstock/outWave/updateOutWave',{id:id,pickType:pickType,billIdList:billlist})
            // }

           update : function(params){
                return curd.post('/outstock/outWaveAutoConfig/update',params,'json')
            }
        }
    }]);
})