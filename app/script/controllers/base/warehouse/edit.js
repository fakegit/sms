/**
 * 新增/编辑 仓库

 * @date     2017-01-03
 * @author   wuting<reruin@gmail.com>
 */
define(['app'], function(app) {

    return app.controller('BaseWarehouseEditCtrl', ['$scope', 'BaseWarehouseService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

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

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '仓库',

            fields : {"status":"","cEmail":"","cFax":"","cTel":"","cMobile":"","cContact":"","cZip":"","cAddress":"","warehouseCompany":"","warehouseType":"","warehouseCode":"","warehouseName":"","cDistrict":'',"cCity":"","cProvince":""
            },

            fields_def : {
                baseWarehouseVO:{ status:1 } ,
                logisticsList:[]
            },

            deps:{
                'warehouseType':'WAREHOUSE_TYPE',
                'logisticsList':'LOGISTICS',
                'area':'AREA'
            },

            options:{
                area:{
                    district:'cDistrict',
                    city:'cCity',
                    province:'cProvince'
                }
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


            service.update(getData() , isEdit).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                    sl.dep.update('WAREHOUSE');
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
            vm.data = sl.pick( d.baseWarehouseVO , page.fields);
            if(isCreate){
                vm.data.logisticsList = page.deps.logisticsList;
            }
            else{
                vm.data.logisticsList = d.logisticsList;
            }
            console.log(vm.data)
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            var logisticsList = params.logisticsList;

            if(isEdit){
                params.id = id;
                // 交叉比对 承运商的变化
                var ret = [],raw_l = raw.logisticsList;

                for (var i = raw_l.length - 1; i >= 0; i--) {
                    if( raw_l[i].flag != logisticsList[i].flag){
                        ret.push( {
                            logisticsId : logisticsList[i].logisticsId,
                            flag : logisticsList[i].flag
                        } )
                    }
                }

                params.logisticsList = ret;
            }
            else if(isCreate){
                var ret = [];
                for( var i = logisticsList.length - 1; i>=0; i--){
                    if(logisticsList[i].flag == '0') ret.push( logisticsList[i].id )
                }
                
                // params['logistics[]'] = sl.coll( params.logisticsList , 'flag', 0).toString();
                delete params.logisticsList;
                params['logistics[]'] = ret.toString();
            }

            return sl.dig( params );
        }
    }]);

})
