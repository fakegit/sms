/**
 * Created by hubo on 2017/1/17.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('CheckReversalListCtrl', ['$scope', 'CheckReversalService', 'sl', '$timeout','ModalService', function($scope, service, sl,  $timeout,ModalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '盘点冲正',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "code", "value": "冲正单号", "display": true},
                    { "key": "planCode", "value": "盘点计划号", "display": true },
                    { "key": "warehouseName", "value": "仓库名称","display": true },
                    { "key": "ownerName", "value": "商家名称","display": true },
                    { "key": "type", "value": "调整类型","display": true },
                    { "key": "createdBy", "value": "创建人", "display": true },
                    { "key": "createdTime", "value": "创建时间", "display": true },
                    { "key": "auditor", "value": "审核人", "display": true },
                    { "key": "auditTime", "value": "审核时间", "display": true },
                    { "key": "status", "value": "状态", "display": true }
                ],

                model : []
            },

            deps:{
                bizControl:"OWNER_BIZ_CONTROL"
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
                        title: "高级筛选",
                        group: [
                            {title:'冲正单号',model:'code',type:'input'},
                            {title:'盘点计划号',model:'planCode',type:'input'},
                            {title:'仓库名称',model:'warehouseName',type:'input'},
                            {title:'商家名称',model:'ownerName',type:'input'},
                            {title:'状态',model:'status',type:'input'},
                            {title:'创建时间',model:['beginCreatedTime','endCreatedTime	'],type:'datetime'},
                            {title:'审核人',model:'auditor',type:'input'},
                            {title:'审核时间',model:['beginAuditTime','endAuditTime'],type:'datetime'}
                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'冲正单号',model:'code'},
                        {title:'盘点计划号',model:'planCode'},
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'商家名称',model:'ownerName'},

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
            // toggle  : toggle,
            reset   : reset,
            search  : search,
            searchByTable:searchByTable,
            doCheck:doCheck,
            doDelete:doDelete
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
         * 分页查询
         */
        function list(){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = false;
            }, loadingLatency);

            //console.log()
            service.list(getParas()).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    vm.data = afterList(resp.list||[]);
                   // console.log(resp.list);
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
            page.params.model = data;
            // console.log(page.params.model);
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
            // 处理td序号
            sl.pushIndex(data , '@');
            sl.dep.conv(data , page.deps);
            // for(v in data) {
            sl.timestamp(data,['createdTime','auditTime']);
            // }

            for(var i=0;i<data.length;i++){
                if(data[i].status==1){
                    data[i].status="已审核";
                }
                else if(data[i].status==0){
                    data[i].status="未审核";
                }
            }
            return data;
        }


        //审核函数
        function doCheck(data) {
            // if(!items.length){
            //     sl.alert('请先选择异常订单')
            // }
            // else {
            //     sl.alert('items:'+items);
            // }
            //console.log(data);
            ModalService.open({
                title:'注意',
                content:'请确定是否要审核盘点冲正单',
                data:data,

            }).then(function (modal) {
               if(modal.result){
                 service.check({id:data.id}).then(function (resp) {
                     if(!resp.returnCode){
                          data.status='已审核';
                     }
                     else{
                         sl.alert(resp.returnMsg);
                     }

                 })

               }
            })
        }



        //删除函数
        function doDelete(data) {
            ModalService.open({
                title:'注意',
                content:'请确定是否删除盘点冲正单',
                data:data
            }).then(function (modal) {
                if(modal.result){
                   service.delete({id:data}).then(function (resp) {
                       if(resp.returnCode){
                           sl.alert(resp.returnMsg);
                       }
                       else{
                           list();
                       }
                   })
                }
            })
        }


    }]);

})