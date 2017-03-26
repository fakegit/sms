define(['app','moment'],function (app,moment) {
    return app.controller('StockmgrDetailEditCtrl',['$scope', 'StockmgrDetailService','InstockInbillService' ,'sl', '$timeout','$stateParams','ModalService',function($scope, service,inbill_service, sl,  $timeout,$stateParams,modalService) {
        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope,

            data = [], //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id;//入库单id
        console.log(id);


        var page = {

            loading: true,
            title:"库存明细",

            //edit: isEdit,

            view: 1,

            //title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '入库预约单',

            fields: {

            },

            fields_def: {
                detailList: []
            }
        }

        sl.extend(vm , {
            page    : page ,
            data    : data,
        })

        init();

        function init() {
            service.change(id).then(function (resp) {
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



    }])
})