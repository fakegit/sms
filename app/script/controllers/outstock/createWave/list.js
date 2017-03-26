define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockCreateWaveListCtrl', ['$scope', 'OutstockcreateWavelService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data0={}, ruleList=[],  data = {};

        var page = {

            title:'波次创建',

            loading: true,

            fields0 : {
                options : [

                            {"hasInvoice":[{"id":"","label":"不限"},{"id":"0","label":"没有"},{"id":"1","label":"有"}]},
                            {"sellerRemarkFlag":[{"id":"","label":"不限"},{"id":"1","label":"等于"},{"id":"2","label":"包含"},{"id":"3","label":"不等于"}]},
                            {"buyerRemarkFlag":[{"id":"","label":"不限"},{"id":"1","label":"等于"},{"id":"2","label":"包含"},{"id":"3","label":"不等于"}]}
                        ]

            },

            //表头显示字段源
            fields : {
                      
                options : [ 
                                { "key": "@", "value": "序号", "display": true}, 
                                { "key": "customerNo", "value": "客户单号", "display": true}, 
                                { "key": "orderNo", "value": "出库单号", "display": true}, 
                                { "key": "billTypeName", "value": "单据类型", "display": true}, 
                                { "key": "orderTime", "value": "接单时间", "display": true}, 
                                { "key": "warehouseName", "value": "仓库名称", "display": true}, 
                                { "key": "customerName", "value": "商家名称", "display": true}, 
                                { "key": "shopName", "value": "店铺名称", "display": true}, 
                                { "key": "logisticsName", "value": "承运商", "display": true}, 
                                { "key": "waybillTypeName", "value": "运单类型", "display": true}, 
                                { "key": "waybillNo", "value": "快递单号", "display": true}, 
                                { "key": "quantity", "value": "商品数量", "display": true}, 
                                { "key": "skuQuantity", "value": "SKU数量", "display": true}, 
                                { "key": "invoiceDesc", "value": "发票", "display": true}, 
                                { "key": "sellerRemark", "value": "卖家备注", "display": true}, 
                                { "key": "buyerRemark", "value": "买家备注", "display": true}
                        ],

                model : []
            },
           

            // 页面下拉数据依赖
            deps: {

                //仓库
                'warehouseId':"WAREHOUSE",
                // 业务类型
                'businessType':'OUT_BUSINESS_TYPE',
                //运单类型
                "waybillType":"WAYBILL_TYPE",
                //拣货方式
                "pickType":"PICK_TYPE",
                //单据类型
                "billType":"OUT_BILL_TYPE",
                //商家
                "ownerId":"OWNER",
                //店铺
                "shopId":"SHOP",
                //承运商
                "logisticsId":"LOGISTICS",
                //区域
                "area":"AREA"

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
                    quick : [
                        {title:'波次单号',model:'code'},
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'承运商',model:'logisticsName'},
                        {title:'创建人',model:'createBy'},
                        {title:'业务类型',model:'businessTypeName'},
                        {title:'单据类型',model:'billTypeName'}

                    ]
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

            }
        };


        sl.extend(vm , {
            page    : page , 
            data    : data,
            data0 : data0,
            list    : list,
            reset   : reset,
            search  : search,
            ruleList : ruleList,
            waveSearch : waveSearch,
            waveCreate : waveCreate,
            searchByTable:searchByTable
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(deps){

                $timeout.cancel(loadingTimeout);
                page.loading = false;
            })


        }

        // 预查询
        vm.sku_options = {
            suggest: suggest,
            key:'id',
            select: function(item) {
                console.log('select' , item)
                vm.data0.skuCode = item.label;
                vm.data0.skulabel = item.id
            },
            verify:function(r){
                console.log(r)
            }
        }

        function suggest(key){
            var obj = {
                ownerId: vm.data0.ownerId , 
                skuCode: key
            }
            if (obj.ownerId == undefined) {
                obj.ownerId = ''
               
            }
            return service.queryBySkuCode(obj).then(function(resp) {
                return formatSuggest(resp.returnVal);
            })
        }

        function formatSuggest(data) {
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].skuCode, label: data[i].skuName , raw: data[i] })
            }
            return obj;
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

            waveSearch(params);
            $timeout.cancel(loadingTimeout);
            page.loading = false;  
                       
        }
        
        // 波次搜索按钮
        function waveSearch(){
            var params = getParas();

            // 使warehouseName的值是data0.warehouseId在page.deps.warehouseId依赖条件下的对应的关系
            // var rule = {
            //     'warehouseName': sl.dep.conv(data0.warehouseId , page.deps.warehouseId , 'id' , 'label'),
            // }
             if (!params.province) {
                delete params.country
             }  
            service.search(params).then(function(resp){
                console.log(11)
                console.log(resp)
                vm.data = afterList(resp.list || [])
                page.params.pag.model.itemCount = resp.total;
            })

            //波次规则下拉   暂时做不传参数处理
            var obj = {};
                obj.warehouseId = params.warehouseId;
            service.ruleList(obj).then(function(resp){
                vm.ruleList = resp.list
            })

        }


        //创建波次按钮
        function waveCreate() {
            
            var params = angular.copy(vm.data0);
            params.orderQty = parseInt(params.orderQty);
            // 波次规则为空时ruleId的值为空
            if (!params.ruleId) {
               params.ruleId = 0
            }
            if (params.beginOrderTime) {
                params.beginOrderTime = new Date(params.beginOrderTime)
            }
            if (params.endOrderTime) {
                params.endOrderTime = new Date(params.endOrderTime)
            }
            service.create(params).then(function(resp){
                if (!resp.returnCode) {
                    sl.notify("创建波次成功")
                }else {
                    sl.alert(resp.returnMsg)
                }
                
            })
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
         * 重置搜索
         * @return {[type]} [description]
         */
        function reset() {

        }


        /**
         * 获取查询参数
         * @param  {[type]} tableState [description]
         * @return {[type]}            [description]
         */
        function getParas() {

            var obj = angular.copy(vm.data0 ) , search_arr = []; 
            sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum
            });
            if (obj.skuCode) {
                obj.skuCode = vm.data0.skulabel
            }
         
            // 删除对象中的某个属性值
            delete obj.cDistrict;
            delete obj.skulabel;
            obj.country = "中国";
            obj = sl.dig(obj)
            if (obj.sellerRemark == '') {
                delete obj.sellerRemark;
            }
           if (obj.buyerRemark == '') {
                delete obj.buyerRemark;
           }
            return obj;
                
            // for (var i in obj) {
            //     if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            // }

            // return search_arr.join('&');
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            sl.pushIndex(data,'@');

           for (var i = 0; i < data.length; i++) {
               data[i].orderTime = sl.format_time(data[i].orderTime)
           }
            return data;
        }

    }]);

})
