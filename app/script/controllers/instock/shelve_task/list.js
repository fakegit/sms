/**
 * 上架任务 列表
 * 
 * @date     2017-01-03
 * @author   wuting<reruin@gmail.com>
 */
define(['app'], function(app) {

    return app.controller('InstockShelveTaskListCtrl', ['$scope', 'InstockShelveTaskService', 'sl', '$timeout','ModalService', function($scope, service, sl,  $timeout,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, data = [];

        var page = {
            loading: true,

            title : '上架任务列表',
            
            //表头显示字段
            fields : {
                options : [
                    { "key": "@", "value": "序号", "display": true}, 
                    { "key": "code", "value": "任务单号", "display": true }, 
                    { "key": "warehouseName", "value": "仓库名称", "sort": 1, "display": true },
                    { "key": "billTypeName", "value": "单据类型", "display": true }, 
                    // { "key": "billType", "value": "业务类型", "display": true },
                    { "key": "quantity", "value": "应上数量", "display": true },
                    
                    { "key": "shelvedQuantity", "value": "实上数量", "display": true },
                    { "key": "createdBy", "value": "创建人", "display": true },
                    { "key": "createdTime", "value": "创建时间", "display": true },
                    
                    { 
                        "key": "statusName", "value": "状态", "display": true,
                        "link":"status","group":[
                            {"id":"-1" , "label":"全部"},
                            {"id":"0" , "label":"待上架"},
                            {"id":"1" , "label":"上架中"},
                            {"id":"2" , "label":"完成"}
                        ] 
                    }
                ]
            },
            
            deps:{
                // bizControl:"OWNER_BIZ_CONTROL"
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
                            {title:'货号',model:'product_id',type:'input',value:'0001'},
                            {title:'商品名',model:'name',type:'input'},
                            {title:'商品条码',model:'barCode',type:'input'},

                        ]
                    }],

                    //用于快速搜索
                    quick : [
                        {title:'任务单号',model:'code'},
                        {title:'仓库名称',model:'warehouseName'},
                        {title:'单据类型',model:'billTypeName'},
                        {title:'创建人',model:'createdBy'},
                        {title:'创建时间',model:'warehouseName'}
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
            remove  : remove,
            reset   : reset,
            search  : search,
            print   : print,
            searchByTable:searchByTable
        })

        init();

        function print(){
            var html = '<div style="position:relative;width:100mm;height:200mm;margin:0 auto;"><div style="position:absolute;left:0mm;top:160mm;width:100mm;height:40mm;background-color:none;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="table"><table style="width:100%;"><thead><tr><th>undefined</th><th></th><th></th></tr></thead><tbody><tr><td>${undefined}</td><td>${}</td><td>${}</td></tr></tbody></table></div><div style="position:absolute;left:0mm;top:0mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><div style="position:absolute;left:0mm;top:18.26mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><div style="position:absolute;left:3.44mm;top:28.31mm;width:34.66mm;height:7.67mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;">${receive}</div></div><div style="position:absolute;left:42.07mm;top:28.31mm;width:41.28mm;height:7.4mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;">电话                    </div></div><div style="position:absolute;left:3.44mm;top:35.98mm;width:96.3mm;height:9.79mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;">地址                    </div></div><div style="position:absolute;left:0mm;top:51.86mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><div style="position:absolute;left:0mm;top:3.71mm;width:100mm;height:14.55mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;"><span style="font-size: 17pt;">大头笔                    </span></div></div><div style="position:absolute;left:0mm;top:75.93mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><img src="${ mailNo }" style="position:absolute;left:0mm;top:51.86mm;width:99.91mm;height:13.76mm;background-color:rgba(0,0,0,.1);display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="barcode"><div style="position:absolute;left:-0.26mm;top:65.62mm;width:100mm;height:10.31mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;"><div style="text-align: center;">运单号</div></div></div><div style="position:absolute;left:0mm;top:96.31mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><div style="position:absolute;left:3.7mm;top:75.93mm;width:66.41mm;height:20mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;">咚咚咚咚咚咚咚咚咚咚咚咚咚咚咚地地道道地地道道地地道道地地道道的地地道道地地道道地地道道地地道道的</div></div><div style="position:absolute;left:70.11mm;top:75.93mm;width:0.28mm;height:20.38mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_v"></div><img src="http://192.168.1.2:8280/nrpms/upload/14_20170114140257.png" style="position:absolute;left:69.74mm;top:75.93mm;width:30mm;height:20mm;background-color:rgba(0,0,0,.1);display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="image"><img src="${ mailNo }" style="position:absolute;left:0mm;top:96.31mm;width:100mm;height:12.7mm;background-color:rgba(0,0,0,.1);display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="barcode"><div style="position:absolute;left:-0.26mm;top:109.01mm;width:100mm;height:8.73mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;"><div style="text-align: center;">运单号</div></div></div><div style="position:absolute;left:0mm;top:117.74mm;width:100mm;height:0.28mm;background-color:#666;display:block;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="line_h"></div><div style="position:absolute;left:3.44mm;top:117.74mm;width:73.82mm;height:10.05mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;">商家名称</div></div><div style="position:absolute;left:3.7mm;top:127.79mm;width:96.04mm;height:6.61mm;background-color:none;display:table;border-style:solid;border-color:#666;border-width:0pt 0pt 0pt 0pt;" type="text"><div style="display:table-cell;vertical-align:middle;"><div style="text-align: right;">打印时间</div></div></div></div>'
            sl.printer.printBasic(html , {preview:true , width:'100mm' , height:'170mm'})
        }

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

        function remove(id){
            $timeout.cancel(loadingTimeout);

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            
            service.remove(id).then(function(resp){
                $timeout.cancel(loadingTimeout);
                page.loading = false;
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{
                    list();
                }
            });
        }
        /**
         * 分页查询
         */
        function list(){

            page.loading = true;
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
            sl.format.timestamp(data , ['createdTime']);
            //console.log(page.fields.model)
            return data;
        }

    }]);

})
