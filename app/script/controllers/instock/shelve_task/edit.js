/**
 * 执行上架

 * @date     2017-01-03
 * @author   wuting<reruin@gmail.com>
 */
define(['app'], function(app) {

    return app.controller('InstockShelveTaskEditCtrl', ['$scope', 'InstockShelveTaskService','InstockShelveRecordService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service,ISRService, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id, //任务id

            code = $stateParams.code; //任务号

        var page = {

            loading: true,

            title: '上架',

            fields : {
                base :{
                    'id':'','locCode':'','quantity':''
                },
                task : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "orderNo", "value": "入库单号", "display": true },
                        { "key": "ownerName", "value": "商家名称", "display": true },
                        { "key": "shopName", "value": "店铺名称", "display": true },
                        { "key": "lpn", "value": "容器编码", "display": true },
                        { "key": "skuCode", "value": "商品编码", "display": true },
                        { "key": "skuName", "value": "商品名称", "display": true },
                        // { "key": "uk0", "value": "单据类型", "display": true }, 
                        // { "key": "", "value": "业务类型", "display": true },
                        { "key": "quantity", "value": "应上数量", "display": true },
                        { "key": "shelvedQuantity", "value": "已上数量", "display": true },
                        { "key": "unitDesc", "value": "包装单位", "display": true },
                        { "key": "inventoryStatusName", "value": "商品状态", "display": true },
                        { "key": "customerLot", "value": "批次编码", "display": true },
                        { "key": "suggestLocCode", "value": "推荐库位", "display": true }
                    ]
                },
                record : {
                    options : [
                        { "key": "@", "value": "序号", "display": true}, 
                        { "key": "taskCode", "value": "任务单号", "display": true }, 
                        { "key": "instorageBillCode", "value": "入库单号", "display": true },
                        { "key": "ownerName", "value": "商家名称", "display": true }, 
                        { "key": "shopName", "value": "店铺名称", "display": true },
                        { "key": "lpn", "value": "容器编码", "display": true },
                        { "key": "goodsCode", "value": "商品编码", "display": true },
                        { "key": "goodsName", "value": "商品名称", "display": true },
                        { "key": "unit", "value": "包装单位", "display": true },
                        { "key": "inventoryStatus", "value": "商品状态", "display": true },
                        { "key": "lot", "value": "批次编码", "display": true },
                        { "key": "quantity", "value": "上架数量", "display": true },
                        { "key": "suggestLocCode", "value": "推荐库位", "display": true },
                        { "key": "toLocCode", "value": "实上库位", "display": true },
                        { "key": "operator", "value": "操作人", "display": true },
                        { "key": "operatedTime", "value": "操作时间", "display": true },
                    ]
                }
            },

            fields_def : {
                
            },

            deps:{
                //renwu 
                //'task':'/instock/shelveRecord/page?taskCode=' + id,
                'record':[]
            },

            //页面显示数据
            data:{
                
            },

            record:[],

            task:[],

            code : code,

            skuCode : '',

            focus :{
                skuCode : false
            }

        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            getTaskByCode:getTaskByCode,
            getTaskBySku:getTaskBySku
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            sl.dep(page.deps).then(function(deps){

                // 从具体的任务id 进入，则直接拉取任务明细
                if(id){
                    getTaskById(id);
                    getTaskRecord(id);
                }

                //等待用户 输入（扫描） 触发查询
                else{
                    page.loading = false;
                }
            },function(){
                sl.alert('发生异常');
            })
        }


        /**
         * 执行上架
         * @return {[type]} [description]
         */
        function save(){
            var d = getData();
            if(valid(d) == false){
                return;
            }

            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);
        
            service.puton(getData()).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.notify('上架成功');
                    //保存本次上架信息

                    //更新上架信息
                    page.data.shelvedQuantity = parseInt(page.data.shelvedQuantity) + parseInt(data.quantity);
                    // getTaskByCode();
                    //更新上架记录
                    getTaskRecord(id);
                }
            });
        }

        /**
         * 根据 任务id 查询上架记录
         * @param  {int} id 任务id
         * @return {none} 
         */
        function getTaskRecord(id){
            ISRService.list({taskId:id}).then(function(resp){
                page.record = resp.list || [] ;
                sl.format.index(page.record , '@');
                sl.format.timestamp(page.record , ['operatedTime']);

            })
        }

        /**
         * 根据 任务id 查询任务明细
         * @param  {int} id 任务id
         * @return {none} 
         */
        function getTaskById(id){
            page.loading = true;
            service.get(id).then(function(resp){
                page.loading = false;
                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    page.task = resp.returnVal;
                    sl.format.index(page.task , '@');
                    sl.format.timestamp(page.task ,['produceDate','expiryDate']);
                    if(page.task && page.task.length)
                        getCodeFromTasks(page.task);
                    //从明细中取出 任务单号
                }
            },function(resp){
                page.loading = false;
                sl.log.error(resp , '查询任务明细失败');
                
            })
        }

        /**
         * 根据 从明细中取出 任务单号
         * @param  {array} id 任务明细
         * @return {none} 
         */
        function getCodeFromTasks(tasks){
            page.code = code = tasks[0].taskCode;

            page.data.lpn = tasks[0].lpn;
        }

        /**
         * 根据 任务单号(code) 查询任务明细
         * @return {none}
         */
        function getTaskByCode(){
            var code = page.code;
            if(code){
                page.loading = true;
                service.getByCode(code).then(function(resp){
                    page.loading = false;
                    if(resp.returnCode){
                        sl.alert(resp.returnMsg);
                    }
                    else{
                        page.task = resp.returnVal;
                        sl.format.index(page.task , '@');
                        sl.format.timestamp(page.task ,['produceDate','expiryDate']);
                        if(page.task && page.task.length){
                            getCodeFromTasks(page.task);
                        }else{
                            sl.alert('该任务还没有任务明细');
                        }

                    }
                },function(resp){
                    page.loading = false;
                    sl.log.error(resp , '查询任务明细失败');
                })
            }
            
        }

        /**
         * 根据skuCode 从任务明细里选择需要 进行商家操作的任务
         * 用户扫描要上架的商品编码，
         * 回车后自动带出当前任务中该商品的应上数量和已上数量，
         * 显示到右边的”应上数量“和“已上数量”。
         * 如果当前任务未包含此商品，弹消息“当前任务未找到此商品”
         * 
         * @return {none}
         */
        function getTaskBySku(){
            if(!page.skuCode) return;
            
            var skuCode = page.skuCode;

            // 从 tasks 中查找满足要求的
            var possible_tasks = sl.select( page.task , 'skuCode' , skuCode);
            
            console.log('getTasks:',skuCode, possible_tasks )
            
            if(possible_tasks.length == 0){
                sl.alert('当前任务未找到此商品',true);
                page.focus.skuCode = true;
            }
            // 如果只有一条数据，则直接选择该条 任务明细
            else if(possible_tasks.length == 1){
                page.data = possible_tasks[0];
            }
            //多条数据选择上架批次号
            else if(possible_tasks.length > 1){
                
                modalService.open('template/instock/task/select.html' , {
                    page:{
                        index : 0,
                        data : possible_tasks
                    },
                    data : possible_tasks[0]
                }).then(function(modal){
                    if(modal.result){
                        page.data = modal.data;
                    }else{
                        page.data = modal.data;
                    }
                    console.log(page.data )
                })
            }
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
            var params = angular.copy( vm.data );
            //任务明细id
            params.id = page.data.id;
            console.log('update:',params);
            return params;
        }
        
        /*
         * 校验数据
         */
        function valid(data){
            var skuCode = page.skuCode;
            var possible_tasks = sl.select( page.task , 'skuCode' , skuCode);
            if(possible_tasks.length == 0){
                sl.alert('当前任务未找到此商品',true);
                page.focus.skuCode = true;
                return false;
            }
            return true;
        }
    }]);

})
