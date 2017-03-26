define(['app', 'moment'], function(app, moment) {

    return app.controller('StockmgrDetailChangeCtrl', ['$scope', 'StockmgrDetailService', 'sl', '$timeout','ModalService','$stateParams', function($scope, service, sl,  $timeout,modalService,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 
            data0 = {},
            data = {},
            raw = null, //缓存原始数据

            id = $stateParams.id;
    
        var page = {
   
            loading: true,

            title: '库存调整',

            fields : {  

                options:{'id':'','code':'','pickType':'','warehouseName':'','ownName':'','outstorageBillVos':''},
                ware :  {"inventoryStatus":[{"id":"1","label":"正品"},{"id":"0","label":"残次品"}]}
            },

            fields_def : {
                    outstorageBillVos:[]
                 },

            deps:{
                //  //库位类别
                // "loca_cat":"LOCATION_CATEGORY",
                // //库位类型
                // "loca_type":"LOCATION_TYPE"
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
            data0 : data0, 
            data    : data,
            save    : save,
            reset   : reset,
            change : {
                edit : change_edit
            },
            searchByTable:searchByTable
         
        })

        init();


        // 预查询
        vm.loc_options = {
            suggest: suggest,
            key:'id',
            select: function(item) {
                console.log('select' , item)
                vm.data.locId = item.label;
                vm.data.code = parseInt(item.id)  

            },
            verify:function(r){
                console.log(r)
            }
        }

        function suggest(key){
            var obj = {
                warehouseId : parseInt(id) , 
                code: key
            }
           console.log(obj)
            return service.queryCode(obj).then(function(resp) {
                return formatSuggest(resp.returnVal);
            })
        }

        function formatSuggest(data) {
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].id, label: data[i].code , raw: data[i] })
            }
            return obj;
        }





        // 库存调整批号按钮弹出框 
        function change_edit(id,model){

           modalService.open('change/edit.html',{
                page : {
                    fields: [  
                            { "key": "@", "value": "序号", "display": true},
                            { "key": "lot", "value": "系统批号", "display": true},
                            { "key": "customerLot", "value": "商家批号", "display": true},
                            { "key": "produceDate", "value": "生产日期", "display": true},
                            { "key": "storageDate", "value": "入库日期", "display": true},
                            { "key": "extendProp1", "value": "批次属性5", "display": true},
                            { "key": "extendProp2", "value": "批次属性6", "display": true}, 
                            { "key": "extendProp3", "value": "批次属性7", "display": true},
                            { "key": "extendProp4", "value": "批次属性8", "display": true},
                            { "key": "extendProp5", "value": "批次属性9", "display": true},
                            ],
                    params:{ 
                        model: {},            
                        pag:{
                        // 分页状态
                            model:{
                                pageSize: 5,//每页显示数量
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
                },
                search:function(data,params){
                    list(data, params); 
                    // page.params.pag.model.itemCount = resp.total;
                },

                data: {},

                /*add: function(item) {
                    console.log(item);
                }*/

                unload:function(modal) {
                    console.log(modal.data.list);
                    for ( var i in modal.data.list) {
                        if (modal.data.list[i].checked) {
                            vm.data.lot=modal.data.list[i].lot
                            vm.data.lotId=modal.data.list[i].id
                            console.log(vm.data.lotId)
                        }
                      
                    }
                    return true
                }
                
            }).then(function(modal){
                
                console.log(modal)
                if(modal.result){
                   // console.log(modal.page.fields[2])
                }else{
                    // sl.extend(row , safe_data)
                }
            });
       
        }



        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {     
                   vm.data.choose = 1;
              // sl.dep(page.deps).then(function(deps){
                      service.change(id).then(function(resp){
                        page.loading = false;
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{   
                            vm.data0 = resp.returnVal || [];
                            // setData(resp.returnVal|| []);
                            console.log(vm.data0)
                        }
                    });   
              // })

            
        }
        


        function list(data,params){
            data.ownerName = vm.data0.ownerName
            data.skuCode = vm.data0.skuCode
            if (data.storageDate) {
                data.storageDate = new Date(data.storageDate)
            }
            if (data.produceDate) {
                  data.produceDate = new Date(data.produceDate)
            }
            if (data.expiryDate) {
                data.expiryDate = new Date(data.expiryDate)
            }

           service.modal(getdata(data,params)).then(function(resp){
                data.list = afterList(resp.list)|| [];
                page.params.pag.model.itemCount = resp.total;

           })
           
        }

        function getdata(data,params){
            var obj = angular.copy(data)
            var oobj = {
                'customerLot':'',
                'produceDate':'',
                'expiryDate':'',
                'storageDate':''
            }
            obj = sl.pick(obj,oobj)
            for (var i in obj) {
                
                if (obj[i] == undefined ) {
                    delete obj[i]
                }
            }
           sl.extend( obj , {
                pageSize: params.pag.model.pageSize,
                pageNum : params.pag.model.pageNum
            });
           console.log(obj)
          return obj;
        }

        
        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){

            // type的类型判断在数据getdata()处处理
            console.log(data.choose)
            
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
            // vm.data.outstorageBillVos = afterList(vm.data.outstorageBillVos)      
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            params.inventoryId = parseInt(id);
           // 数量调整          
           if (data.choose == '1' ) {
                var obj = { 
                    remark:"",
                    inventoryId:"",
                    quantity:""
                }
                params = sl.pick( params , obj );
                params.type = 1;
           } 
            // 库位移动
           if(data.choose == '2'){
                var obj = {
                    remark:"",
                    inventoryId:"",
                    quantity:"",
                    locId:"",
                    inventoryStatus:""

                }
                params = sl.pick( params , obj );
                if (params.locId) {
                    params.locId = data.code
                }
                params.type = 2; 
           }
           //批号调整
           if(data.choose == '3'){
                var obj = {
                    'inventoryId':'',
                    'remark':'',
                    'quantity':'',
                    'lotId':''
                }
                params = sl.pick(params,obj)
                params.type=3;
           }
           // 冻结释放
           if(data.choose == '4'){
                var obj = {
                    remark:"",
                    inventoryId:"",
                    quantity:""
                }
                params = sl.pick( params , obj );
                
                params.type = 4; 
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
