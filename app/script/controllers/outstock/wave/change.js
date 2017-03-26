define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockWavechangeCtrl', ['$scope', 'OutstockWavelService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {},

            raw = null, //缓存原始数据

            id = $stateParams.id

        var page = {
   
            loading: true,

            title: '修改波次明细',

            fields : {  

                 options:{'id':'','code':'','pickType':'','warehouseName':'','ownName':'','outstorageBillVos':''}

            },

            fields_def : {
                    outstorageBillVos:[]
                 },

            deps:{
                 //拣货方式
                "pickType":"PICK_TYPE"
                 },

            //搜索字段
            params:{ 
                model: {},            
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
            page    : page, 
            data    : data,
            save    : save,
            search : search,
            reset   : reset,
            del : del ,
            searchByTable:searchByTable
         
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() { 
    
              sl.dep(page.deps).then(function(deps){
                    console.log(page.deps.pickType)

                      service.change(id).then(function(resp){
                        page.loading = false;
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{   
                            // vm.data = afterList(resp.returnVal.outstorageBillVos || [])
                            setData(resp.returnVal);
                            console.log(vm.data)
                        }
                    });   

              })

            
        }

        
        // 修改波次明细页面删除按钮
        data.billIdList = [];
        function del(id){
           data.billIdList.push(id);
           for (var i = 0; i < vm.data.outstorageBillVos.length; i++) {
              if (vm.data.outstorageBillVos[i].id == id) {
                    vm.data.outstorageBillVos.splice(i,1)
              }
           }
        }            

              
        
        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){
            // init();
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            service.update(getData()).then(function(resp){
                console.log(getData())
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('保存成功');
                }
            });
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
          
            getTabel();
        }



        /**
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {
            setData(raw);
        }


        //获取查询参数；
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



        //高级筛选触发分页；
        function search(data){
            page.params.model = data;
        }
       

         /**
         * 处理并绑定数据
         */
        function setData(d){
            vm.data = sl.pick( d , page.fields.options); 
            vm.data.outstorageBillVos = afterList(vm.data.outstorageBillVos)      
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            console.log(params)
            var obj = {
                'id' : '',
                'pickType':''
            }
            
            params=sl.pick(params, obj)
            if (data.billIdList.length) {
                 params.billIdList = data.billIdList
            }
           
            console.log(params)
            return params;
        }

        // 处理得到的数据
        function afterList(data) {
            sl.pushIndex(data,'@');
         
            return data;
        }



    }]);

})
