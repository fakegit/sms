/**
 * Created by ting on 2016/8/8.
 * 
 */

define(['app'], function(app) {

    app.factory('OutstockWavelService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            get : function(id){
                return curd.get('/outstock/outWave/query',{id:id,flag:1} );
            },
            get1 : function(params){
                return curd.post('/outstock/outstorageBill/page',params);
            },


            // 修改波次查询接口
            change : function(id){
                return curd.get('/outstock/outWave/query',{id:id,flag:2});
            },


            list : function(params){
                return curd.post('/outstock/outWave/page',params);
            },

            // 波次管理列表删除
            del : function(id){
                return curd.post('/outstock/outWave/delOutWave',{id:id})
            },

            //修改波次明细保存按钮
           update : function(params){
                return curd.post('/outstock/outWave/updateOutWave',params,'json')
            },


            //一键复核
            check:function(params){
                return curd.post('/outstock/outWave/onekeyCollate',params,'json')
            }
        }
    }]);
})