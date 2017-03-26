define(['app', 'moment'], function(app, moment) {

    return app.controller('RuleLocationAssignEditCtrl', ['$scope', 'RuleLocationAssignService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

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

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '库位分配规则',

            fields : {"status":"","remark":"","warehouseId":"","ownerId":"","ruleCode":"","ruleName":"","locationAssignRuleDetailVOList":"","id":""},

            fields_def : {
                status : 1,
                shops:[]
            },

            deps:{
                'warehouseId':'WAREHOUSE',
                'ownerId':'OWNER',

                //明细中使用
                'orderType':'ORDER_TYPE',
                'goodsCateId':'GOODS_CATEGORY',
                'unitId':'PACK_UNIT',
                'inventoryStatus':'INVENTORY_STATUS',
                'tacticsId':'LOCATION_ASSIGN_TACTISC'
            }

        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,

            detail:{
                create: detail_create,
                edit: detail_edit,
                remove: detail_remove,
                view:detail_view
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
            vm.data.pickingRuleDetailVOList = vm.data.pickingRuleDetailVOList || [];
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );


            if(isEdit){
                params.bizRefRuleId = parseInt(id);
            }
/*
            params.warehouseName = getDepValue('warehouseId' , params.warehouseId);*/

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

        /**
         * 新增明细
         * @return {[type]} [description]
         */
        function detail_create(){
            detail_edit({},1);
        }

        
        function detail_remove(i){
            vm.data.pickingRuleDetailVOList.splice(i,1);
        }

        /**
         * 查看明细
         * @return {[type]} [description]
         */
        function detail_view(row){
            detail_edit(row,2);
        }

        function detail_valid(row , ori){
            var all = vm.data.pickingRuleDetailVOList , ori_orderNum = ori.orderNum;
            console.log(vm.data.pickingRuleDetailVOList, ori_orderNum )
            for(var i in all){
                if(
                    //排除自身
                    all[i].orderNum != ori_orderNum &&
                    (
                        all[i].orderNum == row.orderNum
                    )
                    
                ){
                    return false;
                }
            }
            return true;
        }

        /**
         * 编辑明细
         * @param  {[type]} row    [description]
         * @param  {[type]} mode [description]
         * @return {[type]}        [description]
         */
        function detail_edit(row, mode){
            var safe_data = angular.copy(row);
            modalService.open('rule/location_assign/detail/edit.html',{
                page : {
                    view : mode == 2, 
                    edit : !mode,
                    title : (mode == 1 ? '新增': ( mode == 2 ? '查看' : '编辑')) + '明细',
                    deps : {
                        tacticsId: page.deps.tacticsId,
                        orderType: page.deps.orderType,
                        goodsCateId:page.deps.goodsCateId,
                        unitId:page.deps.unitId,
                        inventoryStatus:page.deps.inventoryStatus
                    }
                },
                
                data : row
            },{
                unload : function(modal){
                    if( modal.result ){
                        if( !detail_valid( modal.data , safe_data) ){
                            sl.alert('行号已被使用');
                            return false;
                        }
                    }
                    
                }
            }).then(function(modal){
                if(modal.result){
                    
                    modal.data.tacticsName = '大S';
                    
                    //新增时
                    if(mode == 1){
                        vm.data.pickingRuleDetailVOList.push( modal.data );
                    }
                }else{
                    sl.extend(row , safe_data)
                }
            });
        }

    }]);

})
