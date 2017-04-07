define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/custom-fields.html',
            '<div class="modal fade in inner modal-custom-fields" style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title">自定义字段</h4></div><div class="modal-body"><p>请选择您想要在表单中显示的字段信息</p>' + '<div class="custom-fields row"><div class="col-sm-6 left"><input type="text" placeholder="请输入关键字" class="form-control" ng-model="query" /><ul><li ng-click="act.toggle(row)" ng-class="{\'select\':!!row.display}" tabindex="0" ng-repeat="row in fields | filter:{\'value\':query}"><span>{{row.value}}</span><span class="menu"><a><i class="fa fa-fw fa-check"></i></a></span></li></ul></div><div class="col-sm-6"><ul class="remove"><li tabindex="0" ng-repeat="row in cache"><span>{{$index+1}} . {{row.value}}</span><span class="menu"><a ng-click="act.up($index)"><i class="fa fa-fw fa-arrow-up"></i></a><a ng-click="act.down($index)"><i class="fa fa-fw fa-arrow-down"></i></a><a ng-click="act.remove(row)"><i class="fa fa-fw fa-close"></i></a></span></li></ul></div></div>' + '</div><div class="modal-footer text-center"><button class="btn btn-primary pull-center" ng-click="close(true)">确定</button> <button class="btn btn-default pull-center" ng-click="close(false)">取消</button></div></div></div></div>');
    }]);

    app.directive('slFields', ['$timeout', '$parse', 'ModalService','sl','$state', function($timeout, $parse, ModalService, sl , $state) {
        
        var localstore = sl.store.local;

        // 从localStore 载入到 本地
        var slstore = sl.store.get('fields');

        
        if( !slstore ){
            //不存在时 从 ocalStorage 载入
            sl.store.set('fields' , localstore.get('fields') || {});
            slstore = sl.store.get('fields');
        }
        
        function swap(arr, a, b) {
            var t = arr[a];
            arr[a] = arr[b];
            arr[b] = t;
        }

        function store(mod , data){

            var data = sl.hash( data , 'key' , 'display');
            slstore[mod] = data;
            //持久保存
            localstore.set('fields' , slstore);
        }

        function assign(src,dist){
            
            for (var i = dist.length - 1; i >= 0; i--) {
                if(src[i].group) dist[i].group = src[i].group;
                if(src[i].value) dist[i].value = src[i].value;
            }
        }

        function restore(mod , data){
            var ori = slstore[mod];
            if(ori){
                for(var i in data){
                    data[i]['display'] = ori[ data[i]['key'] ];
                }
            }
        }

        return {
            restrict: 'A',
            scope: {
                //处理后
                slFields: '=',

                //源
                slFieldsOptions: '='
            },
            link: function(scope, element, attr, ctrl) {

                var mod = $state.current.name;

                restore(mod, scope.slFieldsOptions)

                var event = 'click';

                //原始数据，display 状态会被更改
                var fields = angular.copy(scope.slFieldsOptions);
                
                var last_fields = angular.copy(fields);

                //最近一次修改
                var cache = [];

                //最近一次保存结果的修改
                var last_cache = [];

                var act = {
                    init: function(d) {
                        cache = [];
                        for (var i in d) {
                            if (!!d[i].display) {
                                cache.push(d[i]);
                            }
                        }
                        scope.slFields = angular.copy(cache);
                        last_cache = angular.copy(cache);
                    },

                    has: function(v) {
                        var key = v.key;
                        for (var i in cache) {
                            if (cache[i].key == key) {
                                return i;
                            }
                        }
                        return -1;
                    },
                    findFromField : function(v){
                        var key = v.key;
                        for (var i in fields) {
                            if (fields[i].key == key) {
                                return i;
                            }
                        }
                        return -1;
                    },
                    //左侧操作
                    toggle: function(row) {
                        row.display = !row.display;
                        var index = act.has(row);
                        if (index != -1) {
                            cache.splice(index, 1);
                        } else {
                            cache.push(row);
                        }

                    },

                    //已选内操作
                    up: function(index) {
                        if (index > 0 && index < cache.length) {
                            swap(cache, index, index - 1);
                        }
                    },
                    down: function(index) {
                        if (index >= 0 && index < cache.length - 1) {
                            swap(cache, index, index + 1);
                        }
                    },
                    remove: function(row) {
                        var index = act.has( row );
                        if(index != -1){
                            cache.splice(index, 1);
                            
                            //从左侧查找
                            index = act.findFromField( row );
                            if(index != -1){
                                fields[index].display = false;
                            }
                        }
                        
                    }
                }

                act.init(fields);

                //发生变动时 要重新赋值
                scope.$watch('slFieldsOptions' , function(nv){
                    
                    if(nv){
                        //重新赋值原始数据
                        assign(nv , scope.slFields);

                        //重新赋值正在用的数据
                        fields = angular.copy(nv);

                        //cache 也要重新赋值
                        act.init(fields);
                        // console.log('=>',fields[13])
                    }
                } , true);

                element.bind(event, function(evt) {
                    console.log(fields)
                    ModalService.open('template/common/custom-fields.html',{
                        fields: fields,
                        cache: cache,
                        act: act
                    }).then(function(modal) {
                        if (modal.result) {
                            //将实际变动赋值
                            scope.slFields = angular.copy( cache );
                            last_cache = angular.copy( cache );
                            last_fields = angular.copy( fields );
                            store(mod ,  last_cache );
                        }else{
                            cache = angular.copy( last_cache );
                            fields = angular.copy( last_fields );
                        }
                    });
                });
            }
        };
    }]);
})
