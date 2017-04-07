define(['app'], function(app) {
    app.factory('store', function() {
        var stack = {} , localStore = window.localStorage;

        function get_(key){
            if(stack[key] && (stack[key].expires == -1 || stack[key].expires < Date.now() ))
                return stack[key].data;
            else
                return null;
        }

        function set_(key , value , expires){
            var deadline = expires === undefined ? -1 : (expiresDate.now() + expires * 1000 )
            stack[key] = { expires : deadline , data : value};
        }

        function get_local(key){
            if(localStore[key]){
                return JSON.parse(localStore[key]);
            }
            else{
                return undefined;
            }
        }

        function set_local(key , value , override){
            override = override === undefined ? true : !!override;

            if( !( localStore[key] && override === false) ) {
                localStore[key] = JSON.stringify(value);
            }
            
        }

        function remove_local(key){
            if( localStore[key] ) {
                localStore.removeItem(key);
            }
        }
        function store(key , value , expires){
            if(arguments.length == 1){
                return get_(key);
            }
            else{
                set_(key , value , expires)
            }
        }

        store.get = get_;
        store.set = set_;
        store.local = {
            get:get_local , set:set_local , remove : remove_local
        }

        return store;
    });
})