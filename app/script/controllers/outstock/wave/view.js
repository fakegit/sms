define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockWaveViewCtrl', ['$scope', 'OutstockWavelService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data1 = {}, //页面直接绑定的数据（非tabel部分）

            data = [], //页面直接绑定的数据（tabel部分）

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

            console.log(data+"--"+raw+"--"+$stateParams.id+"--"+isCreate+"--"+isEdit+"--"+isView)

        var page = {
   
            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '修改' : isView ? '查看' : '新增') + '波次明细',

           
            // 查看波次明细页Table字段 
            fields : {  

                 options:[
                            { "key": "@", "value": "序号", "sort": 1, "display": true },
                            { "key": "customerNo", "value": "客户单号",  "display": true },
                            { "key": "relatedNo1", "value": "相关单号",  "display": true },
                            { "key": "billType", "value": "单据类型",  "display": true },
                            { "key": "orderTime", "value": "接单时间",  "display": true },
                            { "key": "warehouseName", "value": "仓库名称",  "display": true },
                            { "key": "customerName", "value": "商家名称",  "display": true },
                            { "key": "shopName", "value": "店铺名称",  "display": true },
                            { "key": "logisticsName", "value": "承运商",  "display": true },
                            { "key": "waybillTypeName", "value": "运单类型",  "display": true },
                            { "key": "waybillNo", "value": "快递单号",  "display": true },
                            { "key": "quantity", "value": "商品数量",  "display": true },
                            { "key": "skuQuantity", "value": "SKU数量",  "display": true },
                            { "key": "hasInvoiceName", "value": "发票",  "display": true },
                            { "key": "sellerRemark", "value": "卖家备注",  "display": true },
                            { "key": "buyerRemark", "value": "买家备注",  "display": true }
                        ]

                    },

             // 查看波次明细页非Table字段
            fields1 : {"code":"","businessTypeName":"","ruleName":"","pickTypeName":"","waveStatusName":"","wavePrintedTimes":"",
                        "wavePrintedTime":"","wavePrintedName":"","waybillPrintedTimes":"","waybillPrintedTime":"","waybillPrintedName":"",
                        "packPrintedTimes":"","packPrintedTime":"","packPrintedName":"","invoicePrintedTimes":"","invoicePrintedTime":"","invoicePrintedName":""
                    },

            fields_def : { },

            deps:{ },

            //搜索字段
            params:{ 


                model: {},
                
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
            page    : page, 
            data    : data,
            data1   : data1,
            save    : save,
            search : search,
            reset   : reset,
            list : list,
            searchByTable:searchByTable
         
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() { 
            // 页面数据请求获取（非tabel部分）
                        service.get(id).then(function(resp){
                            page.loading = false;
                            if(resp.returnCode){
                                sl.alert(resp.returnMsg);
                            }
                            else{    
                                setData(resp.returnVal);
                                getTabel()
                            }
                        });  

            // 页面数据请求获取（tabel部分）
                    //  service.get1(id).then(function(resp){
                    //     getTabel()
                    //     page.loading = false;
                    //     if(resp.returnCode){
                    //         sl.alert(resp.returnMsg);
                    //     }
                    //     else{          
                    //         vm.data1 = afterList(resp.list) 
                    //         page.params.pag.model.itemCount = resp.total;                           
                    //     }
                    // })
                // setTimeout(function(){
                //    getTabel() 
                // },1000)    
                
        }

         function list(){
            getTabel();              
        }            

              
        
        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){
            // init();
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            service.update(getData(), isEdit).then(function(resp){
                console.log(getData())
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
            console.log(11)
            getTabel();
        }



        /**
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {
            setData(raw);
        }

        //分页查询；
        function getTabel(){
            var params = getParas();
            console.log(params)
            params.waveCode = vm.data1.code;
            console.log(params)
             service.get1(params).then(function(resp){
                page.loading = false;
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    vm.data = afterList(resp.list || []) 
                    page.params.pag.model.itemCount = resp.total;                           
                }
            })
        }

        //获取查询参数；
         function getParas() {
            var obj = angular.copy( page.params.model ) , search_arr = [];
            
            // sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum
            });

            return obj;
                
            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return search_arr.join('&');
        }



        //高级筛选触发分页；
        function search(data){
            page.params.model = data;
            getTabel();
        }
       

         /**
         * 处理并绑定数据
         */
        function setData(d){

            vm.data1 = sl.pick( d , page.fields1); 
           
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            var attrArr=[],
                attrList = params.attr;
           for (var i = 0; i < attrList.length; i++) {
               if(attrList[i].name){
                attrArr.push(attrList[i])
               }
           }
            var obj = {
                name:"",
                dataType:"",
                control:"" ,
                no:"" 
            }
            // params.attr=sl.pick(vm.data.attr, obj)
             params.attr=sl.pick(attrArr, obj)
            console.log(params.attr)
            if(isEdit){
                params.id = parseInt(id);
                console.log(typeof params.id)
            }

            return sl.dig(params);
        }

        function afterList(data) {
            sl.pushIndex(data,'@');
            sl.format.timestamp(data , ['orderTime']);


            return data;
        }



    }]);

})
