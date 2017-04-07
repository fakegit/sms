define(['app'], function(app ) {
	var stack = {};

	var saveFlag = false;

	var tick = 200;

	function save(){

	}

	function read(){

	}

	function _set(){

	}

	function process(){
		if(saveFlag){
			save();
		}

		setTimeout(function(){
			process();
		} , tick);
	}
	
	function init(){
		stack = window.localStorage.SMS || {};
		process();
	}

	init();

	function db(name){
		this.name = name;
		this.saveFlag = false;
	}

	db.prototype.get = function(key){

	}

	db.prototype.set = function(){
		
	}

	db.prototype.find = function(){
		
	}

	return db;
})