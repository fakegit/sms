/**
 * Created by hubo on 2017/2/16.
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockexpressHandoverListCtrl', ['$scope', 'OutstockexpressHandoverService', 'sl', '$timeout','ModalService', function($scope, service, sl,  $timeout,ModalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '快递交接',

            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true},
                    { "key": "waybillNo", "value": "快递单号", "display": true},
                    { "key": "createdTime", "value": "扫描时间", "display": true }
                   
                ],

                model : []
            },

            deps:{
                logisticsName:"LOGISTICS",
                bizControl:"OWNER_BIZ_CONTROL",
                //仓库
                'warehouseId':"WAREHOUSE",
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
                        title: "交接单明细查询",
                        group: [
                            {title:'快递公司',model:'logisticsId',type:'select',values:[]},
                            {title:'交接框号',model:'code',type:'input'},
                            {title:'快递单号',modal:'waybillNo',type:'input'},
                            {title:'操作人',model:'createdBy',type:'input'},
                            {title:'扫描时间',model:['createdTimeFr','createdTimeTo'],type:'datetime'},

                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'快递公司',model:'logisticsName'},
                        {title:'交接框号',model:'code'},
                        {title:'快递单号',model:'waybillNo'},
                        {title:'操作人',model:'createdBy'},
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
            change : change,
            build : build,
            checkDocumentNo : checkDocumentNo,
            del : del ,
            printer : printer,
            search  : search,
            searchByTable:searchByTable,
            openModalService:openModalService
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            sl.dep(page.deps).then(function(){
                $timeout.cancel(loadingTimeout);
                page.loading = false;


               
            })
        }

        function change(){
            var obj = {} 
            obj.logisticsId = vm.data.logisticsId
            console.log(obj)
           service.list(obj).then(function(resp){
                vm.data.code  = resp.returnVal
           })
        }

        function build(){
            var obj = {};
            obj.logisticsId = vm.data.logisticsId
            service.list(obj).then(function(resp){
                vm.data.code = resp.returnVal
            })
        }
        // 扫描事件
        function checkDocumentNo(e){
            var keycode = window.event ? e.keyCode : e.which;
            var obj = {}
                obj.warehouseId = vm.data.warehouseId;
                obj.logisticsId = vm.data.logisticsId;
                obj.code = vm.data.code;
                obj.waybillNo = vm.data.waybillNo
            if (keycode == 13) {
                if (!vm.data.code || vm.data.code == '') {
                    vm.data.speak = '请输入框号'
                    sl.speek('请输入框号')
                }else{
                    service.search(obj).then(function(resp){
                    
                    if (!resp.returnCode) {
                        sl.speek('成功');
                        data.speak = '成功'
                        data.List = afterList(resp.returnVal)
                    }else{
                        sl.speek('失败');
                       data.speak = '失败'

                    }                
                })
                }
                
            }
        }
        // 页面上删除
        function del(row){
            console.log(row)
            var obj = {};
                obj.id = row.id;
            service.del(obj).then(function(resp){
                if(resp.returnCode){
                    sl.alert(resp.returnMsg)
                }else {
                    for (var i = 0 ; i<data.List.length;i++) {
                       if (data.List[i].id == row.id) {
                            data.List.splice(i,1)
                       } 
                    }
                    sl.notify('删除成功!');
                }
            })
        }
        // 页面上打印
        function printer(){
            var obj = {};
                obj.buttonId = 10;
                obj.records = [];
            var record={};
                for (var i= 0; i< vm.data.List.length;i++) {
                    console.log(vm.data.List[i])
                    record.id = vm.data.List[i].id;
                    record.handoverCode = vm.data.List[i].code;
                    obj.records.push(record)
                }
            obj = sl.dig(obj)
            service.printer(obj).then(function(resp){
                if (!resp.returnCode) {
                    // sl.notify('打印成功')
                    vm.data.code = ''
                }
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
            $timeout.cancel(loadingTimeout);
            page.loading = false;

            console.log()
           
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

            // sl.dep.conv(data , page.deps);
            sl.timestamp(data,['createdTime']);
            console.log(data)
            return data;
        }

        function openModalService() {
             ModalService.open({
                 alert:false,
                 content:'确定导出此记录吗？',
                 unload:function (modal) {
                     if(modal.result){

                         exlExport();
                     }
                 }
             })
        }

         function exlExport() {
            //console.log(getParas());
            //sl.curd.download('/outstock/outExpressHandover/exportFile',getParas());
             service.exportFile(getParas());
         }

    }]);

})