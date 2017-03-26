define(['app' , 'config'], function(app , config) {
    
    app.factory('httpx', ['$http', '$q', 'Upload', '$state','core','store',function($http, $q, Uploader, $state , core , store) {
        var getServer = config.getServer;

        function url_(url, paras) {
            if (/\:\/\//.test(url)) {
                return url.replace(/local\:\/\/([\w\W]+)/g,'/data/$1.json');
            } else {
                if (angular.isObject(paras)) {
                    url += '?' + serialize(paras);
                }
                return getServer() + url; //.replace(/\./g, '/');
            }

        }

        function get_(url, data) {
            var params = (angular.isString(data) ? data : serialize(data));
            return $http.get(
                url_(url) + (params ? ('?'+params) : '')
            );
        }

        function post(url, data, format) {
            return http('POST', url, data, format);
        }

        function put(url, data) {
            return http('PUT', url, data);
        }

        function http(type, url, data, format) {
            if(format == undefined) format = 'urlencode';

            var req = {
                method: type,
                url: url_(url),
                data : data
            }

            if(format == 'urlencode'){
                req.data = serialize(data);
                req.headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
            }
            else if(format == 'xml'){
                req.headers = { 'Content-Type': 'text/xml' };
            }
            else if(format == 'json'){
                req.headers = { 'Content-Type': 'application/json' };
            }
            return $http(req);
        }

        function upload(url, data) {
            return Uploader.upload({
                url: url_(url),
                data: data,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            });
        }

        function download(u , data){
            var params = (angular.isString(data) ? data : serialize(data));
            var url = url_(u) + (params ? ('?'+params) : '');
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = url;
            //save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
        }

        //TODO input[type=file] 需要处理
        function serialize(obj) {
            var arr = [];
            for (var i in obj) {
                arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]))
            }
            return arr.join('&');
        }


        /**
         * 获取依赖数据, 包含缓存
         * @param  {[type]} v [description]
         * @return {[type]}   [description]
         */

        function dep(conds){
            if ( !store['deps'] ){
                store['deps'] = {};
            }

            var cache = store['deps'];

            cache['BUSINESS_TYPE'] = [
                {id:'1',label:'B2C'},
                {id:'2',label:'B2B'}
            ];

            var config_urls = {
                 //仓库   
                'WAREHOUSE':'/base/warehouse/getwarehousemap',
                'ZONE_PUT':'/base/warehousezone/getzonemap?type=1',
                'ZONE_PICK':'/base/warehousezone/getzonemap?type=2',
                //区域
                'AREA':'/sys/area/queryAllAreaInfo',
                //商家
                'OWNER':'/base/owner/getEnabledOwner',
                //承运商
                'LOGISTICS':'/base/logistics/queryAll',
                //店铺
                'SHOP':'/base/owner/getAllShop',
                'BATCH':'/base/lotTemplate/page',
                '':'/inv/lot/page',
                '_':'/sys/type/queryTypeByCodeId?codeId='
            };
            var task = []; 
            var index = 0 , task_length;

            var deferred = $q.defer();

            function process() {
                var id = task[index].id;
                var code = task[index].code;
                var url = code.indexOf('/') >= 0 ?  code :
                        (config_urls[code] || (config_urls['_'] + code));

                if(cache[code]){
                    conds[id] = angular.copy( cache[code] );
                }else{
                    post(url).then(function(d) {
                        var data = d.data;
                        var values = [];
                        if( id == 'AREAS' ){
                            values = data.returnVal
                        }
                        else if(data.returnVal){
                            if( angular.isArray(data.returnVal) ){
                                values = conv( data.returnVal );
                            }
                            else{
                                values = conv( data.returnVal.list || [])
                            }
                        }
                        else{
                            values = conv( data.list || [])
                        }
                        /*var values = 
                            id == 'AREAS' ? 
                            data.returnVal : 
                            conv(
                                angular.isArray(data.returnVal) ?
                                (data.returnVal ? data.returnVal.list : data.returnVal) || data.list 
                            );*/

                        //缓存
                        cache[code] = values;
                        // console.log(id,data,values);
                        // 赋值
                        conds[id] = angular.copy( values );

                        if(++index < task_length){
                            process();
                           
                        }else{
                            //处理
                            deferred.resolve({'status':0 , 'message':'success'})
                        }
                    },function(){
                        // 发生错误
                        deferred.resolve({'status':1 , 'message':'获取 ['+id+'] 条件时发生错误'})
                    });
                }
                        

            }
            

            //TODO 转换键值对 为 id:label
            function conv(d){
                if(d){
                    for (var i = d.length - 1; i >= 0; i--) {
                        var value = d[i].childCodeId || d[i].id;
                        var raw = angular.copy(d[i]);
                        if(!/\D+/.test(value)){
                            value = parseInt( value );
                            if(isNaN(value)) value = 0;
                        }
                        d[i].id = value;

                        d[i].label = d[i].childCodeC || d[i].name;
                        d[i].raw = raw;
                    }
                    return d;
                }
                else{
                    return [];
                }
                
            }

            // 处理任务
            for(var i in conds){
                var code = conds[i];

                if(typeof(code) == 'string'){

                    if(  cache[ code ] ){
                        conds[i] = angular.copy( cache[ code ] );
                    }else{
                        task.push({id:i ,code: code});
                    }   
                    
                }
            }

            task_length = task.length;
            //console.log(task_length)

            if(task_length == 0){
                deferred.resolve({'status':0 , 'message':'success'})
            }else{
                process();
            }
            
            return deferred.promise

        }

        dep.conv = function(data , deps , id , label){
            id = id || 'id' ;
            label = label || 'label';

            if(typeof(data) == 'string' || typeof(data) == 'number'){
                var hash = core.hash(deps, id , label);
                return hash[data];
            }

            var is_obj = false;
            if(angular.isArray(data) == false){
                is_obj = true;
                data = [data];
            }

            for(var key in deps){
                var hash = core.hash(deps[key] , id , label);
                for(var i in data){
                    data[i][key+'Name'] = hash[ data[i][key] ];
                }
            }
            
            return is_obj ? data[0] : data;
        }

        dep.update = function(deps){
            if( !angular.isArray(deps) ){
                deps = [deps];
            }
            var deps_store = store['deps'];
            if( deps_store ){
                for(var i in deps){
                    delete deps_store[deps[i]];
                }
            }
            
        }

        var curd = {
            get: function(url , data) {
                return get_(url, data).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    //console.log('Error while get: from '+url,'params:',data)
                    return $q.reject(errResponse);
                });
            },
            post: function(url, data , format) {
                return post(url, data , format).then(function(response) {
                    return response.data;
                }, function(errResponse) {
                    return $q.reject(errResponse);
                });
            },

            upload : function(){

            },

            download : download
        }

        return {
            'serialize': serialize,
            'dep': dep,
            'curd':curd,
            'upload': upload,
            'get': get_,
            'post': post,
            'put': put,
            'url': url_,
        }
    }]);
})