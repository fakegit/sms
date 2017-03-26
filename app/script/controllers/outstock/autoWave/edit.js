define(['app', 'moment'], function(app, moment) {

    return app.controller('OutstockautoWaveEditCtrl', ['$scope', 'OutstockautoWavelService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isEdit = (id !== undefined ),

            isCreate = !isEdit ;

            console.log(id+"--"+isEdit+"--"+isCreate) 
        var page = {
   
            loading: true,

            title: isCreate? "自动创建波次" : "修改创建波次",

            edit : isEdit,

            fields : {"id":"","warehouseId":"","ownerId":"","country":"","province":"","city":"","shopId":"","logisticsId":"",
                        "minWeight":"","maxWeight":"","minSkuQuantity":"","maxSkuQuantity":"","minQuantity":"","maxQuantity":"",
                        "billType":"","businessType":"","skuCode":"","intervalTime":"","beginExecuteTimeStr":"","endExecuteTimeStr":"",
                        "ruleId":"","pickType":"","orderCount":"","beginBillCreatedTimeStr":"","endBillCreatedTimeStr":"",
                        "cutOffTimeStr":""
                    },

            fields_def : {},

            deps:{

                // 仓库              
                'warehouseId':'WAREHOUSE',
                //商家
                "ownerName":"OWNER",
                // 
                "shopId":"SHOP",
                //承运商
                "logisticsId":"LOGISTICS",
                //业务类型
               'businessType':'OUT_BUSINESS_TYPE',
               //单据类型
                "billType":"OUT_BILL_TYPE",
                 //拣货方式
                "pickType":"PICK_TYPE",
                //区域
                "area":"AREA"
                       
            }
        };

      

        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,
            focus : focus
        })


        // 预查询
          vm.sku_options = {
            suggest: suggest,
            key:'id',
            select: function(item) {
                console.log(item)
                vm.data.skuCode = item.label
                vm.data.goodsId = item.id

            },
            verify:function(r){
                console.log(r)
            }
        }


        function suggest(key){
            var obj = {
                ownerId: vm.data.ownerId , 
                skuCode: key
            }
            return service.queryBySkuCode(obj).then(function(resp) {
                return formatSuggest(resp.returnVal);
            })
        }

        function formatSuggest(data) {
            console.log(data)
            if (!data) return [];
            var obj = [];

            for (var i in data) {
                obj.push({ id: data[i].id, label: data[i].skuCode , raw: data[i] })
            }
            return obj;
        }




        init();
        function init(){

            // 页面波次规则依赖请求
            service.ruleList().then(function(resp){
                vm.ruleList = resp.list
            })

            // 页面依赖请求
            sl.dep(page.deps).then(function(deps){
                page.deps.shopId.unshift({'id':'','label':'不限'})
                page.deps.businessType.unshift({'childCodeId':'','childCodeC':'全部'})
                // page.deps.ownerName.unshift({'id':'','label':'全部'})

                page.loading = false;
                $timeout.cancel(loadingTimeout);
             })
            // 设置页面默认数据操作
            data.businessType = '1';
            data.cutOffTimeStr = '23:59';
            data.beginExecuteTimeStr = '0:00';
            data.endExecuteTimeStr = '23:59';

            if(!isCreate){
                service.get(id).then(function(resp){

                    page.loading = false;
                    

                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }else{
                        console.log(resp.returnVal)
                         setData(resp.returnVal);
                    }
                   
                });
            }
        }


        function focus(){
            // console.log(1)
            var params = {}
            console.log(data.warehouseId+"--"+data.ownerId)
            if (data.warehouseId || data.ownerId) {
                params.warehouseId = data.warehouseId;
                params.ownerId = data.ownerId;
                 service.ruleList(params).then(function(resp){
                    vm.ruleList = resp.list
                })
            }
            
        }

        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
            if (isCreate) {
                service.create(getData()).then(function(resp){
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }
                    else{
                        sl.notify('保存成功');
                    }
                });
            }else{
                service.update(getData()).then(function(resp){
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
            
        }


        /**
         * 重置内容
         * @return {[type]} [description]
         */
        function reset() {

            setData(raw);
        }



         /**
         * 处理并绑定数据
         */
        function setData(d){
            // raw = d;
            console.log(d)
            vm.data = sl.pick(d,page.fields);
            // vm.data.goodsId = vm.data.id;
            console.log(vm.data)
            
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            
           if (params.minWeight) {
                params.minWeight = parseFloat(params.minWeight)
           }
            if (params.maxWeight) {
                params.maxWeight = parseFloat(params.maxWeight)
           }
            if (params.minSkuQuantity) {
                params.minSkuQuantity = parseFloat(params.minSkuQuantity)
           }
            if (params.maxSkuQuantity) {
                params.maxSkuQuantity = parseFloat(params.maxSkuQuantity)
           }
           if (params.minQuantity) {
                 params.minQuantity = parseInt(params.minQuantity)
           }
           if (params.maxQuantity) {
                 params.maxQuantity = parseInt(params.maxQuantity)
           }
           if (params.intervalTime) {
                 params.intervalTime = parseInt(params.intervalTime)
           }
           if (params.orderCount) {
                 params.orderCount = parseInt(params.orderCount)
           }
           if(params.skuCode) {
            params.skuCode = params.goodsId
           }
           
            console.log(params)
           
            // for in 操作将参数中的空值过滤
            for (var i in params) {
                if (params[i] == '') {
                     console.log(i)
                    delete params[i]
                }
            }
            if (!params.ruleId) {
                params.ruleId=0
            }
            delete params.cDistrict;
            delete params.goodsID;
            params.country = '中国';
            console.log(params)
            // return sl.dig(params);
            return params
        }
    }]);

})
