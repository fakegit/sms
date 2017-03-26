define(['app', 'moment'], function(app, moment) {

    return app.controller('InstockReserveEditCtrl', ['$scope', 'InstockReserveService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

            console.log(data+"---"+raw+"---"+id+"---"+isCreate+"---"+isEdit+"---"+isView)

        var page = {

            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '入库预约单',

            fields : {
               /* //入库预约单号；
                "inAsnVO.orderNo":"",
                //客户单号；
                "inAsnVO.customerOrderNo":"",
                //单据类型；
                "inAsnVO.typeName":"",
                //业务类型；
                "inAsnVO.businessTypeName":"",
                //货主名称；
                "inAsnVO.baseOwner.name":"",
                //店铺名称；
                'inAsnVO.baseShop.name':'',
                //单据来源；
                '':'',
                //仓库名称;
                'inAsnVO.baseWarehouse.warehouseName':'',
                //商品数量
                'inAsnVO.goodsQty':'',
                //预期到货时间
                'inAsnVO.planArrivalDate':'',
                //入库状态
                'inAsnVO.statusName':'',
                //创建人
                'inAsnVO.createdBy':'',
                //创建时间
                'inAsnVO.createdTime':'',
                //备注
                'inAsnVO.remark':'',*/


                'inAsnVO':'',
                //商品明细
                'detailList':''

            },

            fields_def : {
                detailList:[]
            }


            // 页面初始依赖
           /* deps:{
                //所属库区
                'type':'ZONE_TYPE',
                // 所属仓库
                'warehouseId':'WAREHOUSE',
                // 所属货主
                'ownerId':'OWNER',
                // 商品类别
                'goodsCategory':'GOODS_CATEGORY',
                // 存储环境
                'evn':'LOCATION_ENV',
                // 策略名称
                'tactics':'UP_SHELVE_TACTICS',
                // 订单类型
                'ordersType':'ORDER_TYPE',
                // 库存状态
                'inventorystatus':'INVENTORY_STATUS'
            }
*/
        };


        sl.extend(vm , {
            page    : page,
            data    : data,
            save    : save,
            reset   : reset,

            rule:{
                create: rule_create,
                edit: rule_edit,
                toggle:rule_toggle,
                view:rule_view
            }

        })

        init();
        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

                if(!isCreate){
                    service.get(id).then(function(resp){
                        console.log(resp)
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
                console.log(getData())
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                    sl.dep.update(['ZONE_PUT','ZONE_PICK']);
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
            console.log(d)
            // raw = angular.copy(d);
            vm.data = sl.pick( d , page.fields);
            console.log(vm.data)
            if(vm.data.inAsnVO.planArrivalDate) {
                vm.data.inAsnVO.planArrivalDate = sl.format_time(vm.data.inAsnVO.planArrivalDate)
            }
            if(vm.data.inAsnVO.createdTime) {
                vm.data.inAsnVO.createdTime = sl.format_time(vm.data.inAsnVO.createdTime)
            }
            for (var i = 0; i < vm.data.detailList.length; i++) {
                if(vm.data.detailList[i].produceDate) {
                vm.data.detailList[i].produceDate = sl.format_time(vm.data.detailList[i].produceDate)
                }
                if (vm.data.detailList[i].expiryDate) {
                vm.data.detailList[i].expiryDate = sl.format_time(vm.data.detailList[i].expiryDate)
                }
            }

            console.log(vm.data.detailList.length)
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );


            // console.log(sl.dig(params))

            if(isEdit){
                params.id = id;
            }
            // console.log(Json.parse(params))
            // params.upShelvesRuleDetailVOList =JSON.stringify(params.upShelvesRuleDetailVOList);

            // var ret = sl.dig(params);
            // console.log(sl.dig(params))
            // return sl.dig(params);
            // console.log(params)
            return params;//json.stringfy(params);
        }





        /**
         * 新增rule
         * @return {[type]} [description]
         */
        function rule_create(){

            rule_edit({},1);
        }

        /**
         * 查看rule
         * @return {[type]} [description]
         */
        function rule_view(row){
            rule_edit(row,2);
        }

        function rule_valid(row , ori){
            var all = vm.data.rule , ori_code = ori.code;
            for(var i in all){
                if(
                    //排除自身
                    all[i].code != ori_code &&
                    (
                        all[i].name == row.name ||
                        all[i].code == row.code
                    )
                ){
                    return false;
                }
            }
            return true;
        }

        /**
         * 编辑rule
         * @param  {[type]} row    [description]
         * @param  {[type]} mode [description]
         * @return {[type]}        [description]
         */
        function rule_edit(row, mode){
            var safe_data = angular.copy(row);
            modalService.open('rule/edit.html',{
                page : {
                    view : mode == 2,
                    edit : !mode,
                    // title : (mode == 1 ? '新增': ( mode == 2 ? '查看' : '编辑')) + '店铺',
                    deps : {
                        'types':page.deps.type,
                        'evn':page.deps.evn,
                        'goodsCategory':page.deps.goodsCategory,
                        'tactics':page.deps.tactics,
                        'ordersType':page.deps.ordersType,
                        'inventorystatus':page.deps.inventorystatus

                    }
                },

                data : row,

                unload : function(modal){
                    if( modal.result ){
                        if( !rule_valid( modal.data , safe_data) ){
                            sl.alert('店铺名称或店铺编码已存在');
                            return false;
                        }
                    }
                }
            }).then(function(modal){
                if(modal.result){

                    // var par = getDepValue('pId',modal.data.pId,true);
                    // if(par){
                    //     modal.data.shopRelation = par.shopRelation + 1;
                    // }

                    // create
                    if(mode == 1){
                        console.log(modal.data)
                        vm.data.upShelvesRuleDetailVOList.push( modal.data );
                        console.log(vm.data.upShelvesRuleDetailVOList)
                    }
                }else{
                    sl.extend(row , safe_data)
                }
            });
        }


        /**
         * 修改rule状态
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        function rule_toggle(row){
            //var toggle_state = row.status == 1 ? 0 : 1;
            row.status = row.status == 1 ? 0 : 1;
        }











    }]);

})
