define(['app', 'moment'], function(app, moment) {

    return app.controller('BaseGoodsEditCtrl', ['$scope', 'BaseGoodsService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

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

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '商品',

            fields : {"status":"","remark":"","qtymin":"","qtymax":"","alertDay":"","outDay":"","inDay":"","expirationDay":"","env":"","brand":"","isShelfLifeWarn":"","isBatch":"","sellPrice":"","purchasePrice":"","transferType":"","barcode2":"","barcode1":"","barcode":"","batchId":"","standard":"","unit":"","goodsType":"","goodsCategory":"","ownerId":"","skuCode":"","skuNameEn":"","skuName":"","basePackUnitVOs":"","hsCode":"","grossWeight":"","netWeight":""},
            fields_def:{
                "status":1,
                "basePackUnitVOs":[]
            },
            deps:{
                'ownerId':'OWNER',
                'goodsCategory':'GOODS_CATEGORY',
                'goodsType':'GOODS_TYPE',
                'unitId':'LOCATION_UNITTYPE',
                'batchId':'BATCH',
                'env':'LOCATION_ENV',
                'transferType':'LOCATION_DEMAND'
            },

            modal : {
                title : (this.edit ? '编辑':'新增') + '计量单位',
                data : {}
            }
        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,

            unit:{
                create: unit_create,
                edit : unit_edit,
                remove : unit_remove
            }
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
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {
            vm.data = sl.pick(raw , page.fields);
        }

        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.update(getData(), isEdit).then(function(resp){
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
         * 处理并绑定数据
         */
        function setData(d){
            raw = angular.copy(d);
            vm.data = sl.pick( d , page.fields);
            if( !vm.data.basePackUnitVOs )
                vm.data.basePackUnitVOs = [];
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = sl.dig( angular.copy(vm.data) );
            if(isEdit){
                params.id = id;
            }

            //TODO 商户还需要编码和名称

            var owner = getDepValue('ownerId' , params.ownerId , true);
            if( owner ){
                params.ownerName = owner.name;
                params.ownerCode = owner.code;
            }
            
            return params;
        }

        function getDepValue(dep , id , raw){
            var d = page.deps[dep];
            for (var i = d.length - 1; i >= 0; i--) {
                if( d[i].id == id)
                {
                    return raw ? d[i].raw : d[i].label;
                }

            }
            return null;
        }

        function unit_create(){
            unit_edit({},true);
        }

        function unit_edit(row, create){
            var safe_data = angular.copy(row);
            
            modalService.open('unit/edit.html',{
                page : {
                    title : (create ? '新增': '编辑') + '计量单位明细',
                    deps : {
                        'unitId':page.deps.unitId
                    }
                },
                
                data : row
            }).then(function(modal){
                if(modal.result){
                    if(create){
                        modal.data.unitName = getDepValue('unitId',modal.data.unitId);
                        vm.data.basePackUnitVOs.push( modal.data );
                    }
                }else{
                    sl.extend(row , safe_data)
                }
            });
        }

        function unit_remove(index){

            vm.data.basePackUnitVOs.splice(index , 1);
        }

    }]);

})
