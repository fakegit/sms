define(['app'], function(app) {
    
    app.factory('intercept', ['$state','store',function($state , store) {
        
        var listeners = {};

        function event_on(state_name, handler){
            
            listeners[ state_name ] = handler;
        }

        function event_off(state_name) {
            delete listeners[ state_name ];
        }

        function event_emit(state_name, next) {
            if( listeners[ state_name ] ){
                var res = listeners[ state_name ]();

                if(typeof(res) == 'function'){
                    res(function(r){
                        if(r !== false){
                            console.log(' goto ',next )
                            transtion(state_name,next);
                        }
                    })
                }
                else if( typeof(res) == 'boolean'){
                    if(res !== false){
                        transtion(state_name,next);
                    }
                }
                else if( res === undefined ){
                    transtion(state_name,next);
                }
            }
        }

        function transtion(state_name,next){
            event_off(state_name);
            $state.go(next.name,next.params);

        }

        function event_has(state_name){
            return state_name in listeners;
        }

        function init(){
            window.onbeforeunload = function(){
                var state_name = $state.current.name;
                if(listeners[ state_name ]){
                    var msg = listeners[ state_name ](true) || '确定关闭或刷新页面吗？';
                    return msg;
                };
            }
        }

        init();

        return {
            'on': event_on,
            'off': event_off,
            'has':event_has,
            'emit':event_emit
        }
    }]);
})