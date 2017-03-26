define(['app', 'moment'], function(app, moment) {

    return app.controller('BaseLogisticsEditCtrl', ['$scope', 'BaseLogisticsService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

        var page = {

            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '承运商',

            fields : {"status":"","cZip":"","cEmail":"","cFax":"","cTel":"","cMobile":"","cContact":"","cAddress":"","logisticsCode":"","logisticsName":"","cDistrict":'',"cCity":"","cProvince":""},

            fields_def:{
                "status":1
            },

            deps:{
                'warehouseType':'WAREHOUSE_TYPE',
                'area':'AREA'
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
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{
                            setData(resp.returnVal);
                        }
                    });
                }else{
                    page.loading = false;
                    setData( page.fields_def );
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


            service.update(getData(),isEdit).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                    sl.dep.update('LOGISTICS');
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
            raw = angular.copy(d);
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

            return sl.dig( params );
        }
    }]);

})
