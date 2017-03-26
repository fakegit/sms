var gulp = require('gulp');
var requirejs = require('gulp-requirejs');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var del = require('del');
var cleancss = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');
var rjs = require('gulp-requirejs-optimize');
var addsrc = require('gulp-add-src');
var rep = require('gulp-replace');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var scp = require('gulp-scp2');
var ftp = require('gulp-ftp');
var gutil = require('gulp-util');

var config = {
    dist: './build/',
    html: {
        src: './app/*.html',
        dist: './build/',
    },
    js: {
        src: './app/script/',
        mod: 'main',
        lib: './app/lib/require.js',
        dist: './build/script/',
    },
    tpl: {
        src: './app/**/view/**/*.html',
        dist: './app/script/',
        filename: 'tpl.js'
    },

    css: {
        src: './build/_/css/base.less',
        // font:'./app/**/*.{woff,woff2,ttf}',
        dist: './build/css',
        src_pre: './app/**/*.{css,less}',
        dist_pre: './build/_',
        prefixer: ['last 10 version']
    },

    res: {
        src: [
            './app/**/img/**/*.*',
            './app/*.config',
            //"./app/**/AdminLTE/**/app.js",
            './app/**/font-awesome/**/*.{woff,woff2,ttf}',
            '!./app/**/lib/**/*.{png,jpg,jpeg,gif}'
        ]
    },

    server: {
        host: '114.215.209.64',
        username: 'root',
        password: 'Ttyc123456',
        dest: '/usr/local/nrwms_fe/web/app'
    },
    server_dev: {
        host: '192.168.1.92',
        port: 21,
        user: 'administrator',
        pass: '666666',
        remotePath:'/wms/app'
    },
    server_prod: {
        /*host: '114.55.149.118',
        port: 5555,
        user: 'webserver',
        pass: 'Luj9uHH7vADT6vFz'*/
    },
    stamp: Date.now()
}


gulp.task('js:rjs', ['js:pre'], function() {
    /*copy */
    var cfg = config.js.src + config.js.mod + '-build.js';
    return gulp.src(cfg)
        .pipe(rjs({
            //include:[config.src.js,config.tpl_file],
            uglify: {
                mangle: false //不混淆
            },
            mainConfigFile: cfg
        }))
        //路路由中去除 view 的 timestamp 
        .pipe(rep(/\?([\'\"]+)\s*\+\s*Date\.now\(\)/g,'$1'))
        
        .pipe(rename({
            basename: config.js.mod,
            //suffix: '-' + config.stamp
        }))
        .pipe(gulp.dest(config.js.dist));
});

//预处理入口文件 main.js 和 路由文件 route.js
gulp.task('js:pre', ['tpl'], function() {
    gulp.src(config.js.src + config.js.mod + '.js')
        .pipe(rep(/require\(\[([^\]]+)/, function($0, $1) {
            var url = config.tpl.filename;
            // console.log($1);
            return "require([" + $1 + ",'" + url + "'";
        }))
        .pipe(rep(/([\'\"])route([\'\"])/,'$1route_build$2'))
        .pipe(rename({
            suffix: '-build'
        }))
        .pipe(gulp.dest(config.js.src));

    return gulp.src(config.js.src + 'route.js')
        .pipe(rep(/\?([\'\"]+)\s*\+\s*Date\.now\(\)/g,'$1'))
        .pipe(rename({
            suffix: '_build'
        }))
        .pipe(gulp.dest(config.js.src));    
})


//复制 require.js 文件
gulp.task('js', ['js:rjs'], function() {
    //return gulp;
    return gulp.src(config.js.lib)
        .pipe(rep('lib/require', 'script/require'))
        .pipe(gulp.dest(config.js.dist));
});

//css 副本
gulp.task('css:pre', ['clean:start'], function() {
    return gulp.src(config.css.src_pre)
        .pipe(gulp.dest(config.css.dist_pre))
});


gulp.task('css', ['css:pre'], function() {
    return gulp.src(config.css.src)
        .pipe(less())
        .pipe(cleancss({
            processImport: true,
            //是否开启高级优化（合并选择器等
            //advanced: false,
            //'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            compatibility: '*',
            keepBreaks: false, //[是否保留换行]
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
            keepSpecialComments: '*',
            processImportFrom: ['!fonts.googleapis.com']
        }))
        //.pipe(less())
        .pipe(autoprefixer({ browsers: config.css.prefixer }))

        // issue: https://github.com/jakubpawlowicz/clean-css/issues/789
        .pipe(rep(/(__ESCAPED_SOURCE_END_CLEAN_CSS__|__ESCAPED_SOURCE_CLEAN_CSS[\d]+__)/g, ''))

        /*.pipe(rename({
            suffix: '-' + config.stamp
        }))*/
        .pipe(gulp.dest(config.css.dist))
});
gulp.task('html', ['clean:start'], function() {
    return gulp.src(config.html.src)
        .pipe(rep('lib/require', 'script/require'))
        .pipe(rep('script/main.js', 'script/main.js?' + config.stamp))
        .pipe(rep('css/base.css', 'css/base.css?' + config.stamp))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(config.html.dist))
});

// 编译模板
gulp.task('tpl', ['clean:start'], function() {
    return gulp.src(config.tpl.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(templateCache({
            filename: config.tpl.filename,
            templateHeader: 'define(["app"], function(app) {app.run(["$templateCache", function($templateCache) {',
            templateFooter: '}])});'
        }))
        .pipe(gulp.dest(config.tpl.dist))
});

gulp.task('res', ['clean:start'], function() {
    return gulp.src(config.res.src)
        .pipe(gulp.dest(config.dist));
});

gulp.task('clean:start', function(cb) {
    return del('./build/*', cb);
});

gulp.task('publish', ['clean:end'], function() {
    
    var paras = config.server;
    paras.watch = function(client) {
        client.on('write', function(o) {
            console.log('upload %s', o.destination);
        });
    }

    return gulp.src([config.dist + '**/*.*'])
        .pipe(scp(paras))
        .on('error', function(err) {
            console.log(err);
        });
});

gulp.task('clean:end', ['css', 'js', 'html', 'res'], function(cb) {
    return del('./build/_', cb);
    /*return gulp.src('./build/_')
        .pipe(clean());*/
});

gulp.task('deploy', function() {
    return gulp.src(config.dist + '**/*.*')
        .pipe(ftp(config.server_prod))
        .pipe(gutil.noop());
});

gulp.task('build', ['tpl', 'js', 'html', 'css', 'res', 'publish']);

gulp.task('dev',function(){
    gulp.src(config.dist + '**/*.*')
        .pipe(ftp(config.server_dev))
        .pipe(gutil.noop());
})