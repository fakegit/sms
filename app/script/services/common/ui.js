define(['app'], function(app) {
    app.factory('ui', ['ngNotify', 'ModalService', function(ngNotify, ModalService) {

        function notify(v, type) {
            var status = {
                '1001': '请登录'
            }
            if (angular.isObject(v)) {
                if (v.returnCode && status[v.returnCode]) {
                    ngNotify.set(status[v.returnCode], 'error');
                }
            } else {
                ngNotify.set(v, type);
            }
        }

        function alert_(v , close_from_enter , callback) {
            ModalService.open({
                alert: true,
                content: v
            },{
                close_from_enter:!!close_from_enter
            }).then(function(resp){
                callback && callback();
            });
        }

        function error(resp , extra){
            var tips = '['+resp.status+']'+resp.statusText;
            if(extra) tips += '\n' + extra;
            
            alert_(extra);

        }

        function confirm(opts){
            opts = opts || {};
            var title = opts.title || '提示',
                content = opts.content || '确定执行此操作？';
            var buttons = opts.buttons || [{'title':'确定'},{'title':'取消'}];

            var html = '<div tabindex="0" class="modal fade in" style="display:block;"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" ng-click="close(false)"><span aria-hidden="true">×</span></button><h4 class="modal-title">'+title+'</h4></div><div class="modal-body text-center">'+content+'</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal" ng-click="close(false)">'+buttons[1].title+'</button><button type="button" class="btn btn-normal" ng-click="close(true)">'+buttons[0].title+'</button></div></div></div></div>';

            ModalService.open(html).then(function(resp){
                if(resp.result){
                    buttons[0].callback && buttons[0].callback();
                }
                else{
                    buttons[1].callback && buttons[1].callback();
                }
            });
        }
        return {
            notify : notify,
            alert : alert_,
            error : error,
            confirm:confirm,
            log : {
                error : error
            }
        }
    }]);
})