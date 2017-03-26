define(['app'], function(app) {
/*    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/sl/search.html',
            '<div class="modal fade in modal-custom-fields" style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title">自定义字段</h4></div><div class="modal-body"><p>请选择您想要在表单中显示的字段信息</p>' + '<div class="custom-fields row"><div class="col-lg-6 left"><input type="text" placeholder="请输入关键字" class="form-control" ng-model="query" /><ul><li ng-click="data.act.toggle(row)" ng-class="{\'select\':!!row.display}" tabindex="0" ng-repeat="row in data.fields | filter:{\'value\':query}"><span>{{row.value}}</span><span class="menu"><a><i class="fa fa-fw fa-check"></i></a></span></li></ul></div><div class="col-lg-6"><ul class="remove"><li tabindex="0" ng-repeat="row in data.basekt"><span>{{$index+1}} . {{row.value}}</span><span class="menu"><a ng-click="data.act.up($index)"><i class="fa fa-fw fa-arrow-up"></i></a><a ng-click="data.act.down($index)"><i class="fa fa-fw fa-arrow-down"></i></a><a ng-click="data.act.remove(row)"><i class="fa fa-fw fa-close"></i></a></span></li></ul></div></div>' + '</div><div class="modal-footer text-center"><button class="btn btn-primary pull-center" ng-click="close(true)">确定</button> <button class="btn btn-default pull-center" ng-click="close(false)">取消</button></div></div></div></div>');
    }]);*/

    app.directive('slSearch', ['$timeout', '$parse', 'ModalService','core', function($timeout, $parse, ModalService , core) {

        var creater = (function(){
            var tpl = '<div class="modal modal-search fade in pull-right" style="display:block;"><div class="modal-dialog"><div class="modal-content overflow-modal"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><div class="modal-title"><i class="fa fa-filter"></i>高级筛选</div></div><div class="modal-body">{body}</div><div class="modal-footer"><button class="btn btn-normal" ng-click="close(true)">确定</button><button class="btn btn-op" ng-click="reset();close(-1);">重置</button></div></div></div></div>';
            
            function createTpl(d){
                var html = '';
                for(var i in d){
                    html += '<div class="item">';
                    html += '<div class="header">'+d[i].title+'<i class="fa fa-filter"></i></div>';
                    html += '<div class="group">'+createGroup(d[i].group)+'</div>';
                    html += '</div>';
                }
                return tpl.replace('{body}',html);
            }

            function createGroup(d){
                var html = '';
                for(var i in d){
                    
                    if(d[i].type == 'input'){
                        html += createInput(d[i]);
                    }
                    else if(d[i].type == 'select'){
                        html += createSelect(d[i]);
                    }
                    else if(d[i].type == 'datetime'){
                        html += createDatetime(d[i]);
                    }
                    else if(d[i].type == 'range'){
                        html += createRange(d[i]);
                    }
                }
                return html;
            }

            function createInput(d){
                var html = '';
                if(d.title){
                    html += '<div class="input-group"><span class="input-group-addon">'+d.title+'</span>'; 
                }
                var ph = d.placeholder || ''
                html += '<input placeholder="'+ph+'" class="form-control" ng-model="data.'+d.model+'" />';
                html += '</div>'
                return html;
            }

            function createInput0(d){
                var html = '';
                if(d.title){
                    html += '<label>'+d.title+'</label>'; 
                }
                html += '<input class="form-control" ng-model="data.'+d.model+'" />';
                return html;
            }

            function createSelect(d){
                var html = '';
                if(d.title){
                    html += '<div class="input-group"><span class="input-group-addon">'+d.title+'</span>'; 
                }
                html += '<select class="form-control" ng-change="change(\''+d.model+'\',data.'+d.model+',\''+d.change+'\')" ng-model="data.'+d.model+'" ng-options="v.id as v.label for v in page.'+d.model+'">'; 
                /*for(var i in d.values){
                    html += '<option value="'+d.values[i].id+'">'+d.values[i].label+'</option>';
                }*/
                html += '</select>'; 
                html += '</div>'
                return html;
            }

            function createDatetime(d){

                var html = '';
                if(d.title){
                    html += '<div class="input-group"><span class="input-group-addon">'+d.title+'</span>'; 
                }
                html += '<div class="row">'+
                            '<div class="col-xs-6"><input datetime-picker class="form-control datetime" ng-model="data.'+d.model[0]+'" /></div>'+
                            '<div class="col-xs-6"><input datetime-picker class="form-control datetime" ng-model="data.'+d.model[1]+'" /></div>'+
                        '</div>';
                html += '</div>'
                return html;
            }

            function createRange(d){
                var html = '';
                if(d.title){
                    html += '<div class="input-group"><span class="input-group-addon">'+d.title+'</span>'; 
                }
                html += '<div class="row">'+
                            '<div class="col-xs-6"><input class="form-control" placeholder="最小值" ng-model="data.'+d.model[0]+'" /></div>'+
                            '<div class="col-xs-6"><input class="form-control" placeholder="最大值" ng-model="data.'+d.model[1]+'" /></div>'+
                        '</div>';
                html += '</div>'
                return html;
            }

            function createModels(d){
                var models = {};
                for(var i in d){
                    var g = d[i].group;
                    for(var j in g){
                        models[g[j].model] = g[j].value || '';
                    }
                }
            
                return models;
            }

            function createDeps(d){
                var models = {};
                for(var i in d){
                    var g = d[i].group;
                    for(var j in g){
                        if(g[j].values)
                            models[g[j].model] = g[j].values;
                    }
                }
            
                return models;
            }

            return {
                tpl:createTpl,
                models:createModels,
                deps:createDeps
            }
        }());
        
        function trim(obj){
            var ret = {};
            for(var i in obj){
                if(obj[i] != '' && obj[i] != undefined ) ret[i] = obj[i];
            }
            return core.dig(ret);
        }

        // 比较对象改动，有些条件可能发生更改
        function compare(){

        }

        return {
            restrict: 'A',
            scope: {
                slSearch: '=',
                slSearchChange: '=',
                slSearchSelect:'=?'
             /*   customFields: '=',
                customFieldsOptions: '='*/
            },
            link: function(scope, element, attr, ctrl) {

                var event = 'click';
                var models = scope.slSearch;
                var callback = scope.slSearchChange;
                var select = scope.slSearchSelect;

                var vm = {
                    data: angular.copy(creater.models(models)),
                    page: creater.deps(models),
                    change:function(key , value , bindTo){
                        console.log(key,value)
                        var self = this;
                        
                        if(select){
                            select(key,value,function(resp){
                                if(bindTo && bindTo != 'undefined') {
                                    self.page[bindTo] = resp;
                                }
                            })
                        }
                    }
                };

                element.bind(event, function(evt) {

                    if(vm.data == null)
                        vm.data = angular.copy(creater.models(models));
                    var tpl = creater.tpl(models);
                    vm.page = creater.deps(models);

                    ModalService.open(tpl , vm).then(function(modal) {
                        //重置操作
                        if(modal.result == -1){
                            if(callback)
                                callback( {} );
                            vm.data = null;
                        }
                        else if (modal.result) {
                           if(callback)
                                callback( trim(angular.copy(modal.data)) );
                        }
                    });
                });
            }
        };
    }]);
})
