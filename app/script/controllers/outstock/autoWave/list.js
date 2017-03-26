define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockautoWaveListCtrl', ['$scope', 'OutstockautoWavelService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title:'自动创建波次查看',

            loading: true,

            //表头显示字段源
            fields : {
                
                options : [   

                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "warehouseName", "value": "仓库名称",  "display": true },
                    { "key": "ownName", "value": "商家名称", "display": true },
                    { "key": "shopName", "value": "店铺名称", "display": true },       
                    { "key": "logisticsName", "value": "快递公司", "display": true },                    
                    { "key": "orderCount", "value": "订单数量", "display": true },                    
                    { "key": "beginExecuteTimeStr", "value": "开始时间", "display": true },            
                    { "key": "endExecuteTimeStr", "value": "结束时间", "display": true },     
                    { "key": "runTimes", "value": "已运行次数", "display": true },     
                    { "key": "intervalTime", "value": "间隔时间(分钟)", "display": true },                         
                    { "key": "lastRunTimeStr", "value": "上次运行时间", "display": true },     
                    { "key": "ruleName", "value": "波次规则", "display": true }, 
                    { "key": "pickTypeName", "value": "拣货方式", "display": true }, 
                    { "key": "createdBy", "value": "创建人", "display": true },
                    { "key": "createdTime", "value": "创建时间", "display": true }, 
                                          
                    { "key": "status", "value": "状态", "display": true,
                            "link":"status","group":[
                                            {"id":"0","label":"开启"},
                                            {"id":"1","label":"停止"}                                                                                
                            ]

                     }
                   

                ],

                model : []
            },
           

            // 页面下拉数据依赖
            deps: {   },


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
                        title: "自动创建查询",
                        group: [
                            // {title:'波次单号',model:'code',type:'input',value:'0001'},
                            {title:'仓库名称',model:'warehouseName',type:'input'},
                            {title:'商家名称',model:'ownerName',type:'input'},
                            {title:'店铺名称',model:'shopName',type:'input'},
                            {title:'快递公司',model:'logisticsName',type:'input'},
                            {title:'最小订单数量',model:'minOrderCount',type:'input'},
                            {title:'最大订单数量',model:'maxOrderCount',type:'input'},
                            {title:'波次规则',model:'ruleName',type:'input'},
                            {title:'拣货方式',model:'pickTypeName',type:'input'},
                            {title:'创建人',model:'createBy',type:'input'},
                            {title:'创建时间',model:['startTime','endTime'],type:'datetime'}
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'店铺名称',model:'shopName'},
                        {title:'快递公司',model:'logisticsName'},
                        {title:'波次规则',model:'ruleName'},
                        {title:'拣货方式',model:'pickTypeName'},
                        {title:'创建人',model:'createBy'}

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
            list();

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
            console.log(toggle_status)
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
           for (var i = 0; i < data.length; i++) {
               data[i].lastRunTime = sl.format_time(data[i].lastRunTime)
           }
            return data;
        }

    }]);

})
