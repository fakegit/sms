define(['app', 'moment'], function(app, moment) {

    return app.controller('BaseOwnerEditCtrl', ['$scope', 'BaseOwnerService', 'sl', '$timeout','$stateParams','ModalService', function($scope, service, sl,  $timeout,$stateParams,modalService) {

        var loadingLatency = sl.options.loadingLatency || 100,
            loadingTimeout;

        var vm = $scope, 

            data = {}, //页面直接绑定的数据

            raw = null, //缓存原始数据

            id = $stateParams.id,

            isCreate = id === 'create',

            isEdit = (id !== undefined && $stateParams.act === 'edit' ),

            isView = !isEdit && !isCreate;

        var page = {

            loading: true,

            edit : isEdit,

            view : isView,

            title: (isEdit ? '编辑' : isView ? '查看' : '新增') + '商家',

            fields : {"status":"","remark":"","cEmail":"","cFax":"","cTel":"","cMobile":"","cContact":"","cAddress":"","bizControl":"","warehouseId":"","code":"","nameEn":"","name":"","shops":"","cCity":"","cProvince":"","cDistrict":"","batchId":""},

            fields_def : {
                status : 1,
                shops:[]
            },

            deps:{
                'warehouseId':'WAREHOUSE',
                'bizControl':'OWNER_BIZ_CONTROL',
                'area':'AREA',
                'batchId':'BATCH',
                //店铺使用到的依赖
                'pId':'SHOP',
            }

        };


        sl.extend(vm , {
            page    : page, 
            data    : data,
            save    : save,
            reset   : reset,

            shop:{
                create: shop_create,
                edit: shop_edit,
                toggle:shop_toggle,
                view:shop_view
            }
        })

        init();

        /**
         * 初始化
         * @return {[type]} [description]
         */
        function init() {

            sl.dep(page.deps).then(function(deps){
                if(!isCreate){
                    service.get(id).then(function(resp){
                        page.loading = false;
                        if(resp.returnCode){
                            sl.alert(resp.returnMsg);
                        }
                        else{
                            setData(resp.returnVal);
                        }
                    });
                }else{
                    page.loading = false;
                    setData(page.fields_def);
                }
                
            })
        }


        /**
         * 保存内容
         * @return {[type]} [description]
         */
        function save(){
            loadingTimeout = $timeout(function() {
                page.loading = true;
            }, loadingLatency);

            service.update(getData(), isEdit).then(function(resp){
                page.loading = false;
                $timeout.cancel(loadingTimeout);

                if(resp.returnCode){
                    sl.alert(resp.returnMsg);
                }
                else{
                    sl.dep.update('OWNER');
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
            vm.data.shops = vm.data.shops || [];
        }

        /**
         * 获取操作后的数据
         * @return {[type]} [description]
         */
        function getData(){
            var params = angular.copy( vm.data );


            if(isEdit){
                params.id = id;
            }

            params.warehouseName = getDepValue('warehouseId' , params.warehouseId);

            return sl.dig(params);
        }

        function getDepValue(dep , id , raw){
            var d = page.deps[dep];
            for (var i = d.length - 1; i >= 0; i--) {
                if( d[i].id == id)
                {
                    return raw ? d[i].raw : d[i].label;
                }

            }
            return null;
        }

        /**
         * 新增shop
         * @return {[type]} [description]
         */
        function shop_create(){
            shop_edit({status:1},1);
        }

        /**
         * 查看shop
         * @return {[type]} [description]
         */
        function shop_view(row){
            shop_edit(row,2);
        }

        function shop_valid(row , ori){
            var all = vm.data.shops , ori_code = ori.code;
            for(var i in all){
                if(
                    //排除自身
                    all[i].code != ori_code &&
                    (
                        all[i].name == row.name || 
                        all[i].code == row.code
                    )
                    
                ){
                    return false;
                }
            }
            return true;
        }

        /**
         * 编辑shop
         * @param  {[type]} row    [description]
         * @param  {[type]} mode [description]
         * @return {[type]}        [description]
         */
        function shop_edit(row, mode){
            var safe_data = angular.copy(row);
            modalService.open('shop/edit.html',{
                page : {
                    view : mode == 2, 
                    edit : !mode,
                    title : (mode == 1 ? '新增': ( mode == 2 ? '查看' : '编辑')) + '店铺',
                    deps : {
                        'pId':page.deps.pId
                    }
                },
                
                data : row,

                unload : function(modal){
                    if( modal.result ){
                        if( !shop_valid( modal.data , safe_data) ){
                            sl.alert('店铺名称或店铺编码已存在');
                            return false;
                        }
                    }
                    
                }
            }).then(function(modal){
                if(modal.result){
                    var par = getDepValue('pId',modal.data.pId,true);
                    if(par){
                        modal.data.shopRelation = par.shopRelation + 1;
                    }
                    
                    // create
                    if(mode == 1){
                        vm.data.shops.push( modal.data );
                    }
                }else{
                    sl.extend(row , safe_data)
                }
            });
        }

        /**
         * 修改shop状态
         * @param  {[type]} row [description]
         * @return {[type]}     [description]
         */
        function shop_toggle(row){
            //var toggle_state = row.status == 1 ? 0 : 1;
            row.status = row.status == 1 ? 0 : 1;
        }


    }]);

})
