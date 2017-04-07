define(['app'], function(app) {

    return app.controller('vps.list', ['$scope', 'SVPS', 'sl', '$timeout','print', function($scope, service, sl,  $timeout,printer) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : 'VPS列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "provider", "value": "供应商", "display": true }, 
                    { "key": "remark", "value": "描述", "display": true },
                ],

                model : []
            },
           

            //搜索字段
            params:{

                //必选字段请在此列出
                required : {
                    
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
                        {title:'登录名',model:'user_login'},
                        {title:'昵称',model:'user_nicename'}
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
            toggle  : toggle
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
        function list(tableState){
            $timeout.cancel(loadingTimeout);

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

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.list(getParas(tableState)).then(function(resp){

                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.status){
                    sl.alert(resp.message);
                }else{
                    vm.data = afterList(resp.result.data);
                    //更新分页数据
                    page.params.pag.model.itemCount = resp.result.page_count;
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
        function getParas(extra) {
            var obj = angular.copy( page.params.model ) , search_arr = [];

            var getSorts = function(obj) {
                var ret = {},
                    value, state = ['', 'asc', 'desc'];
                for (var i in obj) {
                    value = obj[i];
                    ret[i] = state[obj[i]];
                }
                return ret;
            }

            sl.extend( obj , page.params.options.required );
            sl.extend( obj , {
                page_size: page.params.pag.model.pageSize,
                page_num : page.params.pag.model.pageNum
            });

            if(extra){
                if(extra.sort){
                    obj.order = getSorts(extra.sort);
                }
            }

            return sl.dig(obj , true);
        }

        /**
         * 格式化返回的结果集
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */
        function afterList(data) {
            sl.format.index(data , '@');
            return data;
        }

    }]);
})
