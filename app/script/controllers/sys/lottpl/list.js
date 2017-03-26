define(['app', 'moment'], function(app, moment) {

    return app.controller('SysLottplListCtrl', ['$scope', 'SysLottplService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title:'批次模板管理',

            loading: true,

            //表头显示字段
            fields : {
                options : [             
                    { "key": "@", "value": "序号", "display": true },
                    { "key": "name", "value": "模板名称", "sort": 1, "display": true },
                    { "key": "createdBy", "value": "创建人", "display": true }, 
                    { "key": "createdTime", "value": "创建时间", "display": true }     
                ],

                model : []
            },
           

            //搜索字段
            params:{

                //必选字段请在此列出
/*                required : {
                    hgCode: ''
                },*/

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                   /* base : [{
                        title: "产品",
                        group: [
                            {title:'货号',model:'product_id',type:'input',value:'0001'},
                            {title:'商品名',model:'name',type:'input'},
                            {title:'商品条码',model:'barCode',type:'input'},

                        ]
                    }],*/

                    //用于快速搜索
                    // quick : [
                    //     {title:'库位编码',model:'code'},
                    //     {title:'仓库名称',model:'warehouseName'},
                    //     {title:'上架区名称',model:'putawayZoneName'},
                    //     {title:'拣货区名称',model:'pickZoneName'}

                    // ]
                }
                ,
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
            console.log(params)
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            //console.log()
            service.list(params).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    vm.data = afterList(resp.returnVal.list);
                    //更新分页数据
                    page.params.pag.model.itemCount = resp.returnVal.total;
                }

            });
        }
        

        /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data){
            page.params.base = data;
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
            console.log(data)
            return data;
        }

    }]);

})
