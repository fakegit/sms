define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
          $templateCache.put('template/sl/pagination.html',
            '<div ng-if="itemCount"><div class="col-sm-5 page-info"><label>共 <span ng-bind="itemCount"></span> 条 每页显示<select class="input-sm" ng-model="pageSize" ng-change="changeSize(pageSize)" ng-options="id for id in options.size"></select></label></div>'+

            '<div class="col-sm-7"><div class="table-page"><nav ng-if="pageCount && pages.length >= 2"><ul class="pagination">' +
            '<li ng-if="pageNum>1"><a href="javascript: void(0);" ng-click="selectPage(pageNum-1)">上一页</a></li>'+
            '<li ng-repeat="page in pages" ng-class="{active: page==pageNum}"><a href="javascript: void(0);" ng-click="selectPage(page)">{{page}}</a></li>' +
            '<li ng-if="pageNum<pageCount"><a href="javascript: void(0);" ng-click="selectPage(pageNum+1)">下一页</a></li>' +
            '<li><span style="padding-right:3px;">共{{pageCount}}页 到第</span></li>'+
            '<li style="margin-right:15px;"><input type="text" class="form-control" style="width:60px;float:left;padding:0 3px;height:32px;text-align:center;" ng-model="gotoPage" max="{{pageCount}}" ng-number min="1"> 页</li>'+
            '<li><button class="btn btn-op" ng-click="selectPage(gotoPage)">前往</button></li>'+
            '</ul></nav></div></div></div>');
    }]);


        //保存 table 参数关系
    app.directive('slt', [function () {
      return {
        restrict: 'A',

        scope: {
            'slt': '='
        },

        controller : function($scope){
          var params = $scope.slt.model;
          var search = $scope.slt.search;
          var pag = params.pag;

          var handlers = {};


          function emit(evt , data){
            if(handlers[evt]){
              for (var i = handlers[evt].length - 1; i >= 0; i--) {
                handlers[evt][i](data);
              }
            }
          }

          function on(evt , handler){
            if(!handlers[evt]){
              handlers[evt] = [];
            }
            handlers[evt].push(handler);
          }

          function setPage(num){
            if(pag){
              pag.model.pageNum = num;
            }
          }

          /**
           * 设置搜索参数
           * @param {[string]} key   [description]
           * @param {[string]} value [description]
           * @param {[boolean]} clear [清除之前的搜索条件]
           */
          this.setOption = function(key , value , clear){
            if(clear){
              params.model = {};
            }

            var obj = {};
            if( angular.isObject(key) ){
              obj = key;
            }else{
              obj[key] = value;
            }

            for(var i in obj){
              if(obj[i] === null){
                delete params.model[i];
              }else
                params.model[i] = obj[i];
            }
            

            //重置页码
            setPage(1);

            search && search();
          }

          this.getOption = function(key){
            return params;
          }

          this.search = function(){
            search && search();
            emit('update');
          }

          this.resetPage = function(){
            setPage(1);
          }

          this.on = on;

          this.emit = emit;
        },

        link : function($scope, element, attrs, ctrl){
           
        }
      }
    }]);

    //分页插件
    app.directive('sltPagination', [function () {
      return {
        restrict: 'EA',

        scope: {
            'sltPagination': '='
        },

        require: '^slt',

        templateUrl: 'template/sl/pagination.html',

        link: function ($scope, element, attrs, ctrl) {

          var pag = $scope.sltPagination;
          var state = pag.model;
          var search = ctrl.search;

          $scope.pages = [];
          $scope.options = pag.options;

          function render () {

              //分页大小
              var pageSize = state.pageSize || 10;

              //显示页码数量
              var pageDisplay = state.pageDisplay || 5;

              //当前页
              var pageNum = state.pageNum || 1;


              //总条目数
              var itemCount = state.itemCount || 0;

              //总页数
              var pageCount = Math.ceil( itemCount / pageSize );

              //保存要显示的页码
              var pages = [];

              //起始页码
              var start = Math.max(1, pageNum - Math.abs(Math.floor(pageDisplay / 2)));

              //结束页码
              var end = start + pageDisplay;

              if (end > pageCount) {
                end = pageCount + 1;
                start = Math.max(1, end - pageDisplay);
              }
              $scope.pages = [];

              for (var i = start; i < end; i++) {
                pages.push(i);
              }

              $scope.pageNum = pageNum;//Math.floor(pag.start / pag.number) + 1;
              $scope.pages = pages;
              $scope.pageCount = pageCount;
              $scope.itemCount = itemCount;
              $scope.pageSize = pageSize;
          }

          
          $scope.$watch(function () {
            return pag;
          }, render, true);

          $scope.$watch(function () {
            return $scope.pageSize;
          }, render, true);

          // 分页
          $scope.selectPage = function (page) {
            state.pageNum = page;
            search && search();
          };

          // 修改每页显示条目
          $scope.changeSize = function (size) {
            state.pageSize = size;
            state.pageNum = 1;
            $scope.gotoPage = '';
            search && search();
          };
        }
      };
    }]);



    app.run(['$templateCache', function($templateCache) {
      $templateCache.put('template/sl/quick_search.html','<div class="ui-dropdown" sl-dropdown><span class="dd-toggle" ng-bind="model.title"></span><ul class="dd-menu"><li ng-repeat="row in models"><a ng-click="select(row)">{{row.title}}</a></li></ul></div>'+
        
        '<div class="text-box">'+
        // 不能使用ng-if
        '<div ng-show="model.type==\'select\'" class="ui-dropdown select" sl-dropdown><span class="dd-toggle" ng-bind="current"></span><ul class="dd-menu"><li ng-repeat="row in model.values"><a ng-click="searchFromSelect(row)">{{row.label}}</a></li></ul></div>'+
        '<input ng-show="model.type!=\'select\'" type="text" ng-model="value" name="" placeholder="请输入{{model.title}}进行搜索" ng-keyup="keyup($event)" /><button ng-show="value" class="qs-close" ng-click="clear()"><i class="fa fa-fw fa-close"></i></button><button ng-click="search()"><i class="fa fa-fw fa-search"></i></button></div>');
    }]);
    // '<select class="form-control" ng-model="data" ng-options="v.id as v.label for v in model.values""></select>'
    app.directive('sltQuick', [function () {
        return {
          restrict: 'EA',

          scope: {
              'sltQuick': '=?'
          },

          require: '^slt',

          templateUrl: 'template/sl/quick_search.html',

          link : function($scope, element, attrs, ctrl){

             var models = $scope.sltQuick || ctrl.getOption().options.quick;

             var setOption = ctrl.setOption;

             var lastModel = '';

             $scope.models = models;

             $scope.value = '';

             $scope.select = '';

             $scope.model = models[0];

             $scope.empty = true;

             $scope.keyup = function(e){
                if(
                    e.which == 13 && $scope.value

                ){
                    $scope.search();
                }
             }

             //选择某个值
             $scope.searchFromSelect = function(row){
              $scope.current = row.label;
              $scope.value = row.id;
              $scope.search();
             }

             //查询
             $scope.search = function(){
              var obj = {};
              console.log($scope.value)
              if($scope.value){

                obj[ $scope.model.model ] = $scope.value;
                if( lastModel && lastModel != $scope.model.model)
                  obj[ lastModel ] = null;

                setOption( obj );
              }
              else{
                obj[ $scope.model.model ] = null;
                setOption( obj );
              }
              
             }

             // 选择查询条件
             $scope.select = function(row){
              var isTypeChange = $scope.model.type != row.type;
              lastModel = $scope.model.model;
              $scope.model = row;
              element.removeClass('open');

              //如果上一个类型 和 本次的类型不一致，清空
              if(isTypeChange){
                $scope.value = null;
                $scope.current = '';
              }
             }

             $scope.clear = function(){
              $scope.value = null;
              if($scope.model.type == 'select'){
                $scope.current = '';
              }
              $scope.search();
             }

          }
        }
    }]);


    app.run(['$templateCache', function($templateCache) {
      $templateCache.put('template/sl/filter.html','<span ng-if="!model.group.length" ng-bind="model.value"></span><div class="ui-dropdown light" sl-dropdown ng-if="model.group.length"><span class="dd-toggle" ng-bind="model.value"></span><ul class="dd-menu"><li ng-repeat="row in model.group" ng-class="{active:row.id == current.id}"><a ng-click="select(row)" slt-action ng-model="row.id">{{row.label}}</a></li></ul></div>');
    }]);

    app.directive('sltFilter', [function () {
      return {
        restrict: 'EA',

        scope: {
            'sltFilter': '='
        },

        require: '^slt',

        templateUrl: 'template/sl/filter.html',

        link : function($scope, element, attrs, ctrl){
           var model = $scope.sltFilter;

           var setOption = ctrl.setOption;

           $scope.model = model;

           $scope.id = '';

           $scope.group = model.group || [];

           $scope.current = $scope.group[0];

           if(('group' in model) == false){
              return;
           }

           var defaultVal = $scope.current ? $scope.current.id : '';

           $scope.search = function(){

           }

           $scope.select = function(m){
            $scope.current = m;
            element.removeClass('open');
            if(m.id != defaultVal)
              setOption(model.link || model.key , m.id);
            else
              setOption(model.link || model.key , null);
           }
        }
      }
    }]);

    app.run(['$templateCache', function($templateCache) {
      $templateCache.put('template/slt/head.html','<th ng-repeat="row in sltHead" slt-filter = "row"></th>');
    }]);

    app.directive('sltHead', [function () {
      return {
        restrict: 'EA',

        scope: {
            'sltHead': '='
        },

        require: '^slt',
        replace: true,
        templateUrl: 'template/slt/head.html',

        link : function($scope, element, attrs, ctrl){
           var model = $scope.sltHead;
           $scope.model = model;
           $scope.$watch('sltHead' , function(nv,ov){
            console.log(nv,ov)
            if(nv)
              $scope.model = nv;
           },true)
           
        }
      }
    }]);
    //此指令依赖 jquery
    app.directive('sltCheck', [function() {
        return {
            restrict: 'A',

            require: '^slt',

            link: function($scope, element, attr , ctrl) {

                var toggle = function(v) {
                    var key = attr['sltCheck'] || 'data';
                    var data = $scope[key];

                    for (var i in data) {
                        data[i].checked = v;
                    }

                    $scope.$apply();
                }


                var header = element.find('tr th input[type="checkbox"]');
                
                
                ctrl.on('update',function(){
                  header.prop('checked' , false);
                });

                header.on('click', function() {
                    var el = angular.element(this);
                    if (el.prop('checked')) {
                        toggle(true);
                    } else {
                        toggle(false);
                    }

                });

                element.on('click', 'tr td input[type="checkbox"]', function(e) {
                    if (element.find('tr td input[type="checkbox"]:not(:checked)').length == 0) {

                        header.prop('checked', true);
                    } else {
                        header.prop('checked', false);
                    }
                })

            }
        };
    }]);
});