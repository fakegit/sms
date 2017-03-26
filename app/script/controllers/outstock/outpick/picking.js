/**
 * 执行拣货
 */
define(['app'], function(app) {

    return app.controller('OutstockOutpickPickingCtrl', ['$scope', 'OutstockOutpickService','sl', '$timeout','$state','$stateParams','ModalService', function($scope, service, sl,  $timeout,$state,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id, //波次id

            //1 边分边检 2 总拣 3 二次分拣
            type = '';

        var page = {

            loading: true,

            title: '拣货',

            fields : {"waveCode":"","details":[]},

            type : '',

            //页面显示数据
            pickingSkus:[],

            //拣货筐

            storage:[],

            data : {
                'skuPlanQuantity':0,
                'skuPickedQuantity':0,
                'storageNo':'　',
                'skuCode':'请扫描商品'
            },

            process : false,

            focus : {
                locationCode:1,
                skuCode : 0,
                quantity : 0
            },

            skuData : {

            }

        };

        //任务队列
        var queue = [];

        sl.extend(vm , {
            page    : page, 
            data    : data,
            scan    : scan,
            stockout:stockout,
            complete: complete

        })

        init();

        sl.unload.on($state.current.name , function(mode){
            if(mode){
                return '确定退出吗'
            }
        })

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {
            //获取拣货状态
            service.get({'waveId':id}).then(function(r){
                // 从波次号 拉取 拣货页面
                if( r.returnVal ){
                    data.waveCode = r.returnVal.code;
                    // returnVal.status: 
                    // 2 边分边检 二次分拣,0 总拣/边分边检
                    var status = r.returnVal.status;

                    // returnVal.pickType
                    // 1 边分边拣; 2 总拣/二次分拣
                    var pickType = r.returnVal.pickType;

                    // type 1 边分边拣
                    if(pickType == 1){
                        type = 1;
                    }
                    // type 3 二次分拣. status = 2 and pickType = 2
                    else if(status == 2 && pickType ==2 ){
                        type = 3;
                    }
                    // type 2 总拣
                    else if((status == 0 || status == 1) && pickType ==2){
                        type = 2;
                    }
                    
                    page.type = type;
                    //type = page.type = r.returnVal.status == 2 ? 3 :
                    // type 1 边分边拣 2 总拣 3 二次分拣
                    console.log(type)
                    page.title = type == 1 ? '边分边拣' : (type == 2 ? '总拣' : '二次分拣');

                    //二次分拣时修改焦点
                    if(type == 3){
                        page.focus.skuCode = true;
                    }

                    service.detail(data.waveCode , page.type).then(function(resp){
                        setData(resp.returnVal);
                        page.loading = false;
                        //检查任务状态
                        updateTask();
                    })
                }else{
                    sl.alert( r.returnMsg );
                }
                
            },function(){
                sl.alert('发生异常');
            })
        }

        /**
         * 刷新拣货状态
         * @return {[type]} [description]
         */
        function reset(){
            vm.data.skuCode = '';
            vm.data.locationCode = '';

            page.data = {
                'skuPlanQuantity':0,
                'skuPickedQuantity':0,
                'storageNo':'　',
                'skuCode':'请扫描商品'
            };

            page.focus = {
                locationCode:1,
                skuCode : 0,
                quantity : 0
            }

            page.process = false;

            page.skuData = [];

            init();
        }

        /**
         * 二次拣货时 完成拣货
         */
        function complete(){
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.complete(data.waveCode).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg , true);
                }
                else{
                    modalService.open('template/outstock/picking/complete.html').then(function(resp){
                        if(resp.result == 2){
                            reset();
                        }
                    })
                }

            })
        }

        /**
         * 同步保存拣货
         * @return {[type]} [description]
         */
        function update(){

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            console.log(Date.now())

            if( page.type == 3 ){
                //二次分拣
                service.picking( getData() , page.type).then(function(resp){
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if(resp.returnCode){
                        sl.alert(resp.returnMsg , true , function(){
                            page.focus.skuCode++;
                        });

                        sl.speek(resp.returnMsg);
                    }
                    else{
                        updateView(resp.returnVal);
                    }
                })
            }else{
                service.picking( getData() , page.type).then(function(resp){
                    page.loading = false;
                    $timeout.cancel(loadingTimeout);

                    if(resp.returnCode){
                        sl.alert(resp.returnMsg , true);
                        sl.speek(resp.returnMsg);
                    }
                    else{
                        updateView(resp.returnVal);
                    }
                })
            }
        }


        /**
         * 扫描商品
         */
        function scan(skuCode , srcSku){

            if( !data.locationCode && page.type !=3){
               page.focus.locationCode++;
               $scope.$apply();
               return;
            }

            if( !data.skuCode ){
                page.focus.skuCode++;
                $scope.$apply();
                return;
            }else if(!checkSkuValid(data.skuCode)){
                sl.alert('商品不属于该任务' , true , function(){
                    page.focus.skuCode++;
                });
                sl.speek('商品不属于该任务');
                return;
            }

            //总拣时 焦点 移动到 数量输入框
            if(!data.locked && srcSku && page.type ==2){
                page.focus.quantity++;
                //否则 page.focus 会不起作用
                $scope.$apply();
                return;
            }

            // 如果是二次分拣
            if( page.type == 3 ) {
                data.quantity = 1;
                update();
            }

            // 总拣 或 边分边拣
            else{
                //如果是边分边拣
                if(page.type == 1){
                    data.quantity = 1;
                }
                
                if(data.quantity){
                    var hit = page.skuData[data.skuCode];

                    if( (hit.skuPlanQuantity - hit.skuPickedQuantity) >= data.quantity) {
                        update();
                    }
                    else{
                        sl.alert('扫描数量大于当前拣货数量' , true);
                    }
                }else{
                    alert(data.quantity)
                }
            }
            
        }

        /**
         * 缺货
         */
        function stockout(){
            sl.alert('请联系相关人员补货。')
        }
        /**
         * 更新页面数据
         * @return {[type]} [description]
         */
        function updateView(d){
            d = d.details[0];


            if( page.type != 3){
                page.data.storageNo = d.storageNo;
                sl.speek(d.storageNo+'号格子');
            }

            //更新拣货筐清单
            updateStorage(d);

            //更新sku清单
            updatePickingSkus(d);

            //更新面板
            updatePanel(d);

            //更新任务
            updateTask();

            page.focus.skuCode++;
            // console.log(Date.now())

        }

        //更新拣货框信息
        function updateStorage(d){
            var storage = page.storage;
            var storageNo = d.storageNo,
                orderNo = d.orderNo;
            var select = -1;


            for (var i = storage.length - 1; i >= 0; i--) {
                if( 
                    storage[i].storageNo == storageNo &&  
                    storage[i].orderNo == orderNo
                ) {
                    select = i;
                    break;
                }
            }

            if( select >=0 ){
                //高亮显示
                //select.active = true;

                //置顶
                var tmp = storage[select];
                tmp.skuPickedQuantity += parseInt(data.quantity);
                tmp.timestamp = Date.now();

               /* storage.splice(select,1);
                storage.unshift( tmp );*/

                page.process = true;

                //修改该格子的已拣货数量
            }

        }

        // 更新清单信息
        function updatePickingSkus(d){
            var details = page.pickingSkus;
            var locationCode = d.locationCode,
                skuCode = d.skuCode;
            var select;
            for (var i = details.length - 1; i >= 0; i--) {
                if( 
                    details[i].skuCode == skuCode &&  
                    details[i].srcLocationCode == locationCode
                ) {
                    select = details[i];
                    break;
                }
            }

            if(select){
                select.skuPickedQuantity += parseInt(data.quantity);
                page.data.skuCode = d.skuCode;
                page.data.skuPlanQuantity = parseInt(select.skuPlanQuantity);
                page.data.skuPickedQuantity = parseInt(select.skuPickedQuantity);

                page.data.progress = Math.round( 100 * page.data.skuPickedQuantity / page.data.skuPlanQuantity );

                //收获完毕
                if(select.skuPlanQuantity == select.skuPickedQuantity){
                    select.success = true;
                }

            }

            // 更新
        }

        //更新面板
        function updatePanel(d){
            //格子号
            page.data.storageNo = d.storageNo;
            page.data.skuCode = d.skuCode;
            page.data.skuName = page.skuData[d.skuCode];
        }

        // 更新任务状态
        function updateTask(){
            var taskDone = true;
            var details = page.pickingSkus;
            var storage = page.storage;

            //遍历sku
            for (var i = details.length - 1; i >= 0; i--) {
                var task = details[i];

                if(task.skuPlanQuantity != task.skuPickedQuantity){
                    taskDone = false;
                    break;
                }
            }

            // 遍历格子 修改显示状态
            for (var i = storage.length - 1; i >= 0; i--) {
                if(storage[i].skuPlanQuantity == storage[i].skuPickedQuantity){
                    storage[i].timestamp = 0;
                }else{
                    storage[i].timestamp = 1;
                }
            }

            if( taskDone ){
                //总拣时 提示是否进行二次分拣
                if( page.type == 2){
                    modalService.open('template/outstock/picking/complete.html').then(function(resp){
                        if(resp.result == 2){
                            reset();
                        }
                        else {
                            $state.go('app.outstock_outpick_list');
                        }
                    })
                }
                else{
                    sl.alert('当前任务已经拣货完成',true , function(){
                        $state.go('app.outstock_outpick_list');
                    });
                }
                
            }
        }

        //检测SKU是否在当前任务中
        function checkSkuValid(skuCode){
            var details = page.pickingSkus;
            for (var i = details.length - 1; i >= 0; i--) {
                if(  details[i].skuCode == skuCode ) {
                    return true;
                }
            }
            return false;
        }

         /**
         * 处理数据
         */
        function setData(rd){

            // 任务清单，按 skuCode 维度
            page.pickingSkus = rd.pickingSkus;
            var skus = page.pickingSkus;
            for (var i = skus.length - 1; i >= 0; i--) {
                page.skuData [ skus[i].skuCode ] = skus[i];
            }

            //分拣框号清单，按 storageNo 维度
            var d = rd.pickingOrders;
            var hash = {} , storageNo;
            for(var i in d){
                storageNo = d[i].storageNo;
                if(!hash[ storageNo ]){
                    hash[ storageNo ] = {
                        'storageNo' : storageNo,
                        'orderNo' : d[i].orderNo,
                        'skuPlanQuantity': 0,
                        'skuPickedQuantity':0,
                        'goods':[]
                    }
                }


                // 
                //TODO 会不会存在 storageNo 和 orderNo 不对应的情况
                hash[ storageNo ][ 'skuPlanQuantity' ] += d[i].skuPlanQuantity;
                hash[ storageNo ][ 'goods' ].push( d[i] );

                hash[ storageNo ][ 'skuPickedQuantity' ] += d[i].skuPickedQuantity;

            }

            var arr = sl.coll(hash);
            //排序
            arr.sort(function(a,b){
                return a.storageNo > b.storageNo ? 1 : -1;
            });

            //处理下商品信息
            for(var i in arr){
                var info = [];
                for (var j = arr[i].goods.length - 1; j >= 0; j--) {
                    info[j] = arr[i].goods[j].skuName+'('+arr[i].goods[j].skuPlanQuantity+')';
                }
                arr[i]['goodsInfo'] = info.join(';');
            }

            page.storage = arr;
            
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var obj = {
                waveCode:data.waveCode 
            }

            if( page.type == 3 ){
                obj.quantity = data.quantity;
                obj.skuCode = data.skuCode;
            }else{
                obj.details = [{
                    'locationCode':data.locationCode,
                    'skuCode':data.skuCode,
                    'quantity': data.quantity
                }]
            }
            return sl.dig(obj);
        }
    
    }]);

})
