define(['app'], function(app) {

    app.factory('ProviderCommon',['$q','httpx',function($q , httpx){
   
        var providers = {};

        var post = httpx.post;

        var proxy_url = '';
        return {
            config : function(provider , actions){
                providers[provider] = actions;
            },

            get:function(provider){
                return providers[provider] ;
            },

            setProxy : function(v){
                proxy_url = v;
            },
            fetch: function(data){
                return post(proxy_url , data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            }
        }
    }]);

})
