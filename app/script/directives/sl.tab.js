define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/sl/tab.html',
            '<div class="tab"><ul><li ng-repeat="row in tabs"><a ng-click="toggle($index)" ng-class="{active:row.active}">{{row.title}}</a></li></ul></div><div class="content" ng-transclude></div>');
    }]);


    app.directive('slTab', [function() {
        return {
            restrict: 'A',

            templateUrl: 'template/sl/tab.html',

            transclude: true,

            link: function ($scope, $element) {
               
                var els = $element.find('div[title]');
                var data = [];
                for (var i = 0; i < els.length; i++) {
                    var el = angular.element(els[i]);
                    el.css('display', 'none');
                    data.push({ title: el.attr('title'), el: angular.element(el) , active:false })
                }

                function toggle(id) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        if (i == id) {
                            data[i].el.css('display', 'block');
                            data[i].active = true;
                        } else {
                            data[i].el.css('display', 'none');
                            data[i].active = false;
                        }
                    }
                    
                };

                $scope.tabs = data;

                $scope.toggle = toggle;


                toggle(0);
            }
        }
    }]);
});
