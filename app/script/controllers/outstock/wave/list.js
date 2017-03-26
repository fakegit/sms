define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockWaveListCtrl', ['$scope', 'OutstockWavelService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title:'波次管理',

            loading: true,

            //表头显示字段源
            fields : {
                
                options : [   

                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "code", "value": "波次单号",  "display": true },
                    { "key": "warehouseName", "value": "仓库名称", "display": true },       
                    { "key": "ownName", "value": "商家名称", "display": true },                    
                    { "key": "shopName", "value": "店铺名称", "display": true },                    
                    { "key": "logisticsName", "value": "承运商", "display": true },            
                    { "key": "orderCount", "value": "订单数量", "display": true },     
                    { "key": "goodsCount", "value": "商品数量", "display": true },     
                    { "key": "pickedQuantity", "value": "已拣数量", "display": true },                         
                    { "key": "ruleName", "value": "波次规则", "display": true },     
                    { "key": "pickTypeName", "value": "拣货方式", "display": true },                        
                    { "key": "waveStatusName", "value": "状态", "display": true,
                            "link":"status","group":[
                                            {"id":"0","label":"已创建"},
                                            {"id":"1","label":"拣货中"},
                                            {"id":"2","label":"已关闭"}                                            
                            ]

                     }, 
                    { "key": "createBy", "value": "创建人", "display": true },                     
                    { "key": "createdTime", "value": "创建时间", "display": true },                         
                    { "key": "businessTypeName", "value": "业务类型", "display": true },                    
                    { "key": "billTypeName", "value": "单据类型", "display": true },                        
                    { "key": "wavePrintedStatusName", "value": "波次单打印", "display": true },            
                    { "key": "waybillPrintedStatusName", "value": "快递单打印", "display": true },         
                    { "key": "packPrintedStatusName", "value": "随箱单打印", "display": true },         
                    { "key": "invoicePrintedStatusName", "value": "发票打印", "display": true }

                ],

                model : []
            },
           

            // 页面下拉数据依赖
            deps: {

                //拣货方式
                "pickType":"PICK_TYPE",
                // 业务类型
                'businessType':'OUT_BUSINESS_TYPE',
                //单据类型
                "billType":"OUT_BILL_TYPE"

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
                    base : [{
                        title: "波次管理",
                        group: [
                            // {title:'波次单号',model:'code',type:'input',value:'0001'},
                            {title:'波次单号',model:'code',type:'input'},
                            {title:'仓库名称',model:'warehouseName',type:'input'},
                            {title:'商家名称',model:'ownName',type:'input'},
                            {title:'创建时间',model:['startTime','endTime'],type:'datetime'},
                            {title:'店铺名称',model:'shopName',type:'input'},
                            {title:'承运商',model:'logisticsName',type:'input'},
                            {title:'创建人',model:'createBy',type:'input'},

                            {title:'拣货方式',model:'pickType',type:'select',
                                    values:[{id:'1',label:'边拣边分'},{id:'2',label:'二次分拣'}]
                            },
                            {title:'业务类型',model:'businessType',type:'select',
                                    values:[{id:'1',label:'B2C'},{id:'2',label:'B2B'}]
                            },
                            {title:'单据类型',model:'billType',type:'select',
                                    values:[{id:'1',label:'出库单'}]
                            },

                            {title:'订单数量',model:['minOrderCount','maxOrderCount'],type:'range'},

                            {title:'最小商品数量',model:'minPlanQuantity',type:'input'},
                            {title:'最大商品数量',model:'maxPlanQuantity',type:'input'},

                            {title:'最小已拣数量',model:'minPickedQuantity',type:'input'},
                            {title:'最大已拣数量',model:'maxPickedQuantity',type:'input'},


                            {title:'波次单打印',model:'wavePrintedTimes',type:'select',
                                     values:[{id:'',label:'全部'},{id:'0',label:'未打印'},{id:'1',label:'已打印'}]   
                            },
                            {title:'快递单打印',model:'waybillPrintedTimes',type:'select',
                                     values:[{id:'',label:'全部'},{id:'0',label:'未打印'},{id:'1',label:'已打印'}]  
                            },
                            {title:'随箱单打印',model:'packPrintedTimes',type:'select',
                                     values:[{id:'',label:'全部'},{id:'0',label:'未打印'},{id:'1',label:'已打印'}]
                            },
                            {title:'发票打印',model:'invoicePrintedTimes',type:'select',
                                     values:[{id:'',label:'全部'},{id:'0',label:'未打印'},{id:'1',label:'已打印'}]
                            },
                            {title:'订单标签',model:'orderNoPrintedTimes',type:'select',
                                     values:[{id:'',label:'全部'},{id:'0',label:'未打印'},{id:'1',label:'已打印'}]  
                            }

                
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'波次单号',model:'code'},
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownName'},
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
            list    : list,
            toggle  : toggle,
            reset   : reset,
            puton : puton ,
            search  : search,
            del : del,
            searchByTable:searchByTable
        })

        init();


        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            // 获取页面依赖条件
            sl.dep(page.deps).then(function(deps){
                var mypickTypeValue = [];
                var mybusinessTypeValue = [];
                var mybillTypeValue = [];

                for (var i = 0; i < page.deps.pickType.length; i++) {
                    
                    var myobj = {};
                        myobj.id = page.deps.pickType[i].id;
                        myobj.label = page.deps.pickType[i].label
                    mypickTypeValue.push(myobj); 

                }
                page.params.options.base[0].group[7].values = mypickTypeValue;
               
                for (var i = 0; i < page.deps.businessType.length; i++) {
                    
                    var myobj = {};
                        myobj.id = page.deps.businessType[i].id;
                        myobj.label = page.deps.businessType[i].label
                    mybusinessTypeValue.push(myobj); 

                }
                page.params.options.base[0].group[8].values = mybusinessTypeValue;

                for (var i = 0; i < page.deps.billType.length; i++) {
                    
                    var myobj = {};
                        myobj.id = page.deps.billType[i].id;
                        myobj.label = page.deps.billType[i].label
                    mybillTypeValue.push(myobj); 

                }
                page.params.options.base[0].group[9].values = mybillTypeValue;
            })

            
            list();

        }


        // 勾选波次列并点击上方一键复核按钮
        function puton(items){
            console.log(items)
            var wave = {};
            wave.waveIdList = items;
            if(items.length){
                page.loading = true;
                service.check(wave).then(function(resp) {
                    if(!resp.returnCode){
                        sl.notify('操作完成');
                        list();
                    }else{
                        sl.alert(resp.returnMsg);
                    }
                    page.loading = false;
                }, function(resp) {
                    sl.log.error(resp);
                    page.loading = false;
                })
            }else{
                sl.alert('请选择要复核的波次');
            }
            
        }
       

        /**
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row){
            var id = row.id;
            var toggle_status = row.status == 1 ? 0 : 1;


            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({id:id , status:toggle_status}).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    row.status = toggle_status;
                }
                $timeout.cancel(loadingTimeout);
                page.loading = false;
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

        
                service.list(params).then(function(resp){
                    $timeout.cancel(loadingTimeout);
                    page.loading = false;

                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }else{
                        vm.data = afterList(resp.list || []);
                        //更新分页数据
                        page.params.pag.model.itemCount = resp.total;
                    }
                });
                             
        }
        
        // 波次管理列表删除按钮
        function del(id){
            console.log(id.id)
            service.del(id.id).then(function(resp){
                if (resp.returnCode) {
                    sl.alert(resp.returnMsg)
                }else{
                    init();
                    sl.notify("删除成功")
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
            var obj = angular.copy( page.params.model ) , search_arr = [];
            
            sl.extend( obj , page.params.options.required );
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

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            sl.pushIndex(data,'@');

           for (var i = 0; i < data.length; i++) {
               data[i].createdTime = sl.format_time(data[i].createdTime)
           }
            return data;
        }

    }]);

})
