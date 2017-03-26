/**
 * Created by hubo on 2017/1/11.
 */
define(['app','moment'],function (app,moment) {
    return app.controller('OutstockAbnormalEditCtrl',['$scope', 'OutstockAbnormalService','InstockInbillService' ,'sl', '$timeout','$stateParams','ModalService',function($scope, service,inbill_service, sl,  $timeout,$stateParams,modalService) {
        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,

            data = [], //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;//入库单id
            console.log(id);


        var page = {

            loading: true,
            title:"异常订单分配单查看",

            //edit: isEdit,

            view: 1,

            //title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '入库预约单',

            fields: {

                'inAsnVO': '',
                //商品明细
                'detailList': '',
                'model':[{value:'序号'},{value:'商品名称'},{value:'商品编码'},{value:'应发数量'},{value:'包装单位'},{value:'商品状态'},{value:'生产日期'},{value:'过期日期'},{value:'批次编码'},]

            },

            fields_def: {
                detailList: []
            }
        }

        sl.extend(vm , {
            page    : page ,
            data    : data,
            allocation : allocation
        })

       init();

        function init() {
            service.get(id).then(function (resp) {
                $timeout.cancel(loadingTimeout);
                page.loading = false;


                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }else{

                    vm.data=setData(resp.returnVal);
                    console.log(vm.data);
                }
            })
        }


      function setData(data) {
              var obj=data;
              //时间戳转化
          obj.billVo.orderTime=sl.timestamp(obj.billVo.orderTime);

          sl.timestamp(obj.details,['produceDate','expiryDate']);

              return obj;

      }

          //手动分配函数
        function allocation() {
            console.log(id);
                service.reAllocation(id).then(function (resp) {
                    console.log('tt:'+ resp);
                    if(!resp.returnCode){
                        sl.alert(resp.returnMsg);
                        init();
                    }
                    else{
                        sl.alert(resp.returnMsg);
                        init();
                    }
                })
            }













            }])
})