/**
 * [模态框指令]
 * 
 * ng-confirm="{
 *     'title':'注意',
 *     'content':'确定删除角色？',
 *     'callback':remove
 * }"
 *
 * @param {object} option
 * 
 * ModalService.open(templateUrl , {
 *  //scope    
 * ).then(function(modal) {
 *      //result 结果 true , false
 *      // data 绑定的所有数据
 *      if( modal.result ){
 *   
 *      }
 * }); 
 *
 * TODO 需要测试下 有没有内存泄露
 */

define(['app'], function(app) {
    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('template/common/modal.html',
            '<div tabindex="0" class="modal fade in" ng-class={"modal-alert":page.alert} style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title" ng-bind="page.title"></h4></div><div class="modal-body text-center" ng-bind-html="page.content"></div><div class="modal-footer"><button ng-if="!page.alert" type="button" class="btn btn-default" data-dismiss="modal" ng-click="close(false)">取消</button><button type="button" class="btn btn-primary" ng-click="close(true)">确定</button></div></div></div></div>');
    }]);

    /**
     * [模态框控制器]
     */
    app.controller('ModalDefaultController', ['$scope','$options','$element', function($scope,$options,$element) {
        
        var close_from_key = 1;
        
        if($options.close_from_enter){
            angular.element(document).on('keyup' , bind); 
        }

        function bind(e){
            var keycode = window.event ? e.keyCode : e.which;
            if(keycode==13){
                $scope.close(true)
            }
        }
        $scope.$on("$destroy",function () {
            angular.element(document).off('keyup' , bind); 
        });

    }]);

    app.factory('ModalService', ['$templateRequest', '$q', '$compile', '$document', '$rootScope', '$controller', '$timeout', '$animate', function($templateRequest, $q, $compile, $document, $rootScope, $controller, $timeout, $animate) {

        function extend(src, dist) {
            for (var i in dist) {
                src[i] = dist[i];
            }
            return src;
        }

        function getTemplate(templateUrl) {
            var deferred = $q.defer();
            $templateRequest(templateUrl, true)
                .then(function(template) {
                    deferred.resolve(template);
                }, function(error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        function getScope(models){
            var m = $rootScope.$new();
            // mix in scope
            for(var i in models){
                m[i] = models[i];
            }

            return m;
        }

        function getData(obj){
            //排除 scope 的内部变量,以 $ 开头的字段， 
            //close 注入的关闭回调
            //unload 额外用于关闭前验证的回调
            //alert 用于 类型区分
            //page 单独处理
            //result 用于额外返回处理结果
            var exc = ['close', 'page' ,'unload','alert' , 'result'];
            var ret = {};
            for (var i in obj) {
                if (exc.indexOf(i) == -1) {
                    ret[i] = obj[i];
                }
            }

            //处理
            ret.page = obj.page || {};

            //特殊处理变量
            if( obj.title )  ret.page.title = obj.title;
            
            if( obj.content ) ret.page.content = obj.content;

            ret.page.alert = !!obj.alert;
            
            return ret;
        }


        function appendChild(child, parent) {
            var children = parent.children();
            if (children.length > 0) {
                return $animate.enter(child, parent, children[children.length - 1]);
            }
            return $animate.enter(child, parent);
        };

        function ModalService() {

            var stamp = 0;

            this.open = function(options , data , extra) {
                var tpl;
                if(angular.isObject(options)){
                    tpl = options.template || 'template/common/modal.html';
                    delete options.template;
                    extra = data || {};
                    data = options;
                }
                else{
                    tpl = options || 'template/common/modal.html';
                    data = data || {};
                    extra = extra || {};
                }

                if(data.unload)
                    extra.unload = data.unload;

                var body = angular.element($document[0].body);

                var deferred = $q.defer();

                var process = function(template){
                    var linkFn = $compile(template);

                    //申明scope
                    var modalModel = getData(data);

                    //添加 关闭回调
                    modalModel.close = function(result, delay) {
                        if (delay === undefined || delay === null) delay = 0;
                        $timeout(function() {

                            cleanUpClose(result);

                        }, delay);
                    }

                    
                    var modalScope = getScope(modalModel);


                    //关联视图模板的scope
                    var modalElement = linkFn(modalScope);

                    var parent = options.parent || body;

                    var rootScopeOnClose = $rootScope.$on('$stateChangeStart', cleanUpClose);

                    //$locationChangeSuccess


                    //申明模板视图
                    var vm = {
                        $scope: modalScope,
                        $element : modalElement,
                        $options: extra
                    };


                    //将自定的视图模板注入到控制器
                    var modalController = $controller('ModalDefaultController', vm);

                    //添加到dom中
                    appendChild(modalElement, parent);


/*                    var modal = {
                        controller: modalController,
                        scope: modalScope,
                        element: modalElement,
                        close: closeDeferred.promise,
                        data : vm.data
                    };*/

                    function closeModal(re){
                        deferred.resolve( re );

                        //closeDeferred.resolve(result);
                        $animate.leave(modalElement)
                            .then(function() {
                                modalScope && modalScope.$destroy();
                                vm.close = null;
                                deferred = null;
                                //modal = null;
                                vm = null;
                                modalElement = null;
                                modalScope = null;
                                modalController = null;
                            });
                        rootScopeOnClose && rootScopeOnClose();
                    }

                    /**
                     * false 时 取消关闭
                    **/
                    function cleanUpClose(result) {
                        var re = extend({result: result} ,  modalModel);

                        if(extra.unload){
                            var res = extra.unload(re);
                            if(typeof(res) == 'function'){
                                res(function(r){
                                    if(r !== false){
                                        closeModal(re);
                                    }
                                })
                            }
                            else if( typeof(res) == 'boolean'){
                                if(res !== false){
                                    closeModal(re);
                                }
                            }
                            else if( res === undefined ){
                                closeModal(re);
                            }
                        }else{
                            closeModal(re);
                        }
                        
                        /*if(data.unload){
                            if( data.unload(extend({result: result} ,  modalModel) ) === false){
                                return;
                            }
                        }
                        
                        closeModal();*/
                    }
                }

                if(tpl.indexOf('<')!=-1){
                    process(tpl);
                }
                else{
                    getTemplate(tpl).then(function(template) {
                        process(template);
                    });
                }
                

                return deferred.promise;
            }
        }
        return new ModalService();
    }]);

    app.directive('ngConfirm', ['$state', function($state) {
        return {
            restrict: 'A',
            scope: {
                'ngConfirm': '='
            },
            link: function($scope, element) {
                element.bind('click', function() {
                    $scope.open($scope.ngConfirm);
                })
            },

            controller: ['$scope', 'ModalService', function($scope, ModalService) {
                $scope.open = function(options) {
                    ModalService.open(options).then(function(modal) {
                        if(modal.result){
                            options.callback && options.callback(options.params);
                        }
                    });
                }
            }]
        };
    }]);
})
