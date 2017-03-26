/**
 * Created by ting on 2017/1/12.
 * 拣货管理 - 服务
 */

define(['app'], function(app) {

    app.factory('OutstockOutpickService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            list : function(params){
                return curd.post('/outstock/outPickTask/page', params);
            },

            get : function(params){
                return curd.post('/outstock/outPickTaskDetail/query',params);
            },

            //执行拣货，执行边拣边分、总拣接口
            picking: function(params , type){
                var url = type == 3 ?
                    '/outstock/outPickTask/pickingSorting':
                    '/outstock/outPickTask/picking';
                    
                return curd.post(url,params);
            },


            //拣货页面详情
            detail : function(id , type){
                var url = type == 3 ? 
                    //二次分拣
                    '/outstock/outPickTask/pickingSortingDetail':

                    //边分边拣/总拣
                    '/outstock/outPickTask/pickingDetail';

                return curd.get(url,{'waveCode':id})
            },

            complete : function(id){
                return curd.get('/outstock/outPickTask/finishPickingSorting',{waveCode:id});
            } 
            
        }
    }]);
})