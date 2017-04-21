define(['app'], function(app) {

    return app.controller('vps.server.manager', ['$scope', 'SVPS', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;

        var page = {

            loading: true,

            title: '管理VPS'
        };


        sl.extend(vm , {
            page : page,
            data    : data,
            shutdown:shutdown,
            boot:boot
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            service.status(id).then(function(resp){
                page.loading = false;
                console.log(resp)
                if(resp.status){
                    sl.alert(resp.message);
                }
                else{
                    setData(resp.result);
                }
            });
        }

        function shutdown(result){

            page.loading = true;
            service.shutdown(id).then(function(){
                page.loading = false;

                if(resp.status){
                    sl.alert(resp.message);
                }
                else{
                    sl.alert('操作成功');
                }
            })
        }

        function boot(result){
            page.loading = true;
            service.boot(id).then(function(resp){
                page.loading = false;
                console.log(resp)
                if(resp.status){
                    sl.alert(resp.message);
                }
                else{
                    sl.alert('操作成功');
                }
            })
        }

        
         /**
         * 处理并绑定数据
         */
        function setData(d){
            raw = d;
            vm.data = d;
        }

    
    }]);

})
