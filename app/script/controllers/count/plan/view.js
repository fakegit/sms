define(['app'], function(app) {

    return app.controller('CountPlanViewCtrl', ['$scope', 'CountPlanService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;

            view = true;
            console.log(id)

        var page = {

            loading: true,

            title:  '查看 盘点计划',


            fields : {
                detail : {
                    options : [
                        { "key": "myList", "value": "序号", "display": true},
                        { "key": "planCode", "value": "盘点计划号", "display": true },
                        { "key": "locationCode", "value": "库位编码","display": true },
                        { "key": "ownName", "value": "商家名称","display": true },
                        { "key": "shopName", "value": "店铺名称", "display": true },
                        { "key": "skuCode", "value": "商品编码", "display": true },
                        { "key": "skuName", "value": "商品名称", "display": true },
                        { "key": "lot", "value": "系统批号", "display": true },
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
                base : {
                    'ownerName':'',
                    'warehouseId':'',
                    'type':'',
                    'remark':'',
                    'ownerName':'',
                    'shopName':'',
                    'countPlanDetailVOs':''
                }
            },

              //搜索字段
            params:{

                //必选字段请在此列出
                // required : {
                //     // hgCode: ''
                // },

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件;用于高级筛选；
                    base : [],

                    //用于快速搜索
                    quick : []
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

            fields_def : {
               
            },

            deps:{
                warehouseId:'WAREHOUSE',
                type:'COUNT_ADJUST_BILL_TYPE'
            }

        };


        sl.extend(vm , {
            page  : page, 
            data  : data,
            list : list
         
        })

        init();




         // 商家名称预查询
        vm.own_options = {
            suggest: suggest1,
            key:'id',
            select: function(item) {
                console.log(item)
                vm.data.ownerName = item.label
                vm.data.ownerId = item.id

            },
            verify:function(r){
                console.log(r)
            }
        }

        function suggest1(key){
            var obj = { 
                name: key
            }
            return service.queryOwnName(obj).then(function(resp) {
                return formatSuggest1(resp.list);
            })
        }

        function formatSuggest1(data) {
            console.log(data)
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].id, label: data[i].name , raw: data[i] })
            }
            return obj;
        }


        // 店铺名称预查询
        vm.shop_options = {
            suggest: suggest2,
            key:'id',
            select: function(item) {
                console.log(item)
                vm.data.shopName = item.label
                vm.data.shopId = item.id
            },
            verify:function(r){
                console.log(r)
            }
        }

        function suggest2(key){
            var obj = { 
                ownerId:vm.data.ownerId,
                name: key
            }
            return service.queryShopName(obj).then(function(resp) {
                return formatSuggest2(resp.list);
            })
        }

        function formatSuggest2(data) {
            console.log(data)
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].id, label: data[i].name, raw: data[i] })
            }
            return obj;
        }


         // 商品名称预查询
        vm.good_options = {
            suggest: suggest3,
            key:'id',
            select: function(item) {
                console.log(item)
                vm.data.skuName = item.label
                vm.data.goodId = item.id

            },
            verify:function(r){
                console.log(r)
            }
        }

        function suggest3(key){
            var obj = { 
                skuName: key
            }
            return service.queryGoodName(obj).then(function(resp) {
                return formatSuggest3(resp.list);
            })
        }

        function formatSuggest3(data) {
            console.log(data)
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].id, label: data[i].skuName , raw: data[i] })
            }
            return obj;
        }



  
        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            // sl.dep(page.deps).then(function(deps){
            //     list();
            // })

            

            sl.dep(page.deps).then(function(deps){
                    service.get(getParas()).then(function(resp){
                        page.loading = false;
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{
                            setData(resp.returnVal);
                            // list()
                        }
                    });
              
            })
        }

     

        /**
         * 分页查询
         */
        function list(){

            var params = getParas();
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;

            }, loadingLatency);
           
               
                service.get(params).then(function(resp){
                    vm.data.planDetailVOPageVO.list = afterList(resp.returnVal.planDetailVOPageVO.list || []);
                    page.params.pag.model.itemCount = resp.returnVal.planDetailVOPageVO.total;
                }) 

            
            
            $timeout.cancel(loadingTimeout);
            page.loading = false;  
                       
        }


     

          /**
         * 获取查询参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function getParas() {

            // var obj = angular.copy(vm.data) , search_arr = []; 
            // console.log(obj)

            // var oobj = {

            //     'ownerId':'',
            //     'shopId':'',
            //     'goodId':'',
            //     'maxLocationCode':'',
            //     'minLocationCode':''
            // }
           
            // obj = sl.pick(obj,oobj)
           
            // for (var i  in obj) {
            //    if (obj[i] == undefined) {
            //     delete obj[i]
            //    }
            // }
            
            var obj = {'id':id}
            sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum
            });
           
            console.log(obj)

            return obj;
                
            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return search_arr.join('&');
        }


         /**
         * 处理并绑定数据
         */
        function setData(d){
                vm.data = d;
                console.log(vm.data)
            // vm.data = sl.pick( d , page.fields.base);
            if (vm.data.planDetailVOPageVO.list) {
                sl.pushIndex(vm.data.planDetailVOPageVO.list,'myList');
                page.params.pag.model.itemCount = vm.data.planDetailVOPageVO.total;
            }  
        }


         function afterList(d){
            sl.pushIndex(d,'myList');
            // sl.format.timestamp(d,['produceDate']);
            sl.timestamp(d,['produceDate','expiryDate','storageDate']);

            return d;

        }

    }]);

})
