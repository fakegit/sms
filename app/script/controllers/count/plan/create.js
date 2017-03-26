define(['app'], function(app) {

    return app.controller('CountPlanCreateCtrl', ['$scope', 'CountPlanService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,
            data0={}, 

            data = {}, //页面直接绑定的数据

            raw = null; //缓存原始数据


        var page = {

            loading: true,

            title:  '新增 盘点计划',

            fields : {
                options : [
                        { "key": "myList", "value": "序号", "display": true},
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

                    ],
                 model : []
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
            page    : page, 
            data    : data,
            data0 : data0,
            list : list,
            search : search,
            searchByTable : searchByTable,
            add : add,
            ensure :ensure,
            btn : btn,
            save : save
        })

        init();



        // 商家名称预查询
        vm.own_options = {
            suggest: suggest1,
            key:'id',
            select: function(item) {
                console.log(item)
                vm.data.ownName = item.label
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
                vm.data.goodsId = item.id

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




        // 点击添加按钮
        function add (){
           service.searchList(getIdList()).then(function(resp){
                data.mygetIdList  = resp.returnVal
                data.ids = []
                console.log(data.mygetIdList)
           })

           
            list();
               
         
        }
        function getIdList(){
            var params = angular.copy(vm.data);
            var obj = {
                'ownerId':'',
                'shopId':'',
                'goodsId':'',
                'maxLocationCode':'',
                'minLocationCode':''
            }
            params = sl.pick(params,obj)
            for (var i  in params) {
                if (params[i] == undefined) {
                    delete params[i]
                }
            }
            console.log(params)
            return params;
        }



        // // 点击添加按钮筛选参数
        // function getDate(){
        //     var params = angular.copy( vm.data );
        //     var obj = {
        //         'ownerId':'',
        //         'shopId':'',
        //         'skuCode':'',
        //         'maxLocationCode':'',
        //         'minLocationCode':''
        //     }
        //     params = sl.pick(params,obj)
        //     console.log(params)
        //     return params
        // }

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            sl.dep(page.deps).then(function(deps){
                 page.loading = false;
                // if(!isCreate){
                //     service.get(id).then(function(resp){
                //         page.loading = false;
                //         if(resp.returnCode){
                //             sl.alert(resp.returnMsg);
                //         }
                //         else{
                //             setData(resp.returnVal);
                //         }
                //     });
                // }else{
                //     page.loading = false;
                //     setData(page.fields_def);
                // }
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
            service.search(params).then(function(resp){
                vm.data.countPlanDetailVOs = afterList(resp.list || []);
                page.params.pag.model.itemCount = resp.total;
            })         
            
            $timeout.cancel(loadingTimeout);
            page.loading = false;  
                       
        }

          /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data){
            page.params.model = data;
            list();
        }


         /**
         * 由 table 插件触发的分页
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function searchByTable(tableState){
            var getSorts = function(obj) {
                var ret = [],
                    value, state = ['', 'asc', 'desc'];
                for (var i in obj) {
                    value = obj[i];
                    if (value != 0) {
                        ret.push(i + ' ' + state[obj[i]]);
                    }
                }
                return ret.join(",");
            }
            
            //更新 search_extra
            var pag = tableState.pagination;
            page.params_extra.orders = getSorts(tableState.sort);

            list();
        }

          /**
         * 获取查询参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function getParas() {

            var obj = angular.copy(vm.data) , search_arr = []; 
            console.log(obj)

            var oobj = {
                'ownerId':'',
                'shopId':'',
                'goodsId':'',
                'maxLocationCode':'',
                'minLocationCode':''
            }
           
            obj = sl.pick(obj,oobj)
           
            for (var i  in obj) {
               if (obj[i] == undefined) {
                delete obj[i]
               }
            }
            
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

        // 删除盘点明细按钮

        function ensure(row){
            $(".ensure").css("display","block")
            vm.data0 = row
            console.log(vm.data0.id)
        }
        function btn(str){
            if (str == 'true' ) {
                var myId = vm.data0.id
                var idList = data.ids
                console.log(idList)
                if(idList.indexOf(myId) == -1){
                    data.ids.push(myId)
                }
                for (var i in vm.data.countPlanDetailVOs) {
                    if (vm.data.countPlanDetailVOs[i].id == myId) {
                        vm.data.countPlanDetailVOs.splice(i ,1)
                    }
                }
            }
            console.log(data.ids)
            $(".ensure").css("display","none")
        }




        //点击保存按钮
        function save(){
            var myData = angular.copy(vm.data );
            console.log(myData)
            delete myData.ownName;
            delete myData.shopName;
            delete myData.skuName;
            delete myData.countPlanDetailVOs;
            delete myData.mygetIdList;
            myData.planDetailQueryParams = {};
            // 将data上绑定的查询数据复制在planDetailQueryParams上
            if (myData.ownerId) {
                myData.planDetailQueryParams.ownerId = myData.ownerId;
            }
            if (myData.shopId) {
                myData.planDetailQueryParams.shopId = myData.shopId;
            }
            if (myData.goodsId) {
                myData.planDetailQueryParams.goodsId = myData.goodsId;
            }
            if (myData.minLocationCode) {
                myData.planDetailQueryParams.minLocationCode = myData.minLocationCode;
                delete myData.minLocationCode;
            }
            if (myData.maxLocationCode) {
                myData.planDetailQueryParams.maxLocationCode = myData.maxLocationCode;
                delete myData.maxLocationCode;
            }
            myData.planDetailQueryParams.ids = myData.ids
            delete myData.ids;
            console.log(myData)
            service.create(myData).then(function(resp){
                 if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                }
            })
        }





         /**
         * 处理并绑定数据
         */
        function setData(d){
            vm.data = sl.pick( d , page.fields.base);
            // if(!isCreate){
            //     sl.format.index(vm.data.countPlanDetailVOs,'@');
            // }
        }


        function afterList(d){
            sl.pushIndex(d,'myList');
            // sl.format.timestamp(d,['produceDate']);
            sl.timestamp(d,['produceDate','expiryDate','storageDate']);

            console.log(d)
            return d;

        }

    }]);

})
