define(['app' , 'db'], function(app , db ) {
	app.factory('api',[
		'$q',
		'store',
		'httpx',
		'core', 
		'ProviderCommon',
		'ProviderSolusVM',
		'ProviderVultr',
	function($q,store,httpx,core , providers){
		var local = store('localMode');

		var request = {};

		var get_ = httpx.curd.get;
		var post_ = httpx.curd.post;
		var proxy_url = '';
		var extend = core.extend;

		providers.setProxy(proxy_url);

		function proxy(url , fn){
			request[url] = fn;
		}

		var store = {};
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
                'PROVIDER':'/common/vps/provider/list'
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
                    httpx.curd.post(url).then(function(data) {

                        var values = [];
                        if( id == 'AREAS' ){
                            values = data.result
                        }
                        else if(data.result){
                            if( angular.isArray(data.result) ){
                                values = conv( data.result );
                            }
                        }
                        else{
                            values = []
                        }

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

		httpx.curd.fetch = function(params){
			return post_(proxy_url , params);
		}

		httpx.curd.get = function(url , params){
			if(request[url] && !params.__header__){
                return request[url](angular.copy(params)); //deferred.promise;
			}else{
				return get_(url , params)
			}
		}

		httpx.curd.post = function(url , params){
			if(request[url]){
                return request[url](angular.copy(params)); //deferred.promise;
			}else{
				return post_(url , params);
			}
		}

		//列出所有vps
		proxy('/vps/server/list', function(p){
			var page_num = p.page_num || 1;
			var page_size = p.page_size || 10;
			var start = page_size * (page_num - 1);
			var end = page_size * page_num;
			var where = {};
			if(p.provider) where.provider = p.provider;

			var data = db('vps').where(where).join(db('vps_provider').value() , {'id':'provider'},{'name':'provider_name'}).limit(start , end);
			
			var count = db('vps').count();
			var deferred = $q.defer();
            deferred.resolve({
				status : 0 , 
				result : {
					data : data , 
					count : count
				}
			});

            return deferred.promise;
		})

		proxy('/vps/server/get', function(p){
			var resp = db('vps').findOne(p);

			var deferred = $q.defer();
			deferred.resolve({
				status : 0 , 
				result : resp
			});

            return deferred.promise;
		})

		proxy('/vps/server/update', function(p){

			var deferred = $q.defer();
			var provider = providers.get(p.type);

			if(provider.init){
				httpx.curd.fetch(provider.init(p)).then(function(resp){
					var ret = resp;
					if(provider.format){
						ret = provider.format(ret , 'init');
					}

					extend(p , ret.result);

					db('vps').update({id:p.id},p);

                	deferred.resolve({
						status : 0 , 
						result : 'success'
					});
				});

			}else{
				db('vps').update({id:p.id},p);
				deferred.resolve({
					status : 0 , 
					result : 'success'
				});
			}

            return deferred.promise;


		})

		proxy('/vps/server/create', function(p){

			var deferred = $q.defer();
			var provider = providers.get(p.type);

			if(provider.create){
				//拉取额外信息
				provider.create(p).then(function(resp){
					
					if(!resp.status){
						console.log(resp.result);

						extend(p , resp.result);

						db('vps').insert(p);

	                	deferred.resolve({
							status : 0 , 
							result : 'success'
						});
					}else{
						deferred.resolve(resp);
					}

				});

			}else{
				db('vps').insert(p);
				deferred.resolve({
					status : 0 , 
					result : 'success'
				});
			}

            return deferred.promise;
		})

		proxy('/vps/server/remove', function(p){
			db('vps').remove(p);
			var deferred = $q.defer();
			deferred.resolve({
				status : 0 , 
				result : 'success'
			});

            return deferred.promise;
		})

		proxy('/vps/server/status', function(p){

			var p = db('vps').findOne(p);

			var deferred = $q.defer();
			var provider = providers.get(p.type);

			if(provider.status){
				//拉取额外信息
				provider.status(p).then(function(resp){
					if(!resp.status){

						extend(p , resp.result);

	                	deferred.resolve({
							status : 0 , 
							result : p
						});
					}else{
						deferred.resolve(p);
					}

				});

			}else{
				deferred.resolve({
					status : 0 , 
					result : p
				});
			}

            return deferred.promise;

			var resp = db('vps').findOne(p);
	
			var provider = providers.get(resp.type);
			
			var deferred = $q.defer();

			if(provider){
				var promises = [];
				promises.push( httpx.curd.fetch(provider.status(resp)));
				promises.push( httpx.curd.fetch(provider.info(resp)));
				$q.all(promises).then(function(resp){
					var result = resp[0].result + resp[1].result;
					var ret = {'status':0 , result:result};
					if(provider.format && result){
						ret = provider.format(ret , 'status');
					}

                	deferred.resolve(ret);
				})
			}else{
				deferred.resolve( {status:-1 , message:'无法解析此供应商'} );
			}
            
            return deferred.promise;
			
		})

		proxy('/vps/server/shutdown', function(p){
			var resp = db('vps').findOne(p);
	
			var provider = providers.get(resp.type);
			
			var deferred = $q.defer();

			if(provider){
				httpx.curd.fetch(provider.shutdown(resp)).then(function(resp){
					var ret = resp;
					if(provider.format){
						ret = provider.format(ret , 'shutdown');
					}
                	deferred.resolve(ret);
				});
			}else{
				deferred.resolve({status:-1 , message:'无法解析此供应商'});
			}
			
			return deferred.promise;
		})

		proxy('/vps/server/boot', function(p){
			var resp = db('vps').findOne(p);
	
			var provider = providers.get(resp.type);

			var deferred = $q.defer();

			if(provider){
				httpx.curd.fetch(provider.boot(resp)).then(function(resp){
					var ret = resp;
					if(provider.format){
						ret = provider.format(ret , 'boot');
					}
                	deferred.resolve(ret);
				});
			}else{
				deferred.resolve({status:-1 , message:'无法解析此供应商'});
			}
            
            return deferred.promise;
			
		})


		proxy('/vps/provider/create', function(p){
			p.count = 0;
			var deferred = $q.defer();
			var provider = providers.get(resp.type);

			if(provider.init){
				httpx.curd.fetch(provider.init(resp)).then(function(resp){
					var ret = resp;
					if(provider.format){
						ret = provider.format(ret , 'init');
					}
                	deferred.resolve(ret);
				});

			}else{
				db('vps_provider').insert(p);
				deferred.resolve({
					status : 0 , 
					result : 'success'
				});
			}

            return deferred.promise;
		})

		proxy('/vps/provider/list', function(p){
			var page_num = p.page_num || 1;
			var page_size = p.page_size || 10;
			var start = page_size * (page_num - 1);
			var end = page_size * page_num;

			var data = db('vps_provider').limit(start , end);
			var count = db('vps_provider').count();
			var deferred = $q.defer();
            deferred.resolve({
				status : 0 , 
				result : {
					data : data , 
					count : count
				}
			});

            return deferred.promise;
		})

		// 公共 列出商户id:name
		proxy('/common/vps/provider/list', function(p){

			var deferred = $q.defer();
            deferred.resolve({
				status : 0 , 
				result : db('vps_provider').value()
			});

            return deferred.promise;
		})

		

		proxy('/vps/provider/get', function(p){
			var resp = db('vps_provider').findOne(p);
			var deferred = $q.defer();
			deferred.resolve({
				status : 0 , 
				result : resp
			});
            return deferred.promise;
		})

		proxy('/vps/provider/update', function(p){
			/*p.count = db('vps').where({provider:p.id}).count();
			db('vps_provider').update({id:p.id},p);
			var deferred = $q.defer();
			deferred.resolve({
				status : 0 , 
				result : 'success'
			});

            return deferred.promise;

            p.count = 0;*/
			var deferred = $q.defer();
			var provider = providers.get(p.type);

			if(provider.init){
				httpx.curd.fetch(provider.init(p)).then(function(resp){
					var ret = resp;
					if(provider.format){
						ret = provider.format(ret , 'init');
					}
                	deferred.resolve(ret);
				});

			}else{
				db('vps_provider').insert(p);
				deferred.resolve({
					status : 0 , 
					result : 'success'
				});
			}

            return deferred.promise;

		})

		proxy('/vps/provider/remove', function(p){
			db('vps_provider').remove(p);
			var deferred = $q.defer();
			deferred.resolve({
				status : 0 , 
				result : 'success'
			});

            return deferred.promise;
		})
		return {
			dep : dep
		};
	}]);
})