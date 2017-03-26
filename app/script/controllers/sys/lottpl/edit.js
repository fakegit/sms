define(['app', 'moment'], function(app, moment) {

    return app.controller('SysLottplEditCtrl', ['$scope', 'SysLottplService', 'sl', '$timeout','$stateParams', function($scope, service, sl,  $timeout,$stateParams) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

            console.log(data+"--"+raw+"--"+$stateParams.id+"--"+isCreate+"--"+isEdit+"--"+isView)

        var page = {
   
            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '批次模板',

            fields : {"name":"","attr":""},

            dataTypes : [             
                { "key": 1, "value": "日期" },
                { "key": 2, "value": "数字" }, 
                { "key": 3, "value": "文本" }     
            ],

            controls : [             
                { "key": 1, "value": "必填" },
                { "key": 2, "value": "选填" },
                { "key": 3, "value": "不显示" },
                { "key": 4, "value": "自动生成" }    
            ],

            // 此处的数据在后面的setData()中将数据付给data

            fields_def : {
                attr: [
                    {
                        "name": "商家批号",
                        "no":1
                    },
                    {
                        "name": "入库日期",
                        "no":2
                    },
                    {
                        "name": "生产日期",
                        "no":3
                    },
                    {
                        "name": "失效日期",
                        "no":4
                    },
                    {
                        "name": "",
                        "no":5
                    },
                    {
                        "name": "",
                        "no":6
                    },
                    {
                        "name": "",
                        "no":7
                    },
                    {
                        "name": "",
                        "no":8
                    },
                    {
                        "name": "",
                        "no":9
                    }
                ]
            },

            // deps:{

            //     // 带有依赖条件的 
                
            //     'warehouseId':'WAREHOUSE',

            //     //库位类别
            //     'category':'LOCATION_CATEGORY',

            //     //上架区
            //     'putawayZoneId':'ZONE_PUT',

            //     'pickZoneId':'ZONE_PICK',

            //     //库位类型
            //     'type':'LOCATION_TYPE',

            //     //周转需求
            //     'demand':'LOCATION_DEMAND',

            //     //储存单位
            //     'unitType':'LOCATION_UNITTYPE',

            //     //储存环境
            //     'env':'LOCATION_ENV'
            // }
        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            // sl.dep(page.deps).then(function(deps){
                if(!isCreate){
                    service.get(id).then(function(resp){
                        page.loading = false;
                         console.log(resp)
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{
                            if(isEdit){
                                if(resp.returnVal.attr.length < 9){
                                    for (var i = resp.returnVal.attr.length; i <9 ; i++) {
                                        var add = {"id":"","name":"","dataType":"","control":"","no":i+1}
                                        resp.returnVal.attr.push(add)
                                    }
                                }
                            }
                            
                            setData(resp.returnVal);
                        }
                    });
                }else{

                    page.loading = false;
                    console.log(page.fields_def)

                    setData(page.fields_def);
                }
                
            // })
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
            service.update(getData(), isEdit).then(function(resp){
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
            raw = d;
            vm.data = sl.pick( d , page.fields);
            for(var i in vm.data.attr) {
                if (i<4) {
                    vm.data.attr[i].display = true;
                }
            }
            // console.log(vm.data.attr)
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );
            var attrArr=[],
                attrList = params.attr;
           for (var i = 0; i < attrList.length; i++) {
               if(attrList[i].name){
                attrArr.push(attrList[i])
               }
           }
            var obj = {
                name:"",
                dataType:"",
                control:"" ,
                no:"" 
            }
            // params.attr=sl.pick(vm.data.attr, obj)
             params.attr=sl.pick(attrArr, obj)
            console.log(params.attr)
            if(isEdit){
                params.id = parseInt(id);
                console.log(typeof params.id)
            }

            return sl.dig(params);
        }
    }]);

})
