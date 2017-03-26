define(['app', 'moment'], function(app, moment) {

    return app.controller('BaseLocationEditCtrl', ['$scope', 'BaseLocationService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

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

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '库位',

            fields : {"status":"","layer":"","weightCapacity":"","volumeCapacity":"","height":"","width":"","length":"","z":"","y":"","x":"","env":"","maxLotidLimit":"","maxSkuLimit":"","demand":"","type":"","pickSeq":"","putawaySeq":"","remark":"","pickZoneId":"","putawayZoneId":"","category":"","warehouseId":"","code":"","remark":""},

            fields_def : {
                status : 1
            },

            deps:{
                // 带有依赖条件的 
                
                'warehouseId':'WAREHOUSE',

                //库位类别
                'category':'LOCATION_CATEGORY',

                //上架区
                'putawayZoneId':'ZONE_PUT',

                'pickZoneId':'ZONE_PICK',

                //库位类型
                'type':'LOCATION_TYPE',

                //周转需求
                'demand':'LOCATION_DEMAND',

                //储存单位
                'unitType':'LOCATION_UNITTYPE',

                //储存环境
                'env':'LOCATION_ENV'
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

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
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
            
            //处理 checkbox
            vm.data.unitType = sl.checkbox(raw.unitType , page.deps.unitType);

            if(isCreate){
                for (var i = vm.data.unitType.length - 1; i >= 0; i--) {
                    vm.data.unitType[i].checked = true;
                }
            }

            // console.log(vm.data.unitType)
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );

            params.unitType = sl.select(params.unitType, 'checked' , true, 'id').join(',');

            if(isEdit){
                params.id = id;
            }

            return sl.dig(params);
        }
    }]);

})
