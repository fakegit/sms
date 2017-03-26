//详情页生成指令
define(['app'], function(app) {

    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/sl/detail.html',
            '<div ng-repeat="row in data"><div class="row"><div class="col-sm-{{12/row.length}}" ng-repeat="item in row"><div class="input-group {{item.require}}"><span class="input-group-addon">{{item.label}}</span><input type="text" class="form-control col-xs-9" ng-maxlength="{{item.maxlength}}" required placeholder="{{item.placeholder}}" ></div></div></div></div>');
    }]);


    app.directive('slData', ['$timeout', '$parse', function($timeout, $parse) {

        return {
            restrict: 'A',
            scope: {
                slData: '=',
            },
            templateUrl:'template/sl/detail.html',
            link: function($scope, element, attr, ctrl) {

                $scope.data = $scope.slData;
            }
        };
    }]);
})
