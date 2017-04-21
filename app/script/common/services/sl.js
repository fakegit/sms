define(['app','config'], function(app , config) {
    app.factory('sl', ['$state','core','ui','httpx','intercept','store','print','api', function($state, core, ui , httpx ,intercept, store , print , api) {

        var options = { loadingLatency: 100 };

        var extend = core.extend;

        var local = {};

        core.extend( local , core );

        core.extend( local , ui );

        core.extend( local , api);
        
        core.extend( local , httpx );

        core.extend( local , {
            
            'reload': function() {
                $state.reload();
            },

            'go':function(name , params){
                $state.go(name , params || {});
            },

            'unload':intercept,

            'options':options,

            'store': store,

            'printer' : print,

            'getServer':function(){
                return config.getServer();
            }
        });

        local.store['localMode'] = 1;

        local.dep = api.dep;
        
        return local;
    }]);

})
