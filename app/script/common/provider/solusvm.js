define(['app'], function(app) {

    app.factory('ProviderSolusVM',['ProviderCommon','$q',function(PC,$q){
   
        function size(v ,  unit , b){

            var d = 1;
            var units = {
                m : 1024*1024,
                g : 1024*1024*1024,
                t : 1024*1024*1024*1024
            }

            if(unit === undefined){
                if(v > units.t){
                    unit = 't';
                    d = units.t;
                } 
                else if(v > units.g) {
                    unit = 'g';
                    d = units.g;
                }
                else if(v > units.m) {
                    unit = 'm';
                    d = units.m;
                }
            }else{
                d = units[unit];
            }

            var unit_desc = unit.toUpperCase() + 'B';
            
            return Math.round( 1 * parseInt(v) / d) / 1 + (b ? unit_desc : 0);
        }


        function format_hdd(ret){
            if(ret.disk){
                console.log(ret.disk)
                ret.disk_total = size(ret.disk[0] , 'g');
                ret.disk_used = size(ret.disk[1] , 'g');
            }
        }


        function format(resp , type){
            if(resp.status){
                return resp;
            }

            var ret = resp.result;

            
            if(type == 'status'){
                format_hdd(ret);
            }

            else if(type == 'create'){
                return {status: 0 , result : format_info(ret) };
            }

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
            extra.type = 'solusvm';
            return extra;
        }
        
        PC.config('solusvm' , {
            create : function(resp){
                return PC.fetch( getOptions('create' , resp )).then(function(resp){
                    return format(resp , 'create');
                });
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

                return PC.fetch( getOptions('info') );

            },

            status : function(resp){
                return PC.fetch( getOptions('status' , resp )).then(function(resp){
                    return format(resp , 'status');
                });
            }
        })

        return {}
    }]);
})
