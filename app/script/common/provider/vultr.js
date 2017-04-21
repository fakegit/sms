define(['app'], function(app) {

    app.factory('ProviderVultr',['ProviderCommon','$q',function(PC,$q){
        var base = 'https://api.vultr.com';

        function format(resp , type){

            if(type == 'create'){
                var result = resp.result;
                var ret = [];
                for(var i in result){
                    ret.push( result[i] );
                }
            }
            console.log(ret)
            return {status:0 , result:ret};
        }

        function getOptions( act ,opt , extra){
            var url = opt.api_url;
            var url = url + (/\/$/.test(url) ? '' : '/') + 'api/client/command.php';

            extra = extra || {};
            extra.action = act;
            extra.url = url;
            extra.hash = opt.api_hash;
            extra.key = opt.api_key;
            return extra;
        }
        
        PC.config('vultr' , {

            create : function(resp){
                return {
                    'url' : base + '/v1/server/list',
                    'key': resp.api_key,
                    'type':'vultr'
                }
            },

            format : function(d , type){
                return format(d , type) ;
            },

            boot : function(resp){
                return getOptions('boot' , resp);
            },

            reboot : function(resp){
                return getOptions('reboot' , resp);
            },

            shutdown : function(resp){
                return getOptions('shutdown' , resp);
            },

            info : function(resp){
                var extra = {
                    hdd : true , 
                    mem : true,
                    bw : true,
                }
                return getOptions('info' , resp , extra);

            },

            status : function(resp){
                return getOptions('status' , resp);
            }
        })

        return {}
    }]);
    
})
