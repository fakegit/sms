/**
 * 执行收货
 */
define(['app', 'moment'], function(app, moment) {

    return app.controller('InstockReceiveExecCtrl', ['$scope', 'InstockReceiveService','InstockInbillService','InstockShelveTaskService','sl', '$timeout','$stateParams','ModalService', function($scope, service,inbill_service,shelve_task_service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = [], //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id //入库单id

        var page = {

            loading: true,

            title: '收货',

            fields : [
                { "key": "receiveLpn", "value": "容器编码", "display": true }, 
                { "key": "skuCode", "value": "商品编码", "display": true },
                { "key": "skuName", "value": "商品名称", "display": true }, 
                { "key": "realPackQuantity", "value": "扫描数量", "display": true },
                { "key": "realPackUnitId", "value": "包装单位", "display": true },

                { "key": "inventoryStatus", "value": "商品状态", "display": true },

                { "key": "produceDate", "value": "生产日期", "display": true },
                { "key": "expiryDate", "value": "过期日期", "display": true },
                { "key": "invLotVO.lotTemplateId", "value": "批次模板", "display": true }
                    
            ],
                

            fields_def : {
                
            },

            deps:{
                //renwu 
                //'task':'/instock/shelveRecord/page?taskCode=' + id,
                //'record':[]
                'realPackUnitId':'PACK_UNIT',
                'inventoryStatus':'INVENTORY_STATUS',

                //缓存入库单内明细列表
                'tasks':[],

                //当前匹配到的明细
                'task':{},

                //当前入库单信息
                'bill' : {},

                //商品信息
                'goods':{}
            },

            //页面显示数据
            data:{
                'invLotVO':{},
                'lastSku':''
            }
        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            exec    : exec,
            cancel  : cancel,
            checkLpn: checkLpn,
            checkSku: checkSku

        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            sl.dep(page.deps).then(function(deps){

                // 从入库单id 拉取 入库明细
                if(id){
                    inbill_service.get(id).then(function(resp){
                        page.deps.bill = resp.returnVal;
                        page.deps.tasks = resp.returnVal.detailList;
                        page.loading = false;
                    });
                }
            },function(){
                sl.alert('发生异常');
            })
        }

        function reset(){
            data.splice(0 , data.length);
            page.data = {
                'invLotVO':{}
            }

            page.deps.task = {};
            page.deps.goods = {};
        }


        /**
         * 完成收货
         * @return {[type]} [description]
         */
        function save(){
            if(data.length == 0){
                al.alert('暂无记录');
                return ;
            }

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.update(getData()).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    var ids = resp.returnVal.normal;
                    sl.confirm({
                        title : '提示',
                        content:'收货记录提交成功!',
                        buttons:[
                            {title:'创建上架任务',callback:function(){
                                //$state.go('app.instock_receive_record_list');
                                page.loading = true;
                                shelve_task_service.create(ids).then(function(resp_puton){
                                    if(resp_puton.returnCode){
                                        sl.alert(resp.returnMsg);
                                    }else{
                                        sl.notify('创建上架任务成功');
                                    }
                                    page.loading = false;
                                })
                            }},
                            {
                                title:'返回列表页',
                                callback:function(){
                                    sl.go('app.instock_inbill_list');
                                }
                            },
                        ]
                    });
                    //sl.notify('收货成功');
                    //reset();
                }
            });
        }

        //创建上架任务
        function puton(items){
            if(items.length){
                page.loading = true;
                shelve_service.create( items ).then(function(resp) {
                    if(!resp.returnCode){
                        sl.notify('操作完成');
                        console.log(resp);
                        list();
                    }else{
                        sl.alert(resp.returnMsg);
                    }
                    page.loading = false;
                }, function(resp) {
                    sl.log.error(resp);
                    page.loading = false;
                })
            }
        }
        /**
         * 执行收货
         * @return {none}
         */
        function exec(){
            //checkSku();
            if(page.data.lastSku != page.data.skuCode){
                checkSku();
                return;
            }

            var bill = page.deps.bill,
                goods = page.deps.goods,
                pdata = page.data;

            var obj = {
                billId : id, 
                warehouseId : bill.inInstorageBillVO
.warehouseId,
                goodsId : goods.id,
                realPackUnitId : pdata.realPackUnitId,
                realPackQuantity: parseInt(pdata.realPackQuantity),
                inventoryStatus: pdata.inventoryStatus,
                timeSpace : Date.now(),
                receiveType: pdata.receiveLpn ? 1 : 0,
                receiveLpn : pdata.receiveLpn,
                skuName : goods.skuName
            };
            
            if(pdata.invLotVO){
                obj.produceDate = pdata.invLotVO.produceDate;
                obj.expiryDate = pdata.invLotVO.expiryDate;
                obj.invLotVO = pdata.invLotVO;
            }


            obj.extra = {
                'skuCode':goods.skuCode,
                'realPackUnitId': sl.dep.conv(pdata.realPackUnitId , goods.basePackUnitVOs , 'id' , 'unitDesc'),
                'inventoryStatus':sl.dep.conv(pdata.inventoryStatus , page.deps.inventoryStatus)
            }

            //console.log(obj.extra)

            saveLocal(obj);
            // 保存 对比
        }


        function cancel(i){
            //本地删除
            data.splice(i,1);
        }

        /**
         * 本地保存
         * @return {[type]} [description]
         */
        function saveLocal(d){
            
            var qty = d.realPackQuantity;
            var timeSpace = d.timeSpace;


            for(var i = 0 ; i< data.length; i++){
                d.realPackQuantity = data[i].realPackQuantity;
                d.timeSpace = data[i].timeSpace;

                if( angular.equals( data[i] , d) ){
                    data[i].realPackQuantity += qty;

                    console.log('equals: true')

                    d.realPackQuantity = qty;

                    return true;
                }else{
                    console.log('equals:',false)
                }
            }

            d.realPackQuantity = qty;
            d.timeSpace = timeSpace;

            data.push( angular.copy(d) );

            return false;

        }


        /**
         * 校验LPN
         * @param  {int} id 任务id
         * @return {none} 
         */
        function checkLpn(id){
            var lpn = page.data.receiveLpn;
            if(lpn){
                page.loading = true;
                service.checkLpn(lpn).then(function(resp){
                    page.loading = false;
                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }
                    else{
                        
                    }
                })
            }
            
        }

        /**
         * 判断输入或扫描的 SKU 是否在该入库单的 收货明细里
         * 入库单ID skuCode
         * @return {[type]} [description]
         */
        function checkSku(){

            if(id && page.data.skuCode){

                var skuCode = page.data.skuCode;
                var task = checkSkuInTask(page.data.skuCode);
                
                //TODO 如何处理 相同sku 的不同批次
                if(page.data.lastSku == skuCode){
                    return;
                }
                
                page.loading = true;

                // 如果skuCode 在 入库单明细内
                if( task ){

                    // 保存当前任务信息
                    page.deps.task = task;

                    // 通过任务单 和 sku 获取详情
                    service.getSku({'id': id , 'skuCode': skuCode}).then(function(resp){
                        if( resp.returnCode ){
                            sl.alert( resp.returnMsg , true);
                        }
                        else{

                            // 保存商品信息
                            page.deps.goods = resp.returnVal;

                            //清除批次信息
                            page.data.invLotVO = {};

                            //判断是否 需要进行 批次信息 录入
                            if(resp.returnVal.isBatch){
                                setBatch(resp.returnVal.baseLotTemplateAttrVOs);
                            }
                            page.data.lastSku = skuCode;
                        }

                        page.loading = false;
                        
                    }); 
                }
                
                else{

                    sl.alert('该商品不在此入库单内，请仔细核对！',true); 
                    page.loading = false;
                }
                
            }
            
        }

        /**
         * 设置批次属性, 弹框
         */
        function setBatch(lots){
            //批次备选种类
            var lot_count = lots[0].temAttrStringValues.length;
            var def = [{id:2,label:'其他批次'}];
            var fields_def = [
                'customerLot','storageDate','produceDate','expiryDate',
                'extendProp1','extendProp2','extendProp3','extendProp4',
                'extendProp5'
            ];

            var fields = [];

            var req = {};

            var lots = format(lots);

            for(var i = 0; i< lot_count ; i++){
                def.push({id:i , label: lots[0].values[i] });
            }

            function select(index , ref){
                var ret = {};
                for(var i=0;i<fields.length ; i++){
                    var key = fields[i].key;
                    ret[key] = lots[i].values[index];
                }

                if( ref ){
                    for(var key in ret){
                        ref[key] = ret[key];
                    }
                }
                return ret;
            }

            //筛选类型
            function collBatch(){

            }

            function format(d){
                var ret = [];
                //TODO 需要处理没有data的情况
                var lc = d[0].temAttrStringValues.length;
                var def_lot;
                for(var i in d){
                    var values = [''];
                    var valueIsDate = d[i].dataType == 1;
                    for(var j=0; j < lc; j++){
                        values[j] = valueIsDate ? 
                            sl.format_time(d[i].temAttrDateValues[j] , true) : 
                            d[i].temAttrStringValues[j];
                    }

                    d[i].values = values;

                    //顺带处理一下 fields
                    fields[i] = {
                        key : fields_def[i],
                        control : d[i].control,
                        label:d[i].name
                    }

                    //顺带处理一下 req
                }

                return d;
            }

            modalService.open('template/instock/receive/batch.html' , {
                page:{
                    title:'批次信息',
                    def : def,
                    index : 0,
                    lots : lots,
                    count : lot_count,
                    fields:fields
                },
                data : select(0),
                select : function(i){
                    select(i , this.data);
                }
            },{
                unload : function(){
                    var r = checkValidDate( this.data );
                    if(r){
                        return true;
                    }
                }
            }).then(function(modal){
                var d = modal.data;
                var s = angular.copy( d );

                s.lotTemplateId = page.deps.goods.batchId;
                s.goodsId = page.deps.goods.id;
                //保存
                page.data.invLotVO = angular.copy( s );
            })
        }

        /**
         * 检测有效时间
         * @return {boolean}
         */
        function checkValidDate(d){
            return true;
        }

        /**
         * 判断商品是否在 入库单明细内
         * @param  {string} skuCode
         * @return {object:task | none}         存在则返回具体明细
         */
        function checkSkuInTask(skuCode){
            var task = page.deps.tasks;
            for(var i in task){
                if( task[i].baseGoods.skuCode == skuCode){
                    return task[i];
                }
            }
            return null;
        }


         /**
         * 添加数据 - 上架明细
         */
        function setData(d){
            page.record.push(d) ;
            sl.pushIndex(page.record , '@');
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var d = angular.copy( data );
            var now = Date.now();

            for( var i = 0 ;i < d.length ; i++){
                d[i].timeSpace = now - d[i].timeSpace;
                d[i].no = i;
                delete d[i].extra;
            }
            
            return d;
        }
    
    }]);

})
