define(['app'], function(app) {

    return app.controller('CountPlanEditCtrl', ['$scope', 'CountPlanService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            data_detail = {}, data_remove_cache = {},

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

        var page = {

            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '盘点计划',

            fields : {
                base : {
                    'warehouseId':'',
                    'type':'',
                    'remark':'',
                    'ownerId':''
                    // 'countPlanDetailVOs':''
                },
                detail_list:[
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "locationCode", "value": "库位编码","display": true },
                    { "key": "ownName", "value": "商家名称","display": true },
                    { "key": "shopName", "value": "店铺名称", "display": true },
                    { "key": "skuName", "value": "商品名称", "display": true },
                    { "key": "skuCode", "value": "商品编码", "display": true }, 
                    { "key": "customerLot", "value": "商家批号", "display": true },
                    { "key": "produceDate", "value": "生产日期", "display": true },
                    { "key": "expiryDate", "value": "失效日期", "display": true },
                    { "key": "storageDate", "value": "入库日期", "display": true },
                    { "key": "quantity", "value": "库存数量", "display": true },
                    { "key": "countQuantity", "value": "实盘数量", "display": true },
                    { "key": "diffQuantity", "value": "盈亏数量", "display": true },
                    { "key": "operator", "value": "盘点人", "display": true },
                    { "key": "countTime", "value": "盘点时间", "display": true },
                    { "key": "statusName", "value": "盘点标记", "display": true }
                ]
            },

            //实际明细
            detail_params : {
                pag:{
                    // 分页状态
                    model:{
                        pageSize: 10,//每页显示数量
                        pageNum: 1, //当前页码
                        pageCount:0,//总页数
                        itemCount:0 // 总条目数
                    },
                    // 分页选项
                    options:{
                        size:[1, 5, 10, 20, 50],
                        display:5
                    }
                }
            },

            //查询搜索字段
            params:{

                model: {
                    'shopId':'',
                    'goodsId':'',
                    'maxLocationCode':'',
                    'minLocationCode':''
                },

                // 分页数据
                pag:{
                    // 分页状态
                    model:{
                        pageSize: 10,//每页显示数量
                        pageNum: 1, //当前页码
                        pageCount:0,//总页数
                        itemCount:0 // 总条目数
                    },
                    // 分页选项
                    options:{
                        size:[1, 5, 10, 20, 50],
                        display:5
                    }
                }
            },
            /*params : {
                'ownerId':'',
                'shopId':'',
                'goodsId':'',
                'maxLocationCode':'',
                'minLocationCode':''
            },*/
            fields_def : {
                status : 1,
                countPlanDetailVOs:[]
            },

            deps:{
                warehouseId:'WAREHOUSE',
                type:'COUNT_ADJUST_BILL_TYPE'
            }
            ,
            ac:{

            },

            showDetail : false,

            data : {
                // shopName:'',
                ownerName:'',
                details:[]
            }
        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,
            data_detail:data_detail,
            detail:{
                show:detail_show,
                close:detail_close,
                search:detail_search,
                toggle:detail_toggle,

                remove:detail_remove
            }
        })

        init();

        //商家名称预查询
        page.ac.owner = {
            suggest: function(key){
                return service.queryOwnName({name: key}).then(function(resp) {
                    return sl.format.suggest(resp.list);
                })
            },
            select: function(item) {
                page.data.ownerName = item.label;
                vm.data.ownerId = item.id;
            }
        }

        // 店铺名称预查询
        page.ac.shop = {
            suggest: function(key){
                return service.queryShopName({ 
                    ownerId:vm.data.ownerId,
                    name: key
                }).then(function(resp) {
                    return sl.format.suggest(resp.list);
                })
            },
            select: function(item) {
                page.params.model.shopName = item.label;
                page.params.model.shopId = item.id;
            }
        }

        // 商品名称预查询
        page.ac.goods = {
            suggest: function(key){
                return service.queryGoodName({skuName: key}).then(function(resp) {
                    return sl.format.suggest(resp.list);
                })
            },
            select: function(item) {
                page.params.model.skuName = item.label
                page.params.model.goodsId = item.id
            }
        }

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
                    detail_list(id);
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
                    if(!isEdit){
                        // sl.confirm({})
                    }
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
            vm.data = sl.pick( d , page.fields.base);
            vm.data.detail = d.countPlanDetailVOs || [];
            vm.page.data.ownerName = d.ownerName;
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

            /*if(isCreate){
                var detail = angular.copy( page.params )
                detail.ownerId = data.ownerId;
                detail.ids = data_detail;

                params.planDetailQueryParams = detail;
            }*/

            return params;
        }

        //列出实际的明细
        function detail_list(){
            var params = {
                id : id,
                pageSize: page.detail_params.pag.model.pageSize,
                pageNum : page.detail_params.pag.model.pageNum
            };
            service.detail_list(params).then(function(resp){
                console.log(resp)
                var d = resp.list || [];
                sl.format.index(d);
                sl.format.timestamp(d,['produceDate','expiryDate','storageDate']);
                page.data.details = d;
                page.detail_params.pag.model.itemCount = resp.total;

            });
        }

        function detail_remove(row){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            //console.log()
            service.detail_remove(row.id).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    sl.notify('删除成功');
                    detail_list();
                }

            });
        }

        function detail_show(){
            page.showDetail = true;
        }

        function detail_close(result){
            page.showDetail = false;

            //保存
            if(result){
                detail_save();
            }
            $timeout(function(){
                detail_reset_search();
            },100)
            page.showDetail = false;
        }

        // 保存查询出的明细
        function detail_save(){
            var params = angular.copy(page.params.model);
            params.ids = sl.key(data_remove_cache);
            params.ownerId = vm.data.ownerId
            delete params.shopName;

            if(params.ids.length == 0){
                delete params.ids;
            }

            var obj = {
                planDetailQueryParams : sl.clean(params),
                id : parseInt(id)
            }
            
            service.update(obj, true).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                    //更新
                    init();
                }
            });
        }

        function detail_filter(data){
            //过滤掉删除的
            for(var i in data){
                if( data_remove_cache[data[i].id] ){
                    data[i].disabled = '1';
                }else{
                    data[i].disabled = '0';
                }
            }
        }

        /**
         * 删除明细
         * @return {[type]} [description]
         */
        function detail_toggle(row){
            row.disabled = row.disabled == '1' ? '0' : '1';
            if(row.disabled){
                data_remove_cache[row.id] = true;
            }else{
                delete data_remove_cache[row.id];
            }
        }

        /**
         * 查找明细
         * @return {[type]} [description]
         */
        function detail_search(){
            var obj = detail_params();
            service.search(sl.clean(obj)).then(function(resp){
                var d = resp.list || [];
                sl.format.index(d);
                sl.format.timestamp(d,['produceDate','expiryDate','storageDate']);
                vm.data_detail = d;
                detail_filter(d);
                page.params.pag.model.itemCount = resp.total;
            })         
            
            $timeout.cancel(loadingTimeout);
            page.loading = false;  
        }

        //查询所有id
        function detail_reset_search(){
            page.params.model = {};
            vm.data_detail = [];
        }

        function detail_params(){
            var obj = angular.copy( page.params.model ) ;
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum,
                ownerId : vm.data.ownerId
            });
            delete obj.shopName;
            return obj;
        }



    }]);

})
