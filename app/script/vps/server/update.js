define(['app'], function(app, moment) {

    return app.controller('vps.server.update', ['$scope', 'SVPS', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = !id ,

            isEdit = !!id,

            isView = !isEdit && !isCreate;

        var page = {

            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : '新增') + 'VPS',

            fields : {"name":"","provider":"","type":"","remark":"","status":"" ,"api_url":"" ,"api_key":"" , "api_hash":"","virtualization":""},

            fields_def : {
                status : 1,
                'api_hash':'9b30fff6134e8808cf8af81d1651080c1a3ce768',
                'api_key':'8FCP4-Z7NYF-KNHKH',
                'api_url':'https://manage.quadcone.com/',
                'type':'solusvm'
            },

            deps:{
                // 带有依赖条件的 
                'provider':'PROVIDER'
            }
        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(deps){
                if(!isCreate){
                    service.get(id).then(function(resp){
                        page.loading = false;
                        if(resp.status){
                            sl.alert(resp.message);
                        }
                        else{
                            setData(resp.result);
                        }
                    });
                }else{
                    page.loading = false;
                    setData(page.fields_def);
                }
                
            })
        }


        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.update(getData() , isEdit).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);
                console.log(resp)
                if(resp.status){
                    sl.alert(resp.message);
                }
                else{
                    sl.notify('保存成功');
                }

            });
        }

        /**
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {
            setData(raw);
        }

         /**
         * 处理并绑定数据
         */
        function setData(d){
            raw = d;
            vm.data = sl.pick( d , page.fields);
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );

            if(isEdit){
                params.id = id;
            }
            return params;
        }
    }]);

})
