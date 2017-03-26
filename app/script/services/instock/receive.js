/**
 * Created by ting on 2016/12/22.
 * 收货 - 服务
 */

define(['app'], function(app) {

    app.factory('InstockReceiveService', ['sl' ,function(sl) {
        var curd = sl.curd;

        return {
            // 收货记录列表 #359
            list : function(params){
                return curd.post('/receive/record/page', params);
            },

            //收货记录删除 #360
            remove : function(params){
                return curd.post('/receive/record/delete', {recordIdList:params},'json');
            },

            // #401 获取批次属性 id={id}&skuCode={skuCode}
            getSku:function(params){
                
                return curd.get('/receive/record/querySkuBatchInfo',params);

            },

            //#401 校验lpn
            checkLpn:function(lpn){
                return curd.get('/receive/record/checkLpn?receiveLpn=lpn');
            },

            //#401 后台-收货操作页—完成收货
            update :function(params){
                return curd.post('/receive/record/finishReceived', params , 'json')
            },
        }
    }]);
})