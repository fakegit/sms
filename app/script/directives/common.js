/*!
 * @desc 功能指令库
 * @date 2016/08/29
 */

define(['app'], function(app) {

    app.directive('onKeyenter', function() {
        return function(scope, element, attr) {
            element.bind("keyup", function(e) {
                var keycode = window.event ? e.keyCode : e.which;
                if(keycode==13){
                    scope.$apply(attrs.onKeyenter);
                }
            });
        };
    });

    app.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keyup", function (e) {
                var keycode = window.event ? e.keyCode : e.which;
                if(keycode === 13) {
                    scope.$apply(function (){
                        setTimeout(function(){
                            scope.$eval(attrs.ngEnter);
                        },0)
                        
                    });
                    
                    element.blur()
                    event.preventDefault();
                }
            });
        };
    });

    app.directive('slAutofocus', ['$timeout', function($timeout) {
      return {
        restrict: 'A',
        scope: {
            'slAutofocus':'='
        },
        link : function($scope, $element) {
          $scope.$watch('slAutofocus', function(nv , ov){
            if(nv){
                $timeout(function() {
                    $element[0].focus();
                });
            }
          })
          
        }
      }
    }]);

    app.directive('slReadyfocus', ['$timeout', function($timeout) {
      return {
        restrict: 'A',
        scope: {'slAutofocus':'='},
        link : function($scope, $element) {
          
        }
      }
    }]);

    app.directive('slToggle', function() {
        return {
            restrict: 'A',

            scope: {
                slToggle : '=',
                slToggleOptions:'=?'
            },

            template: "{{(slToggleOptions || {'1':'禁用','0':'启用'})[slToggle]}}",
        }
    });

    app.directive('slCollapse', ['$rootScope',function($rootScope) {
        return function(scope, element, attr) {
            
            $rootScope.$watch('collapse', function(v) {
                 element.toggleClass('sidebar-collapse' , !!v);
            });
        };
    }]);

    app.directive('slLoad', function() {
        
        return function(scope, element, attr) {
            
            scope.$watch(function(){
                return scope.page.loading;
            }, function(v) {
                 element.toggleClass('loading' , !!v);
            });
        };
    });

    app.directive('slDetail', function() {
        
        return function(scope, element, attr) {
            if(scope.page.view) element.addClass( 'view' );
        };
    });

    app.directive('slView', function() {
        return function($scope, element, attr) {
            $scope.$watch('page.view' , function(nv){
                if(nv) element.addClass( 'view' );
            })
            
        };
    });

    // 依赖 bootstrap css
    app.directive('slDropdown', ['$document', function($document) {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {
                var menu = element.find('.dd-menu'),
                    trigger = element.find('.dd-toggle');
                var capture = false;    
                trigger.on('click',function(e){
                    capture = true;
                    element.toggleClass('open');
                    //e.stopPropagation();
                });

                $document.on('click' , function(e){
                    if(!capture){
                        element.removeClass('open');
                    }
                    capture = false;
                    
                    //element.removeClass('open');
                    /*if( !(element[0].compareDocumentPosition(e.target) & 16) ){
                        if(flag)
                            element.removeClass('open');
                    }*/
                })
            }
        }
    }]);

    app.directive('ngBack', ['$window', function($window) {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {
                element.on('click', function() {
                    $window.history.back();
                });
            }
        };
    }]);


    //此指令依赖 jquery
    app.directive('slTableCheck', [function() {
        return {
            restrict: 'A',

            link: function($scope, element, attr) {

                var toggle = function(v) {
                    var key = attr['slTableCheck'] || 'data';
                    var data = $scope[key];

                    for (var i in data) {
                        data[i].checked = v;
                    }

                    $scope.$apply();
                }

                var header = element.find('tr th input[type="checkbox"]');
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

    app.directive('slBatch', ['ModalService', 'filterFilter', function(ModalService, filter) {
        return {
            restrict: 'A',
            scope: {
                'slBatch': '='
            },
            link: function($scope, element, attr) {
                element.bind('click', function() {

                    var items = $scope.slBatch.data;

                    var ignore = !!$scope.slBatch.ignore;

                    var options = {
                        'title': $scope.slBatch.title || '提示',
                        'content': $scope.slBatch.content || '确定要操作吗？',
                    }

                    var callback = $scope.slBatch.callback;

                    var key = $scope.slBatch.key || 'checked';

                    var select = $scope.slBatch.select || 'id';

                    var filter_opt = $scope.slBatch.filter;

                    var arr = []; // oms.coll(items , 'checked' , true);

                    if (filter_opt) {
                        items = filter(items, filter_opt);
                    }

                    for (var i in items) {
                        if (items[i][key]) arr.push(items[i][select]);
                    }

                    if (arr.length) {
                        if(ignore){
                            callback && callback(arr);
                        }
                        else{
                            ModalService.open(options).then(function(modal) {
                                if(modal.result){
                                    callback && callback(arr);
                                }
                            });
                        }
                        
                    } else {
                        ModalService.open({'title':'提示','content':'请选择条目',alert:true});
                        //callback && callback([]);
                    }
                })
            }
        };
    }]);

    app.directive('pageReset', ['$state', function($state) {
        return {
            restrict: 'A',

            link: function($scope, element) {
                // Prevent html5/browser auto completion.
                var input = element.find('.ac-trigger input');

                element.bind('click', function() {
                    $state.reload();
                })
            }
        };
    }]);
    app.directive('ngNumber', [function($state, $location) {
        return {
            scope: {
                ngModel: '=',
            },
            link: function(scope, element, attr) {

                element.bind('propertychange keyup change paste', function() {
                    var min = attr['min'],
                    max = attr['max'];
                    scope.$apply(function() {

                        var v = element.val();
                        v = parseInt(v.replace(/\D/g, ''));
                        if (!isNaN(v)) {
                            if (v < min) v = min;
                            if (v > max) v = max;
                        }
                        scope.ngModel = v;
                    });
                });



            }
        }
    }]);

    app.directive('nrHref', ['$state', '$location', function($state, $location) {
        return function(scope, element, attr) {
            element.bind('click', function() {
                if (attr.href == $location.path()) {
                    $state.reload();
                }
            })

        };
    }]);

    app.directive('ngVisible', function() {
        return function(scope, element, attr) {
            scope.$watch(attr.ngVisible, function(visible) {
                element.css('visibility', visible ? 'visible' : 'hidden');
            });
        };
    });

        /**
     * 生成导航面包屑
     */
    app.directive('slRadio', function() {
        return {
            restrict: 'A',
            scope : {
                'slRadio':'=',
                'slRadioOption':'=?'
            },
            template: '<label ng-repeat="row in slRadioOption"><input type="radio" class="sl-radio" ng-model="slRadio[model]" value="{{row.id}}" name="{{model}}" ><i>{{row.label}}</i></label>',
            link: function($scope , element, attr) {
                if(!$scope.slRadioOption){
                    $scope.slRadioOption = [
                        { label:'是', id : 1 },
                        { label:'否', id : 0 }
                    ]
                }
                $scope.model = attr['slRadioModel'];
            }
        }
    });

    /**
     * 生成导航面包屑
     */
    app.directive('slBreadcrumb', ['Session', '$state', '$timeout', function(Session, $state, $timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: '<ol class="breadcrumb"><li>首页</li><li ng-repeat="item in data"><span ng-if="!item.url">{{item.name}}</span><a ng-if="item.url" href="{{item.url}}">{{item.name}}</a></li></ol>',
            link: function($scope) {
                var process = function() {
                    var menu = Session.getPermissions();
                    if (menu.length == 0) {
                        $timeout(process, 100);
                    } else {
                        format(menu, location.pathname);
                    }
                }

                function hit(d, c) {
                    for (var i in d) {
                        if (c.indexOf(i) >= 0) {
                            return d[i];
                        }
                    }
                    return null;
                }

                function hit(cur , url){
                    for(var i in cur){
                        if( url.indexOf( cur[i].url ) >=0 ){
                            return cur[i];
                        }
                    }
                    return null;
                }

                function format(d,c){
                    var ret = [];
                    var cur = d, t;
                    while(cur){
                        t = hit(cur , c);
                        if(t){
                            cur = t.children;
                            ret.push(t);
                        }else{
                            cur = null;
                        }
                        
                    }
                    $scope.data = ret;
                }

                function format2(d, c) {
                    
                    var hash_id = {},
                        hash_url = {};
                    for (var i in d) {
                        hash_id[d[i].id] = d[i];
                        if (d[i].url) {
                            hash_url[d[i].url] = d[i];
                        }
                    }
                    var cur = hit(hash_url, c),
                        arr = [];
                        console.log(d,c,cur)
                    while (cur) {
                        arr.unshift(cur);
                        if (cur.parentId) {
                            cur = hash_id[cur.parentId];
                        } else {
                            cur = null;
                        }
                    }

                    console.log(arr)
                    $scope.data = arr;
                }

                process();
            }
        }
    }]);

    app.directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    scope.$apply(function() {
                        scope.fileread = changeEvent.target.files[0];
                        console.log(scope.fileread);
                        // or all selected files:
                        // scope.fileread = changeEvent.target.files;
                    });
                });
            }
        }
    }]);

    app.directive("nrUploadFile", ['Upload', function(Upload) {
        return {
            scope: {
                nrUploadFile: "=",
                nrFile: "=?"
            },
            template: '<div class="select"><span>选择文件</span><input type="file"></div><span ng-bind="nrUploadFile.name"></span><a href="{{nrFile}}" target="_blank" class="ori" ng-show="nrFile"><i class="fa fa-paperclip"></i>{{nrFile | filename}}</a>',
            link: function(scope, element, attributes) {
                element.addClass('upload-file');
                var name = attributes.name;
                var file = element.find('input[type="file"]');
                file.attr('name', name);
                file.bind("change", function(changeEvent) {
                    //Upload.rename(file, name)
                    scope.$apply(function() {
                        console.log(changeEvent.target.files[0])
                        scope.nrUploadFile = changeEvent.target.files[0];
                        // scope.nrUploadFile._name = name;
                        //Upload.rename( changeEvent.target.files[0] ,name);
                    });
                });

            }
        }
    }]);


    /*    app.directive('nrBg', function() {
            return function(scope, element, attrs) {
                attrs.$observe('nrBg', function(value) {
                    console.log(value)
                    element.css({
                        'background-image': 'url(' + value + ')',
                        'background-size': 'cover'
                    });
                    //element.css("background", "url(" +scope.nrBg+ ") center center / cover");
                });
            };
        });*/

    app.directive('nrThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            scope: {
                nrThumb: "="
            },
            template: '<canvas/>',
            link: function(scope, element, attrs) {


                if (!helper.support) return;


                var canvas = element.find('canvas');
                var reader = new FileReader();
                var width = element.width();
                var height = element.height();
                canvas.attr({ width: width, height: height });

                scope.$watch('nrThumb', function(file) {

                    if (!helper.isFile(file)) return;
                    if (!helper.isImage(file)) return;

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(file);
                });


                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var r = 1;
                    // if(this.width > width || this.height > height){
                    //     r = Math.min( width / height , this.width / this.height);
                    // }

                    var r = Math.min(width / this.width, height / this.height)
                    var w = this.width * r,
                        h = this.height * r;
                    var ix = (width - w) / 2,
                        iy = (height - h) / 2;

                    canvas[0].getContext('2d').clearRect(0, 0, width, height);

                    //将源图像所有内容都绘制出来
                    canvas[0].getContext('2d').drawImage(this, 0, 0, this.width, this.height, ix, iy, w, h);

                }
            }
        };
    }]);

    app.directive('nrUpload', ['$window', '$parse', function($window, $parse) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            scope: {
                nrUpload: "=",
                nrUploadBg: "="
            },
            template: '<span class="upload-btn" ng-visible="!nrUpload && !nrUploadBg">点击选择上传</span><input type="file" ><div class="thumb" style="background:url({{nrUpload ? \'\' :nrUploadBg}}) center center / contain no-repeat"><canvas></canvas></div>',
            link: function(scope, element, attrs) {

                var required = attrs['nrRequired'];
                var canvas = element.find('canvas'),
                    fileinput = element.find('input[type="file"]');

                var width = element.width(),
                    height = element.height();
                //console.log(JSON.stringify(attrs))

                if (required) {
                    fileinput.attr('required', 'required')
                }


                canvas.attr({ width: width, height: height });

                fileinput.bind("change", function(changeEvent) {
                    scope.$apply(function() {
                        scope.nrUpload = changeEvent.target.files[0];
                        render(scope.nrUpload);
                    });
                });

                if (!helper.support) return;

                var reader = new FileReader();


                function render(file) {
                    if (!helper.isFile(file) || !helper.isImage(file)) {
                        clear();
                    } else {
                        reader.onload = onLoadFile;
                        reader.readAsDataURL(file);
                    }

                }

                function clear() {
                    canvas[0].getContext('2d').clearRect(0, 0, width, height);
                }

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {

                    var r = Math.min(width / this.width, height / this.height)
                    var w = this.width * r,
                        h = this.height * r;
                    var ix = (width - w) / 2,
                        iy = (height - h) / 2;
                    canvas[0].getContext('2d').clearRect(0, 0, width, height);
                    canvas[0].getContext('2d').drawImage(this, 0, 0, this.width, this.height, ix, iy, w, h);
                }
            }
        };
    }]);
});
