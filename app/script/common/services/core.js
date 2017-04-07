define(['app'], function(app) {
    app.factory('core', function() {
        //比较两个dom的相对位置
        
        function comparePosition(a, b) {
            return a.compareDocumentPosition ?
                a.compareDocumentPosition(b) :
                a.contains ?
                (a != b && a.contains(b) && 16) +
                (a != b && b.contains(a) && 8) +
                (a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
                    (a.sourceIndex < b.sourceIndex && 4) +
                    (a.sourceIndex > b.sourceIndex && 2) :
                    1) :
                0;
        }

        function contain(a, b) {
            return !!(comparePosition(a, b) & 16);
        }


        function extend(src, dist) {
            for (var i in dist) {
                src[i] = dist[i];
            }
            return src;
        }

        // 将键收集为数组
        function key(obj) {
            var ret = [];
            for (var i in obj) {
                ret.push(i);
            }
            return ret;
        }

        //将值收集为数组, 如果 obj 是数组对象时，则从此数组对象中 取出 field 字段并组成新数组
        //如果 field = true ,则表示去重
        // obj, field, dup
        // obj, dup
        function coll(obj, field, dup) {
            var ret = [] , h = {};
            dup = typeof(field) === 'boolean';

            for (var i in obj) {
                if (obj[i]) {
                    ret.push(field ? obj[i][field] : obj[i]);
                    if(dup)
                        h[ obj[i] ] = 1;
                }
            }
            return dup ? key(h) : ret;
        }



        // [{key:,value:}] -> raw ? obj[key] = value : obj[key] = obj[i];
        function hash(data, key, value) {
            var obj = {};

            key = key || 'key';
            for (var i in data) {
                if (key in data[i])
                    obj[data[i][key]] = value ? data[i][value] : data[i];
            }
            return obj;
        }

        /**
         * filter特殊实现，取出对象数组中 满足要求的对象，组合成新数组
         * @param  {[type]} src   [源]
         * @param  {[type]} cond  [条件]
         * @param  {[type]} value [值]
         * @return {[type]} field [输出字段]
         */
        function select(src, cond, value, field) {
            var arr = [];
            for (var i in src) {
                if (src[i][cond] == value) {
                    arr.push( field ? src[i][field] : src[i] );
                }
            }
            return arr;
        }

        /**
         * 过滤对象
         * @param  {[object]} obj [对象]
         * @param  {[object]} m   [过滤条件]
         * @return {[array]}     []
         */
        function filter(obj, m, field) {

            var ret = [];
            for (var i in obj) {
                var r = true;
                for (var j in m) {
                    if (obj[i][j] != m[j]) {
                        r = false;
                        break;
                    }
                }
                if (r) {
                    ret.push( field ? obj[i][field] : obj[i] );
                };
            }
            return ret;
        }

        // 从 src 中遴选出 dist 所需的字段;
        function pick(src_t, dist) {
            var ret = [];
            var isarr = angular.isArray(src_t);
            //if(angular.isArray(src)){
            var src = !isarr ? [src_t] : src_t;

            for (var j = 0, l = src.length; j < l; j++) {
                var obj = {};
                for (var i in dist) {
                    obj[i] = src[j][i] === null ? dist[i] : src[j][i];
                }
                ret.push(obj);
            }

            return isarr ? ret : ret[0];
        }

        /**
         * 将数组转换为 树
         * @return {[type]} [description]
         */
        function tree(data, id, parentId, children) {
            var obj = {},
                root = [];
            var field_id = id || 'id',
                parentId = parentId || 'parentId',
                children = children || 'children';

            for (var i in data) {
                obj[data[i][field_id]] = data[i];
                if (children in data[i]) {
                    delete data[i][children]
                }
            }

            for (var i in data) {
                var pid = data[i][parentId],
                    id = data[i][field_id];
                if (pid == 0) {
                    root.push(data[i]);
                } else {
                    if (obj[pid]) {
                        if (!obj[pid][children]) {
                            obj[pid][children] = [];
                        }
                        obj[pid][children].push(data[i]);
                    }
                }
            }
            return root;
        }

        function unset(v){
            return (v === undefined || v === null) ? '' : v;
        }


        //格式化提交数据
        function dig(obj , assoc) {
            var ret = {};
            for (var i in obj) {
                var key = i,
                    value = obj[i];
                // 数组 转 List<>
                if (angular.isArray(value)) {
                    for (var j = 0, l = value.length; j < l; j++) {
                        if (angular.isObject(value[j])) {
                            for (var k in value[j]) {
                                ret[key + '[' + j + '].' + k] = unset(value[j][k]);
                            }
                        } else {
                            ret[key + '[' + j + ']'] = unset(value[j]);
                        }
                    }
                }
                // 对象 转 object
                else if (angular.isObject(value)) {
                    for (var k in value) {
                        if(assoc === true){
                            ret[key + '[' + k + ']'] = unset(value[k]);
                        }else{
                            ret[key + '.' + k] = unset(value[k]);
                        }
                    }
                } else {
                    ret[key] = unset(value);
                }

            }
            return ret;
        }

        function checkbox(v , obj){
            var ret = angular.copy(obj);
            var h = {};

            if(typeof(v) == 'string') v = v.split(',');
            
            for(var i in v) h[v[i]] = 1;
            
            for (var i = ret.length - 1; i >= 0; i--) {
                if(h[ret[i].id]){
                    ret[i].checked = true;
                }
            }

            return ret;
        }

        function pushIndex(data , key){
            key = key || '@';
            for (var i = data.length - 1; i >= 0; i--) {
                data[i][key] = i + 1;
            }
        }

        function fix0(v) {
            return (v <= 9) ? ('0' + v) : v;
        }

        function conv_time(t , date_only) {
            // var d = new Date( Number(t) );

            if( !t ) return t;
            var d = new Date( t );
            var date = d.getFullYear() + '-' +
                    fix0(d.getMonth() + 1) + '-' +
                    fix0(d.getDate());
            var time = fix0(d.getHours()) + ':' +
                    fix0(d.getMinutes()) + ':' +
                    fix0(d.getSeconds());

            return  date_only ? date : ( date + ' ' + time) ;
        }

        function timestamp(data , fields){
            if(angular.isArray(data)){
                for(var i in data){
                    for( var j in fields){
                        data[i][fields[j]] = conv_time( data[i][fields[j]] );
                    }
                }
            }
            else if(angular.isObject(data)){
                for( var j in fields){
                    data[fields[j]] = conv_time( data[fields[j]] );
                }
            }
            else{
                return conv_time(data , !!fields)
            }
            
        }

        /**
         * 从obj对象中挖掘数据
         * @return {[type]} [description]
         */
        function grab(data , fields){
           
            for(var i in fields){
                var key = fields[i];
                var deep = fields[i].split('.');

                for(var j in data){
                    var obj = data[j];
                    for(var k =0 ; k<deep.length;k++){
                        if (obj[ deep[k] ]) {
                            obj = obj[ deep[k] ];
                        }
                        else {
                            obj = '';
                        }
                    }
                    data[j][key] = obj;
                }

            }
            return data;
        }

        //
        function convToSuggest(data , raw){
            data = data || [];
            var ret = [] , raw = !!raw;
            for(var i = 0, l =data.length;i<l;i++ ){
                ret[i] = {id : data[i].id , label:data[i].name};
                if(raw) ret[i].raw = data[i];
            }
            return ret;
        }

        function clean(data){
            var ret = {};
            for(var i  in data){
                if(data[i]) ret[i] = data[i];
            }
            return ret;
        }

        function speek(text){
           var newUtterance = new SpeechSynthesisUtterance();
           newUtterance.text = text;
           window.speechSynthesis.speak(newUtterance);
        }

        function saveAs(blob, filename) {
            var type = blob.type;
            var force_saveable_type = 'application/octet-stream';
            if (type && type != force_saveable_type) {
                // 强制下载，而非在浏览器中打开
                var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
                blob = slice.call(blob, 0, blob.size, force_saveable_type);
            }
            var url = URL.createObjectURL(blob);
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = url;
            save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
            URL.revokeObjectURL(url);
        }

       
        function saveFile(cnt , filename){
            var mime = {
                'xml':'application/xml'
            }

            var t = filename.split('.');

            var ext = t[t.length-1];

            var type = mime[ext] || 'text/plain';
            
            var b = new Blob([cnt] , {"type":type});

            saveAs(b , filename);
        }

        function now(){
            return conv_time( Date.now() );
        }
        return {
            'comparePosition':comparePosition,
            'contain':contain,
            'extend': extend,
            'key': key,
            'coll': coll,
            'hash': hash,
            'select': select,
            'filter': filter,
            'pick': pick,
            'tree': tree,
            'checkbox':checkbox,
            'dig' : dig,'clean':clean,

            'pushIndex':pushIndex,
            'timestamp':timestamp,
            'format_time':conv_time,
            'now':now,
            'format':{
                timestamp:timestamp,
                grab:grab,
                index:pushIndex,
                suggest:convToSuggest
            },
            'speek':speek,
            'saveFile':saveFile
        }
    });

})
