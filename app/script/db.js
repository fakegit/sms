define(['app'], function(app) {
    var stack = {},
        localStore = window.localStorage;

    var saveFlag = false;

    var tick = 100;

    var db_name = 'SMS';

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
                ret.push(field ? (field == '@' ? parseInt(i) : obj[i][field]) : obj[i]);
            };
        }
        return ret;
    }

    function compare(a, b, af, bf) {
        var ret = [];
        for (var i in a) {
            for (var j in b) {
                if (a[i][af] == b[j][bf]) {
                    ret.push(b);
                }
            }
        }
        return ret;
    }

    function save() {
        localStore[db_name] = JSON.stringify(stack);
    }

    function read() {
        stack = JSON.parse(localStore[db_name] || '{}');
    }

    function extend(src, dist) {
        for (var i in dist) {
            if (i != 'id')
                src[i] = dist[i];
        }
        return src;
    }

    function isArray(v) {
        return Object.prototype.toString.call(v) === "[object Array]";
    }

    function isObject(v) {
        return Object.prototype.toString.call(v) === "[object Object]";
    }


    function copy(obj, target, deep) {　　
        if (!isArray(obj) && !isObject(obj)) {
            return obj;
        }
        var nullTarget = isArray(obj) ? [] : {};

        if (typeof(target) == 'boolean') {
            deep = target;
            target = nullTarget;
        }

        if (deep === undefined) {
            deep = true;
        }

        if (target === undefined) {
            target = nullTarget;
        }

        var name, src, copyIsArray, clone;

        　　　　
        for (name in obj) {　　　　　　　　
            src = obj[name];

            if (target === src) {　　　　　　　　　　
                continue;　　　　　　　　 }　　　　　　　　
            if (deep) {
                // 如果是数组
                copyIsArray = isArray(src);　　　　　　　　　　
                if (copyIsArray) {　　　　　　　　　　　　 copyIsArray = false;　　　　　　　　　　　　 // 判断被扩展的对象中src是不是数组
                    　　　　　　　　　　　　
                    clone = src && isArray(src) ? src : [];　　　　　　　　　　 } else {　　　　　　　　　　　　 clone = src;　　　　　　　　　　 }

                　　　　　　　　　　 // 递归调用继续进行深度遍历
                　　　　　　　　　　
                target[name] = copy(clone, deep);

                　　　　　　　　
            } else if (copy !== undefined) {　　　　　　　　　　 target[name] = src;　　　　　　　　 }　　　　　　
        }

        　　
        return target;
    };

    function process() {
        if (saveFlag) {
            saveFlag = false;
            save();
        }

        setTimeout(function() {
            process();
        }, 20);
    }

    function init() {
        read();
    }

    init();

    function db(name) {
        this.table = name;

        if (!stack[name]) {
            stack[name] = [];
        }

        this.data = stack[name];
    }


    db.prototype.find = function() {
        return this.data;

        /*var k = key.split('.');
        var o = stack;
        for (i = 0; i < k.length && o; i++) {
            o = o[k[i]];
        }
        return new db(o);*/

    }

    db.prototype.count = function() {
        return this.data.length;
    }

    db.prototype.where = function(obj) {
        this.data = filter(this.data, obj);
        return this;
    }

    db.prototype.find = function(obj) {
        return this.where(obj).value();
    }

    db.prototype.findOne = function(obj) {
        return this.where(obj).value()[0];
    }

    // left join table where 
    //db('vps_provider') , {'provider':'id'},{'name':'provider_name'}
    db.prototype.join = function(obj, cond, field) {
        var data = copy(this.data);
        for (var j in data) {
            var hit = {};
            for (var i in obj) {
                var flag = true;
                for (var k in cond) {
                    console.log(obj[i], k, data[j], cond[k])
                    if (obj[i][k] != data[j][cond[k]]) {
                        flag = false;
                        break;
                    }
                }
                    //一致
                if (flag) {
                    hit = obj[i];
                    break;
                }

            }

            for (var k in field) {
                data[j][field[k]] = hit[k];
            }
        }

        this.data = data;
        return this;

    }

    db.prototype.update = function(m, obj) {
        var m = filter(this.data, m, '@');
        for (var i = m.length - 1; i >= 0; i--) {
            extend(this.data[m], obj)
        }
        this.save();
        return this;
    }

    db.prototype.insert = function(d) {
        var id = this.data.length + 1;
        if (this.data.length) {
            id = this.data[this.data.length - 1].id + 1;
        }
        d.id = id;
        this.data.push(d);
        this.save();
    }

    db.prototype.remove = function(m) {
        var data = filter(this.data, m, '@');
        for (var i = data.length - 1; i >= 0; i--) {
            this.data.splice(data[i], 1);
        }

        this.save();
    }

    db.prototype.save = function() {
        // saveFlag = true;
        save();
        return this;
    }

    db.prototype.limit = function(start, end) {
        // console.log(copy(this.data))
        return this.data ? copy(this.data.slice(start, end)) : [];
    }

    db.prototype.value = function() {
        return copy(this.data);
    }

    return function(table) {
        return new db(table);
    }

})
