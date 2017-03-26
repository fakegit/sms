define(['app','layout'], function(app,layout) {

    return app.controller('IndexCtrl', ['$scope','$rootScope','sl','$document','AuthService','Session' ,'IndexService', function($scope,$rootScope,sl,$document, auth , session , service) {

        var vm = $scope , store = sl.store;

        var page = {
            loading:true , 
            menu:[],
            submenu : [],
            current_menu:''
        };

        sl.extend(vm , {
            signout : signout,
            collapse : collapse,
            page : page
        });

        function signout(){
            auth.signout();
        }

        function collapse(){
            $rootScope.collapse = !$rootScope.collapse;
            store.local.set('collapse',$rootScope.collapse);
        }

        function init(){
            $rootScope.collapse = store.local.get('collapse') || false;

            auth.init().then(function(resp){
                
                page.menu = resp;
                vm.data = session.get();
                vm.loading = false;

                //current_menu = page.menu[0];

                setTimeout(function(){
                    layout();
                },100)
            },function(){
                console.log('error');
            });

            // url 变化
            $rootScope.$watch('url' , function(nv){
                var url = nv;
                var cat = _getCat(url);
                if(cat>=0){
                    _setCat( page.menu[cat] , url);
                } 
            })

        }

        /**
         * 根据url获取一级分类
         * @param  {[type]} url [description]
         * @return {[type]}     [description]
         */
        function _getCat(url){
            var menu = page.menu;
            for(var i in menu){
                if(url.indexOf(menu[i].url) != -1){
                    return i;
                }
            }
            return -1;
        }

        function _setCat(item , url){
            page.submenu = item.children;
            page.current_menu = item.url;
            page.current_submenu = url;


        }

        // function init2(){
        //     auth.init().then(function(resp){

        //         if(!resp.returnCode){
        //             if(resp.returnVal){
        //                 vm.menu = setMenu(resp.returnVal);
        //                 vm.data = session.get();
        //                 document.title = "NR WMS";
        //             }
        //             vm.isLoading = false;
        //         }
        //         setTimeout(function(){
        //             layout();
        //         },100)
        //     },function(){
        //         console.log('error');
        //     });

        // }

        // function setMenu(data){
        //     data.sort(function(a,b){
        //         if(a.level == b.level){
        //             return a.orderIndex > b.orderIndex ? 1 : -1;
        //         }else{
        //             return a.level > b.level ? 1 : -1;
        //         }
        //     });

        //     var obj = {}
        //     for(var i in data){
        //         var cur = data[i],
        //             id = cur.id , 
        //             parent = cur.parentId;

        //         if( parent && obj[parent]){
        //             if( !obj[parent]['children'] ){
        //                 obj[parent]['children'] = [cur];
        //             }else{
        //                 obj[parent]['children'].push( cur )
        //             }
        //         }
        //         else{
        //            obj[id] = cur;
        //         }
        //     }

        //     return angular.copy(obj);
        // }

        init();
    }]);
})
