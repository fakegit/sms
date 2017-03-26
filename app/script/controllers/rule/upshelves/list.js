/**
 * 上架规则管理
 */
define(['app'], function(app) {

    return app.controller('RuleUpshelvesListCtrl', ['$scope', 'RuleUpshelvesService', 'sl', '$timeout', function($scope, service, sl,  $timeout) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {

            title : '上架规则管理',

            loading: true,

            //表头显示字段
            fields : {
                
                options : [

                    { "key": "@", "value": "序号", "display": true, 'sort': 1 }, 
                    { "key": "ruleCode", "value": "规则编码", "sort": 1, "display": true },
                    { "key": "ruleName", "value": "规则名称", "display": true }, 
                    { "key": "ownerName", "value": "所属商家", "display": true }, 
                    { "key": "warehouseName", "value": "所属仓库", "display": true }, 
                    { "key": "remark", "value": "描述", "display": true },              
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

                model: {},

                // 初始化筛选字段，
                options : {
                    // 用于 sl-search 插件
                    base : [{
                        title: "产品",
                        group: [
                            {title:'规则名称',model:'ruleName',type:'input',value:'0001'},
                            {title:'规则编码',model:'ruleCode',type:'input'},
                            {title:'所属商家',model:'ownerName',type:'input'},
                            {title:'所属仓库',model:'warehouseName',type:'input'},

                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'规则名称',model:'ruleName'},
                        {title:'规则编码',model:'ruleCode'},
                        {title:'所属商家',model:'ownerName'},
                        {title:'所属仓库',model:'warehouseName'},
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
         * 启用/禁用
         * @return {[type]} [description]
         */
        function toggle(row){
            var id = row.id;
            var toggle_status = row.status == 1 ? 0 : 1;


            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.toggle({ruleId:id , status:toggle_status}).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    row.status = toggle_status;
                }

                sl.dep.update(['ZONE_PUT','ZONE_PICK']);

                $timeout.cancel(loadingTimeout);
                page.loading = false;
            })
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
            // 序号列;
            sl.pushIndex(data , '@');
            
            for (var i in data) {
                // console.log(data[i].baseWar ehouse)
               /* data[i].ownerName = data[i].baseOwner;
                data[i].warehouseName = data[i].baseWarehouse;*/
            }
          
            return data;
        }

    }]);

})
