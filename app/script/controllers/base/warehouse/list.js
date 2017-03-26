define(['app', 'moment'], function(app, moment) {

    return app.controller('BaseWarehouseListCtrl', ['$scope', 'BaseWarehouseService', 'sl', '$timeout','print', function($scope, service, sl,  $timeout,printer) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '仓库列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "warehouseName", "value": "仓库名称", "display": true }, 
                    { "key": "warehouseCode", "value": "仓库编码", "sort": 1, "display": true },
                    { "key": "warehouseTypeName", "value": "仓库类型", "display": true }, 
                    { "key": "warehouseCompany", "value": "所属公司", "display": true }, 
                    { "key": "warehouseCompany", "value": "所属承运商", "display": false }, 
                    { "key": "cContact", "value": "联系人", "display": true },
                    
                    { "key": "cMobile", "value": "联系电话", "display": true }, 
                    { 
                        "key": "status", "value": "状态", "display": true,
                        "link":"status","group":[
                            {"id":"-1" , "label":"全部"},
                            {"id":"1" , "label":"启用"},
                            {"id":"0" , "label":"禁用"}
                        ] 
                    }
                ],

                model : []
            },
           

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    hgCode: ''
                },

                // 搜索字段
                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [{
                        title: "产品",
                        group: [
                            {title:'货号',model:'product_id',type:'input',value:'0001'},
                            {title:'商品名',model:'name',type:'input'},
                            {title:'商品条码',model:'barCode',type:'input'}

                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'仓库编码',model:'warehouseCode'},
                        {title:'仓库类型',model:'warehouseType'}
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
            reset   : reset,
            search  : search,
            toggle  : toggle,
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
                sl.dep.update('WAREHOUSE');
                $timeout.cancel(loadingTimeout);
                page.loading = false;
            })
        }

        /**
         * 分页查询
         */
        function list(){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.list(getParas()).then(function(resp){

                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    vm.data = afterList(resp.list);
                    //更新分页数据
                    page.params.pag.model.itemCount = resp.total;
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
            
            sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                pageSize: page.params.pag.model.pageSize,
                pageNum : page.params.pag.model.pageNum
            });

                
            for (var i in obj) {
                if (obj[i] !== '') search_arr.push(i + '=' + obj[i]);
            }

            return obj;//search_arr.join('&');
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            sl.pushIndex(data , '@');
            return data;
        }

    }]);

})
