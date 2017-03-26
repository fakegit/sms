define(['app'], function(app) {
    //<input type="text" placeholder="请输入关键字" class="form-control" ng-model="query" />
    app.filter("areaNameClean", function() {
        return function(input) {
            return input ? input : '清空';
        }
    });
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/areainfo.html',
            '<div class="ui-area"><div class="area-select"><div class="ui-dropdown" sl-dropdown ng-if="level>=1"><span class="dd-toggle" ng-bind="current.province.areaName"></span><ul class="dd-menu"><li ng-repeat="row in group.province"><a ng-click="select_province(row)">{{row.areaName | areaNameClean}}</a></li></ul></div><div ng-if="level>=2" class="ui-dropdown" sl-dropdown><span class="dd-toggle" ng-bind="current.city.areaName"></span><ul class="dd-menu"><li ng-repeat="row in group.city"><a ng-click="select_city(row)">{{row.areaName | areaNameClean }}</a></li></ul></div><div ng-if="level==3" class="ui-dropdown" sl-dropdown><span class="dd-toggle" ng-bind="current.district.areaName">请选择地区</span><ul class="dd-menu"><li ng-repeat="row in group.district"><a ng-click="select_district(row)">{{row.areaName | areaNameClean}}</a></li></ul></div></div></div></div>');
    }]);

    app.directive('slArea', ['$timeout', '$parse', 'ModalService', function($timeout, $parse, ModalService) {

        return {
            restrict: 'A',
            scope: {
                slArea: '=',
                slAreaLv: '=?',
                slAreaOption: '=?',
                slAreaModel: '=',
            },
            templateUrl:'template/common/areainfo.html',

            link: function(scope, element, attr, ctrl) {

                var group = {
                    province : [],
                    city : [],
                    district : []
                }

                var labels = scope.slAreaOption || {
                    district:'cDistrict',
                    city:'cCity',
                    province:'cProvince'
                }

                var current = {
                    province:'',
                    city:''
                };

                var lv = scope.slAreaLv || 3;

                var ready = false;

                var handlers = [];

                scope.level = lv;

                scope.group = group;

                scope.current = current;

                scope.select_province = select_province;

                scope.select_city = select_city;

                scope.select_district = select_district;

                scope.$watch(function(){
                    return scope.slArea;
                }, function(nv){
                    if(angular.isArray(nv)) parse(nv);
                });

                scope.$watch('slAreaModel', function(nv){
                   
                    if(nv && (nv[ labels.province ])){
                        whenReady(function(){
                            set_current(nv);
                        })
                        
                    }
                });

                function parse(v){
                    if(v){
                        group.province = v;

                        group.province.push({
                            areaName:'',id:'-1',
                            childrens:[{
                                areaName:'',id:'-11',
                                childrens:[{
                                    areaName:'',id:'-111',
                                }]
                            }]
                        });

                        ready = true;
                        fire();
                        //current.province = v[0];
                        //select_province(v[0]);
                    }
                }

                function whenReady(fn){
                    handlers.push(fn);
                    if(ready) fire();
                }

                function fire(){
                    for (var i = handlers.length - 1; i >= 0; i--) {
                        handlers[i]();
                    }
                    handlers = [];
                }
                function set_current(v){
                    console.log(v)
                    var p = v[ labels.province ];
                    var s = v[ labels.city ];
                    var d = v[ labels.district ];

                    var obj = group.province ;
                    var result = [p, s, d];

                    for(var j = 0; j < result.length && obj; j++){
                        var flag = false , i = 0;
                        for (i = obj.length - 1; i >= 0; i--) 
                        {
                            if(obj[i].areaName == result[j]){
                                flag = true;
                                break;
                            }
                        }
                        if(flag){
                            result[j] =  obj[i];
                            obj = obj[i].childrens;
                        }else{
                            break;
                        }
                    }
                    //console.log(result)
                    if(lv>=1){
                        console.log(result)
                        select_province(result[0]);
                    }
                    
                    if(lv>=2){
                        select_city(result[1]);
                    }

                    if(lv == 3){
                        select_district(result[2]);
                    }
                    

                }

                function select_province(v){
                    console.log(v)
                    /*if( v == '-1'){
                        scope.slAreaModel[labels['province']] = '';
                        return;
                    }*/

                    current.province = v;
                    scope.slAreaModel[labels['province']] = v.areaName;

                    var citys = angular.copy(v.childrens);
                    citys.push({
                        areaName:'',id:'-11',
                        childrens:[{
                            areaName:'',id:'-111'
                        }]
                    });
                    group.city = citys;
                    if(lv>=2)
                        select_city(citys[0])
                }

                function select_city(v) {
                    
                    current.city = v;
                    scope.slAreaModel[labels['city']] = v.areaName;

                    var districts = angular.copy(v.childrens);
                    districts.push({
                        areaName:'',id:'-111'
                    });
                    group.district = districts;

                    if(lv==3)
                        select_district(districts[0])
                }

                function select_district(v){
                    current.district = v;
                    scope.slAreaModel[labels['district']] = v.areaName;

                }

            }
        };
    }]);
})
