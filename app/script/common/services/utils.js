define(['app'], function(app) {

    app.factory('utils', ['$state', function($state) {
        

        //根据state name 猜测url
        function getFullUrl(name){
            var names = name.split('.'), full = '';

            for (var i = 1,l=names.length; i<=l;i++ ) {
                full += $state.get( names.slice(0,i).join('.') ).url;
            }

            return full;
        }

        function dom_create(tag , cls , style , par ,data){
            var el = document.createElement(tag || 'div');
            el.style = style || '';
            if(cls)
                el.className = cls;
            if(par)
                par.appendChild(el);
            if(data){
                for(var i in data){
                    el.setAttribute(i , data[i]);
                }
            }
            return el;
        }

        return {
            getFullUrl: getFullUrl,
            dom : {
                create : dom_create
            }
        }
    }])
})
