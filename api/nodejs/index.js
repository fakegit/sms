const low = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');

class logger {
	static success(res, data){
		res.json({status:0 , result:data});
	}
	static error(res , msg){
		res.json({status:-1 , message:msg});
	}

}

class SMSService {
	constructor(){
		this.db = low('sms.db.json', {
		  storage: fileAsync
		})

		this.db.defaults({
			user: { username:'admin' , password:'admin'} ,
			dedi:[],
			vps:[],
			host:[]
		})
		.write();

	}


	signin(p,res){
		
		let data = this.db
			.get('user').value();
		if(data.username == p.username && data.password == p.password){
			logger.success();
		}else{
			logger.error('error');
		}
	}

	signout(res){

	}

	modifyPassword(p,res){
		this.db
			.get('user')
			.find({"username":params.username , "password":params.password})
	
	}

	exec(a , p , res){
		a = a.replace(/$\//,'').replace('/','_');

		if(a == 'signin'){
			this.signin(p, res);
		}
		else if(a == 'signout'){
			this.signout(p, res);
		}
		else if(a in this){
			this[a](p, res);
		}
	}

	vps_list(p, res){
		var page_num = p.page_num || 1;
		var page_size = p.page_size || 10;
		var start = page_size * (page_num - 1);
		var end = page_size * page_num;

		let data = this.db
			.get('vps').slice(start , end).value();
		let count = this.db
			.get('vps').size().value();
		logger.success({page_count:count , page_num: page_num , data:data});
	}

	vps_update(p , res){

	}

	vps_create(p , res){
		let data = this.db
			.get('vps').push(p);
		logger.success({page_count:count , page_num: page_num , data:data});
	}
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = new SMSService();
}