/**
 * 上架记录 列表
 * 
 * @date     2017-01-03
 * @author   wuting<reruin@gmail.com>
 */
define(['app'], function(app) {

    return app.controller('InstockShelveRecordListCtrl', ['$scope', 'InstockShelveRecordService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;
            console.log($scope)
        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '上架记录列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "taskCode", "value": "任务单号", "display": true }, 
                    { "key": "instorageBillCode", "value": "入库单号", "display": true },
                    { "key": "warehouseName", "value": "仓库名称", "display": true },
                    { "key": "lpn", "value": "容器编码", "display": true },
                    { "key": "ownerName", "value": "商家名称", "display": true }, 
                    { "key": "shopName", "value": "店铺名称", "display": true },
                    { "key": "goodsName", "value": "商品名称", "display": true },
                    { "key": "goodsCode", "value": "商品编码", "display": true },
                    { "key": "unit", "value": "包装单位", "display": true },
                    { "key": "inventoryStatusName", "value": "商品状态", "display": true },
                    { "key": "lot", "value": "批次编码", "display": true },
                    { "key": "quantity", "value": "上架数量", "display": true },
                    { "key": "suggestLocCode", "value": "推荐库位", "display": true },
                    { "key": "toLocCode", "value": "实上库位", "display": true },
                    { "key": "operator", "value": "操作人", "display": true },
                    { "key": "operatedTime", "value": "操作时间", "display": true },
                    { "key": "endTime", "value": "结束时间", "display": true }
                ]
            },
            
            deps:{
                //bizControl:"OWNER_BIZ_CONTROL"
                'inventoryStatus':'INVENTORY_STATUS'
            },

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    hgCode: ''
                },

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [
                        {
                            title: "基础",
                            group: [
                                {title:'任务单号',model:'taskCode',type:'input'},
                                {title:'容器编码',model:'lpn',type:'input'},
                                {title:'商家名称',model:'ownerName',type:'input'},
                                {title:'商品名称',model:'goodsName',type:'input'},
                                {title:'商品编码',model:'goodsCode',type:'input'},
                                {title:'批号',model:'lot',type:'input'},
                                {title:'操作人',model:'operator',type:'input'}
                            ]
                        },{
                            title: "货位",
                            group :[
                                {title:'推荐上架货位',model:'suggestLocCode',type:'input'},
                                {title:'实际上架货位',model:'toLocCode',type:'input'}
                            ]
                        },
                        {
                            title: "时间",
                            group :[
                                {title:'操作时间',model:['beginTime','endTime'],type:'datetime'}
                            ]
                        }
                    ],

                    //用于快速搜索
                    quick : [
                        {title:'任务单号',model:'taskCode'},
                        {title:'容器编码',model:'lpn'},
                        {title:'商家名称',model:'ownerName'},
                        {title:'商品名称',model:'goodsName'},
                        {title:'商品编码',model:'goodsCode'},
                        {title:'批号',model:'lot'},
                        {title:'推荐上架货位',model:'suggestLocCode'},
                        {title:'实际上架货位',model:'toLocCode'},
                        {title:'操作人',model:'operator'}
                    ]
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
            sl.dep(page.deps).then(function(){
                list();
            })
        }

        /**
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row){
            var id = row.id;
            var toggle_state = row.status == 1 ? 0 : 1;


            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({id:id , status:toggle_state}).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    row.status = toggle_state;
                }
                sl.dep.update('OWNER');
                
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

            //console.log()
            service.list(getParas()).then(function(resp){
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
        

        /**
         * 高级筛选触发的分页
         * @param  {object} data [筛选条件]
         */
        function search(data){
            //将结果置入 查询参数中，会替换 原先已有的参数（例如 快速搜索）
            page.params.model = data;

            //console.log( data);
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
            sl.dep.conv(data , page.deps);

            sl.format.index(data);
            sl.format.timestamp(data,['operatedTime','endTime']);
            //console.log(page.fields.model)
            return data;
        }

    }]);

})
