define(['app', 'moment'], function(app, moment) {

    return app.controller('RuleUpshelvesEditCtrl', ['$scope', 'RuleUpshelvesService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

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

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '上架规则',

            fields : {
               "id":"", "status":"","ownerId":"","warehouseId":"","ruleType":"","ruleCode":"","ruleName":"","remark":"","upShelvesRuleDetailVOList":""
            },
          
            fields_def : {
                status : 1,
                upShelvesRuleDetailVOList:[]
            },


            // 页面初始依赖
            deps:{
                //所属库区
                // 'type':'ZONE_TYPE',
                // 所属仓库
                'warehouseId':'WAREHOUSE',
                // 所属货主、商家
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
                'inventorystatus':'INVENTORY_STATUS'  ,
                //库位类别
                // 'warehouseLocationId':'LOCATION_CATEGORY',
                //库位类型
                'warehouseLocationtype':'LOCATION_TYPE'

            }

        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,
            // change : change,
            rule:{
                create: rule_create,
                edit: rule_edit,
                // toggle:rule_toggle,
                view:rule_view,
                del:rule_del
            }
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(deps){
                // page.deps.type_hash = sl.hash(page.deps.type, 'id', 'name'); 
                page.deps.tactics_hash = sl.hash(page.deps.tactics, 'id', 'label');

                if(!isCreate){
                    service.get(id).then(function(resp){
                        page.loading = false;

                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{
                            setData(resp.returnVal);
                            var mylist = {};
                            var obj = {};
                                obj.warehouseId = vm.data.warehouseId;
                                obj.ownerId = vm.data.ownerId;
                                obj.type = 1;
                            service.getZone(obj).then(function(resp){
                                mylist = resp.list
                                page.deps.type_hash = sl.hash(mylist, 'id', 'name'); 
                            })
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
            raw = angular.copy(d);
            vm.data = sl.pick( d , page.fields);

        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){   
            var params = angular.copy( vm.data );
            console.log(params)
                params.ruleType = "UPSHELVES";
                console.log(params)
            if (params.upShelvesRuleDetailVOList) {
                var list = params.upShelvesRuleDetailVOList;
                console.log(list)
                for(var i in list) {
                    if (list[i].orderNum) {
                        list[i].orderNum = parseInt(list[i].orderNum)
                    }
                   if(list[i].warehouseZoneId){

                        list[i].warehouseZoneId={
                            "factAttribute":"warehouseZoneId",
                            "operator":"=",
                            "expectationValue":list[i].warehouseZoneId.expectationValue
                        }
                   }
                   if(list[i].warehouseLocationId){
                        list[i].warehouseLocationId={
                            "factAttribute":"warehouseLocationId",
                            "operator":"=",
                            "expectationValue":list[i].warehouseLocationId.expectationValue
                        }
                   }
                   if(list[i].ordersType){
                        list[i].ordersType={
                            "factAttribute":"ordersType",
                            "operator":"=",
                            "expectationValue":list[i].ordersType.expectationValue
                        }
                   }
                   if(list[i].goodsCategory){
                        list[i].goodsCategory={
                            "factAttribute":"goodsCategory",
                            "operator":"=",
                            "expectationValue":list[i].goodsCategory.expectationValue
                        }
                   }
                   if(list[i].inventoryStatus){
                        list[i].inventoryStatus={
                            "factAttribute":"inventoryStatus",
                            "operator":"=",
                            "expectationValue":list[i].inventoryStatus.expectationValue
                        }
                   }
                   if(list[i].evn){
                        list[i].evn={
                            "factAttribute":"evn",
                            "operator":"=",
                            "expectationValue":list[i].evn.expectationValue
                        }
                   }
                   if(list[i].goodsId){
                        list[i].goodsId={
                            "factAttribute":"goodsId",
                            "operator":"=",
                            "expectationValue":list[i].goodsId.expectationValue
                        }
                   }


                    // 将tacticsName类型转为string
                    if (list[i].tacticsName) {
                        list[i].tacticsName = list[i].tacticsName.toString();
                    }

                    // list[i] = sl.dig(list[i]);
                }
            }
            

            // console.log(sl.dig(params))

            if(isEdit){
                params.bizRefRuleId = id;
            }
            // console.log(Json.parse(params))
            // params.upShelvesRuleDetailVOList =JSON.stringify(params.upShelvesRuleDetailVOList);

            // var ret = sl.dig(params);
            // console.log(sl.dig(params))
            // return sl.dig(params);
            // console.log(params)
            console.log(params)
            return params;//json.stringfy(params);
        }





        /**
         * 新增rule
         * @return {[type]} [description]
         */
        function rule_create(){
            var mylist = {};
            var obj = {};
                obj.warehouseId = vm.data.warehouseId;
                obj.ownerId = vm.data.ownerId;
                obj.type = 1;
            service.getZone(obj).then(function(resp){
                mylist = resp.list
                page.deps.type_hash = sl.hash(mylist, 'id', 'name'); 
            })


            rule_edit({},1);
        }

        /**
         * 查看rule
         * @return {[type]} [description]
         */
        function rule_view(row){
            rule_edit(row,2);
        }

        //判断序号不可重复
        function rule_valid(row,ori){
            for (var i in row) {
                if (row[i].orderNum == ori.orderNum) {
                    return false
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
            if (safe_data.warehouseZoneId) {
                if (safe_data.warehouseZoneId.expectationValue) {
                    safe_data.warehouseZoneId.expectationValue = parseInt(safe_data.warehouseZoneId.expectationValue)
                }
            }
            if (safe_data.warehouseLocationId) {
                if (safe_data.warehouseLocationId.expectationValue) {
                    safe_data.warehouseLocationId.expectationValue = parseInt(safe_data.warehouseLocationId.expectationValue)
                }
            }
            if (safe_data.ordersType) {
                if (safe_data.ordersType.expectationValue) {
                    safe_data.ordersType.expectationValue = parseInt(safe_data.ordersType.expectationValue)
                }
            }
            if (safe_data.goodsCategory) {
                if (safe_data.goodsCategory.expectationValue) {
                    safe_data.goodsCategory.expectationValue = parseInt(safe_data.goodsCategory.expectationValue)
                }
            }
            if (safe_data.inventoryStatus) {
                if (safe_data.inventoryStatus.expectationValue) {
                    safe_data.inventoryStatus.expectationValue = parseInt(safe_data.inventoryStatus.expectationValue)
                }
            }
            if (safe_data.evn) {
                if (safe_data.evn.expectationValue) {
                    safe_data.evn.expectationValue = parseInt(safe_data.evn.expectationValue)
                }
            } 
            // 打开模态框前请求数据
            if (vm.data.ownerId && vm.data.warehouseId) {

                var obj = {};
                    obj.warehouseId = vm.data.warehouseId;
                    obj.ownerId = vm.data.ownerId;
                    obj.type = 1;
                service.getZone(obj).then(function(resp){
                    vm.data.getZone = resp.list;
                    // 打开模态框前请判断库区是否有值
                    if (row.warehouseZoneId) {
                        var obj = {};
                            obj.putaway_zone_id= row.warehouseZoneId.expectationValue;
                        service.getLocation(obj).then(function(resp){
                            vm.data.warehouseLocationId = resp.list
                            modalService.open('rule/edit.html',{
                                page : {
                                    view : mode == 2, 
                                    edit : !mode,
                                    // title : (mode == 1 ? '新增': ( mode == 2 ? '查看' : '编辑')) + '店铺',
                                    deps : {
                                        'types':vm.data.getZone,
                                        'evn':page.deps.evn,
                                        'goodsCategory':page.deps.goodsCategory,
                                        'tactics':page.deps.tactics,
                                        'ordersType':page.deps.ordersType,
                                        'inventorystatus':page.deps.inventorystatus,
                                        'warehouseLocationId':vm.data.warehouseLocationId,
                                        'ownerId':page.deps.ownerId
                                    }
                                },
                                getLocation:function(page){
                                    var obj = {};
                                        obj.putaway_zone_id= safe_data.warehouseZoneId.expectationValue
                                        service.getLocation(obj).then(function(resp){
                                            page.deps.warehouseLocationId = resp.list
                                        })
                                },
                                data : safe_data,
                            unload : function(modal){
                                if ( mode== 1 ) {
                                    if( modal.result){
                                        var dataList = vm.data.upShelvesRuleDetailVOList
                                        if( !rule_valid(dataList , modal.data) ){
                                            sl.alert('序号不可以重复');
                                            return false;
                                        }
                                    }
                                }
                                if (mode == undefined) {
                                    if (modal.result) {
                                        // 用于存贮行号，避免直接操作数据
                                        var orderNumList = []
                                        var dataList = vm.data.upShelvesRuleDetailVOList
                                       for (var i = 0; i<dataList.length;i++) {
                                            orderNumList.push(dataList[i].orderNum)
                                       }
                                       for (var i=0;i<orderNumList.length;i++) {
                                           orderNumList.splice(i,1)
                                       }
                                        if(orderNumList.indexOf(modal.data.orderNum)){
                                                sl.alert('序号不可以重复')
                                                return false;
                                        }
                                    }
                                }
                            }
                            }).then(function(modal){
                                if(modal.result){
                                    // create
                                    if(mode == 1){ 
                                        vm.data.upShelvesRuleDetailVOList.push(modal.data); 
                                        console.log(vm.data.upShelvesRuleDetailVOList)                   
                                    }
                                    // 编辑
                                    if (mode == undefined) {
                                        safe_data = modal.data
                                        sl.extend(row , safe_data)
                                    }
                                }else{
                                    sl.extend(row , safe_data)
                                }
                            }); 
                        })
                    }else{
                        modalService.open('rule/edit.html',{
                            page : {
                                view : mode == 2, 
                                edit : !mode,
                                // title : (mode == 1 ? '新增': ( mode == 2 ? '查看' : '编辑')) + '店铺',
                                deps : {
                                    'types':vm.data.getZone,
                                    'evn':page.deps.evn,
                                    'goodsCategory':page.deps.goodsCategory,
                                    'tactics':page.deps.tactics,
                                    'ordersType':page.deps.ordersType,
                                    'inventorystatus':page.deps.inventorystatus,
                                    // 'warehouseLocationId':page.deps.warehouseLocationId,
                                    'ownerId':page.deps.ownerId
                                }
                            },
                            getLocation:function(page){
                                var obj = {};
                                    obj.putaway_zone_id= safe_data.warehouseZoneId.expectationValue
                                    service.getLocation(obj).then(function(resp){
                                        page.deps.warehouseLocationId = resp.list
                                    })
                            },
                            data : safe_data,
                            unload : function(modal){

                                if ( mode== 1 ) {
                                    if( modal.result){
                                        var dataList = vm.data.upShelvesRuleDetailVOList
                                        if( !rule_valid(dataList , modal.data) ){
                                            sl.alert('序号不可以重复');
                                            return false;
                                        } 
                                    }
                                }
                                if (mode == undefined) {
                                    if (modal.result) {
                                        // 用于存贮行号，避免直接操作数据
                                        var orderNumList = []
                                        var dataList = vm.data.upShelvesRuleDetailVOList
                                       for (var i = 0; i<dataList.length;i++) {
                                            orderNumList.push(dataList[i].orderNum)
                                       }
                                       for (var i=0;i<orderNumList.length;i++) {
                                           orderNumList.splice(i,1)
                                       }
                                        if(orderNumList.indexOf(modal.data.orderNum)){
                                                sl.alert('序号不可以重复')
                                                return false;
                                        }
                                    }
                                }
                            }
                        }).then(function(modal){
                            if(modal.result){
                                // create
                                if(mode == 1){ 
                                    vm.data.upShelvesRuleDetailVOList.push(modal.data);
                                    console.log(vm.data.upShelvesRuleDetailVOList)                    
                                }
                                // 编辑
                                if (mode == undefined) {
                                    safe_data = modal.data
                                    sl.extend(row , safe_data)
                                }
                            }else{
                                sl.extend(row , safe_data)
                            }
                        }); 
                      }
                    })
                }else{
                    sl.alert('请先选择所属商家和仓库')
                }
            }


        /**
         * 修改rule状态
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        // function rule_toggle(row){
        //     //var toggle_state = row.status == 1 ? 0 : 1;
        //     row.status = row.status == 1 ? 0 : 1;
        // }


        //删除rule行；
        function rule_del(row){
            var rowList = vm.data.upShelvesRuleDetailVOList;
            var rowi;
            for (var i = 0; i < rowList.length; i++) {
                if( row == rowList[i]){
                    rowi = i;
                }
            }
           vm.data.upShelvesRuleDetailVOList.splice(rowi,1);
           console.log(vm.data.upShelvesRuleDetailVOList)
        }








    }]);

})
