/**
 * Created by hubo on 2017/2/14.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockOutExpressHandoverListCtrl', ['$scope', 'OutstockOutExpressHandoverService', 'sl', '$timeout','print', function($scope, service, sl,  $timeout,printer) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '交接单管理',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "logisticsName", "value": "快递公司", "display": true},
                    { "key": "code", "value": "交接框号", "display": true },
                    { "key": "quantity", "value": "数量", "sort": 1, "display": true },
                    { "key": "createdBy", "value": "操作人", "display": true },
                    { "key": "printFlag", "value": "是否打印", "display": true },
                    { "key": "printTime", "value": "打印时间", "display": true },




                ],

                model : []
            },

            deps:{
                logisticsName:"LOGISTICS",
                bizControl:"OWNER_BIZ_CONTROL",


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
                        title: "交接单管理查询",
                        group: [
                            {title:'快递公司',model:'logisticsId',type:'select',values:[]},
                            {title:'交接框号',model:'code',type:'input'},
                            {title:'数量从',model:['quantityFr','quantityTo'],type:'range'},
                            {title:'操作人',model:'createdBy',type:'input'},
                            {title:'打印时间',model:['printTimeFr','printTimeTo'],type:'datetime'},
                            {title:'是否打印',model:'printFlag',type:'input'},

                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'快递公司',model:'logisticsName'},
                        {title:'交接框号',model:'code'},
                        {title:'操作人',model:'createdBy'},
                        {title:'是否打印',model:'printFlag'},
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
            allocation:allocation
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(){
                var values=[];
                for(var i=0;i<page.deps.logisticsName.length;i++){
                    values[i]={id:page.deps.logisticsName[i].id,label:page.deps.logisticsName[i].logisticsName};
                }
                values.unshift({id:'',label:'全部'});
                console.log(values);
                page.params.options.base[0].group[0].values=values;
                list();
            })
        }

        /**
         * 启用/禁用
         * @return {[type]} [description]
         */
        // function toggle(row){
        //     var id = row.id;
        //     var toggle_state = row.status == 1 ? 0 : 1;
        //
        //
        //     loadingTimeout = $timeout(function() {
        //         page.loading = true;
        //     }, loadingLatency);
        //
        //     service.toggle({id:id , status:toggle_state}).then(function(resp){
        //         if(resp.returnCode){
        //             sl.alert(resp.returnMsg);
        //         }else{
        //             row.status = toggle_state;
        //         }
        //         sl.dep.update('OWNER');
        //
        //         $timeout.cancel(loadingTimeout);
        //         page.loading = false;
        //     })
        // }

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
                    vm.data = afterList(resp.list||[]);
                    console.log(resp.list);
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
            sl.timestamp(data,['printTime']);
            return data;
        }


        //手动分配回调函数
        function allocation(items) {
            if(!items.length){
                sl.alert('请先需要打印的记录')
            }
            else {
                  //sl.alert(items);
                //sl.printer.print('');
                  var records={records:[],buttonId:10};
                  for(v in items){
                      records.records[v]={
                          handoverCode:items[v],
                          id:10
                      };
                     // sl.dig(records[v]);
                  }
                 // console.log(records);
                  records=sl.dig(records);
                  service.print(records).then(
                      function (resp) {
                          //console.log(resp.returnVal.tasks[0].queue[0].data[0]);
                          var content=[];
                         for(v in resp.returnVal.tasks){
                             content[v]={
                                 content:resp.returnVal.tasks[0].queue[0].data[0]
                             }
                         }
                          console.log(content);
                          //sl-print="{'data':data,'id':6}";
                          printer.print(content,{preview:true});
                      }
                  )
            }
        }

    }]);

})