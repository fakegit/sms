define(function() {
    var server = '';

    var print_server = 'http://192.168.1.234:8000';


    window.coll = function(){
         var els = $('.content-wrapper [ng-model]');var data = {};
            console.log(els)
            for (var i = els.length - 1; i >= 0; i--) {
                var key = $(els[i]).attr('ng-model').replace('data.','');
                data[key] = '';
            }
            console.log( JSON.stringify(data))
    }
    
    return {
        getServer : function(){
            return server;
        },

        setServer : function(v){
            server = v;
        },

        getPrinterServer : function(){

        },

        setPrinterServer : function(){

        }
    }
})